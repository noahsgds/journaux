'use client'

import React, { useState, useEffect } from 'react'
import { X, Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { PROFILE_COLORS } from '@/lib/utils'
import type { Profile, ProfileCreate } from '@/lib/types'

interface ProfileEditorProps {
  open: boolean
  onClose: () => void
  onSave: (data: ProfileCreate) => Promise<void>
  editing?: Profile | null
}

export function ProfileEditor({
  open,
  onClose,
  onSave,
  editing,
}: ProfileEditorProps) {
  const [name, setName] = useState('')
  const [subjects, setSubjects] = useState<string[]>([])
  const [subjectInput, setSubjectInput] = useState('')
  const [color, setColor] = useState(PROFILE_COLORS[0])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (editing) {
      setName(editing.name)
      setSubjects(editing.subjects)
      setColor(editing.color)
    } else {
      setName('')
      setSubjects([])
      setColor(PROFILE_COLORS[0])
    }
    setSubjectInput('')
  }, [editing, open])

  function addSubject() {
    const trimmed = subjectInput.trim()
    if (trimmed && !subjects.includes(trimmed)) {
      setSubjects((prev) => [...prev, trimmed])
    }
    setSubjectInput('')
  }

  function removeSubject(subject: string) {
    setSubjects((prev) => prev.filter((s) => s !== subject))
  }

  async function handleSave() {
    if (!name.trim()) return
    setSaving(true)
    try {
      await onSave({ name: name.trim(), subjects, color })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-full max-w-md mx-4 sm:mx-auto">
        <DialogHeader>
          <DialogTitle>
            {editing ? 'Modifier le profil' : 'Nouveau profil'}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 space-y-5">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-foreground-dim uppercase tracking-widest">
              Nom
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex. Marie Dupont"
              autoFocus
            />
          </div>

          {/* Color */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-foreground-dim uppercase tracking-widest">
              Couleur
            </label>
            <div className="flex gap-2">
              {PROFILE_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className="w-6 h-6 rounded-full transition-all duration-150 ring-offset-canvas"
                  style={{
                    backgroundColor: c,
                    boxShadow:
                      color === c
                        ? `0 0 0 2px #09090f, 0 0 0 4px ${c}`
                        : undefined,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Subjects */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-foreground-dim uppercase tracking-widest">
              Sujets d'intérêt
            </label>
            <div className="flex gap-2">
              <Input
                value={subjectInput}
                onChange={(e) => setSubjectInput(e.target.value)}
                placeholder="ex. théâtre, expositions, musique"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault()
                    addSubject()
                  }
                }}
              />
              <Button
                variant="secondary"
                size="icon"
                onClick={addSubject}
                disabled={!subjectInput.trim()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-[10px] font-mono text-foreground-dim">
              Entrée ou virgule pour ajouter
            </p>

            {subjects.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {subjects.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 bg-accent/10 text-accent border border-accent/20 rounded-sm px-2 py-0.5 text-xs font-mono"
                  >
                    {s}
                    <button
                      onClick={() => removeSubject(s)}
                      className="hover:text-accent-hover"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || saving}>
            {saving ? 'Enregistrement…' : editing ? 'Mettre à jour' : 'Créer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
