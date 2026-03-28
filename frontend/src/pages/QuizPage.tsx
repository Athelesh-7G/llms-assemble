import { useState } from 'react'
import type { ElementType } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  Bot,
  Brain,
  ChevronLeft,
  Cloud,
  Code2,
  CreditCard,
  Database,
  DollarSign,
  FileText,
  FlaskConical,
  Gift,
  Github,
  Globe,
  LayoutGrid,
  Layers,
  Lock,
  MessageCircle,
  MessageSquare,
  PenLine,
  Scale,
  Sparkles,
  Target,
  TrendingUp,
  Wallet,
  Zap,
} from 'lucide-react'
import ClusterBadge from '../components/ClusterBadge'
import MetricBar from '../components/MetricBar'
import ModelLinks from '../components/ModelLinks'
import { getClusterColor, modelsData } from '../data/loader'
import type { LLMModel } from '../types/index'

// ── Icon map ─────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, ElementType> = {
  Target, Code2, MessageSquare, FlaskConical, Bot, Layers, PenLine,
  DollarSign, Gift, Wallet, CreditCard, TrendingUp, Zap,
  Github, Lock, Cloud, Globe,
  Scale, Brain, LayoutGrid,
  FileText, MessageCircle, BookOpen, Database,
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface QuizAnswer {
  useCase: string
  budget: string
  needsOSS: string
  priority: string
  contextNeeds: string
}

interface QuizOption {
  value: string
  label: string
  desc: string
  icon: string
}

interface QuizQuestion {
  id: string
  question: string
  subtitle: string
  icon: string
  options: QuizOption[]
}

// ── Questions ─────────────────────────────────────────────────────────────────

const QUESTIONS: QuizQuestion[] = [
  {
    id: 'useCase',
    question: 'What will you mainly use the model for?',
    subtitle: 'Pick the option closest to your primary use case',
    icon: 'Target',
    options: [
      { value: 'coding',   label: 'Coding & Development',      desc: 'Write code, debug, code review, PRs',           icon: 'Code2'         },
      { value: 'chat',     label: 'Chatbot / Customer Support', desc: 'Conversational AI, support bots, Q&A',           icon: 'MessageSquare' },
      { value: 'research', label: 'Research & Analysis',        desc: 'Deep reasoning, reports, data analysis',          icon: 'FlaskConical'  },
      { value: 'content',  label: 'Content & Writing',          desc: 'Articles, marketing copy, summarisation',         icon: 'PenLine'       },
      { value: 'agents',   label: 'Agentic Workflows',          desc: 'Multi-step automation, tool use, pipelines',      icon: 'Bot'           },
      { value: 'general',  label: 'General Purpose',            desc: 'Mixed tasks, experimenting, not sure yet',        icon: 'Layers'        },
    ],
  },
  {
    id: 'budget',
    question: 'What is your monthly API budget?',
    subtitle: 'We will filter out models that are likely too expensive',
    icon: 'DollarSign',
    options: [
      { value: 'free',    label: 'Free / Open Source only',    desc: 'Self-hosted or free tier only',                   icon: 'Gift'          },
      { value: 'low',     label: 'Under $50/month',            desc: 'Hobby, small projects, prototypes',               icon: 'Wallet'        },
      { value: 'medium',  label: '$50 – $500/month',           desc: 'Small team, growing product',                     icon: 'CreditCard'    },
      { value: 'high',    label: '$500 – $5000/month',         desc: 'Production app, significant volume',              icon: 'TrendingUp'    },
      { value: 'noLimit', label: 'Cost is not a constraint',   desc: 'Enterprise, need maximum capability',             icon: 'Zap'           },
    ],
  },
  {
    id: 'needsOSS',
    question: 'Do you need an open-source model?',
    subtitle: 'Open source models can be self-hosted for full data privacy',
    icon: 'Github',
    options: [
      { value: 'yes',  label: 'Yes — must be open source',    desc: 'Data privacy, compliance, or self-hosting required', icon: 'Lock'  },
      { value: 'no',   label: 'No — proprietary is fine',     desc: 'Using a managed API, no special requirements',       icon: 'Cloud' },
      { value: 'both', label: 'No preference',                desc: 'Show me the best option regardless',                 icon: 'Globe' },
    ],
  },
  {
    id: 'priority',
    question: 'What matters most to you?',
    subtitle: 'We will weight the recommendation toward your top priority',
    icon: 'Scale',
    options: [
      { value: 'capability', label: 'Maximum Capability',  desc: 'Best benchmark scores, smartest model',        icon: 'Brain'       },
      { value: 'speed',      label: 'Speed & Low Latency', desc: 'Fast responses, real-time applications',        icon: 'Zap'         },
      { value: 'cost',       label: 'Cost Efficiency',     desc: 'Best performance per dollar',                   icon: 'DollarSign'  },
      { value: 'balanced',   label: 'Balanced All-Round',  desc: 'Good across all dimensions',                    icon: 'LayoutGrid'  },
    ],
  },
  {
    id: 'contextNeeds',
    question: 'How long are your typical inputs?',
    subtitle: 'This determines the context window you need',
    icon: 'FileText',
    options: [
      { value: 'short',   label: 'Short — under 2,000 words',    desc: 'Single messages, quick queries, short docs',   icon: 'MessageCircle' },
      { value: 'medium',  label: 'Medium — 2,000 to 20,000 words', desc: 'Long documents, code files, reports',         icon: 'FileText'      },
      { value: 'long',    label: 'Long — 20,000+ words',          desc: 'Books, large codebases, extended research',    icon: 'BookOpen'      },
      { value: 'extreme', label: 'Very Long — 100,000+ words',    desc: 'Entire repositories, massive documents',       icon: 'Database'      },
    ],
  },
]

