import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'
import ramp from '@plivo/tokens/type.json'

// tailwind-merge only knows Tailwind's stock font sizes, so it reads the Plivo ramp (text-label,
// text-p-400, …) as text COLOURS and silently drops them beside text-foreground. Register every
// ramp token as a size; the list comes from the tokens package, so it can't drift.
const twMerge = extendTailwindMerge({ extend: { theme: { text: Object.keys(ramp) } } })

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
