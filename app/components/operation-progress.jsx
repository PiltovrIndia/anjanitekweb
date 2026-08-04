'use client'

import { Loader2 } from 'lucide-react'

import { cn } from '@/app/lib/utils'

export function OperationProgress({ title = 'Working', description = 'Please keep this page open while we finish.', className }) {
  return (
    <section
      aria-live="polite"
      aria-busy="true"
      className={cn('w-full max-w-sm rounded-md border border-primary/20 bg-primary/[0.03] px-4 py-3 shadow-sm', className)}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold leading-none">{title}</p>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-primary/10" aria-hidden="true">
        <div className="operation-progress-indicator h-full w-2/5 rounded-full bg-primary" />
      </div>
    </section>
  )
}
