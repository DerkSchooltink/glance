import type { Bindings } from '../types'
import { discoverOidc } from './oidc'

export function isOidcBearerEnabled(env: Bindings): boolean {
  return Boolean(env.OIDC_ISSUER && env.OIDC_CLIENT_ID && env.OIDC_CLI_CLIENT_ID)
}

const cliIssuer = (env: Bindings) => env.OIDC_CLI_ISSUER || (env.OIDC_ISSUER as string)

/** What `glance login` needs to run the provider's device flow; null while the feature is off. */
export function cliOidcConfig(env: Bindings) {
  if (!isOidcBearerEnabled(env)) return null
  return {
    issuer: cliIssuer(env),
    clientId: env.OIDC_CLI_CLIENT_ID as string,
    scope: env.OIDC_CLI_SCOPE || 'openid profile offline_access',
    tokenUse: env.OIDC_CLI_TOKEN === 'access' ? 'access' : 'id',
  }
}

const SKEW_SECONDS = 60
const JWKS_REFETCH_MS = 60_000

type Jwk = JsonWebKey & { kid?: string }
let keys: { uri: string; fetchedAt: number; byKid: Map<string, CryptoKey> } | null = null

export function resetOidcKeys(): void {
  keys = null
}

function decode(part: string): Uint8Array {
  const b64 = part.replace(/-/g, '+').replace(/_/g, '/')
  return Uint8Array.from(atob(b64.padEnd(Math.ceil(b64.length / 4) * 4, '=')), (ch) => ch.charCodeAt(0))
}

async function loadKeys(uri: string): Promise<Map<string, CryptoKey>> {
  const res = await fetch(uri)
  if (!res.ok) throw new Error(`OIDC jwks failed: ${res.status}`)
  const byKid = new Map<string, CryptoKey>()
  for (const jwk of ((await res.json()) as { keys: Jwk[] }).keys) {
    if (jwk.kty !== 'RSA' || !jwk.kid) continue
    byKid.set(
      jwk.kid,
      await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']),
    )
  }
  return byKid
}

/** The provider's signing key `kid`. An unknown kid refetches the set, at most once a minute, so a
 *  key rotation is picked up without letting a forged kid turn every request into a fetch. */
async function signingKey(uri: string, kid: string): Promise<CryptoKey | null> {
  if (keys?.uri !== uri) keys = { uri, fetchedAt: 0, byKid: new Map() }
  let key = keys.byKid.get(kid)
  if (!key && Date.now() - keys.fetchedAt > JWKS_REFETCH_MS) {
    keys = { uri, fetchedAt: Date.now(), byKid: await loadKeys(uri) }
    key = keys.byKid.get(kid)
  }
  return key ?? null
}

/** True for a compact JWS (three dot-separated parts), the shape of the provider's tokens; CLI
 *  tokens and API keys never look like one. */
export function looksLikeJwt(token: string): boolean {
  return token.split('.').length === 3
}

/** The `sub` of a provider-issued bearer token, or null when it must be refused. The signature is
 *  verified against the provider's published keys, then issuer, audience and expiry are checked:
 *  an ID token carries the CLI client id as `aud`; an access token from a custom authorization
 *  server carries OIDC_CLI_AUDIENCE and names the client in `cid`. */
export async function verifyOidcBearer(env: Bindings, token: string, now = Date.now()): Promise<string | null> {
  if (!isOidcBearerEnabled(env) || !looksLikeJwt(token)) return null
  try {
    const [head, body, sig] = token.split('.')
    const header = JSON.parse(new TextDecoder().decode(decode(head))) as { alg?: string; kid?: string }
    if (header.alg !== 'RS256' || !header.kid) return null

    const endpoints = await discoverOidc(env, cliIssuer(env))
    if (!endpoints.jwks_uri) return null
    const key = await signingKey(endpoints.jwks_uri, header.kid)
    if (!key) return null
    const signed = new TextEncoder().encode(`${head}.${body}`)
    if (!(await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, decode(sig), signed))) return null

    const claims = JSON.parse(new TextDecoder().decode(decode(body))) as Record<string, unknown>
    const seconds = now / 1000
    if (claims.iss !== cliIssuer(env)) return null
    if (typeof claims.exp !== 'number' || claims.exp + SKEW_SECONDS <= seconds) return null
    if (typeof claims.nbf === 'number' && claims.nbf - SKEW_SECONDS > seconds) return null

    const audiences = Array.isArray(claims.aud) ? claims.aud : [claims.aud]
    const accessToken = env.OIDC_CLI_TOKEN === 'access'
    const audienceOk = accessToken
      ? Boolean(env.OIDC_CLI_AUDIENCE) &&
        audiences.includes(env.OIDC_CLI_AUDIENCE) &&
        claims.cid === env.OIDC_CLI_CLIENT_ID
      : audiences.includes(env.OIDC_CLI_CLIENT_ID)
    if (!audienceOk) return null
    return typeof claims.sub === 'string' && claims.sub ? claims.sub : null
  } catch {
    return null
  }
}
