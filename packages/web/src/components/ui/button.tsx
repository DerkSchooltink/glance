import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'

import { cn } from '@/lib/utils'

// The Plivo control voice: 11px JetBrains Mono, uppercase, tracked. Ink at rest; on hover the
// filled and outline variants converge to the brand blue with white text, and a click presses the
// control down 1px. No shadow on any variant — elevation is for layers that float.
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-mono text-label uppercase tracking-[0.05em] [transition:color_var(--duration-fast),background-color_var(--duration-fast),border-color_var(--duration-fast),transform_var(--duration-press)] active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-3.5 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-brand hover:text-brand-foreground',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        // hover:border-brand too, or the grey hairline frames the blue fill.
        outline:
          'border border-input bg-background text-foreground hover:border-brand hover:bg-brand hover:text-brand-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-accent',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        default: 'h-9 px-4 has-[>svg]:px-3',
        sm: 'h-8 gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 px-6 has-[>svg]:px-4',
        icon: "size-9 [&_svg:not([class*='size-'])]:size-4",
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : 'button'
  return (
    <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />
  )
}

export { Button }
