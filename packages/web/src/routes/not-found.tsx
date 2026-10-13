import { Link } from 'react-router'

import { Button } from '@/components/ui/button'

export function Component() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      {/* plivo.com's 404: a small brand label over an ink display headline */}
      <p className="text-brand-text text-kicker">404 error</p>
      <h2 className="mt-4 text-foreground text-headline">Page not found</h2>
      <p className="mt-3 text-muted-foreground">That page or site doesn&apos;t exist.</p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <Link to="/dashboard">Back to dashboard</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/login">Sign in</Link>
        </Button>
      </div>
    </div>
  )
}
