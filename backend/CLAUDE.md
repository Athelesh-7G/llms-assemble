---
# Backend — Python Data Pipeline

## Entry Point
python main.py runs all phases in order and exports JSON to ../frontend/src/data/

## Module Responsibilities
- config.py         All constants and config. Zero logic.
- data_collector.py Builds raw DataFrames. Zero file I/O.
- preprocessor.py   Transforms DataFrames. Accepts and returns DataFrames only.
- modeling.py       Clustering and ranking. Accepts and returns DataFrames only.
- main.py           Orchestrates everything. All file I/O happens here.

## Python Rules
- Every function must have full type annotations
- Every module must be runnable standalone via if __name__ == "__main__"
- No hardcoded file paths inside modules — import from config.py PATHS dict
- Required packages: pandas numpy scikit-learn scipy plotly

## Data Schema — Static (25 rows)
model_name, organization, architecture, parameter_size_b, context_window_k,
mmlu_score, humaneval_score, math_score, hellaswag_score, arc_score,
tokens_per_second, latency_ms, cost_input_per_1m, cost_output_per_1m,
is_open_source, data_quality, release_month

## Data Schema — Monthly (25 models × 12 months = 300 rows)
month(YYYY-MM), model_name, mmlu_score, humaneval_score, math_score,
hellaswag_score, arc_score, tokens_per_second, latency_ms, cost_input_per_1m

## JSON Exports to frontend/src/data/
- models.json      25 objects, all computed fields included
- monthly.json     300 monthly snapshot objects
- clusters.json    4 cluster objects with label, color, models, avg scores
- rankings.json    4 profiles × 25 models with rank and composite score
- correlations.json  {labels: string[], values: number[][]}
---
