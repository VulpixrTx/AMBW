import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import { requestFCMToken } from '@/lib/firebase'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      loading: true,

      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      setLoading: (loading) => set({ loading }),

      fetchProfile: async (uid) => {
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('id', uid)
          .single()
        if (data) set({ profile: data })
        return data
      },

      signIn: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        return data
      },

      signUp: async (email, password, name) => {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        if (data.user) {
          await supabase.from('users').insert({
            id: data.user.id,
            email,
            name,
            role,
          })
        }
        return data
      },

      signOut: async () => {
        await supabase.auth.signOut()
        set({ user: null, profile: null })
      },

      saveFCMToken: async (token) => {
        const { user } = get()
        if (!user || !token) return
        await supabase.from('users').update({ fcm_token: token }).eq('id', user.id)
      },

      initFCM: async () => {
        const token = await requestFCMToken()
        if (token) await get().saveFCMToken(token)
      },

      updateTheme: async (theme) => {
        const { user } = get()
        if (!user) return
        await supabase.from('users').update({ theme }).eq('id', user.id)
        set(s => ({ profile: { ...s.profile, theme } }))
      },
    }),
    { name: 'evenin-auth', partialize: (s) => ({ user: s.user, profile: s.profile }) }
  )
)
