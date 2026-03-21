"""
preprocessor.py — Transforms raw DataFrames for LLMs Assemble.
Accepts and returns pd.DataFrame only. Zero file I/O.
"""
from __future__ import annotations

import numpy as np
import pandas as pd

from src.config import CAPABILITY_SUBWEIGHTS  # type: ignore[import]

# Columns processed by the pipeline
_BENCHMARK_COLS = [
    "mmlu_score",
    "humaneval_score",
    "math_score",
    "hellaswag_score",
    "arc_score",
]
_OUTLIER_COLS = [
    "mmlu_score",
    "humaneval_score",
    "math_score",
    "hellaswag_score",
    "arc_score",
    "tokens_per_second",
    "latency_ms",
]


def handle_missing_values(df: pd.DataFrame) -> pd.DataFrame:
    """Impute NaN benchmark scores with architecture-group median, fallback to global."""
    df = df.copy()
    total_imputed = 0

    for col in _BENCHMARK_COLS:
        if col not in df.columns:
            continue
        null_mask = df[col].isna()
        count_before = null_mask.sum()
        if count_before == 0:
            continue

        # Group-median imputation
        group_medians = df.groupby("architecture")[col].transform("median")
        # Fallback to global median where group median is also NaN
        global_median = df[col].median()
        df.loc[null_mask, col] = group_medians[null_mask].fillna(global_median)

        imputed = count_before - df[col].isna().sum()
        total_imputed += imputed
        if imputed > 0:
            print(f"  [impute] {col}: {imputed} values filled")

    print(f"  [impute] Total values imputed: {total_imputed}")
    return df


def detect_outliers(df: pd.DataFrame) -> pd.DataFrame:
    """Flag rows containing IQR outliers in operational/benchmark columns."""
    df = df.copy()
    df["has_outlier_flag"] = False

    for col in _OUTLIER_COLS:
        if col not in df.columns:
            continue
        q1 = df[col].quantile(0.25)
        q3 = df[col].quantile(0.75)
        iqr = q3 - q1
        lower = q1 - 1.5 * iqr
        upper = q3 + 1.5 * iqr
        mask = (df[col] < lower) | (df[col] > upper)
        df.loc[mask, "has_outlier_flag"] = True
        flagged = df.loc[mask, "model_name"].tolist()
        if flagged:
            print(f"  [outlier] {col}: {flagged}")

    return df


def normalize_features(df: pd.DataFrame) -> pd.DataFrame:
    """Min-max and log1p normalize all features used downstream."""
    df = df.copy()

    def _minmax(series: pd.Series) -> pd.Series:
        lo, hi = series.min(), series.max()
        if hi == lo:
            return pd.Series(0.5, index=series.index)
        return (series - lo) / (hi - lo)

    # Benchmark norms (0-100 → 0-1, higher = better)
    for col, norm_col in [
        ("mmlu_score", "mmlu_norm"),
        ("humaneval_score", "humaneval_norm"),
        ("math_score", "math_norm"),
        ("hellaswag_score", "hellaswag_norm"),
        ("arc_score", "arc_norm"),
    ]:
        df[norm_col] = _minmax(df[col])

    # Speed: higher TPS = better; lower latency = better
    df["tps_norm"] = _minmax(df["tokens_per_second"])
    df["latency_norm"] = 1.0 - _minmax(df["latency_ms"])  # invert

    # Effective cost: average of input/output; OSS gets 0.5 (hosting estimate)
    df["effective_cost_per_1m"] = (
        df["cost_input_per_1m"] + df["cost_output_per_1m"]
    ) / 2.0
    oss_mask = df["is_open_source"].astype(bool)
    df.loc[oss_mask, "effective_cost_per_1m"] = 0.8

    # cost_norm: normalize then invert (lower cost = higher score)
    df["cost_norm"] = 1.0 - _minmax(df["effective_cost_per_1m"])

    # Context window: log1p normalize (spans orders of magnitude)
    df["context_norm"] = _minmax(np.log1p(df["context_window_k"]))

    # Parameter size: log1p normalize
    df["params_norm"] = _minmax(np.log1p(df["parameter_size_b"]))

    return df


def add_derived_features(df: pd.DataFrame) -> pd.DataFrame:
    """Compute capability, efficiency, cost-efficiency, and speed scores."""
    df = df.copy()

    sw = CAPABILITY_SUBWEIGHTS
    df["capability_score"] = (
        df["mmlu_norm"] * sw["mmlu"]
        + df["humaneval_norm"] * sw["humaneval"]
        + df["math_norm"] * sw["math"]
        + df["hellaswag_norm"] * sw["hellaswag"]
        + df["arc_norm"] * sw["arc"]
    )

    # Efficiency: capability / log2(params+2), penalised below 45th-percentile capability
    cap_threshold = df["capability_score"].quantile(0.45)
    eligible = df["capability_score"] >= cap_threshold
    raw_efficiency = df["capability_score"] / (np.log2(df["parameter_size_b"] + 2))
    raw_efficiency = raw_efficiency.where(eligible, raw_efficiency * 0.5)
    lo, hi = raw_efficiency.min(), raw_efficiency.max()
    df["efficiency_score"] = (raw_efficiency - lo) / (hi - lo + 1e-9)

    # Cost-efficiency ratio: capability per dollar, re-normalized [0, 1]
    raw_cer = df["capability_score"] / (df["effective_cost_per_1m"] + 0.01)
    lo_c, hi_c = raw_cer.min(), raw_cer.max()
    df["cost_efficiency_ratio"] = (
        (raw_cer - lo_c) / (hi_c - lo_c) if hi_c != lo_c else 0.5
    )

    # Speed score
    df["speed_score"] = 0.6 * df["tps_norm"] + 0.4 * df["latency_norm"]

    # Raw perf/cost ratio for display (not normalized)
    df["perf_cost_ratio"] = df["capability_score"] / (
        df["effective_cost_per_1m"] + 0.01
    )

    return df


def run_pipeline(df_raw: pd.DataFrame) -> pd.DataFrame:
    """Run all preprocessing steps in order and return engineered DataFrame."""
    print("[preprocessor] Starting pipeline...")
    df = handle_missing_values(df_raw)
    df = detect_outliers(df)
    df = normalize_features(df)
    df = add_derived_features(df)
    print(f"[preprocessor] Done. Shape: {df.shape}")
    print(f"[preprocessor] Columns: {df.columns.tolist()}")
    return df


if __name__ == "__main__":
    from src.data_collector import build_static_dataset  # type: ignore[import]

    df_raw = build_static_dataset()
    df_out = run_pipeline(df_raw)
    print(df_out[["model_name", "capability_score", "efficiency_score", "speed_score"]].to_string())
