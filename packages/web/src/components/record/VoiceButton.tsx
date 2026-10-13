import { Mic, Square } from 'lucide-react'
import type { RecorderState } from '@/hooks/useMediaRecorder'
import { cn } from '@/lib/utils'

// The primary recorder control: a large circular button that starts recording when idle and stops
// it while recording/paused. A live recording gets a pulsing red ring; pause/resume is a separate
// affordance the dialog renders beside it.
export function VoiceButton({
  state,
  onStart,
  onStop,
  disabled,
}: {
  state: RecorderState
  onStart: () => void
  onStop: () => void
  disabled?: boolean
}) {
  const live = state === 'recording' || state === 'paused'
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={live ? onStop : onStart}
      aria-label={live ? 'Stop recording' : 'Start recording'}
      className={cn(
        'relative flex size-20 items-center justify-center rounded text-brand-foreground outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50',
        live ? 'bg-destructive hover:bg-destructive/90' : 'bg-brand hover:bg-brand/90',
      )}
    >
      {state === 'recording' && (
        <span className="absolute inset-0 animate-ping rounded bg-destructive/40" aria-hidden />
      )}
      {live ? <Square className="relative size-7 fill-current" /> : <Mic className="relative size-8" />}
    </button>
  )
}
