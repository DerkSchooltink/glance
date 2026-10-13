import { Loader2, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('size-4 animate-spin', className)} />
}

/** The brand mark (favicon.svg) — the header logo in AppShell and the viewer. */
export function BrandMark() {
  return <img src="/favicon.svg" alt="" className="size-4 rounded-sm" />
}

/** "by Plivo", the byline beside the Glance mark: plain, small text, quieter than everything
 *  around it, so it reads as attribution rather than a second logo. Callers baseline-align it
 *  with the "glance" wordmark. */
export function ByPlivo({ className }: { className?: string }) {
  return (
    <span className={cn('font-normal font-sans text-[11px] text-muted-foreground/80 tracking-normal', className)}>
      by Plivo
    </span>
  )
}

/** The plivo.com instrument eyebrow: an index, a short rule, the label, then a dashed hairline
 *  that runs to the edge, with optional terse metadata after it. Mono uppercase; the index sits at
 *  70% ink in tabular figures. */
export function Eyebrow({
  index,
  meta,
  children,
}: {
  index: React.ReactNode
  meta?: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <span className="flex min-w-0 flex-1 items-center gap-3 text-kicker text-muted-foreground tabular-nums">
      <span className="flex shrink-0 items-center gap-2">
        <span className="text-foreground/70">{index}</span>
        <span className="h-px w-6 bg-border" />
      </span>
      {children}
      <span className="min-w-6 flex-1 border-border border-t border-dashed" />
      {meta && <span className="shrink-0">{meta}</span>}
    </span>
  )
}

export function PageHeader({
  title,
  description,
  eyebrow = 'work',
  children,
}: {
  title: React.ReactNode
  description?: React.ReactNode
  eyebrow?: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex">
        <Eyebrow index="~">{eyebrow}</Eyebrow>
      </div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-h1-500">{title}</h1>
          {description && <p className="mt-1 text-muted-foreground text-sm">{description}</p>}
        </div>
        {children && <div className="flex items-center gap-2">{children}</div>}
      </div>
    </div>
  )
}

// Section heading as an instrument eyebrow: numbered index, the title as the label, a dashed rule
// trailing off to the right — the same device that opens every section on plivo.com.
export function SectionHeader({
  index,
  title,
  children,
}: {
  index?: number
  title: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Eyebrow index={index != null ? String(index).padStart(2, '0') : '~'}>
        <h2 className="truncate text-kicker">{title}</h2>
      </Eyebrow>
      {children}
    </div>
  )
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  children,
  className,
}: {
  icon?: LucideIcon
  title: string
  description?: string
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded border border-dashed bg-surface px-6 py-16 text-center',
        className,
      )}
    >
      {Icon && (
        <div className="mb-3 flex size-11 items-center justify-center rounded border bg-background text-muted-foreground">
          <Icon className="size-5" />
        </div>
      )}
      <div className="font-display text-h4-500">{title}</div>
      {description && <p className="mt-1 max-w-sm text-muted-foreground text-sm">{description}</p>}
      {children && <div className="mt-4 flex items-center gap-2">{children}</div>}
    </div>
  )
}
