"""
modeling.py — Clustering and ranking for LLMs Assemble.
Accepts and returns pd.DataFrame only. Zero file I/O.
"""
from __future__ import annotations

import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.metrics import silhouette_score
from sklearn.preprocessing import StandardScaler

from src.config import CLUSTER_CONFIG, WEIGHT_PROFILES  # type: ignore[import]


def run_clustering(df: pd.DataFrame) -> tuple[pd.DataFrame, dict]:
    """
    Run KMeans clustering, PCA projection, and assign semantic cluster labels.

    Returns (df_with_clusters, diagnostics_dict).
    """
    df = df.copy()

    feature_cols: list[str] = [
        c for c in list(CLUSTER_CONFIG["features"])  # type: ignore[arg-type]
        if c in df.columns
    ]

    # Clip extreme outliers at 5th/95th percentile per feature before scaling
    X_raw = df[feature_cols].fillna(0).copy()
    for col in X_raw.columns:
        lo = float(X_raw[col].quantile(0.05))
        hi = float(X_raw[col].quantile(0.95))
        X_raw[col] = X_raw[col].clip(lo, hi)

    X = X_raw.values
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    n_clusters: int = int(CLUSTER_CONFIG["n_clusters"])  # type: ignore[arg-type]
    random_state: int = int(CLUSTER_CONFIG["random_state"])  # type: ignore[arg-type]

    kmeans = KMeans(
        n_clusters=n_clusters,
        random_state=random_state,
        n_init=50,
        max_iter=500,
    )
    cluster_ids = kmeans.fit_predict(X_scaled)

    # PCA for 2-D visualisation
    pca = PCA(n_components=2, random_state=random_state)
    X_pca = pca.fit_transform(X_scaled)
    df["pca_x"] = X_pca[:, 0].round(4)
    df["pca_y"] = X_pca[:, 1].round(4)

    # Assign semantic labels via composite tier score
    label_names = ["Frontier", "Balanced", "Efficient", "Lightweight"]
    cluster_tiers: list[tuple[int, float]] = []
    for k in range(n_clusters):
        mask = cluster_ids == k
        avg_cap   = float(df.loc[mask, "capability_score"].mean()) if "capability_score" in df.columns else 0.0
        avg_eff   = float(df.loc[mask, "efficiency_score"].mean()) if "efficiency_score" in df.columns else 0.0
        avg_cost  = float(df.loc[mask, "cost_norm"].mean())        if "cost_norm"        in df.columns else 0.0
        avg_speed = float(df.loc[mask, "speed_score"].mean())      if "speed_score"      in df.columns else 0.0
        tier_score = 0.5 * avg_cap + 0.25 * avg_eff + 0.15 * avg_cost + 0.10 * avg_speed
        cluster_tiers.append((k, tier_score))

    cluster_tiers.sort(key=lambda x: x[1], reverse=True)
    id_to_label: dict[int, str] = {
        cluster_id: label_names[rank]
        for rank, (cluster_id, _) in enumerate(cluster_tiers)
    }
    df["cluster_label"] = [id_to_label[c] for c in cluster_ids]

    # Post-processing: if Frontier > 10, demote low-capability models to Balanced
    frontier_mask = df["cluster_label"] == "Frontier"
    if frontier_mask.sum() > 10 and "capability_score" in df.columns:
        threshold = float(df.loc[frontier_mask, "capability_score"].quantile(0.70))
        move_mask = frontier_mask & (df["capability_score"] < threshold)
        df.loc[move_mask, "cluster_label"] = "Balanced"
        print(
            f"[clustering] Post-processing: moved {int(move_mask.sum())} models "
            f"from Frontier to Balanced (cap < {threshold:.4f})"
        )

    dist = df["cluster_label"].value_counts().to_dict()
    print(f"[clustering] Distribution: {dist}")

    sil = float(silhouette_score(X_scaled, cluster_ids))
    diagnostics: dict = {
        "silhouette_score": round(sil, 4),
        "inertia": round(float(kmeans.inertia_), 4),
        "explained_variance_ratio": [
            round(float(v), 4) for v in pca.explained_variance_ratio_
        ],
        "features_used": feature_cols,
    }
    print(
        f"[clustering] Silhouette={sil:.4f}  Inertia={kmeans.inertia_:.2f}  "
        f"PCA variance={pca.explained_variance_ratio_.sum():.3f}"
    )
    return df, diagnostics


