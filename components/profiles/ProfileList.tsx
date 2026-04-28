'use client'

import React from 'react'
import { Pencil, Trash2, Users } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Profile } from '@/lib/types'

interface ProfileListProps {
  profiles: Profile[]
  selectedId: string | null
  onSelect: (id: string) => void
  onEdit: (profile: Profile) => void
  onDelete: (id: string) => void
  onNew: () => void
}

export function ProfileList({
  profiles,
  selectedId,
  onSelect,
  onEdit,
  onDelete,
  onNew,
}: ProfileListProps) {
  if (profiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-card border border-border">
          <Users className="w-5 h-5 text-foreground-dim" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">No profiles yet</p>
          <p className="text-xs text-foreground-muted mt-1">
            Create a profile to assign subjects and see focused feeds
          </p>
        </div>
        <Button onClick={onNew} size="sm">
          Create first profile
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-6 content-start">
      {profiles.map((profile) => (
        <ProfileCard
          key={profile.id}
          profile={profile}
          selected={selectedId === profile.id}
          onSelect={onSelect}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}

      {/* Add new card */}
      <button
        onClick={onNew}
        className={cn(
          'rounded-xl border border-dashed border-border text-foreground-dim',
          'flex flex-col items-center justify-center gap-1.5 p-6 min-h-[140px]',
          'hover:border-accent/40 hover:text-accent transition-all duration-150',
          'text-sm font-mono',
        )}
      >
        <span className="text-2xl font-light">+</span>
        New profile
      </button>
    </div>
  )
}

function ProfileCard({
  profile,
  selected,
  onSelect,
  onEdit,
  onDelete,
}: {
  profile: Profile
  selected: boolean
  onSelect: (id: string) => void
  onEdit: (p: Profile) => void
  onDelete: (id: string) => void
}) {
  return (
    <div
      className={cn(
        'relative rounded-xl border bg-card p-4 cursor-pointer transition-all duration-150',
        'flex flex-col gap-3 group',
        selected
          ? 'border-accent/40 shadow-sm shadow-accent/10'
          : 'border-border hover:border-border/60',
      )}
      onClick={() => onSelect(profile.id)}
    >
      {/* Color accent line */}
      <div
        className="absolute top-0 left-4 right-4 h-0.5 rounded-b-full"
        style={{ backgroundColor: profile.color }}
      />

      <div className="flex items-start justify-between gap-2 pt-1">
        <div className="flex items-center gap-2.5">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0 mt-0.5"
            style={{ backgroundColor: profile.color }}
          />
          <h3 className="font-display font-semibold text-foreground text-base leading-tight">
            {profile.name}
          </h3>
        </div>

        {/* Actions (show on hover) */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={(e) => {
              e.stopPropagation()
              onEdit(profile)
            }}
            className="text-foreground-dim hover:text-foreground"
          >
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(profile.id)
            }}
            className="text-foreground-dim hover:text-red-400"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Subjects */}
      {profile.subjects.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {profile.subjects.slice(0, 4).map((s) => (
            <Badge key={s} variant="secondary" className="text-[10px]">
              {s}
            </Badge>
          ))}
          {profile.subjects.length > 4 && (
            <Badge variant="outline" className="text-[10px]">
              +{profile.subjects.length - 4}
            </Badge>
          )}
        </div>
      ) : (
        <p className="text-xs text-foreground-dim italic">No subjects assigned</p>
      )}

      <div className="flex items-center justify-between mt-auto pt-1">
        <span className="text-[10px] font-mono text-foreground-dim">
          {profile.subjects.length} subject{profile.subjects.length !== 1 ? 's' : ''}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onSelect(profile.id)
          }}
          className="text-[10px] font-mono text-accent hover:text-accent-hover transition-colors"
        >
          View feed →
        </button>
      </div>
    </div>
  )
}
