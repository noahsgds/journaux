'use client'

import React, { useRef, useEffect, useCallback } from 'react'
import { useChat } from 'ai/react'
import { Send, RotateCcw, Sparkles } from 'lucide-react'
import { cn, generateId } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChatMessage } from './ChatMessage'
import type { ChatMessage as ChatMessageType, JournalChunk } from '@/lib/types'

export function ChatInterface() {
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    data: streamData,
    setMessages,
  } = useChat({
    api: '/api/chat',
    id: 'journal-chat',
  })

  // Auto-scroll to bottom on new content
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Map stream data (sources) to the last assistant message
  const enrichedMessages: ChatMessageType[] = messages.map((msg, idx) => {
    const base: ChatMessageType = {
      id: msg.id,
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
      createdAt: msg.createdAt ?? new Date(),
    }
    // Attach sources to the last assistant message from StreamData
    if (
      msg.role === 'assistant' &&
      idx === messages.length - 1 &&
      streamData?.length
    ) {
      const lastData = streamData[streamData.length - 1] as {
        sources?: JournalChunk[]
      }
      if (lastData?.sources) base.sources = lastData.sources
    }
    return base
  })

  // Submit on Enter (Shift+Enter for newline)
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        if (input.trim() && !isLoading) {
          handleSubmit(e as unknown as React.FormEvent)
        }
      }
    },
    [input, isLoading, handleSubmit],
  )

  const isEmpty = messages.length === 0

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div>
          <h2 className="font-display font-semibold text-foreground text-lg">
            Journal Q&A
          </h2>
          <p className="text-xs font-mono text-foreground-dim mt-0.5">
            Ask anything — grounded in your journal archive
          </p>
        </div>
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMessages([])}
            className="gap-1.5 text-foreground-dim"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear
          </Button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        {isEmpty ? (
          <EmptyState onPrompt={(p) => {
            const syntheticEvent = { target: { value: p } } as React.ChangeEvent<HTMLInputElement>
            handleInputChange(syntheticEvent)
            setTimeout(() => inputRef.current?.focus(), 50)
          }} />
        ) : (
          <ScrollArea className="h-full">
            <div className="px-6 py-6 space-y-6 max-w-3xl mx-auto">
              {enrichedMessages.map((msg, i) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  isStreaming={
                    isLoading &&
                    i === enrichedMessages.length - 1 &&
                    msg.role === 'assistant' &&
                    !msg.content
                  }
                />
              ))}
              {/* Loading placeholder */}
              {isLoading &&
                messages[messages.length - 1]?.role === 'user' && (
                  <ChatMessage
                    message={{
                      id: 'thinking',
                      role: 'assistant',
                      content: '',
                      createdAt: new Date(),
                    }}
                    isStreaming
                  />
                )}
              <div ref={bottomRef} />
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border px-6 py-4">
        <form
          onSubmit={handleSubmit}
          className="flex items-end gap-3 max-w-3xl mx-auto"
        >
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your journal entries…"
              rows={1}
              className={cn(
                'w-full resize-none rounded-xl border border-border bg-card px-4 py-3 pr-12',
                'text-sm text-foreground placeholder:text-foreground-dim',
                'focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30',
                'transition-all duration-150',
                'min-h-[48px] max-h-[180px]',
              )}
              style={{
                height: 'auto',
                overflow: input.split('\n').length > 3 ? 'auto' : 'hidden',
              }}
              onInput={(e) => {
                const el = e.currentTarget
                el.style.height = 'auto'
                el.style.height = Math.min(el.scrollHeight, 180) + 'px'
              }}
            />
          </div>

          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            size="icon"
            className="shrink-0 h-12 w-12 rounded-xl"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
        <p className="text-[10px] font-mono text-foreground-dim text-center mt-2">
          Enter to send · Shift+Enter for newline
        </p>
      </div>
    </div>
  )
}

const EXAMPLE_PROMPTS = [
  'What recurring themes appear across multiple entries?',
  'Summarize entries related to housing and urban development',
  'What does the journal say about labor movements?',
  'Find passages mentioning environmental concerns',
]

function EmptyState({ onPrompt }: { onPrompt: (p: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-12">
      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 mb-6">
        <Sparkles className="w-6 h-6 text-accent" />
      </div>
      <h3 className="font-display text-xl font-semibold text-foreground mb-2">
        Ask your journal archive
      </h3>
      <p className="text-sm text-foreground-muted text-center max-w-sm mb-8">
        Questions are embedded and matched against the full vector index.
        Answers are grounded in retrieved excerpts.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-xl">
        {EXAMPLE_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => onPrompt(prompt)}
            className={cn(
              'text-left px-4 py-3 rounded-lg border border-border bg-card',
              'text-sm text-foreground-muted hover:text-foreground hover:border-accent/40 hover:bg-card',
              'transition-all duration-150',
            )}
          >
            <span className="text-accent mr-1.5">&rarr;</span>
            {prompt}
          </button>
        ))}
      </div>
    </div>
  )
}
