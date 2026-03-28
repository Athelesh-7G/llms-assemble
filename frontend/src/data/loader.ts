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

// ── Model external links ─────────────────────────────────────────────────────

const MODEL_LINKS: Record<string, {
  chat?: string
  api?: string
  huggingface?: string
  docs?: string
}> = {
  "GPT-4o": {
    chat: "https://chatgpt.com",
    api: "https://platform.openai.com/docs/models/gpt-4o",
    docs: "https://openai.com/index/hello-gpt-4o"
  },
  "GPT-4o mini": {
    chat: "https://chatgpt.com",
    api: "https://platform.openai.com/docs/models/gpt-4o-mini",
    docs: "https://openai.com/index/gpt-4o-mini-advancing-cost-efficient-intelligence"
  },
  "GPT-4 Turbo": {
    chat: "https://chatgpt.com",
    api: "https://platform.openai.com/docs/models/gpt-4-turbo",
    docs: "https://platform.openai.com/docs/models"
  },
  "GPT-3.5 Turbo": {
    chat: "https://chatgpt.com",
    api: "https://platform.openai.com/docs/models/gpt-3-5-turbo",
    docs: "https://platform.openai.com/docs/models"
  },
  "GPT-5": {
    chat: "https://chatgpt.com",
    api: "https://platform.openai.com/docs/models",
    docs: "https://openai.com"
  },
  "GPT-5 mini": {
    chat: "https://chatgpt.com",
    api: "https://platform.openai.com/docs/models",
    docs: "https://openai.com"
  },
  "Claude Sonnet 4": {
    chat: "https://claude.ai",
    api: "https://www.anthropic.com/api",
    docs: "https://docs.anthropic.com/en/docs/models-overview"
  },
  "Claude Opus 4": {
    chat: "https://claude.ai",
    api: "https://www.anthropic.com/api",
    docs: "https://docs.anthropic.com/en/docs/models-overview"
  },
  "Claude Haiku 4": {
    chat: "https://claude.ai",
    api: "https://www.anthropic.com/api",
    docs: "https://docs.anthropic.com/en/docs/models-overview"
  },
  "Claude 3.5 Sonnet": {
    chat: "https://claude.ai",
    api: "https://www.anthropic.com/api",
    docs: "https://docs.anthropic.com/en/docs/models-overview"
  },
  "Claude 3.5 Haiku": {
    chat: "https://claude.ai",
    api: "https://www.anthropic.com/api",
    docs: "https://docs.anthropic.com/en/docs/models-overview"
  },
  "Claude 3 Opus": {
    chat: "https://claude.ai",
    api: "https://www.anthropic.com/api",
    docs: "https://docs.anthropic.com/en/docs/models-overview"
  },
  "Claude 3 Haiku": {
    chat: "https://claude.ai",
    api: "https://www.anthropic.com/api",
    docs: "https://docs.anthropic.com/en/docs/models-overview"
  },
  "Gemini 1.5 Pro": {
    chat: "https://gemini.google.com",
    api: "https://ai.google.dev/gemini-api/docs/models",
    docs: "https://deepmind.google/technologies/gemini/pro"
  },
  "Gemini 1.5 Flash": {
    chat: "https://gemini.google.com",
    api: "https://ai.google.dev/gemini-api/docs/models",
    docs: "https://deepmind.google/technologies/gemini"
  },
  "Gemini 2.0 Flash": {
    chat: "https://gemini.google.com",
    api: "https://ai.google.dev/gemini-api/docs/models",
    docs: "https://deepmind.google/technologies/gemini"
  },
  "Gemini 2.5 Pro": {
    chat: "https://gemini.google.com",
    api: "https://ai.google.dev/gemini-api/docs/models",
    docs: "https://deepmind.google/technologies/gemini/pro"
  },
  "Gemini 2.5 Flash": {
    chat: "https://gemini.google.com",
    api: "https://ai.google.dev/gemini-api/docs/models",
    docs: "https://deepmind.google/technologies/gemini"
  },
  "Gemini 3 Pro": {
    chat: "https://gemini.google.com",
    api: "https://ai.google.dev/gemini-api/docs/models",
    docs: "https://deepmind.google/technologies/gemini"
  },
  "Llama 3.1 405B": {
    chat: "https://www.meta.ai",
    api: "https://llama.meta.com",
    huggingface: "https://huggingface.co/meta-llama/Llama-3.1-405B-Instruct",
    docs: "https://llama.meta.com/docs/overview"
  },
  "Llama 3.1 70B": {
    chat: "https://www.meta.ai",
    api: "https://llama.meta.com",
    huggingface: "https://huggingface.co/meta-llama/Llama-3.1-70B-Instruct",
    docs: "https://llama.meta.com/docs/overview"
  },
  "Llama 3.1 8B": {
    chat: "https://www.meta.ai",
    api: "https://llama.meta.com",
    huggingface: "https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct",
    docs: "https://llama.meta.com/docs/overview"
  },
  "Llama 3.2 3B": {
    chat: "https://www.meta.ai",
    api: "https://llama.meta.com",
    huggingface: "https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct",
    docs: "https://llama.meta.com/docs/overview"
  },
  "Llama 4 Scout": {
    chat: "https://www.meta.ai",
    api: "https://llama.meta.com",
    huggingface: "https://huggingface.co/meta-llama",
    docs: "https://llama.meta.com/docs/overview"
  },
  "Llama 4 Maverick": {
    chat: "https://www.meta.ai",
    api: "https://llama.meta.com",
    huggingface: "https://huggingface.co/meta-llama",
    docs: "https://llama.meta.com/docs/overview"
  },
  "Mistral Large 2": {
    chat: "https://chat.mistral.ai",
    api: "https://console.mistral.ai",
    docs: "https://docs.mistral.ai/getting-started/models/models_overview"
  },
  "Mistral Large 3": {
    chat: "https://chat.mistral.ai",
    api: "https://console.mistral.ai",
    docs: "https://docs.mistral.ai/getting-started/models/models_overview"
  },
  "Mistral 7B": {
    chat: "https://chat.mistral.ai",
    api: "https://console.mistral.ai",
    huggingface: "https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3",
    docs: "https://docs.mistral.ai"
  },
  "Mixtral 8x7B": {
    chat: "https://chat.mistral.ai",
    api: "https://console.mistral.ai",
    huggingface: "https://huggingface.co/mistralai/Mixtral-8x7B-Instruct-v0.1",
    docs: "https://docs.mistral.ai"
  },
  "DeepSeek-V3": {
    chat: "https://chat.deepseek.com",
    api: "https://platform.deepseek.com",
    huggingface: "https://huggingface.co/deepseek-ai/DeepSeek-V3",
    docs: "https://api-docs.deepseek.com"
  },
  "DeepSeek-V3.2": {
    chat: "https://chat.deepseek.com",
    api: "https://platform.deepseek.com",
    huggingface: "https://huggingface.co/deepseek-ai",
    docs: "https://api-docs.deepseek.com"
  },
  "DeepSeek-R1": {
    chat: "https://chat.deepseek.com",
    api: "https://platform.deepseek.com",
    huggingface: "https://huggingface.co/deepseek-ai/DeepSeek-R1",
    docs: "https://api-docs.deepseek.com"
  },
  "Qwen2.5 72B": {
    chat: "https://tongyi.aliyun.com",
    api: "https://www.alibabacloud.com/en/product/modelscope",
    huggingface: "https://huggingface.co/Qwen/Qwen2.5-72B-Instruct",
    docs: "https://qwen.readthedocs.io"
  },
  "Qwen2.5 7B": {
    chat: "https://tongyi.aliyun.com",
    api: "https://www.alibabacloud.com/en/product/modelscope",
    huggingface: "https://huggingface.co/Qwen/Qwen2.5-7B-Instruct",
    docs: "https://qwen.readthedocs.io"
  },
  "Qwen3 235B": {
    chat: "https://tongyi.aliyun.com",
    api: "https://www.alibabacloud.com/en/product/modelscope",
    huggingface: "https://huggingface.co/Qwen",
    docs: "https://qwen.readthedocs.io"
  },
  "Phi-3 Medium": {
    chat: "https://azure.microsoft.com/en-us/products/ai-studio",
    api: "https://azure.microsoft.com/en-us/products/ai-services/openai-service",
    huggingface: "https://huggingface.co/microsoft/Phi-3-medium-128k-instruct",
    docs: "https://azure.microsoft.com/en-us/blog/introducing-phi-3"
  },
  "Phi-3 Mini": {
    chat: "https://azure.microsoft.com/en-us/products/ai-studio",
    api: "https://azure.microsoft.com/en-us/products/ai-services/openai-service",
    huggingface: "https://huggingface.co/microsoft/Phi-3-mini-128k-instruct",
    docs: "https://azure.microsoft.com/en-us/blog/introducing-phi-3"
  },
  "Command R+": {
    chat: "https://coral.cohere.com",
    api: "https://dashboard.cohere.com",
    docs: "https://docs.cohere.com/docs/command-r-plus"
  },
  "Grok 3": {
    chat: "https://x.com/i/grok",
    api: "https://console.x.ai",
    docs: "https://docs.x.ai"
  },
  "Grok 4": {
    chat: "https://x.com/i/grok",
    api: "https://console.x.ai",
    docs: "https://docs.x.ai"
  },
}

export function getModelLinks(name: string) {
  return MODEL_LINKS[name] ?? {}
}
