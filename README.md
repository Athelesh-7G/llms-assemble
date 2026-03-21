# LLMs Assemble

A data-driven platform for quantitative evaluation and comparison of 25
modern Large Language Models across capability, efficiency, cost, and speed.

Built as a complete data science project: from raw benchmark data through
statistical analysis, unsupervised clustering, composite ranking, and an
interactive React dashboard.

## Features

- 25 LLMs evaluated across MMLU, HumanEval, MATH, HellaSwag, ARC benchmarks
- Monthly 2025 trends — track how models evolved throughout the year
- Live ranking — adjust weight profiles and watch rankings reorder in real time
- Cluster analysis — K-Means grouping with PCA visualization
- Tradeoff explorer — capability vs cost, speed vs capability, params vs performance
- Full data explorer — filter, sort, and export the complete dataset as CSV

## Tech Stack

Frontend: React 18 + TypeScript (strict) + Tailwind CSS + Framer Motion + Recharts
Backend: Python 3.12 + pandas + numpy + scikit-learn + scipy

## Setup

Step 1 — Generate data (run this first):

  cd backend
  pip install pandas numpy scikit-learn scipy plotly
  python main.py

This exports 5 JSON files to frontend/src/data/

Step 2 — Run frontend:

  cd frontend
  npm install
  npm run dev

Open http://localhost:5173

Step 3 — Production build:

  cd frontend
  npm run build

## Data Sources

MMLU, MATH, HellaSwag, ARC: Open LLM Leaderboard (HuggingFace)
HumanEval: BigCode Models Leaderboard
Latency, TPS: Artificial Analysis (artificialanalysis.ai)
Pricing: Official vendor pages — OpenAI, Anthropic, Google, Mistral, Cohere
OSS hosting cost: Estimated median (Lambda Labs / Together AI, 2025)

## Pages

/             Overview — KPIs, top 5, cluster summary, key insights
/compare      Side-by-side model comparison with radar chart
/benchmarks   Per-benchmark rankings, distributions, org averages
/trends       Monthly 2025 evolution charts with improver analysis
/clusters     K-Means cluster analysis with PCA scatter plot
/tradeoffs    Capability vs cost, speed vs capability, params vs performance
/rankings     Live interactive ranking with adjustable weight sliders
/explorer     Full dataset browser with filters, sort, and CSV export

See docs/architecture.md for the full data flow and scoring formulas.
