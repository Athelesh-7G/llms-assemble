import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, ChevronUp, Download, Eye, EyeOff } from 'lucide-react'
import ClusterBadge from '../components/ClusterBadge'
import { modelsData } from '../data/loader'
import type { LLMModel } from '../types/index'

// ── Column definitions ────────────────────────────────────────────────────────

interface ColDef {
  key: keyof LLMModel
  label: string
  format: (v: LLMModel[keyof LLMModel]) => string
  align: 'left' | 'right'
}

const ALL_COLUMNS: ColDef[] = [
  { key: 'model_name',            label: 'Model',       format: (v) => String(v),                          align: 'left'  },
  { key: 'organization',          label: 'Org',         format: (v) => String(v),                          align: 'left'  },
  { key: 'cluster_label',         label: 'Cluster',     format: (v) => String(v),                          align: 'left'  },
  { key: 'architecture',          label: 'Arch',        format: (v) => String(v),                          align: 'left'  },
  { key: 'parameter_size_b',      label: 'Params (B)',  format: (v) => String(v),                          align: 'right' },
  { key: 'context_window_k',      label: 'Context (K)', format: (v) => String(v),                          align: 'right' },
  { key: 'capability_score',      label: 'Cap',         format: (v) => (v as number).toFixed(3),            align: 'right' },
  { key: 'efficiency_score',      label: 'Eff',         format: (v) => (v as number).toFixed(3),            align: 'right' },
  { key: 'speed_score',           label: 'Speed',       format: (v) => (v as number).toFixed(3),            align: 'right' },
  { key: 'cost_norm',             label: 'Cost (inv)',  format: (v) => (v as number).toFixed(3),            align: 'right' },
  { key: 'mmlu_score',            label: 'MMLU',        format: (v) => (v as number).toFixed(1),            align: 'right' },
  { key: 'humaneval_score',       label: 'HumanEval',   format: (v) => (v as number).toFixed(1),            align: 'right' },
  { key: 'math_score',            label: 'MATH',        format: (v) => (v as number).toFixed(1),            align: 'right' },
  { key: 'hellaswag_score',       label: 'HellaSwag',   format: (v) => (v as number).toFixed(1),            align: 'right' },
  { key: 'arc_score',             label: 'ARC',         format: (v) => (v as number).toFixed(1),            align: 'right' },
  { key: 'tokens_per_second',     label: 'TPS',         format: (v) => Math.round(v as number).toString(),  align: 'right' },
  { key: 'latency_ms',            label: 'Latency',     format: (v) => `${Math.round(v as number)}ms`,      align: 'right' },
  { key: 'cost_input_per_1m',     label: '$/1M In',     format: (v) => `$${(v as number).toFixed(2)}`,      align: 'right' },
  { key: 'cost_output_per_1m',    label: '$/1M Out',    format: (v) => `$${(v as number).toFixed(2)}`,      align: 'right' },
  { key: 'is_open_source',        label: 'OSS',         format: (v) => (v ? 'Yes' : 'No'),                  align: 'left'  },
  { key: 'rank_balanced',         label: 'Rk Bal',      format: (v) => `#${v}`,                             align: 'right' },
  { key: 'rank_research_focused', label: 'Rk Res',      format: (v) => `#${v}`,                             align: 'right' },
  { key: 'rank_cost_sensitive',   label: 'Rk Cost',     format: (v) => `#${v}`,                             align: 'right' },
  { key: 'release_month',         label: 'Released',    format: (v) => String(v),                          align: 'left'  },
  { key: 'data_quality',          label: 'Data',        format: (v) => String(v),                          align: 'left'  },
]

const DEFAULT_VISIBLE = new Set<keyof LLMModel>([
  'model_name', 'organization', 'cluster_label', 'architecture',
  'parameter_size_b', 'capability_score', 'efficiency_score',
  'tokens_per_second', 'latency_ms', 'cost_input_per_1m',
  'mmlu_score', 'is_open_source', 'rank_balanced',
])

type SortDir = 'asc' | 'desc'

// ── Filter option lists ───────────────────────────────────────────────────────

