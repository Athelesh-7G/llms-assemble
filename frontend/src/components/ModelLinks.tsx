import { BookOpen, Code2, MessageSquare } from 'lucide-react'
import { getModelLinks } from '../data/loader'

interface ModelLinksProps {
  modelName: string
  size?: 'sm' | 'md'
}

export default function ModelLinks({ modelName, size = 'sm' }: ModelLinksProps) {
  const links = getModelLinks(modelName)

  if (!links.chat && !links.api && !links.huggingface && !links.docs) {
    return null
  }

  const base =
    size === 'sm'
      ? 'text-[10px] px-2 py-1 gap-1 rounded-md'
      : 'text-xs px-3 py-1.5 gap-1.5 rounded-lg'

  const iconSize = size === 'sm' ? 10 : 12

  return (
    <div className="flex flex-wrap gap-1.5">
      {links.chat && (
        <a
          href={links.chat}
          target="_blank"
          rel="noopener noreferrer"
          title="Open Chat / Playground"
          className={`${base} flex items-center font-medium border border-[#10A37F]/20 bg-[#10A37F]/15 text-[#10A37F] hover:opacity-90 hover:scale-105 transition-transform duration-150`}
        >
          <MessageSquare size={iconSize} />
          Chat
        </a>
      )}
      {links.api && (
        <a
          href={links.api}
          target="_blank"
          rel="noopener noreferrer"
          title="API & Pricing"
          className={`${base} flex items-center font-medium border border-[#457B9D]/20 bg-[#457B9D]/15 text-[#457B9D] hover:opacity-90 hover:scale-105 transition-transform duration-150`}
        >
          <Code2 size={iconSize} />
          API
        </a>
      )}
      {links.huggingface && (
        <a
          href={links.huggingface}
          target="_blank"
          rel="noopener noreferrer"
          title="HuggingFace Model Card"
          className={`${base} flex items-center font-medium border border-[#E9C46A]/20 bg-[#E9C46A]/15 text-[#E9C46A] hover:opacity-90 hover:scale-105 transition-transform duration-150`}
        >
          <span style={{ fontSize: iconSize }}>🤗</span>
          HF
        </a>
      )}
      {links.docs && (
        <a
          href={links.docs}
          target="_blank"
          rel="noopener noreferrer"
          title="Documentation"
          className={`${base} flex items-center font-medium border border-[#2A9D8F]/20 bg-[#2A9D8F]/15 text-[#2A9D8F] hover:opacity-90 hover:scale-105 transition-transform duration-150`}
        >
          <BookOpen size={iconSize} />
          Docs
        </a>
      )}
    </div>
  )
}
