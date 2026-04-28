'use client'

import React, { useState } from 'react'
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'
import { cn, formatDate, scoreToPercent, truncate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { JournalChunk } from '@/lib/types'

interface SourceCardProps {
  chunk: JournalChunk
  index: number
}

export function SourceCard({ chunk, index }: SourceCardProps) {
  const [expanded, setExpanded] = useState(false)
  const score = scoreToPercent(chunk.similarity)
  const date = formatDate(chunk.metadata.date)
  const title = chunk.metadata.title ?? chunk.metadata.source ?? `Entry ${index + 1}`
  const preview = truncate(chunk.content, 160)

  return (
    <div
      className={cn(
        'rounded-lg border bg-card transition-all duration-200 animate-fade-in',
        'border-border hover:border-accent/30',
      )}
    >
      <button
        className="w-full text-left px-4 py-3 flex items-start gap-3"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Source number */}
        <span className="shrink-0 w-5 h-5 flex items-center justify-center rounded text-[10px] font-mono font-bold bg-accent/15 text-accent border border-accent/20 mt-0.5">
          {index + 1}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-sm font-medium text-foreground truncate">
              {String(title)}
            </span>
            {date && (
              <span className="text-xs font-mono text-foreground-dim shrink-0">
                {date}
              </span>
            )}
          </div>
          <p className="text-xs text-foreground-muted leading-relaxed">
            {expanded ? chunk.content : preview}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-2">
          <ScoreBar score={score} />
          {expanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-foreground-dim" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-foreground-dim" />
          )}
        </div>
      </button>

      {expanded && chunk.metadata.tags && Array.isArray(chunk.metadata.tags) && (
        <div className="px-4 pb-3 flex flex-wrap gap-1.5">
          {(chunk.metadata.tags as string[]).map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

function ScoreBar({ score }: { score: number }) {
  const color =
    score >= 80 ? '#10B981' : score >= 60 ? '#3B82F6' : '#F59E0B'
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-12 h-1 rounded-full bg-surface overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-[10px] font-mono" style={{ color }}>
        {score}%
      </span>
    </div>
  )
}
