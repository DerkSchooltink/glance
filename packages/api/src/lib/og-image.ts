// Signed brand-card image URL for the Slack unfurl (the "og image"): HMAC over
// `og:<space>/<site>` (lib/hmac.ts primitives — never re-implemented), minted into the card's
// image_url by the unfurl builder and verified by the CONTENT worker's /_glance/og route. Slack
// fetches image_url SERVER-SIDE and UNAUTHENTICATED, so the route must be public — the signature
// is what keeps a public image path from becoming the site-enumeration oracle the unfurl endpoint
// deliberately avoids (Glance has no anonymous tier). Deliberately STABLE (no expiry): Slack
// re-fetches after its cache lapses, and a dead URL breaks the card forever; unguessable-but-
// stable is the right trade here.
//
// Signed with CONTENT_TOKEN_SECRET — the one secret both workers share, in its existing
// direction (minted on main, verified on content, like lib/token.ts). The image lives on the
// CONTENT worker so the ~700 KiB gz satori/resvg wasm (lib/og-render.ts) never enters the main
// worker bundle. This file must stay renderer-free for the same reason in reverse: the main
// worker imports it for minting.

import { secretEquals } from './bootstrap'
import { hmacSignHex } from './hmac'

/** hex(HMAC(secret, `og:<space>/<site>`)) — the `og:` scope prefix domain-separates this use of
 *  CONTENT_TOKEN_SECRET from the content tokens minted with it. */
export function signOgSig(secret: string, spaceSlug: string, siteSlug: string): Promise<string> {
  return hmacSignHex(secret, `og:${spaceSlug}/${siteSlug}`)
}

/** Constant-time verify (a MAC compared with `===` leaks timing). */
export async function verifyOgSig(secret: string, spaceSlug: string, siteSlug: string, sig: string): Promise<boolean> {
  return secretEquals(await signOgSig(secret, spaceSlug, siteSlug), sig)
}

/** The absolute, signed image_url the unfurl card carries — on the CONTENT origin, under the
 *  reserved `_glance` prefix (never a space slug, see content.ts's asset routes). `v` is a
 *  cache-buster for Slack, which caches by full URL and the sig is deliberately stable: bump it
 *  whenever the rendered card changes visually (v3: entity-decode fix, back to 1200×630), else
 *  channels keep showing the cached old design. The route ignores it. */
export async function signedOgImageUrl(
  secret: string,
  contentUrl: string,
  spaceSlug: string,
  siteSlug: string,
): Promise<string> {
  return `${contentUrl}/_glance/og/${spaceSlug}/${siteSlug}.png?sig=${await signOgSig(secret, spaceSlug, siteSlug)}&v=4`
}

/** What the card renders. Kept to what the picture needs — the route resolves it, the renderer
 *  (real or the OG_RENDER test seam) consumes it. */
export type OgCard = { title: string; spaceSlug: string; siteSlug: string }

// The brand mark: packages/web/public/favicon.svg with the theme-adaptive <style> flattened to
// the light-theme rim (satori/resvg render static SVG; a media query would be ignored anyway).
const BRAND_MARK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect x="8" y="8" width="496" height="496" rx="62" fill="#323dfe"/><rect x="14" y="14" width="484" height="484" rx="56" fill="none" stroke="rgba(9,9,11,0.16)" stroke-width="12"/><path d="M256 132C356 132 442 196 476 256C442 316 356 380 256 380C156 380 70 316 36 256C70 196 156 132 256 132Z" fill="#ffffff"/><rect x="184" y="184" width="144" height="144" rx="18" fill="#09090b"/><rect x="208" y="222" width="92" height="20" rx="4" fill="#323dfe"/><circle cx="300" cy="296" r="18" fill="#ffffff"/></svg>`

const BRAND_MARK_DATA_URI = `data:image/svg+xml;base64,${btoa(BRAND_MARK_SVG)}`

// NOT entity-escaping (and not lib/markdown's escapeHtml): workers-og's HTML parser never
// decodes entities, so `&amp;` renders LITERALLY on the card (seen live with a title containing
// `&`). Raw `&`/`"` are plain text to that parser; only `<`/`>` could open markup, so they're
// swapped for lookalike angle quotes — injection-proof and faithful for every real title.
const esc = (s: string) => s.replace(/</g, '‹').replace(/>/g, '›')

/** The card markup (satori's HTML subset: everything display:flex, inline styles only). Brand
 *  palette is Plivo's dark theme: ink ground #09090b, near-white #fafafa, and the brand blue's
 *  text lift #4d6aff for the one accent line. Display face Sora. Sizes are for the 1200×630
 *  canvas (og-render.ts). The title uses satori's native line-clamp (needs display:block): a
 *  long title ends in a visible ellipsis at exactly three wrapped lines instead of clipping
 *  mid-sentence. */
export function ogCardHtml(card: OgCard): string {
  return `<div style="display:flex;flex-direction:column;justify-content:space-between;width:100vw;height:100vh;background:#09090b;padding:72px;font-family:'Sora'">
  <div style="display:flex;align-items:center">
    <img src="${BRAND_MARK_DATA_URI}" width="96" height="96" />
    <div style="display:flex;align-items:baseline;margin-left:28px">
      <span style="font-size:44px;font-weight:600;letter-spacing:-0.02em;color:#fafafa">Glance</span>
      <span style="margin-left:14px;font-size:24px;color:#71717a">by Plivo</span>
    </div>
  </div>
  <div style="display:flex;flex-direction:column">
    <span style="display:block;line-clamp:3;font-size:64px;font-weight:600;letter-spacing:-0.03em;color:#fafafa;line-height:1.15">${esc(card.title)}</span>
    <span style="margin-top:24px;font-size:32px;color:#4d6aff">${esc(card.spaceSlug)}/${esc(card.siteSlug)}</span>
  </div>
</div>`
}
