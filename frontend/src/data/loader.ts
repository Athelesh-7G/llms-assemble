import type { ClusterInfo, CorrelationMatrix, LLMModel, MonthlySnapshot, RankingResult } from '../types/index'

import rawModels from './models.json'
import rawMonthly from './monthly.json'
import rawClusters from './clusters.json'
import rawRankings from './rankings.json'
import rawCorrelations from './correlations.json'

// ── Typed exports ────────────────────────────────────────────────────────────

export const modelsData: LLMModel[] = rawModels as unknown as LLMModel[]
export const monthlyData: MonthlySnapshot[] = rawMonthly as unknown as MonthlySnapshot[]
export const clustersData: ClusterInfo[] = rawClusters as unknown as ClusterInfo[]
export const rankingsData: { [profile: string]: RankingResult[] } =
  rawRankings as unknown as { [profile: string]: RankingResult[] }
export const correlationsData: CorrelationMatrix =
  rawCorrelations as unknown as CorrelationMatrix

// ── Helper functions ─────────────────────────────────────────────────────────

export function getModelByName(name: string): LLMModel | undefined {
  return modelsData.find((m) => m.model_name === name)
}

export function getMonthlyForModel(name: string): MonthlySnapshot[] {
  return monthlyData
    .filter((s) => s.model_name === name)
    .sort((a, b) => a.month.localeCompare(b.month))
}

const CLUSTER_COLORS: Record<string, string> = {
  Frontier: '#E63946',
  Balanced: '#457B9D',
  Efficient: '#2A9D8F',
  Lightweight: '#E9C46A',
}

export function getClusterColor(label: string): string {
  return CLUSTER_COLORS[label] ?? '#888888'
}

export function getTopNByProfile(profile: string, n: number): LLMModel[] {
  const rankField = `rank_${profile}` as keyof LLMModel
  return [...modelsData]
    .sort((a, b) => (a[rankField] as number) - (b[rankField] as number))
    .slice(0, n)
}

export function getOSSModels(): LLMModel[] {
  return modelsData.filter((m) => m.is_open_source === true)
}

const BENCHMARK_DISPLAY_NAMES: Record<string, string> = {
  mmlu_score: 'MMLU',
  humaneval_score: 'HumanEval',
  math_score: 'MATH',
  hellaswag_score: 'HellaSwag',
  arc_score: 'ARC',
  capability_score: 'Overall Capability',
  tokens_per_second: 'Tokens/sec',
  latency_ms: 'Latency (ms)',
  cost_input_per_1m: 'Cost/1M tokens',
}

export function getBenchmarkDisplayName(key: string): string {
  return BENCHMARK_DISPLAY_NAMES[key] ?? key
}
