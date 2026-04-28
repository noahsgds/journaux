'use client'

import React from 'react'
import { Bot, User } from 'lucide-react'
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
      {/* Avatar */}
      <div
        className={cn(
          'shrink-0 w-8 h-8 rounded-md flex items-center justify-center border mt-0.5',
          isUser
            ? 'bg-surface border-border text-foreground-muted'
            : 'bg-accent/15 border-accent/30 text-accent',
        )}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      <div className={cn('flex flex-col gap-2 max-w-[85%]', isUser && 'items-end')}>
        {/* Bubble */}
        <div
          className={cn(
            'rounded-xl px-4 py-3 text-sm leading-relaxed',
            isUser
              ? 'bg-card border border-border text-foreground rounded-tr-sm'
              : 'bg-surface border border-border text-foreground rounded-tl-sm',
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
              Extraits récupérés
            </p>
            {message.sources.map((chunk, i) => (
              <SourceCard key={chunk.id} chunk={chunk} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function MessageContent({ content }: { content: string }) {
  // Basic markdown-like rendering: bold, inline code, line breaks
  const parts = content.split(/(\*\*.*?\*\*|`[^`]+`|\[[^\]]+\])/g)

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
            <code
              key={i}
              className="font-mono text-xs bg-muted/50 text-accent px-1 py-0.5 rounded"
            >
              {part.slice(1, -1)}
            </code>
          )
        }
        if (/^\[\d+\]$/.test(part)) {
          return (
            <sup
              key={i}
              className="font-mono text-[10px] text-accent font-semibold cursor-default"
            >
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
          className="w-1.5 h-1.5 rounded-full bg-accent/60 animate-pulse"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  )
}
