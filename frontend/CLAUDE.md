---
# Frontend — React + TypeScript + Tailwind

## Design System
Dark theme only. Use these exact Tailwind classes for consistency:
- Page background:  bg-[#0F1117]
- Card background:  bg-[#1E2029]
- Sidebar:          bg-[#0D0F15]
- Border:           border-[#2A2D3A]
- Text primary:     text-[#EAEAEA]
- Text muted:       text-[#888888]
- Accent red:       text-[#E63946] bg-[#E63946]
- Accent blue:      text-[#457B9D] bg-[#457B9D]
- Accent teal:      text-[#2A9D8F] bg-[#2A9D8F]
- Accent gold:      text-[#E9C46A] bg-[#E9C46A]

## Component Rules
- All components in frontend/src/components/
- All pages in frontend/src/pages/
- All chart components in frontend/src/components/charts/
- One component per file, filename matches component name exactly
- Every component has an explicit TypeScript props interface above it
- No prop drilling more than 2 levels deep
- No inline styles — Tailwind classes only

## Chart Rules (Recharts)
- Every chart wrapped in ResponsiveContainer with width="100%" height={height}
- CartesianGrid stroke="#333" strokeDasharray="3 3"
- All axes: stroke="#888" tick={{ fill: "#888" }}
- Tooltip: contentStyle={{ backgroundColor:"#1E2029", border:"1px solid #2A2D3A", color:"#EAEAEA" }}
- Legend: wrapperStyle={{ color:"#EAEAEA" }}

## Animation Rules (Framer Motion)
- Page mount: initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.3 }}
- Card hover: whileHover={{ scale:1.02 }} transition={{ duration:0.15 }}
- List items: staggerChildren 0.05s

## Data Imports
- import modelsData from '../data/models.json'
- import monthlyData from '../data/monthly.json'
- Always cast through types from ../types/index.ts
- Never fetch() at runtime — all data is static JSON

## Routes
/ → HomePage
/compare → ComparisonPage
/benchmarks → BenchmarksPage
/trends → TrendsPage
/clusters → ClustersPage
/tradeoffs → TradeoffsPage
/rankings → RankingPage
/explorer → ExplorerPage

## SVG Theme Rule
Never use CSS variable strings (var(--...)) directly inside SVG fill/stroke/color
attributes. SVG does not reliably inherit CSS variables in all browsers. Instead:
  1. Read theme from document.documentElement.getAttribute('data-theme')
  2. Define JS color variables based on theme (isDark ? '#...' : '#...')
  3. Use those JS variables directly in SVG attributes
  4. Use MutationObserver + useState key to force SVG re-render on theme change

## Always-Dark Elements
These elements intentionally stay dark in both light and dark themes:
  - SplashScreen.tsx (full page)
  - JSON/code blocks: use bg-[#0F1117] with hardcoded text-[#color] Tailwind
    arbitrary classes for syntax tokens — do NOT replace with bg-card or
    text-muted.
---
