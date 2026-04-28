'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { RefreshCw, ChevronDown, ChevronUp, Zap } from 'lucide-react'
import { cn, formatDate, scoreToPercent, truncate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { Profile, FocusResult, JournalChunk } from '@/lib/types'

interface FocusFeedProps {
  profile: Profile
}

export function FocusFeed({ profile }: FocusFeedProps) {
  const [results, setResults] = useState<FocusResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchFeed = useCallback(async () => {
    if (profile.subjects.length === 0) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/focus-feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjects: profile.subjects }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setResults(json.results ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [profile.subjects])

  useEffect(() => {
    fetchFeed()
  }, [fetchFeed])

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <span
            className="w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: profile.color }}
          />
          <div>
            <h2 className="font-display font-semibold text-foreground text-lg leading-none">
              {profile.name}
            </h2>
            <p className="text-xs font-mono text-foreground-dim mt-0.5">
              Focus feed — {profile.subjects.length} subjects
            </p>
          </div>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={fetchFeed}
          disabled={loading}
          className="gap-1.5"
        >
          <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* Subject chips */}
      {profile.subjects.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-6 py-3 border-b border-border">
          {profile.subjects.map((s) => (
            <Badge key={s} variant="default">
              {s}
            </Badge>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {profile.subjects.length === 0 ? (
          <EmptySubjects />
        ) : loading && results.length === 0 ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchFeed} />
        ) : results.length === 0 ? (
          <NoResults />
        ) : (
          <ScrollArea className="h-full">
            <div className="px-6 py-4 space-y-8 max-w-3xl mx-auto">
              {results.map((result) => (
                <SubjectSection
                  key={result.subject}
                  result={result}
                  color={profile.color}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  )
}

function SubjectSection({
  result,
  color,
}: {
  result: FocusResult
  color: string
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-1 h-4 rounded-full shrink-0"
          style={{ backgroundColor: color }}
        />
        <h3 className="font-mono font-semibold text-sm text-foreground uppercase tracking-wide">
          {result.subject}
        </h3>
        <span className="text-xs font-mono text-foreground-dim">
          {result.chunks.length} passages
        </span>
      </div>

      {result.chunks.length === 0 ? (
        <p className="text-sm text-foreground-dim pl-3">
          No relevant passages found for this subject.
        </p>
      ) : (
        <div className="space-y-2">
          {result.chunks.map((chunk, i) => (
            <FeedChunkCard key={chunk.id} chunk={chunk} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}

function FeedChunkCard({
  chunk,
  index,
}: {
  chunk: JournalChunk
  index: number
}) {
  const [expanded, setExpanded] = useState(false)
  const score = scoreToPercent(chunk.similarity)
  const date = formatDate(chunk.metadata.date)
  const title =
    chunk.metadata.title ?? chunk.metadata.source ?? `Passage ${index + 1}`

  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-card animate-fade-in',
        'hover:border-border/70 transition-colors',
      )}
    >
      <button
        className="w-full text-left px-4 py-3 flex items-start gap-3"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            {date && (
              <span className="text-[10px] font-mono text-foreground-dim">
                {date}
              </span>
            )}
            <span className="text-xs font-medium text-foreground-muted truncate">
              {String(title)}
            </span>
          </div>
          <p className="text-sm text-foreground-muted leading-relaxed">
            {expanded ? chunk.content : truncate(chunk.content, 200)}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-2 pt-0.5">
          <span
            className={cn(
              'text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded',
              score >= 80
                ? 'bg-emerald-500/10 text-emerald-400'
                : score >= 60
                  ? 'bg-accent/10 text-accent'
                  : 'bg-amber/10 text-amber',
            )}
          >
            {score}%
          </span>
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

function EmptySubjects() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3">
      <Zap className="w-8 h-8 text-foreground-dim" />
      <p className="text-sm text-foreground-muted">
        Add subjects to this profile to see relevant passages.
      </p>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="px-6 py-8 space-y-6 max-w-3xl mx-auto">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 w-24 rounded bg-card animate-pulse" />
          <div className="space-y-1.5">
            {[1, 2].map((j) => (
              <div key={j} className="h-20 rounded-lg bg-card animate-pulse" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string
  onRetry: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3">
      <p className="text-sm text-red-400">Error: {message}</p>
      <Button variant="secondary" size="sm" onClick={onRetry}>
        Retry
      </Button>
    </div>
  )
}

function NoResults() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <p className="text-sm text-foreground-muted">
        No matching passages found. Try broadening your subjects.
      </p>
    </div>
  )
}
