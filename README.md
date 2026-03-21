<div align="center">

```
██╗     ██╗     ███╗   ███╗███████╗     █████╗ ███████╗███████╗███████╗███╗   ███╗██████╗ ██╗     ███████╗
██║     ██║     ████╗ ████║██╔════╝    ██╔══██╗██╔════╝██╔════╝██╔════╝████╗ ████║██╔══██╗██║     ██╔════╝
██║     ██║     ██╔████╔██║███████╗    ███████║███████╗███████╗█████╗  ██╔████╔██║██████╔╝██║     █████╗
██║     ██║     ██║╚██╔╝██║╚════██║    ██╔══██║╚════██║╚════██║██╔══╝  ██║╚██╔╝██║██╔══██╗██║     ██╔══╝
███████╗███████╗██║ ╚═╝ ██║███████║    ██║  ██║███████║███████║███████╗██║ ╚═╝ ██║██████╔╝███████╗███████╗
╚══════╝╚══════╝╚═╝     ╚═╝╚══════╝    ╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝╚═╝     ╚═╝╚═════╝ ╚══════╝╚══════╝
```

# LLMs Assemble

**An interactive benchmarking and analysis platform for 40 large language models — 2025 edition.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-llms--assemble.vercel.app-blue?style=for-the-badge&logo=vercel)](https://llms-assemble.vercel.app)
[![React 18 TypeScript](https://img.shields.io/badge/React%2018-TypeScript-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Python 3.12](https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python)](https://python.org)

**Built by Athelesh Balachandran · Barath Krishna R · Kamaleshwar K K**

</div>

---

## What Is This

LLMs Assemble is a data-driven platform that quantitatively evaluates 40 large language models across capability, cost, speed, and efficiency dimensions using 2025 benchmark data. It aggregates scores from HuggingFace Open LLM Leaderboard, BigCode, Artificial Analysis, and vendor pricing pages into a unified analysis dashboard. The platform goes beyond raw benchmarks — it applies K-Means clustering, PCA, and composite scoring to help developers, researchers, and teams choose the right model for their specific use case.

---

## Data Pipeline Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                              DATA SOURCES                                │
│                                                                          │
│  HuggingFace LB   Artificial Analysis   Vendor Pages   BigCode LB       │
│  MMLU·HellaSwag   Latency · TPS (API)   OpenAI·Anthro  HumanEval        │
│  ARC · MATH                             Google·Mistral  pass@1           │
└──────────────────────────────┬───────────────────────────────────────────┘
                               │
                               ▼
              ┌────────────────────────────────────┐
              │         data_collector.py          │
              │     40 models · 480 monthly rows   │
              └────────────────┬───────────────────┘
                               │
                               ▼
              ┌────────────────────────────────────┐
              │          preprocessor.py           │
              │  Normalize · Impute · Feature Eng  │
              │  capability_score · efficiency     │
              │  cost_norm · speed_score           │
              └────────────────┬───────────────────┘
                               │
                               ▼
              ┌────────────────────────────────────┐
              │            modeling.py             │
              │  K-Means Clustering (4 tiers)      │
              │  PCA (2D projection)               │
              │  Composite Ranking (4 profiles)    │
              └────────────────┬───────────────────┘
                               │
                               ▼
              ┌────────────────────────────────────┐
              │           5 JSON exports           │
              │  models.json      · 40 entries     │
              │  monthly.json     · 480 snapshots  │
              │  clusters.json    · 4 groups       │
              │  rankings.json    · 4 profiles     │
              │  correlations.json· 11×11 matrix   │
              └────────────────┬───────────────────┘
                               │
                               ▼
              ┌────────────────────────────────────┐
              │          React Frontend            │
              │       9 Interactive Pages          │
              └────────────────────────────────────┘
```

---

## Platform Pages

| Route | Page | Description |
|---|---|---|
| `/` | Home | KPI summary, cluster overview, top models, quick navigation |
| `/compare` | Comparison | Side-by-side radar chart comparison of any two models |
| `/benchmarks` | Benchmarks | Sorted bar charts across all benchmark dimensions |
| `/trends` | Trends | 12-month historical performance and cost trends per model |
| `/clusters` | Clusters | K-Means cluster scatter plot with PCA projection |
| `/tradeoffs` | Tradeoffs | Scatter plots: cost vs capability, speed vs power, size vs score |
| `/rankings` | Rankings | Live ranking with adjustable weight sliders for 4 use-case profiles |
| `/explorer` | Explorer | Searchable, filterable, sortable full model data table with CSV export |
| `/making` | Making Of | Pipeline walkthrough, methodology, correlation matrix, workflow diagram |

---

## Features

- **40 LLMs evaluated** across 10 raw metrics and 4 composite scores
- **12 months of historical data** (480 snapshots) for trend analysis
- **6 ranking profiles** — Balanced, Research, Production, Cost-Sensitive, Speed-First, Quality-First
- **Live ranking sliders** — adjust metric weights in real time and see rankings update instantly
- **K-Means clustering** — models grouped into 4 tiers: Frontier, Balanced, Efficient, Lightweight
- **Tradeoff analysis** — scatter plots revealing cost/speed/capability trade-offs across the model landscape
- **Light / dark theme** — system-aware with manual toggle
- **Mobile responsive** — all pages and charts adapt to small screens
- **CSV export** — raw engineered dataset available for download

---

## Tech Stack

### Frontend

| Library | Version | Purpose |
|---|---|---|
| React | 18 | UI framework |
| TypeScript | strict | Type safety |
| Tailwind CSS | 3 | Utility-first styling |
| Framer Motion | 11 | Page transitions, animations |
| Recharts | 2 | Bar, line, scatter, radar charts |
| React Router | v6 | Client-side routing |
| Vite | 6 | Build tooling |

### Data Pipeline

| Library | Purpose |
|---|---|
| Python 3.12 | Runtime |
| pandas | Data wrangling and feature engineering |
| NumPy | Numerical operations |
| scikit-learn | K-Means clustering, PCA, normalisation |
| scipy | Statistical utilities |

---

## Composite Score Formula

```
capability  = MMLU×0.25 + HumanEval×0.25 + MATH×0.20 + HellaSwag×0.15 + ARC×0.15

efficiency  = capability / log₂(params + 2)    [re-normalised to 0–1]

cost_inv    = 1 − normalise(cost_per_1M_tokens)

speed       = 0.6 × tps_norm + 0.4 × latency_inv_norm

composite   = 0.40×capability + 0.20×efficiency + 0.20×cost_inv + 0.20×speed
```

All input metrics are independently min-max normalised to [0, 1] before weighting. Outliers are detected via IQR and flagged rather than removed.

---

## Data Sources

| Metric | Source |
|---|---|
| MMLU · MATH · HellaSwag · ARC | [Open LLM Leaderboard](https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard) (HuggingFace) |
| HumanEval pass@1 | [BigCode Models Leaderboard](https://huggingface.co/spaces/bigcode/bigcode-models-leaderboard) |
| Latency · Tokens per Second | [Artificial Analysis](https://artificialanalysis.ai) — API inference benchmarks |
| Pricing (input/output per 1M tokens) | Official vendor pages — OpenAI, Anthropic, Google, Mistral, Cohere |
| Open-source hosting cost | Estimated median — Lambda Labs / Together AI (2025 rates) |

---

## Local Setup

**Step 1 — Run the data pipeline**

```bash
cd backend
pip install pandas numpy scikit-learn scipy plotly
python main.py
```

Outputs 5 JSON files to `frontend/src/data/`.

**Step 2 — Start the dev server**

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

**Step 3 — Production build**

```bash
cd frontend
npm run build
```

Output goes to `frontend/dist/`.

---

## Cluster Tiers

```
┌─────────────────┬──────────────────┬──────────────────┬──────────────────┐
│    FRONTIER     │    BALANCED      │    EFFICIENT     │   LIGHTWEIGHT    │
│   (4 models)    │   (18 models)    │   (8 models)     │   (10 models)    │
├─────────────────┼──────────────────┼──────────────────┼──────────────────┤
│ GPT-5           │ GPT-4o           │ Claude Haiku 4   │ Phi-3 Mini       │
│ Gemini 3 Pro    │ Claude Sonnet 4  │ Gemini 2.0 Flash │ Llama 3.2 3B     │
│ Claude Opus 4   │ Llama 3.1 70B    │ GPT-4o mini      │ Mistral 7B       │
│ GPT-5 mini      │ Gemini 2.5 Pro   │ Gemini 2.5 Flash │ Phi-4 Mini       │
├─────────────────┼──────────────────┼──────────────────┼──────────────────┤
│ Cap score > 0.9 │ Cap score ~0.7–9 │ Cap score ~0.6–7 │ Cap score < 0.65 │
├─────────────────┼──────────────────┼──────────────────┼──────────────────┤
│ Maximum         │ General purpose  │ High throughput  │ Edge / on-device │
│ capability,     │ production tasks,│ API products,    │ low-resource     │
│ complex tasks   │ daily usage      │ budget-conscious │ deployments      │
└─────────────────┴──────────────────┴──────────────────┴──────────────────┘
```

---

## Project Structure

```
llms-assemble/
│
├── backend/
│   ├── main.py                  # Pipeline entry point
│   ├── src/
│   │   ├── config.py            # Model definitions and benchmark data
│   │   ├── data_collector.py    # Builds static dataset from config
│   │   ├── preprocessor.py      # Normalisation, imputation, feature engineering
│   │   └── modeling.py          # K-Means, PCA, composite ranking, export
│   └── data/
│       ├── raw/                 # llm_raw_data.csv
│       ├── processed/           # llm_engineered.csv
│       └── monthly/             # llm_monthly.csv
│
├── frontend/
│   ├── src/
│   │   ├── pages/               # 9 page components
│   │   ├── components/          # Layout, charts, WorkflowDiagram, CustomCursor
│   │   │   └── charts/          # BarChart, ScatterPlot, LineChart, RadarChart, …
│   │   ├── data/                # 5 JSON files (pipeline output, committed)
│   │   ├── hooks/               # useTheme, useCountUp
│   │   ├── types/               # LLMModel, ClusterData, etc.
│   │   └── index.css            # CSS variables, dark/light theme tokens
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── package.json
│
├── vercel.json                  # Vercel deployment config
├── .gitignore
├── CLAUDE.md                    # AI assistant instructions
└── README.md
```

---

## Deployment

The platform is deployed as a pure static site on Vercel. The Python pipeline runs locally and its JSON outputs are committed to `frontend/src/data/` — no backend server or database is needed at runtime. Vercel builds the React app from `frontend/` using Vite and serves the `dist/` directory. To update the data, re-run `python main.py` locally, commit the refreshed JSON files, and push — Vercel will redeploy automatically.

---

<div align="center">

</div>
