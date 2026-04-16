import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { supabase } from '../lib/supabase'
import {
  exchangeCodeForToken,
  fetchDiscordUser,
  normalizeDiscordUser
} from '../lib/discord'
import type { UserProfile } from '../types'

export function useAuth() {
  const { user, isLoading, error, setUser, setLoading, setError, logout } = useAuthStore()
  const navigate = useNavigate()

  const loginWithDiscord = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // 1. Open Discord OAuth popup via Electron IPC
      const { code } = await window.api.discordLogin()

      // 2. Exchange code → access token
      const accessToken = await exchangeCodeForToken(code)

      // 3. Fetch full Discord user object
      const discordUser = await fetchDiscordUser(accessToken)
      const normalized = normalizeDiscordUser(discordUser)

      // 4. Upsert into Supabase (profiles table)
      const { data: profile, error: dbError } = await supabase
        .from('profiles')
        .upsert(
          {
            discord_id: normalized.discordId,
            username: normalized.username,
            global_name: normalized.globalName,
            email: normalized.email,
            avatar_url: normalized.avatarUrl,
            banner_url: normalized.bannerUrl,
            locale: normalized.locale,
            premium_type: normalized.premiumType,
            verified: normalized.verified,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'discord_id' }
        )
        .select('*')
        .single()

      if (dbError) throw new Error(dbError.message)

      const userProfile: UserProfile = {
        ...normalized,
        id: profile.discord_id, 
        supabaseId: profile.id,
        plan: profile.plan ?? 'free',
        role: profile.role ?? 'user', // Lendo a role do banco!
        joinedAt: profile.created_at
      }

      setUser(userProfile)
      
      // Maximiza a janela e traz para o topo após o login bem sucedido
      if (window.api) {
        window.api.forceMaximize();
        window.api.focusWindow();
      }

      navigate('/library') // Redirecionar para Biblioteca após login
    } catch (err: any) {
      console.error("Login failed:", err)
      const message = err instanceof Error ? err.message : (typeof err === 'string' ? err : 'Erro inesperado')
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [navigate, setError, setLoading, setUser])

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut()
    logout()
    navigate('/login')
  }, [logout, navigate])

  return { user, isLoading, error, loginWithDiscord, logout: handleLogout }
}
