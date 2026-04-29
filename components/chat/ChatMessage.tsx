'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { SourceCard } from './SourceCard'
import type { ChatMessage as ChatMessageType } from '@/lib/types'

interface ChatMessageProps {
  message: ChatMessageType
  isStreaming?: boolean
}

export function ChatMessage({ message, isStreaming }: ChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <div className={cn('flex gap-3 animate-fade-in', isUser && 'flex-row-reverse')}>
      {/* Role badge */}
      <div
        className={cn(
          'shrink-0 w-7 h-7 flex items-center justify-center mt-0.5 text-[10px] font-mono font-bold border',
          isUser
            ? 'bg-canvas border-border text-foreground-dim'
            : 'bg-accent text-white border-accent',
        )}
      >
        {isUser ? 'Q' : 'A'}
      </div>

      <div className={cn('flex flex-col gap-2 max-w-[90%] lg:max-w-[85%]', isUser && 'items-end')}>
        {/* Message content */}
        <div
          className={cn(
            'px-4 py-3 text-sm leading-relaxed',
            isUser
              ? 'bg-panel border border-border text-foreground'
              : 'bg-surface border-l-[3px] border-l-accent border-t border-t-border border-r border-r-border border-b border-b-border text-foreground',
          )}
        >
          {message.content ? (
            <MessageContent content={message.content} />
          ) : isStreaming ? (
            <ThinkingDots />
          ) : null}
        </div>

        {/* Sources */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="w-full space-y-1.5">
            <p className="text-[10px] font-mono text-foreground-dim uppercase tracking-widest px-1">
              Sources récupérées
            </p>
            {message.sources.map((chunk, i) => (
              <SourceCard key={chunk.id} chunk={chunk} index={i} />
            ))}
          </div>
        )}

        {/* No RAG context badge */}
        {!isUser && message.ragWorked === false && !message.ragError && (
          <p className="text-[10px] font-mono text-foreground-dim px-1 italic">
            Aucun article trouvé dans les archives — réponse basée sur les connaissances du modèle.
          </p>
        )}
        {!isUser && message.ragError && (
          <div className="border border-rouge/30 bg-rouge/5 px-3 py-2">
            <p className="text-[10px] font-mono text-rouge font-semibold uppercase tracking-wider mb-1">
              Archives inaccessibles — réponse sans contexte
            </p>
            <p className="text-[10px] font-mono text-rouge/80 break-all">
              {message.ragError}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function MessageContent({ content }: { content: string }) {
  const parts = content.split(/(\*\*.*?\*\*|`[^`]+`|\[\d+\])/g)

  return (
    <p className="whitespace-pre-wrap">
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={i} className="font-semibold text-foreground">
              {part.slice(2, -2)}
            </strong>
          )
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code key={i} className="font-mono text-xs bg-panel text-accent px-1 py-0.5">
              {part.slice(1, -1)}
            </code>
          )
        }
        if (/^\[\d+\]$/.test(part)) {
          return (
            <sup key={i} className="font-mono text-[10px] text-accent font-bold cursor-default">
              {part}
            </sup>
          )
        }
        return part
      })}
    </p>
  )
}

function ThinkingDots() {
  return (
    <div className="flex items-center gap-1.5 py-0.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 bg-accent/50 animate-pulse"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  )
}
