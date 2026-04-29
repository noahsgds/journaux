'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Menu, MessageSquare, Users } from 'lucide-react'
import { Sidebar } from '@/components/layout/Sidebar'
import { ChatInterface } from '@/components/chat/ChatInterface'
import { FocusFeed } from '@/components/profiles/FocusFeed'
import { ProfileList } from '@/components/profiles/ProfileList'
import { ProfileEditor } from '@/components/profiles/ProfileEditor'
import { TooltipProvider } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { Profile, ProfileCreate } from '@/lib/types'

type Panel = 'chat' | 'feed'

export default function Home() {
  const [activePanel, setActivePanel] = useState<Panel>('chat')
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const selectedProfile = profiles.find((p) => p.id === selectedProfileId) ?? null

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setSidebarOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const loadProfiles = useCallback(async () => {
    try {
      const res = await fetch('/api/profiles')
      if (!res.ok) return
      const json = await res.json()
      setProfiles(json.profiles ?? [])
    } catch {
      // Silently fail — Supabase may not be configured yet
    }
  }, [])

  useEffect(() => {
    loadProfiles()
  }, [loadProfiles])

  const handleSaveProfile = useCallback(
    async (data: ProfileCreate) => {
      if (editingProfile) {
        const res = await fetch(`/api/profiles/${editingProfile.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        if (res.ok) {
          const json = await res.json()
          setProfiles((prev) =>
            prev.map((p) => (p.id === editingProfile.id ? json.profile : p)),
          )
        }
      } else {
        const res = await fetch('/api/profiles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        if (res.ok) {
          const json = await res.json()
          setProfiles((prev) => [...prev, json.profile])
          setSelectedProfileId(json.profile.id)
          setActivePanel('feed')
        }
      }
      setEditingProfile(null)
    },
    [editingProfile],
  )

  const handleDeleteProfile = useCallback(async (id: string) => {
    const confirmed = window.confirm('Supprimer ce profil ?')
    if (!confirmed) return
    await fetch(`/api/profiles/${id}`, { method: 'DELETE' })
    setProfiles((prev) => prev.filter((p) => p.id !== id))
    setSelectedProfileId((cur) => (cur === id ? null : cur))
  }, [])

  const openNewProfile = useCallback(() => {
    setEditingProfile(null)
    setEditorOpen(true)
  }, [])

  const openEditProfile = useCallback((profile: Profile) => {
    setEditingProfile(profile)
    setEditorOpen(true)
  }, [])

  return (
    <TooltipProvider>
      <div className="flex h-[100dvh] w-screen overflow-hidden bg-canvas">
        {/* Left sidebar — always visible on lg+ */}
        <div className="hidden lg:flex lg:shrink-0">
          <Sidebar
            activePanel={activePanel}
            onPanelChange={setActivePanel}
            profiles={profiles}
            selectedProfileId={selectedProfileId}
            onSelectProfile={setSelectedProfileId}
            onNewProfile={openNewProfile}
            open={true}
            onClose={() => {}}
          />
        </div>

        {/* Mobile sidebar drawer */}
        <div className="lg:hidden">
          <Sidebar
            activePanel={activePanel}
            onPanelChange={setActivePanel}
            profiles={profiles}
            selectedProfileId={selectedProfileId}
            onSelectProfile={setSelectedProfileId}
            onNewProfile={openNewProfile}
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        </div>

        {/* Right content area */}
        <div className="flex flex-col flex-1 overflow-hidden min-w-0">
          <MobileHeader
            onMenuOpen={() => setSidebarOpen(true)}
            activePanel={activePanel}
          />

          {/* Top rule — desktop */}
          <div
            aria-hidden
            className="hidden lg:block h-px bg-border shrink-0"
          />

          <main className="flex-1 overflow-hidden">
            {activePanel === 'chat' ? (
              <ChatInterface />
            ) : (
              <FeedPanel
                profiles={profiles}
                selectedProfile={selectedProfile}
                selectedProfileId={selectedProfileId}
                onSelectProfile={setSelectedProfileId}
                onEdit={openEditProfile}
                onDelete={handleDeleteProfile}
                onNew={openNewProfile}
              />
            )}
          </main>

          <MobileBottomNav
            activePanel={activePanel}
            onPanelChange={setActivePanel}
          />
        </div>

        <ProfileEditor
          open={editorOpen}
          onClose={() => {
            setEditorOpen(false)
            setEditingProfile(null)
          }}
          onSave={handleSaveProfile}
          editing={editingProfile}
        />
      </div>
    </TooltipProvider>
  )
}

// ─── Mobile Header ────────────────────────────────────────────────────────────

function MobileHeader({
  onMenuOpen,
  activePanel,
}: {
  onMenuOpen: () => void
  activePanel: Panel
}) {
  return (
    <header className="lg:hidden flex items-center gap-3 px-4 h-14 border-b border-border bg-surface shrink-0">
      <button
        onClick={onMenuOpen}
        className="p-2 -ml-1 text-foreground-muted hover:text-foreground transition-colors"
        aria-label="Ouvrir le menu"
      >
        <Menu className="w-5 h-5" />
      </button>
      <div className="flex items-center gap-2.5">
        <span className="font-display italic font-bold text-foreground text-lg leading-none">
          TomKiosque
        </span>
        <span className="text-border">|</span>
        <span className="text-sm text-foreground-muted font-mono">
          {activePanel === 'chat' ? 'Interroger' : 'Profils'}
        </span>
      </div>
    </header>
  )
}

// ─── Mobile Bottom Nav ────────────────────────────────────────────────────────

function MobileBottomNav({
  activePanel,
  onPanelChange,
}: {
  activePanel: Panel
  onPanelChange: (p: Panel) => void
}) {
  return (
    <nav className="lg:hidden flex border-t border-border bg-surface shrink-0 safe-bottom">
      <BottomTab
        icon={<MessageSquare className="w-5 h-5" />}
        label="Interroger"
        active={activePanel === 'chat'}
        onClick={() => onPanelChange('chat')}
      />
      <BottomTab
        icon={<Users className="w-5 h-5" />}
        label="Profils"
        active={activePanel === 'feed'}
        onClick={() => onPanelChange('feed')}
      />
    </nav>
  )
}

function BottomTab({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-colors',
        active ? 'text-accent' : 'text-foreground-dim hover:text-foreground-muted',
      )}
    >
      {icon}
      <span className="text-[10px] font-mono uppercase tracking-widest">{label}</span>
    </button>
  )
}

// ─── Feed Panel ───────────────────────────────────────────────────────────────

interface FeedPanelProps {
  profiles: Profile[]
  selectedProfile: Profile | null
  selectedProfileId: string | null
  onSelectProfile: (id: string | null) => void
  onEdit: (p: Profile) => void
  onDelete: (id: string) => void
  onNew: () => void
}

function FeedPanel({
  profiles,
  selectedProfile,
  selectedProfileId,
  onSelectProfile,
  onEdit,
  onDelete,
  onNew,
}: FeedPanelProps) {
  if (selectedProfile) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-2 px-4 lg:px-6 pt-3 pb-0 shrink-0">
          <button
            onClick={() => onSelectProfile(null)}
            className="text-xs font-mono text-foreground-dim hover:text-accent transition-colors"
          >
            ← Tous les profils
          </button>
        </div>
        <FocusFeed profile={selectedProfile} />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 lg:px-6 py-4 border-b border-border shrink-0">
        <h2 className="font-display font-semibold text-foreground text-lg">
          Profils de veille
        </h2>
        <p className="text-xs font-mono text-foreground-dim mt-0.5">
          Associez des sujets à chaque profil — obtenez un fil classé par pertinence
        </p>
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <ProfileList
            profiles={profiles}
            selectedId={selectedProfileId}
            onSelect={(id) => onSelectProfile(id)}
            onEdit={onEdit}
            onDelete={onDelete}
            onNew={onNew}
          />
        </div>
      </div>
    </div>
  )
}
