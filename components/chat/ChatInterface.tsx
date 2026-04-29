'use client'

import React, { useRef, useEffect, useCallback } from 'react'
import { useChat } from 'ai/react'
import { Send, RotateCcw, Newspaper, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChatMessage } from './ChatMessage'
import type { ChatMessage as ChatMessageType, JournalChunk } from '@/lib/types'

export function ChatInterface() {
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  // Track whether the user has ever sent a message so we don't flash back to
  // the empty state when useChat reverts optimistic updates on error.
  const everSentRef = useRef(false)

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    data: streamData,
    setMessages,
    append,
    error,
  } = useChat({
    api: '/api/chat',
    id: 'press-chat',
  })

  if (messages.length > 0) everSentRef.current = true

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const enrichedMessages: ChatMessageType[] = messages.map((msg, idx) => {
    const base: ChatMessageType = {
      id: msg.id,
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
      createdAt: msg.createdAt ?? new Date(),
    }
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

  const handlePromptClick = useCallback(
    (p: string) => {
      everSentRef.current = true
      append({ role: 'user', content: p })
    },
    [append],
  )

  const handleReset = useCallback(() => {
    everSentRef.current = false
    setMessages([])
  }, [setMessages])

  // Only show the empty/welcome state if the user has never sent a message
  const showEmpty = messages.length === 0 && !everSentRef.current

  return (
    <div className="flex flex-col h-full bg-surface">
      {/* Header — desktop */}
      <div className="hidden lg:flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
        <div>
          <h2 className="font-display font-semibold text-foreground text-lg">
            Interroger les archives
          </h2>
          <p className="text-xs font-mono text-foreground-dim mt-0.5">
            Recherche sémantique dans la revue de presse
          </p>
        </div>
        {(messages.length > 0 || everSentRef.current) && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-foreground-dim hover:text-foreground font-mono transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Effacer
          </button>
        )}
      </div>

      {/* Mobile clear */}
      {(messages.length > 0 || everSentRef.current) && (
        <div className="lg:hidden flex justify-end px-4 pt-2 shrink-0">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-foreground-dim hover:text-foreground font-mono transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Effacer
          </button>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="mx-4 mt-3 shrink-0 border border-rouge/40 bg-rouge/5 px-4 py-3 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-rouge shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">
              {friendlyError(error.message)}
            </p>
            <p className="text-xs text-foreground-muted mt-0.5 font-mono">
              {detailError(error.message)}
            </p>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        {showEmpty ? (
          <EmptyState onPrompt={handlePromptClick} />
        ) : (
          <ScrollArea className="h-full">
            <div className="px-3 py-4 lg:px-6 lg:py-6 space-y-5 lg:space-y-6 max-w-3xl mx-auto">
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
              {isLoading && messages[messages.length - 1]?.role === 'user' && (
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
              {/* Empty messages but user has tried — error was shown above */}
              {messages.length === 0 && everSentRef.current && !error && (
                <p className="text-sm text-foreground-dim font-mono text-center py-12">
                  Posez une nouvelle question…
                </p>
              )}
              <div ref={bottomRef} />
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border px-3 py-3 lg:px-6 lg:py-4 bg-surface shrink-0">
        <form
          onSubmit={(e) => {
            everSentRef.current = true
            handleSubmit(e)
          }}
          className="flex items-end gap-2 lg:gap-3 max-w-3xl mx-auto"
        >
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Posez une question sur l'actualité…"
              rows={1}
              className={cn(
                'w-full resize-none border border-border bg-canvas px-3 py-3 lg:px-4',
                'text-sm text-foreground placeholder:text-foreground-dim',
                'focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20',
                'transition-colors duration-150',
                'min-h-[48px] max-h-[140px] lg:max-h-[180px]',
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

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={cn(
              'shrink-0 h-[48px] w-[48px] flex items-center justify-center',
              'bg-accent text-white transition-colors',
              'hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed',
            )}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="hidden lg:block text-[10px] font-mono text-foreground-dim text-center mt-2">
          Entrée pour envoyer · Maj+Entrée pour un saut de ligne
        </p>
      </div>
    </div>
  )
}

const EXAMPLE_PROMPTS = [
  "Quels sont les grands sujets d'actualité du moment ?",
  'Que dit la presse sur la situation économique ?',
  'Résume les analyses sur la politique internationale',
  'Quels événements récents sont couverts dans les archives ?',
]

function friendlyError(msg: string | undefined): string {
  if (!msg) return 'Erreur de connexion à l\'API'
  if (msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('rate'))
    return 'Quota API dépassé'
  if (msg.includes('GOOGLE_GENERATIVE_AI_API_KEY') || msg.includes('API_KEY') || msg.includes('authentication'))
    return 'Clé API Google manquante ou invalide'
  if (msg.includes('model') && msg.includes('not found'))
    return 'Modèle introuvable'
  return 'Erreur de connexion à l\'API'
}

function detailError(msg: string | undefined): string {
  if (!msg) return 'Vérifiez la configuration et réessayez.'
  if (msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('free_tier'))
    return 'Votre clé API a atteint la limite gratuite. Activez la facturation sur console.cloud.google.com ou créez une nouvelle clé sur aistudio.google.com.'
  if (msg.includes('GOOGLE_GENERATIVE_AI_API_KEY'))
    return 'Configurez GOOGLE_GENERATIVE_AI_API_KEY dans les variables d\'environnement Vercel.'
  if (msg.includes('authentication') || msg.includes('API_KEY_INVALID'))
    return 'Vérifiez que la clé API est correcte dans les variables Vercel.'
  return 'Vérifiez la configuration de l\'API et réessayez.'
}

function EmptyState({ onPrompt }: { onPrompt: (p: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-12">
      <div className="mb-6 nameplate-line w-full max-w-md text-center pb-4">
        <div className="flex items-center justify-center gap-3 mb-1">
          <Newspaper className="w-5 h-5 text-accent" />
          <h3 className="font-display italic font-bold text-foreground text-2xl">
            TomKiosque
          </h3>
        </div>
        <p className="text-xs font-mono text-foreground-dim uppercase tracking-widest">
          Analyse de presse · Recherche sémantique
        </p>
      </div>

      <p className="text-sm text-foreground-muted text-center max-w-sm mb-8 leading-relaxed">
        Posez une question sur l'actualité. Chaque requête est comparée à l'index
        vectoriel des archives. Les réponses citent les articles sources.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-xl">
        {EXAMPLE_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => onPrompt(prompt)}
            className={cn(
              'text-left px-4 py-3 border border-border bg-canvas',
              'text-sm text-foreground-muted hover:text-foreground hover:border-accent hover:bg-surface',
              'transition-all duration-150 font-sans',
            )}
          >
            <span className="text-accent mr-2 font-bold">→</span>
            {prompt}
          </button>
        ))}
      </div>
    </div>
  )
}
