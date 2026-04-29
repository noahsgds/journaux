'use client'

import React, { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn, truncate, scoreToPercent, parseChunkMeta } from '@/lib/utils'
import type { JournalChunk } from '@/lib/types'

interface SourceCardProps {
  chunk: JournalChunk
  index: number
}

export function SourceCard({ chunk, index }: SourceCardProps) {
  const [expanded, setExpanded] = useState(false)
  const score = scoreToPercent(chunk.similarity)
  const { source, date, chunkIndex } = parseChunkMeta(chunk.metadata)
  const preview = truncate(chunk.content, 180)

  return (
    <div className={cn('border border-border bg-canvas transition-colors', 'hover:border-accent/40')}>
      <button
        className="w-full text-left px-4 py-3 flex items-start gap-3"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Source number */}
        <span className="shrink-0 w-5 h-5 flex items-center justify-center text-[10px] font-mono font-bold bg-accent text-white mt-0.5">
          {index + 1}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div className="min-w-0">
              {source ? (
                <p className="text-xs font-mono font-medium text-foreground-muted truncate">
                  {source}
                  {chunkIndex !== null && (
                    <span className="ml-1.5 text-foreground-dim">§{chunkIndex + 1}</span>
                  )}
                </p>
              ) : (
                <p className="text-xs font-mono text-foreground-dim">Extrait {index + 1}</p>
              )}
              {date && (
                <p className="text-[10px] font-mono text-foreground-dim mt-0.5">{date}</p>
              )}
            </div>
          </div>

          <p className="text-xs text-foreground-muted leading-relaxed">
            {expanded ? chunk.content : preview}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-2 mt-0.5">
          <ScoreBar score={score} />
          {expanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-foreground-dim" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-foreground-dim" />
          )}
        </div>
      </button>
    </div>
  )
}

function ScoreBar({ score }: { score: number }) {
  const color =
    score >= 80 ? '#059669' : score >= 60 ? '#003189' : '#D97706'
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-12 h-1 bg-border overflow-hidden">
        <div
          className="h-full transition-all"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-[10px] font-mono tabular-nums" style={{ color }}>
        {score}%
      </span>
    </div>
  )
}
