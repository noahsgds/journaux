'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { ChatInterface } from '@/components/chat/ChatInterface'
import { FocusFeed } from '@/components/profiles/FocusFeed'
import { ProfileList } from '@/components/profiles/ProfileList'
import { ProfileEditor } from '@/components/profiles/ProfileEditor'
import { TooltipProvider } from '@/components/ui/tooltip'
import type { Profile, ProfileCreate } from '@/lib/types'

type Panel = 'chat' | 'feed'

export default function Home() {
  const [activePanel, setActivePanel] = useState<Panel>('chat')
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null)

  const selectedProfile = profiles.find((p) => p.id === selectedProfileId) ?? null

  // ── Load profiles ──────────────────────────────────────────────────────────
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

  // ── Profile CRUD ───────────────────────────────────────────────────────────
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

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <TooltipProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-canvas">
        {/* Left sidebar */}
        <Sidebar
          activePanel={activePanel}
          onPanelChange={setActivePanel}
          profiles={profiles}
          selectedProfileId={selectedProfileId}
          onSelectProfile={setSelectedProfileId}
          onNewProfile={openNewProfile}
        />

        {/* Right main panel */}
        <main className="flex-1 flex flex-col overflow-hidden bg-canvas relative">
          {/* Subtle top gradient accent */}
          <div
            aria-hidden
            className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent"
          />

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

        {/* Profile editor modal */}
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

// ─── Feed Panel ───────────────────────────────────────────────────────────────
// Shows the profile grid if no profile selected, or the FocusFeed for the selected profile

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
        {/* Breadcrumb back to list */}
        <div className="flex items-center gap-2 px-6 pt-3 pb-0">
          <button
            onClick={() => onSelectProfile(null)}
            className="text-xs font-mono text-foreground-dim hover:text-accent transition-colors"
          >
            ← All profiles
          </button>
        </div>
        <FocusFeed profile={selectedProfile} />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border">
        <h2 className="font-display font-semibold text-foreground text-lg">
          Profils thématiques
        </h2>
        <p className="text-xs font-mono text-foreground-dim mt-0.5">
          Associez des sujets à chaque personne — obtenez un fil classé par pertinence
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
