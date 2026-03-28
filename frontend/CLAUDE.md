---
# Frontend — React + TypeScript + Tailwind

## Design System
Supports dark and light themes via CSS variables. Use semantic Tailwind aliases
(defined in tailwind.config.ts) for theme-aware styles:
- Page background:  bg-base        → var(--bg-base)
- Card background:  bg-card        → var(--bg-card)
- Sidebar:          bg-sidebar     → var(--bg-sidebar)
- Border:           border-border  → var(--border)
- Text primary:     text-primary   → var(--text-primary)
- Text muted:       text-muted     → var(--text-muted)
- Text faint:       text-faint     → var(--text-faint)
- Accent red:       text-red / bg-red      → var(--accent-red)   #E63946
- Accent blue:      text-blue / bg-blue    → var(--accent-blue)  #457B9D
- Accent teal:      text-teal / bg-teal    → var(--accent-teal)  #2A9D8F
- Accent gold:      text-gold / bg-gold    → var(--accent-gold)  #E9C46A

Hardcoded hex values (bg-[#E63946], text-[#457B9D], etc.) are acceptable
when applying opacity variants like bg-[#E63946]/10 or for intentionally
always-dark elements.

## Component Rules
- All components in frontend/src/components/
- All pages in frontend/src/pages/
- All chart components in frontend/src/components/charts/
- One component per file, filename matches component name exactly
- Every component has an explicit TypeScript props interface above it
- No prop drilling more than 2 levels deep
- No inline styles — Tailwind classes only

## Existing Components (non-chart)
- Layout.tsx        — Collapsible sidebar + topbar; collapse state in localStorage
- ClusterBadge.tsx  — Colored badge for cluster tier (Frontier/Balanced/Efficient/Lightweight)
- MetricBar.tsx     — Horizontal progress bar for 0–1 normalized metrics
- StatCard.tsx      — KPI card with icon, value, label, animateCount option
- Skeleton.tsx      — Loading skeleton placeholder
- SplashScreen.tsx  — Full-page animated splash (always-dark)
- ParticleCanvas.tsx — Canvas-based particle background (landing page only)
- CustomCursor.tsx  — Spring-based custom cursor (landing page only, adds body class)
- AnimatedBackground.tsx — Alternative animated background component
- WorkflowDiagram.tsx    — SVG data pipeline diagram (Making page)
- ModelLinks.tsx    — Quick-link buttons (Chat/API/HF/Docs) for a given model

## Chart Rules (Recharts)
- Every chart wrapped in ResponsiveContainer with width="100%" height={height}
- CartesianGrid: stroke="var(--border)" strokeDasharray="3 3"
- All axes: stroke="var(--text-muted)" tick={{ fill: "var(--text-muted)" }}
- Tooltip: contentStyle with var(--bg-card), var(--border), var(--text-primary)
- Legend: wrapperStyle={{ color: "var(--text-primary)" }}
- BarChart (horizontal): domain={[0, (dataMax) => dataMax * 1.15]}, margin right 65,
  Bar label prop with position:"right" (not LabelList) to avoid SVG clipping

## Animation Rules (Framer Motion)
- Page mount: initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.3 }}
- Card hover: whileHover={{ scale:1.02 }} transition={{ duration:0.15 }}
- List items: staggerChildren 0.05s

## Data Imports
- Always import from '../data/loader' (not directly from JSON files)
- Available exports: modelsData, monthlyData, clustersData, rankingsData,
  correlationsData, getModelByName, getMonthlyForModel, getClusterColor,
  getTopNByProfile, getOSSModels, getBenchmarkDisplayName, getModelLinks
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
/making → MakingPage

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

## Custom Cursor
- CustomCursor.tsx: used on LandingPage only
- Adds/removes "custom-cursor-active" class on document.body via useEffect
- index.css sets cursor:none on .custom-cursor-active
- CursorGuard component in App.tsx removes the class on every route change
- Touch devices: @media (hover:none) disables the custom cursor
---
