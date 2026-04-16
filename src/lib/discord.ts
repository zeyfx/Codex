import type { DiscordUser, AuthUser } from '../types'

const DISCORD_API = 'https://discord.com/api/v10'
const CLIENT_ID = import.meta.env.VITE_DISCORD_CLIENT_ID as string
const CLIENT_SECRET = import.meta.env.VITE_DISCORD_CLIENT_SECRET as string
const REDIRECT_URI = 'http://127.0.0.1:6543/auth/callback'

export async function exchangeCodeForToken(code: string): Promise<string> {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    grant_type: 'authorization_code',
    code,
    redirect_uri: REDIRECT_URI
  })

  const res = await fetch(`${DISCORD_API}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString()
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(`[Discord] Token exchange failed: ${err.error_description ?? err.error}`)
  }

  const data = await res.json()
  return data.access_token as string
}

export async function fetchDiscordUser(accessToken: string): Promise<DiscordUser> {
  const res = await fetch(`${DISCORD_API}/users/@me`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  })

  if (!res.ok) throw new Error('[Discord] Failed to fetch user data')

  return res.json()
}

export function buildAvatarUrl(user: DiscordUser): string | null {
  if (!user.avatar) return null
  const ext = user.avatar.startsWith('a_') ? 'gif' : 'webp'
  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}?size=256`
}

export function buildBannerUrl(user: DiscordUser): string | null {
  if (!user.banner) return null
  const ext = user.banner.startsWith('a_') ? 'gif' : 'png'
  return `https://cdn.discordapp.com/banners/${user.id}/${user.banner}.${ext}?size=600`
}

export function normalizeDiscordUser(user: DiscordUser): AuthUser {
  return {
    id: user.id,
    discordId: user.id,
    username: user.username,
    globalName: user.global_name ?? user.username,
    email: user.email,
    verified: user.verified,
    avatarUrl: buildAvatarUrl(user),
    bannerUrl: buildBannerUrl(user),
    locale: user.locale,
    premiumType: user.premium_type
  }
}
