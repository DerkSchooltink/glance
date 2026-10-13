import { describe, expect, test } from 'bun:test'
import { cn } from './utils'

// The Plivo type ramp shares the text-* prefix with colours. Stock tailwind-merge files an
// unknown text-* class under colour, so `text-label` beside `text-primary-foreground` was merged
// away and every button lost its 11px mono size. cn must treat ramp tokens as sizes.
describe('cn', () => {
  test('keeps a ramp size beside a text colour', () => {
    expect(cn('font-mono text-label uppercase', 'text-primary-foreground')).toBe(
      'font-mono text-label uppercase text-primary-foreground',
    )
    expect(cn('text-p-400 text-muted-foreground')).toBe('text-p-400 text-muted-foreground')
  })

  test('still lets a later ramp size replace an earlier one', () => {
    expect(cn('text-label', 'text-xs-500')).toBe('text-xs-500')
  })

  test('still lets a later colour replace an earlier one', () => {
    expect(cn('text-p-400 text-muted-foreground', 'text-foreground')).toBe('text-p-400 text-foreground')
  })
})
