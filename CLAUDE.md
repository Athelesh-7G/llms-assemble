---
# LLMs Assemble — Project Memory

## What This Is
A data science platform comparing 25 modern LLMs across performance, cost,
speed, and efficiency. React + TypeScript + Tailwind frontend. Python backend
data pipeline. No runtime backend calls — frontend reads static JSON exports.

## Stack
- Frontend: React 18 + TypeScript + Tailwind CSS + Vite + Recharts + Framer Motion + lucide-react
- Backend: Python 3.12, pandas, numpy, scikit-learn, scipy, plotly
- Data: CSVs in backend/data/, JSON exports in frontend/src/data/
- Routing: react-router-dom v6

## Directory Map
- backend/src/         Python pipeline modules
- backend/data/        raw/, processed/, monthly/ CSVs
- frontend/src/        React app source
- frontend/src/data/   JSON exports from pipeline (never edit manually)
- frontend/src/types/  TypeScript interfaces
- docs/                architecture.md, plan.md, data-sources.md, frontend-spec.md

## Non-Negotiables
- TypeScript strict mode everywhere, zero use of `any`
- All backend modules independently importable, no circular imports
- Frontend reads ONLY from frontend/src/data/ JSON files
- Every chart uses ResponsiveContainer and works on mobile
- Run `python backend/main.py` to regenerate all JSON exports

## Commands
- Frontend dev server:  cd frontend && npm run dev
- Backend pipeline:     cd backend && python main.py
- Type check:           cd frontend && npx tsc --noEmit
- Production build:     cd frontend && npm run build

## Workflow for Every Task
1. Read docs/plan.md and identify the next unchecked box
2. Read the relevant spec in docs/ before writing any code
3. Write code → run it or type-check it → verify zero errors
4. Check off the completed box in docs/plan.md
5. Never leave a task half-done — finish and verify before stopping

## Design Tokens (use these everywhere)
- bg-base:    #0F1117
- bg-card:    #1E2029
- bg-sidebar: #0D0F15
- accent-red:  #E63946
- accent-blue: #457B9D
- accent-teal: #2A9D8F
- accent-gold: #E9C46A
- text-primary: #EAEAEA
- text-muted:   #888888

## Making Page Rules
- WorkflowDiagram SVG: never use CSS var() strings in SVG attributes.
  Always read theme from data-theme attribute and pass as JS variables.
- JSON code blocks: use bg-[#0F1117] and hardcoded text-[#color] Tailwind
  classes — intentionally dark in both themes. Do not replace with bg-card
  or text-muted.
- Phase badge text colors: must use dark: modifier for light theme contrast —
  light theme needs a darker shade of the accent color.
- Source cards, step cards, finding cards: all use bg-card and
  text-primary/muted/faint — never hardcoded dark hex values.
---