// ── Scoring ───────────────────────────────────────────────────────────────────

function scoreModel(model: LLMModel, answers: QuizAnswer): number {
  let score = 0

  if (answers.useCase === 'coding') {
    score += model.humaneval_score * 0.4
    score += model.capability_score * 100 * 0.2
  } else if (answers.useCase === 'research') {
    score += model.math_score * 0.3
    score += model.mmlu_score * 0.3
    score += model.capability_score * 100 * 0.2
  } else if (answers.useCase === 'chat' || answers.useCase === 'content') {
    score += model.hellaswag_score * 0.2
    score += model.capability_score * 100 * 0.3
    score += model.speed_score * 100 * 0.2
  } else if (answers.useCase === 'agents') {
    score += model.capability_score * 100 * 0.3
    score += model.humaneval_score * 0.2
    score += model.efficiency_score * 100 * 0.2
  } else {
    score += model.capability_score * 100 * 0.4
  }

  const cost = model.cost_input_per_1m
  if (answers.budget === 'free'   && !model.is_open_source)              score = -999
  if (answers.budget === 'low'    && cost > 1.0 && !model.is_open_source) score = -999
  if (answers.budget === 'medium' && cost > 5.0 && !model.is_open_source) score = -999

  if (answers.needsOSS === 'yes' && !model.is_open_source) score = -999

  if (answers.priority === 'capability') score += model.capability_score * 100 * 0.3
  if (answers.priority === 'speed')      score += model.speed_score * 100 * 0.3
  if (answers.priority === 'cost')       score += model.cost_efficiency_ratio * 10 * 0.3
  if (answers.priority === 'balanced')   score += model.composite_balanced * 100 * 0.3

  const ctx = model.context_window_k
  if (answers.contextNeeds === 'extreme' && ctx < 200)  score -= 30
  if (answers.contextNeeds === 'long'    && ctx < 32)   score -= 20
  if (answers.contextNeeds === 'extreme' && ctx >= 1000) score += 20
  if (answers.contextNeeds === 'long'    && ctx >= 200)  score += 10

  return score
}

