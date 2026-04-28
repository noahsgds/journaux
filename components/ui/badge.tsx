import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-mono font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-accent/15 text-accent border border-accent/25',
        secondary: 'bg-card text-foreground-muted border border-border',
        amber: 'bg-amber/15 text-amber border border-amber/25',
        success: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
        destructive: 'bg-red-500/15 text-red-400 border border-red-500/25',
        outline: 'border border-border text-foreground-muted',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
