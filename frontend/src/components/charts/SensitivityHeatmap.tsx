import type { LLMModel } from '../../types/index'

interface SensitivityHeatmapProps {
  models: LLMModel[]
  profiles: string[]
  height?: number
}

function toTitleCase(s: string): string {
  return s
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function abbreviate(name: string): string {
  const first = name.split(' ')[0]
  return first.slice(0, 8)
}

function rankStyle(rank: number): { bg: string; text: string } {
  if (rank <= 5)  return { bg: 'rgba(42,157,143,0.80)',  text: '#FFFFFF' }
  if (rank <= 15) return { bg: 'rgba(233,196,106,0.60)', text: '#0F1117' }
  return             { bg: 'rgba(230,57,70,0.70)',  text: '#FFFFFF' }
}

export default function SensitivityHeatmap({
  models,
  profiles,
}: SensitivityHeatmapProps) {
  const sorted = [...models].sort((a, b) => a.rank_balanced - b.rank_balanced)

  return (
    <div className="overflow-x-auto">
      <table className="border-separate border-spacing-0.5">
        <thead>
          <tr>
            {/* empty first header */}
            <th className="p-1" />
            {sorted.map((m) => (
              <th
                key={m.model_name}
                className="p-1 align-bottom"
                style={{ height: 72 }}
              >
                <div className="flex items-end justify-center h-full">
                  <span
                    className="text-[10px] text-muted whitespace-nowrap block"
                    style={{
                      writingMode: 'vertical-rl',
                      transform: 'rotate(180deg)',
                    }}
                  >
                    {abbreviate(m.model_name)}
                  </span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {profiles.map((profile) => {
            const rankKey = `rank_${profile}` as keyof LLMModel
            return (
              <tr key={profile}>
                <td className="text-[10px] text-muted pr-3 whitespace-nowrap align-middle">
                  {toTitleCase(profile)}
                </td>
                {sorted.map((m) => {
                  const rank = m[rankKey] as number
                  const { bg, text } = rankStyle(rank)
                  return (
                    <td key={m.model_name} className="p-0 align-middle">
                      <div
                        className="rounded-sm flex flex-col items-center justify-center font-mono"
                        style={{
                          width: 32,
                          height: 32,
                          backgroundColor: bg,
                          color: text,
                          fontSize: 10,
                        }}
                      >
                        <span>{rank}</span>
                        {m.rank_stable && (
                          <span className="text-white leading-none" style={{ fontSize: 6 }}>
                            ●
                          </span>
                        )}
                      </div>
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