def compute_composite_score(df: pd.DataFrame, profile: str) -> pd.DataFrame:
    """
    Add composite_{profile} and rank_{profile} columns for one weight profile.
    """
    df = df.copy()
    weights = WEIGHT_PROFILES[profile]
    df[f"composite_{profile}"] = (
        weights["capability"] * df["capability_score"]
        + weights["efficiency"] * df["efficiency_score"]
        + weights["cost"] * df["cost_norm"]
        + weights["speed"] * df["speed_score"]
    ).round(6)
    df[f"rank_{profile}"] = (
        df[f"composite_{profile}"]
        .rank(ascending=False, method="min")
        .astype(int)
    )
    return df


def run_all_ranking_profiles(df: pd.DataFrame) -> pd.DataFrame:
    """Apply compute_composite_score for all 4 weight profiles."""
    for profile in WEIGHT_PROFILES:
        df = compute_composite_score(df, profile)
    return df


def sensitivity_analysis(df: pd.DataFrame) -> pd.DataFrame:
    """Add rank_mean, rank_std, and rank_stable columns across all profiles."""
    df = df.copy()
    rank_cols = [
        "rank_balanced",
        "rank_research_focused",
        "rank_production_focused",
        "rank_cost_sensitive",
    ]
    existing = [c for c in rank_cols if c in df.columns]
    df["rank_mean"] = df[existing].mean(axis=1).round(2)
    df["rank_std"] = df[existing].std(axis=1).round(2)
    df["rank_stable"] = df["rank_std"] < 2.0
    return df


def correlation_analysis(df: pd.DataFrame) -> pd.DataFrame:
    """Return correlation matrix for key numeric features."""
    cols = [
        "capability_score",
        "efficiency_score",
        "speed_score",
        "mmlu_score",
        "humaneval_score",
        "math_score",
        "parameter_size_b",
        "latency_ms",
        "effective_cost_per_1m",
        "tokens_per_second",
        "is_open_source",
    ]
    existing = [c for c in cols if c in df.columns]
    numeric_df = df[existing].copy()
    # is_open_source → int for correlation
    if "is_open_source" in numeric_df.columns:
        numeric_df["is_open_source"] = numeric_df["is_open_source"].astype(int)
    return numeric_df.corr(method="pearson")


def elbow_analysis(
    df: pd.DataFrame, k_range: range = range(2, 9)
) -> dict[int, dict]:
    """Compute KMeans inertia and silhouette for k in k_range."""
    feature_cols: list[str] = [
        c for c in list(CLUSTER_CONFIG["features"])  # type: ignore[arg-type]
        if c in df.columns
    ]
    X = df[feature_cols].fillna(0).values
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    random_state: int = int(CLUSTER_CONFIG["random_state"])  # type: ignore[arg-type]
    results: dict[int, dict] = {}
    for k in k_range:
        km = KMeans(n_clusters=k, random_state=random_state, n_init=20)
        labels = km.fit_predict(X_scaled)
        sil = float(silhouette_score(X_scaled, labels)) if k > 1 else 0.0
        results[k] = {
            "inertia": round(float(km.inertia_), 4),
            "silhouette": round(sil, 4),
        }
    return results


def run_modeling_pipeline(
    df: pd.DataFrame,
) -> tuple[pd.DataFrame, dict]:
    """
    Full modeling pipeline: clustering → ranking → sensitivity.
    Returns (final_df, artifacts).
    """
    print("[modeling] Running clustering...")
    df, cluster_diag = run_clustering(df)

    print("[modeling] Running ranking profiles...")
    df = run_all_ranking_profiles(df)

    print("[modeling] Running sensitivity analysis...")
    df = sensitivity_analysis(df)

    print("[modeling] Computing correlations and elbow analysis...")
    corr_df = correlation_analysis(df)
    elbow = elbow_analysis(df)

    artifacts: dict = {
        "cluster_diagnostics": cluster_diag,
        "elbow": elbow,
        "correlation_matrix": corr_df,
    }
    print("[modeling] Done.")
    return df, artifacts


if __name__ == "__main__":
    from src.data_collector import build_static_dataset  # type: ignore[import]
    from src.preprocessor import run_pipeline  # type: ignore[import]

    df_raw = build_static_dataset()
    df_eng = run_pipeline(df_raw)
    df_final, arts = run_modeling_pipeline(df_eng)
    print(
        df_final[
            ["model_name", "cluster_label", "composite_balanced", "rank_balanced"]
        ]
        .sort_values("rank_balanced")
        .to_string()
    )
    print(f"\nSilhouette: {arts['cluster_diagnostics']['silhouette_score']}")
