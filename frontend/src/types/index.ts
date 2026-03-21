// ============================================================
// LLMs Assemble — TypeScript Interfaces
// ============================================================

/**
 * One LLM model entry — static fields from data pipeline + all
 * computed fields added by preprocessor.py and modeling.py.
 */
export interface LLMModel {
  // --- Raw / static fields ---
  model_name: string
  organization: string
  architecture: string
  parameter_size_b: number
  context_window_k: number
  mmlu_score: number
  humaneval_score: number
  math_score: number
  hellaswag_score: number
  arc_score: number
  tokens_per_second: number
  latency_ms: number
  cost_input_per_1m: number
  cost_output_per_1m: number
  is_open_source: boolean
  data_quality: 'measured' | 'estimated'
  release_month: string

  // --- Computed fields (added by pipeline) ---
  capability_score: number
  efficiency_score: number
  cost_efficiency_ratio: number
  effective_cost_per_1m: number
  speed_score: number
  cost_norm: number
  tps_norm: number
  latency_norm: number
  pca_x: number
  pca_y: number
  cluster_label: 'Frontier' | 'Balanced' | 'Efficient' | 'Lightweight'

  // Composite scores per profile
  composite_balanced: number
  composite_research_focused: number
  composite_production_focused: number
  composite_cost_sensitive: number

  // Ranks per profile (1 = best)
  rank_balanced: number
  rank_research_focused: number
  rank_production_focused: number
  rank_cost_sensitive: number

  // Rank stability metrics
  rank_std: number
  rank_stable: boolean
}

/**
 * One monthly snapshot row.
 * month is "YYYY-MM". Metrics may be null for months before model release.
 */
export interface MonthlySnapshot {
  month: string
  model_name: string
  mmlu_score: number | null
  humaneval_score: number | null
  math_score: number | null
  hellaswag_score: number | null
  arc_score: number | null
  tokens_per_second: number | null
  latency_ms: number | null
  cost_input_per_1m: number | null
}

/**
 * Weight profile used for composite score calculation.
 * All four weights must sum to 1.0.
 */
export interface WeightProfile {
  capability: number
  efficiency: number
  cost: number
  speed: number
}

/**
 * Cluster summary produced by modeling.py.
 */
export interface ClusterInfo {
  label: 'Frontier' | 'Balanced' | 'Efficient' | 'Lightweight'
  color: string
  models: string[]
  avg_capability: number
  avg_efficiency: number
  avg_cost: number
  avg_speed: number
  use_case: string
}

/**
 * One ranking row — a model ranked under a specific weight profile.
 */
export interface RankingResult {
  model_name: string
  profile: 'balanced' | 'research_focused' | 'production_focused' | 'cost_sensitive'
  composite_score: number
  rank: number
}

/**
 * Correlation matrix for heatmap visualization.
 * values[i][j] is the Pearson r between labels[i] and labels[j].
 */
export interface CorrelationMatrix {
  labels: string[]
  values: number[][]
}
