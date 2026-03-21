"""
config.py — All constants and configuration for LLMs Assemble.
Zero logic. All other modules import from here.
"""
from __future__ import annotations

import os
from pathlib import Path
from typing import Dict, List

# ---------------------------------------------------------------------------
# Project
# ---------------------------------------------------------------------------
PROJECT_NAME: str = "LLMs Assemble"

# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------
TARGET_MODELS: List[str] = [
    # Original 25
    "GPT-4o",
    "GPT-4o mini",
    "GPT-4 Turbo",
    "GPT-3.5 Turbo",
    "Claude 3.5 Sonnet",
    "Claude 3.5 Haiku",
    "Claude 3 Opus",
    "Claude 3 Haiku",
    "Gemini 1.5 Pro",
    "Gemini 1.5 Flash",
    "Gemini 2.0 Flash",
    "Llama 3.1 405B",
    "Llama 3.1 70B",
    "Llama 3.1 8B",
    "Llama 3.2 3B",
    "Mistral Large 2",
    "Mistral 7B",
    "Mixtral 8x7B",
    "Qwen2.5 72B",
    "Qwen2.5 7B",
    "DeepSeek-V3",
    "DeepSeek-R1",
    "Phi-3 Medium",
    "Phi-3 Mini",
    "Command R+",
    # New 2025 models
    "GPT-5",
    "GPT-5 mini",
    "Claude Sonnet 4",
    "Claude Opus 4",
    "Claude Haiku 4",
    "Gemini 2.5 Pro",
    "Gemini 2.5 Flash",
    "Gemini 3 Pro",
    "Llama 4 Scout",
    "Llama 4 Maverick",
    "Grok 3",
    "Grok 4",
    "Qwen3 235B",
    "DeepSeek-V3.2",
    "Mistral Large 3",
]

# ---------------------------------------------------------------------------
# Weight profiles — each must sum exactly to 1.0
# ---------------------------------------------------------------------------
WEIGHT_PROFILES: Dict[str, Dict[str, float]] = {
    "balanced": {
        "capability": 0.40,
        "efficiency": 0.20,
        "cost": 0.20,
        "speed": 0.20,
    },
    "research_focused": {
        "capability": 0.60,
        "efficiency": 0.15,
        "cost": 0.10,
        "speed": 0.15,
    },
    "production_focused": {
        "capability": 0.25,
        "efficiency": 0.25,
        "cost": 0.30,
        "speed": 0.20,
    },
    "cost_sensitive": {
        "capability": 0.20,
        "efficiency": 0.20,
        "cost": 0.45,
        "speed": 0.15,
    },
}

# ---------------------------------------------------------------------------
# Capability sub-weights (must sum to 1.0)
# ---------------------------------------------------------------------------
CAPABILITY_SUBWEIGHTS: Dict[str, float] = {
    "mmlu": 0.25,
    "humaneval": 0.25,
    "math": 0.20,
    "hellaswag": 0.15,
    "arc": 0.15,
}

# ---------------------------------------------------------------------------
# Monthly snapshots
# ---------------------------------------------------------------------------
MONTHLY_SNAPSHOTS: List[str] = [
    "2025-01",
    "2025-02",
    "2025-03",
    "2025-04",
    "2025-05",
    "2025-06",
    "2025-07",
    "2025-08",
    "2025-09",
    "2025-10",
    "2025-11",
    "2025-12",
]

# ---------------------------------------------------------------------------
# Clustering
# ---------------------------------------------------------------------------
CLUSTER_CONFIG: Dict[str, object] = {
    "n_clusters": 4,
    "random_state": 42,
    "features": [
        "capability_score",
        "efficiency_score",
        "cost_norm",
        "speed_score",
        "context_norm",
    ],
}

CLUSTER_COLORS: Dict[str, str] = {
    "Frontier": "#E63946",
    "Balanced": "#457B9D",
    "Efficient": "#2A9D8F",
    "Lightweight": "#E9C46A",
}

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
_ROOT: Path = Path(__file__).resolve().parent.parent.parent  # repo root

PATHS: Dict[str, Path] = {
    # Backend data directories
    "backend_data_raw": _ROOT / "backend" / "data" / "raw",
    "backend_data_processed": _ROOT / "backend" / "data" / "processed",
    "backend_data_monthly": _ROOT / "backend" / "data" / "monthly",
    # JSON exports (frontend reads these)
    "frontend_data": _ROOT / "frontend" / "src" / "data",
    "models_json": _ROOT / "frontend" / "src" / "data" / "models.json",
    "monthly_json": _ROOT / "frontend" / "src" / "data" / "monthly.json",
    "clusters_json": _ROOT / "frontend" / "src" / "data" / "clusters.json",
    "rankings_json": _ROOT / "frontend" / "src" / "data" / "rankings.json",
    "correlations_json": _ROOT / "frontend" / "src" / "data" / "correlations.json",
}


if __name__ == "__main__":
    print(f"Project: {PROJECT_NAME}")
    print(f"Models ({len(TARGET_MODELS)}): {TARGET_MODELS[:3]} ...")
    print(f"Weight profiles: {list(WEIGHT_PROFILES.keys())}")
    print(f"Monthly snapshots: {MONTHLY_SNAPSHOTS}")
    for name, path in PATHS.items():
        print(f"  {name}: {path}")