const ORGS     = ['All', ...Array.from(new Set(modelsData.map((m) => m.organization))).sort()]
const CLUSTERS = ['All', 'Frontier', 'Balanced', 'Efficient', 'Lightweight']
const TYPES    = ['All', 'Open Source', 'Proprietary']
const ARCHS    = ['All', ...Array.from(new Set(modelsData.map((m) => m.architecture))).sort()]

// ── CSV export ────────────────────────────────────────────────────────────────

function downloadCSV(rows: LLMModel[], visibleCols: Set<keyof LLMModel>) {
  const cols = ALL_COLUMNS.filter((c) => visibleCols.has(c.key))
  const header = cols.map((c) => c.label).join(',')
  const body = rows
    .map((row) =>
      cols
        .map((c) => {
          const val = c.format(row[c.key])
          return val.includes(',') ? `"${val}"` : val
        })
        .join(',')
    )
    .join('\n')
  const blob = new Blob([`${header}\n${body}`], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'llms-assemble-export.csv'
  a.click()
  URL.revokeObjectURL(url)
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ExplorerPage() {
  const [search,         setSearch]         = useState('')
  const [orgFilter,      setOrgFilter]      = useState('All')
  const [clusterFilter,  setClusterFilter]  = useState('All')
  const [typeFilter,     setTypeFilter]     = useState('All')
  const [archFilter,     setArchFilter]     = useState('All')
  const [sortKey,        setSortKey]        = useState<keyof LLMModel>('rank_balanced')
  const [sortDir,        setSortDir]        = useState<SortDir>('asc')
  const [visibleCols,    setVisibleCols]    = useState<Set<keyof LLMModel>>(new Set(DEFAULT_VISIBLE))
  const [showColToggle,  setShowColToggle]  = useState(false)

  const filteredRows = useMemo<LLMModel[]>(() => {
    let rows = [...modelsData]

    if (search.trim()) {
      const q = search.toLowerCase()
      rows = rows.filter(
        (m) =>
          m.model_name.toLowerCase().includes(q) ||
          m.organization.toLowerCase().includes(q)
      )
    }
    if (orgFilter     !== 'All') rows = rows.filter((m) => m.organization   === orgFilter)
    if (clusterFilter !== 'All') rows = rows.filter((m) => m.cluster_label  === clusterFilter)
    if (typeFilter    !== 'All') {
      const wantOSS = typeFilter === 'Open Source'
      rows = rows.filter((m) => m.is_open_source === wantOSS)
    }
    if (archFilter    !== 'All') rows = rows.filter((m) => m.architecture   === archFilter)

    rows.sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDir === 'asc' ? av - bv : bv - av
      }
      return sortDir === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av))
    })

    return rows
  }, [search, orgFilter, clusterFilter, typeFilter, archFilter, sortKey, sortDir])

  function handleSort(key: keyof LLMModel) {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  function toggleCol(key: keyof LLMModel) {
    setVisibleCols((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        if (next.size > 1) next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  const visibleColDefs = ALL_COLUMNS.filter((c) => visibleCols.has(c.key))

  const SELECT_CLS =
    'bg-card border border-border rounded-lg px-3 py-2 text-primary text-sm ' +
    'focus:outline-none focus:ring-1 focus:ring-[#457B9D]/50 focus:border-[#457B9D]/50 cursor-pointer'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-7xl mx-auto"
    >
      {/* ── Header ── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary">Model Explorer</h1>
        <p className="text-sm text-muted mt-1">
          Search, filter, sort, and export all {modelsData.length} models
        </p>
      </div>

      {/* ── Toolbar ── */}
      <div className="bg-card rounded-xl p-4 border border-border mb-4">
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-start sm:items-center">
          <input
            type="search"
            placeholder="Search model or org..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${SELECT_CLS} min-w-[200px] flex-1 placeholder:text-muted`}
          />

          <select
            title="Filter by organization"
            value={orgFilter}
            onChange={(e) => setOrgFilter(e.target.value)}
            className={SELECT_CLS}
          >
            {ORGS.map((o) => <option key={o}>{o}</option>)}
          </select>

          <select
            title="Filter by cluster"
            value={clusterFilter}
            onChange={(e) => setClusterFilter(e.target.value)}
            className={SELECT_CLS}
          >
            {CLUSTERS.map((c) => <option key={c}>{c}</option>)}
          </select>

          <select
            title="Filter by type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className={SELECT_CLS}
          >
            {TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>

          <select
            title="Filter by architecture"
            value={archFilter}
            onChange={(e) => setArchFilter(e.target.value)}
            className={SELECT_CLS}
          >
            {ARCHS.map((a) => <option key={a}>{a}</option>)}
          </select>

          <button
            type="button"
            title="Toggle columns"
            onClick={() => setShowColToggle((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border
                       text-muted hover:text-primary hover:border-[#EAEAEA] transition-colors text-sm"
          >
            {showColToggle ? <EyeOff size={14} /> : <Eye size={14} />}
            Columns
          </button>

          <button
            type="button"
            title="Export to CSV"
            onClick={() => downloadCSV(filteredRows, visibleCols)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border
                       text-muted hover:text-[#2A9D8F] hover:border-[#2A9D8F] transition-colors text-sm"
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>

        {showColToggle && (
          <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-2">
            {ALL_COLUMNS.map((col) => {
              const on = visibleCols.has(col.key)
              return (
                <button
                  key={String(col.key)}
                  type="button"
                  onClick={() => toggleCol(col.key)}
                  className={`text-xs px-2.5 py-1 rounded border transition-colors ${
                    on
                      ? 'bg-[#457B9D]/10 text-[#457B9D] border-[#457B9D]/30'
                      : 'text-faint border-border hover:text-muted'
                  }`}
                >
                  {col.label}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Results count ── */}
      <p className="text-xs text-faint mb-2">
        {filteredRows.length} of {modelsData.length} models
      </p>

      {/* ── Table ── */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-border sticky top-0 z-10">
                {visibleColDefs.map((col) => (
                  <th
                    key={String(col.key)}
                    className={`text-xs text-muted uppercase px-4 py-3 whitespace-nowrap
                               cursor-pointer select-none hover:text-primary transition-colors ${
                                 col.align === 'right' ? 'text-right' : 'text-left'
                               }`}
                    onClick={() => handleSort(col.key)}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      {sortKey === col.key
                        ? sortDir === 'asc'
                          ? <ChevronUp size={12} className="text-[#457B9D]" />
                          : <ChevronDown size={12} className="text-[#457B9D]" />
                        : null}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={visibleColDefs.length}
                    className="px-4 py-12 text-center text-muted text-sm"
                  >
                    No models match the current filters.
                  </td>
                </tr>
              ) : (
                filteredRows.map((m) => (
                  <tr
                    key={m.model_name}
                    className={`border-b border-border/50 hover:bg-border/40 transition-colors ${
                      m.is_open_source ? 'border-l-2 border-l-[#2A9D8F]/40' : ''
                    }`}
                  >
                    {visibleColDefs.map((col) => {
                      const formatted = col.format(m[col.key])

                      if (col.key === 'cluster_label') {
                        return (
                          <td key="cluster_label" className="px-4 py-2.5">
                            <ClusterBadge label={m.cluster_label} size="sm" />
                          </td>
                        )
                      }

                      if (col.key === 'model_name') {
                        return (
                          <td key="model_name" className="px-4 py-2.5 font-medium text-primary whitespace-nowrap">
                            {formatted}
                          </td>
                        )
                      }

                      if (col.key === 'is_open_source') {
                        return (
                          <td key="is_open_source" className="px-4 py-2.5">
                            <span className={`text-xs px-1.5 py-0.5 rounded ${
                              m.is_open_source
                                ? 'bg-[#2A9D8F]/10 text-[#2A9D8F]'
                                : 'bg-border text-muted'
                            }`}>
                              {formatted}
                            </span>
                          </td>
                        )
                      }

                      return (
                        <td
                          key={String(col.key)}
                          className={`px-4 py-2.5 text-xs font-mono text-muted whitespace-nowrap ${
                            col.align === 'right' ? 'text-right' : 'text-left'
                          }`}
                        >
                          {formatted}
                        </td>
                      )
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  )
}
