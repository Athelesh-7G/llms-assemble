"""
main.py — Orchestrates the full LLMs Assemble data pipeline.
All file I/O happens here. No file I/O in other modules.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import pandas as pd

# Allow running as `python main.py` from the backend/ directory
sys.path.insert(0, str(Path(__file__).parent))

from src.config import CLUSTER_COLORS, PATHS  # type: ignore[import]
from src.data_collector import build_monthly_dataset, build_static_dataset  # type: ignore[import]
from src.modeling import run_modeling_pipeline  # type: ignore[import]
from src.preprocessor import run_pipeline  # type: ignore[import]


def _ensure_dirs() -> None:
    for key in ("backend_data_raw", "backend_data_processed", "backend_data_monthly", "frontend_data"):
        PATHS[key].mkdir(parents=True, exist_ok=True)


def _df_to_json_safe(df: pd.DataFrame) -> list[dict]:
    """Convert DataFrame to list of dicts replacing NaN/inf with None."""
    return json.loads(df.where(pd.notnull(df), None).to_json(orient="records"))


def export_models_json(df_final: pd.DataFrame) -> None:
    path = PATHS["models_json"]
    records = _df_to_json_safe(df_final)
    path.write_text(json.dumps(records, indent=2), encoding="utf-8")
    print(f"  [ok] models.json       -- {len(records)} models")


def export_monthly_json(df_monthly: pd.DataFrame) -> None:
    path = PATHS["monthly_json"]
    records = _df_to_json_safe(df_monthly)
    path.write_text(json.dumps(records, indent=2), encoding="utf-8")
    print(f"  [ok] monthly.json      -- {len(records)} snapshots")


def export_clusters_json(df_final: pd.DataFrame) -> None:
    use_cases = {
        "Frontier": "Maximum capability, cost not a constraint",
        "Balanced": "Production workloads, strong all-round tradeoff",
        "Efficient": "Best capability per dollar, small model sweet spot",
        "Lightweight": "Edge inference, fast response, budget constrained",
    }
    clusters = []
    counts: list[str] = []
    for label in ["Frontier", "Balanced", "Efficient", "Lightweight"]:
        mask = df_final["cluster_label"] == label
        sub = df_final[mask]
        n = len(sub)
        counts.append(f"{label}({n})")
        clusters.append(
            {
                "label": label,
                "color": CLUSTER_COLORS[label],
                "models": sub["model_name"].tolist(),
                "avg_capability": round(float(sub["capability_score"].mean()), 4),
                "avg_efficiency": round(float(sub["efficiency_score"].mean()), 4),
                "avg_cost": round(float(sub["cost_norm"].mean()), 4),
                "avg_speed": round(float(sub["speed_score"].mean()), 4),
                "use_case": use_cases[label],
            }
        )
    PATHS["clusters_json"].write_text(json.dumps(clusters, indent=2), encoding="utf-8")
    print(f"  [ok] clusters.json     -- 4 clusters: {' '.join(counts)}")


def export_rankings_json(df_final: pd.DataFrame) -> None:
    profiles = ["balanced", "research_focused", "production_focused", "cost_sensitive"]
    rankings: dict[str, list[dict]] = {}
    for profile in profiles:
        comp_col = f"composite_{profile}"
        rank_col = f"rank_{profile}"
        rows = (
            df_final[["model_name", rank_col, comp_col]]
            .sort_values(rank_col)
            .rename(columns={rank_col: "rank", comp_col: "composite_score"})
            .assign(profile=profile)
        )
        rankings[profile] = _df_to_json_safe(rows)
    PATHS["rankings_json"].write_text(json.dumps(rankings, indent=2), encoding="utf-8")
    print(f"  [ok] rankings.json     -- 4 profiles")


def export_correlations_json(corr_df: pd.DataFrame) -> None:
    safe = corr_df.where(pd.notnull(corr_df), None)
    payload = {
        "labels": safe.columns.tolist(),
        "values": [
            [None if v is None else round(float(v), 3) for v in row]
            for row in safe.values.tolist()
        ],
    }
    PATHS["correlations_json"].write_text(json.dumps(payload, indent=2), encoding="utf-8")
    n = len(safe.columns)
    print(f"  [ok] correlations.json -- {n}x{n} matrix")


def main() -> None:
    _ensure_dirs()
    print("\n[main] Step 1: Building static dataset...")
    df_static = build_static_dataset()
    print(f"  Static shape: {df_static.shape}")

    print("\n[main] Step 2: Preprocessing...")
    df_engineered = run_pipeline(df_static)

    print("\n[main] Step 3: Modeling (clustering + ranking)...")
    df_final, artifacts = run_modeling_pipeline(df_engineered)

    print("\n[main] Step 4: Building monthly dataset...")
    df_monthly = build_monthly_dataset()
    print(f"  Monthly shape: {df_monthly.shape}")

    print("\n[main] Step 5: Exporting JSON files...")
    export_models_json(df_final)
    export_monthly_json(df_monthly)
    export_clusters_json(df_final)
    export_rankings_json(df_final)
    export_correlations_json(artifacts["correlation_matrix"])

    print("\n[main] Step 6: Saving CSVs...")
    df_final.to_csv(PATHS["backend_data_processed"] / "llm_engineered.csv", index=False)
    df_static.to_csv(PATHS["backend_data_raw"] / "llm_raw_data.csv", index=False)
    df_monthly.to_csv(PATHS["backend_data_monthly"] / "llm_monthly.csv", index=False)
    print("  CSVs saved to backend/data/")

    # Completion summary
    sil = artifacts["cluster_diagnostics"]["silhouette_score"]
    print(f"\n  Silhouette score: {sil:.3f}")
    for profile in ["balanced", "research_focused", "production_focused", "cost_sensitive"]:
        rank_col = f"rank_{profile}"
        top5 = (
            df_final[["model_name", rank_col]]
            .sort_values(rank_col)
            .head(5)["model_name"]
            .tolist()
        )
        names = "  ".join(f"{i+1}. {n}" for i, n in enumerate(top5))
        print(f"  Top 5 ({profile}):  {names}")
    print("\n[main] Pipeline complete.\n")


if __name__ == "__main__":
    main()