function getRecommendations(answers: QuizAnswer): LLMModel[] {
  return [...modelsData]
    .map((m) => ({ model: m, score: scoreModel(m, answers) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((x) => x.model)
}

function getExplanation(model: LLMModel, answers: QuizAnswer): string {
  const lines: string[] = []
  if (answers.useCase === 'coding')
    lines.push(`Strong HumanEval score of ${model.humaneval_score.toFixed(1)} — excellent for code generation.`)
  if (answers.useCase === 'agents')
    lines.push(`High capability score (${model.capability_score.toFixed(3)}) and efficient architecture suit agentic workflows.`)
  if (answers.useCase === 'research')
    lines.push(`Top MMLU (${model.mmlu_score}) and MATH (${model.math_score}) scores for deep reasoning tasks.`)
  if (answers.priority === 'speed')
    lines.push(`Delivers ${model.tokens_per_second} tokens/second — one of the fastest available.`)
  if (answers.priority === 'cost' || answers.budget === 'low')
    lines.push(`At $${model.cost_input_per_1m}/1M tokens — excellent value for your budget.`)
  if (model.is_open_source)
    lines.push(`Fully open source — can be self-hosted for complete data privacy.`)
  if (model.context_window_k >= 200)
    lines.push(`${model.context_window_k}K context window handles your document length requirements.`)
  if (lines.length === 0)
    lines.push(`Balanced performer across all dimensions with a capability score of ${model.capability_score.toFixed(3)}.`)
  return lines.slice(0, 2).join(' ')
}

const ANSWER_LABELS: Record<string, Record<string, string>> = {
  useCase:      { coding: 'Coding', chat: 'Chat/Support', research: 'Research', content: 'Content', agents: 'Agents', general: 'General' },
  budget:       { free: 'Free/OSS', low: '<$50/mo', medium: '$50–$500', high: '$500–$5K', noLimit: 'No limit' },
  needsOSS:     { yes: 'OSS required', no: 'Proprietary OK', both: 'No preference' },
  priority:     { capability: 'Max Capability', speed: 'Speed', cost: 'Cost Efficiency', balanced: 'Balanced' },
  contextNeeds: { short: 'Short inputs', medium: 'Medium docs', long: 'Long docs', extreme: 'Very long (100K+)' },
}

const RESULT_BADGES = [
  { emoji: '🥇', label: 'Best Match',          ring: 'border-2 border-[#E63946]', badge: 'bg-[#E9C46A] text-black' },
  { emoji: '🥈', label: 'Strong Alternative',  ring: 'border border-border',      badge: 'bg-[#C0C0C0]/20 text-[#C0C0C0]' },
  { emoji: '🥉', label: 'Also Consider',        ring: 'border border-border',      badge: 'bg-[#CD7F32]/20 text-[#CD7F32]' },
]

// ── Component ─────────────────────────────────────────────────────────────────

export default function QuizPage() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Partial<QuizAnswer>>({})
  const [showResults, setShowResults] = useState(false)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)

  const question = QUESTIONS[currentStep]
  const QuestionIcon = ICON_MAP[question?.icon ?? 'Target']
  const isLastStep = currentStep === QUESTIONS.length - 1
  const progress = (currentStep / QUESTIONS.length) * 100

  function handleNext() {
    if (!selectedOption) return
    const newAnswers = { ...answers, [question.id]: selectedOption }
    setAnswers(newAnswers)
    if (isLastStep) {
      setShowResults(true)
    } else {
      setCurrentStep((s) => s + 1)
      const nextId = QUESTIONS[currentStep + 1]?.id as keyof QuizAnswer
      setSelectedOption(newAnswers[nextId] ?? null)
    }
  }

  function handleBack() {
    const prevId = QUESTIONS[currentStep - 1].id as keyof QuizAnswer
    setCurrentStep((s) => s - 1)
    setSelectedOption(answers[prevId] ?? null)
  }

  function handleRetake() {
    setShowResults(false)
    setCurrentStep(0)
    setAnswers({})
    setSelectedOption(null)
  }

  if (showResults) {
    const results = getRecommendations(answers as QuizAnswer)
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-3xl mx-auto px-4 sm:px-6"
      >
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-primary">Your Perfect Models</h2>
          <p className="text-sm text-muted mt-1">Based on your answers — ranked best to worst fit</p>
          <div className="flex flex-wrap gap-2 mt-4">
            {(Object.entries(answers) as [string, string][]).map(([key, val]) => (
              <span key={key} className="bg-card border border-border rounded-full px-3 py-1 text-xs text-muted">
                {ANSWER_LABELS[key]?.[val] ?? val}
              </span>
            ))}
          </div>
        </div>

        {results.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-8 text-center">
            <p className="text-muted text-sm">No models match your exact criteria. Try relaxing your budget or OSS requirement.</p>
            <button type="button" onClick={handleRetake} className="mt-4 text-sm text-[#E63946] hover:underline">
              ← Retake Quiz
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((model, i) => {
              const badge = RESULT_BADGES[i]
              const clusterColor = getClusterColor(model.cluster_label)
              return (
                <motion.div
                  key={model.model_name}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.3 }}
                  className={`bg-card rounded-2xl p-6 ${badge.ring}`}
                  style={i === 0 ? { borderTopColor: '#E63946', borderTopWidth: 4 } : {}}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${badge.badge}`}>
                        {badge.emoji} {badge.label}
                      </span>
                      <div className="text-lg font-bold text-primary mt-2">{model.model_name}</div>
                      <div className="text-sm text-muted">{model.organization}</div>
                    </div>
                    <ClusterBadge label={model.cluster_label} size="sm" />
                  </div>

                  <div className="bg-[#E63946]/5 border border-[#E63946]/15 rounded-lg p-3 text-xs text-muted italic mb-4">
                    {getExplanation(model, answers as QuizAnswer)}
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      { label: 'MMLU',    value: model.mmlu_score.toFixed(1)          },
                      { label: 'TPS',     value: model.tokens_per_second.toFixed(0)   },
                      { label: 'Cost/1M', value: `$${model.cost_input_per_1m}`        },
                    ].map(({ label, value }) => (
                      <div key={label} className="text-center bg-border/20 rounded-lg py-2">
                        <div className="text-sm font-mono font-bold text-primary">{value}</div>
                        <div className="text-[10px] text-muted mt-0.5">{label}</div>
                      </div>
                    ))}
                  </div>

                  <MetricBar label="Capability" value={model.capability_score} color={clusterColor} />

                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-between flex-wrap gap-2">
                    <ModelLinks modelName={model.model_name} size="sm" />
                    <button
                      type="button"
                      onClick={() => navigate('/compare')}
                      className="flex items-center gap-1 text-xs text-[#457B9D] hover:underline"
                    >
                      Compare this model <ArrowRight size={12} />
                    </button>
                  </div>
                </motion.div>
              )
            })}

            <div className="flex justify-center gap-6 mt-6 pt-4 pb-8">
              <button
                type="button"
                onClick={handleRetake}
                className="text-sm text-muted hover:text-primary transition-colors flex items-center gap-2"
              >
                <ChevronLeft size={16} /> Retake Quiz
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowResults(false)
                  setCurrentStep(QUESTIONS.length - 1)
                  setSelectedOption((answers as Record<string, string>)[QUESTIONS[QUESTIONS.length - 1].id] ?? null)
                }}
                className="text-sm text-[#457B9D] hover:text-primary transition-colors flex items-center gap-2"
              >
                <ChevronLeft size={16} /> Edit Last Answer
              </button>
            </div>
          </div>
        )}
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-3xl mx-auto px-4 sm:px-6"
    >
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Sparkles size={22} className="text-[#E63946]" />
        <div>
          <h1 className="text-2xl font-bold text-primary">Find My Perfect Model</h1>
          <p className="text-sm text-muted mt-0.5">5 questions · personalised LLM recommendation</p>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-muted">Step {currentStep + 1} of {QUESTIONS.length}</span>
          <span className="text-xs text-muted">{Math.round(progress)}% complete</span>
        </div>
        <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#E63946] to-[#457B9D]"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          />
        </div>
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.2 }}
          className="bg-card border border-border rounded-2xl p-6 sm:p-8"
        >
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-[#E63946]/10 flex items-center justify-center flex-shrink-0">
              <QuestionIcon size={20} className="text-[#E63946]" />
            </div>
            <div className="text-[10px] text-[#E63946] uppercase tracking-widest font-semibold">
              Question {currentStep + 1}
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-primary mt-3">
            {question.question}
          </h2>
          <p className="text-sm text-muted mt-1 mb-6">{question.subtitle}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {question.options.map((option) => {
              const OptionIcon = ICON_MAP[option.icon]
              const isSelected = selectedOption === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSelectedOption(option.value)}
                  className={`flex items-start gap-3 text-left p-4 rounded-xl border transition-all duration-150 ${
                    isSelected
                      ? 'border-[#E63946] bg-[#E63946]/8 ring-1 ring-[#E63946]/30'
                      : 'border-border bg-card hover:border-[#E63946]/40 hover:bg-[#E63946]/4'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                    isSelected ? 'bg-[#E63946]/10 text-[#E63946]' : 'bg-border/50 text-muted'
                  }`}>
                    {OptionIcon && <OptionIcon size={18} />}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-primary leading-tight">{option.label}</div>
                    <div className="text-xs text-muted mt-0.5 leading-relaxed">{option.desc}</div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            {currentStep > 0 ? (
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors"
              >
                <ChevronLeft size={16} /> Back
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              onClick={handleNext}
              disabled={!selectedOption}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                selectedOption
                  ? 'bg-[#E63946] text-white hover:bg-[#E63946]/90 cursor-pointer'
                  : 'bg-border text-muted cursor-not-allowed'
              }`}
            >
              {isLastStep ? 'Get My Recommendations' : 'Next'}
              <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}
