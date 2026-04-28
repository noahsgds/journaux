'use client'

import React from 'react'
import { MessageSquare, Users, Database, ChevronRight } from 'lucide-react'
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
}

export function Sidebar({
  activePanel,
  onPanelChange,
  profiles,
  selectedProfileId,
  onSelectProfile,
  onNewProfile,
}: SidebarProps) {
  return (
    <aside className="flex flex-col w-64 min-w-[256px] h-full bg-surface border-r border-border">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-border">
        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-accent/15 border border-accent/30">
          <Database className="w-4 h-4 text-accent" />
        </div>
        <div>
          <h1 className="font-display font-semibold text-foreground text-base leading-none">
            VectorLens
          </h1>
          <p className="text-[10px] font-mono text-foreground-dim mt-0.5 uppercase tracking-widest">
            RAG Platform
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="px-3 pt-4 space-y-0.5">
        <NavItem
          icon={<MessageSquare className="w-4 h-4" />}
          label="Journal Q&A"
          active={activePanel === 'chat'}
          onClick={() => onPanelChange('chat')}
        />
        <NavItem
          icon={<Users className="w-4 h-4" />}
          label="Subject Profiles"
          active={activePanel === 'feed'}
          onClick={() => onPanelChange('feed')}
        />
      </nav>

      <div className="mx-4 my-3 border-t border-border" />

      {/* Profiles section */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 mb-2">
          <span className="text-[10px] font-mono text-foreground-dim uppercase tracking-widest">
            Profiles
          </span>
          <button
            onClick={onNewProfile}
            className="text-xs font-mono text-accent hover:text-accent-hover transition-colors"
          >
            + New
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 space-y-0.5 pb-4">
          {profiles.length === 0 ? (
            <p className="px-2 py-3 text-xs text-foreground-dim font-mono">
              No profiles yet.
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
                }}
              />
            ))
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-border">
        <p className="text-[10px] font-mono text-foreground-dim">
          pgvector · Supabase · Claude
        </p>
      </div>
    </aside>
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
        'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-150',
        active
          ? 'bg-accent/15 text-accent border border-accent/25 shadow-sm shadow-accent/10'
          : 'text-foreground-muted hover:bg-card hover:text-foreground',
      )}
    >
      {icon}
      <span className="font-medium">{label}</span>
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
        'w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-all duration-150 text-left',
        active
          ? 'bg-card text-foreground border border-border'
          : 'text-foreground-muted hover:bg-card hover:text-foreground',
      )}
    >
      {/* Color dot */}
      <span
        className="w-2 h-2 rounded-full shrink-0"
        style={{ backgroundColor: profile.color }}
      />
      <span className="truncate font-medium flex-1">{profile.name}</span>
      <span className="text-[10px] font-mono text-foreground-dim shrink-0">
        {profile.subjects.length}
      </span>
    </button>
  )
}
