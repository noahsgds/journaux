'use client'

import React from 'react'
import { MessageSquare, Users, ChevronRight, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Profile } from '@/lib/types'

type Panel = 'chat' | 'feed'

interface SidebarProps {
  activePanel: Panel
  onPanelChange: (panel: Panel) => void
  profiles: Profile[]
  selectedProfileId: string | null
  onSelectProfile: (id: string) => void
  onNewProfile: () => void
  open: boolean
  onClose: () => void
}

export function Sidebar({
  activePanel,
  onPanelChange,
  profiles,
  selectedProfileId,
  onSelectProfile,
  onNewProfile,
  open,
  onClose,
}: SidebarProps) {
  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          'flex flex-col h-full bg-surface border-r border-border',
          'w-64 min-w-[256px]',
          'lg:relative lg:translate-x-0 lg:z-auto',
          'fixed inset-y-0 left-0 z-50 transition-transform duration-200 ease-in-out',
          open ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0',
        )}
      >
        {/* Nameplate */}
        <div className="px-5 pt-6 pb-5 shrink-0">
          <div className="nameplate-line mb-1 flex items-start justify-between">
            <h1 className="font-display italic font-bold text-foreground text-2xl leading-none tracking-tight">
              TomKiosque
            </h1>
            <button
              onClick={onClose}
              className="lg:hidden p-1 text-foreground-dim hover:text-foreground transition-colors mt-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] font-mono text-foreground-dim uppercase tracking-widest mt-2">
            Analyse de presse
          </p>
        </div>

        {/* Nav */}
        <nav className="px-3 space-y-0.5 shrink-0">
          <NavItem
            icon={<MessageSquare className="w-4 h-4" />}
            label="Interroger"
            active={activePanel === 'chat'}
            onClick={() => { onPanelChange('chat'); onClose() }}
          />
          <NavItem
            icon={<Users className="w-4 h-4" />}
            label="Profils de veille"
            active={activePanel === 'feed'}
            onClick={() => { onPanelChange('feed'); onClose() }}
          />
        </nav>

        <div className="mx-4 my-4 border-t border-border shrink-0" />

        {/* Profiles section */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <div className="flex items-center justify-between px-4 mb-2 shrink-0">
            <span className="text-[10px] font-mono text-foreground-dim uppercase tracking-widest">
              Profils
            </span>
            <button
              onClick={() => { onNewProfile(); onClose() }}
              className="text-xs font-mono text-accent hover:text-accent-hover transition-colors"
            >
              + Nouveau
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-3 space-y-0.5 pb-4">
            {profiles.length === 0 ? (
              <p className="px-2 py-3 text-xs text-foreground-dim font-mono">
                Aucun profil.
              </p>
            ) : (
              profiles.map((profile) => (
                <ProfileItem
                  key={profile.id}
                  profile={profile}
                  active={selectedProfileId === profile.id}
                  onClick={() => {
                    onSelectProfile(profile.id)
                    onPanelChange('feed')
                    onClose()
                  }}
                />
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-border shrink-0">
          <p className="text-[10px] font-mono text-foreground-dim">
            pgvector · Supabase · Google AI
          </p>
        </div>
      </aside>
    </>
  )
}

function NavItem({
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
        'w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-all duration-150',
        active
          ? 'bg-accent text-white font-medium'
          : 'text-foreground-muted hover:bg-panel hover:text-foreground',
      )}
    >
      {icon}
      <span>{label}</span>
      {active && <ChevronRight className="w-3 h-3 ml-auto" />}
    </button>
  )
}

function ProfileItem({
  profile,
  active,
  onClick,
}: {
  profile: Profile
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-all duration-150 text-left',
        active
          ? 'bg-panel text-foreground border-l-2 border-accent'
          : 'text-foreground-muted hover:bg-panel hover:text-foreground',
      )}
    >
      <span
        className="w-2 h-2 rounded-full shrink-0"
        style={{ backgroundColor: profile.color }}
      />
      <span className="truncate flex-1">{profile.name}</span>
      <span className="text-[10px] font-mono text-foreground-dim shrink-0">
        {profile.subjects.length}
      </span>
    </button>
  )
}
