import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useThemeStore = create(
  persist(
    (set) => ({
      dark: window.matchMedia('(prefers-color-scheme: dark)').matches,
      toggle: () => set((s) => {
        const next = !s.dark
        document.documentElement.classList.toggle('dark', next)
        return { dark: next }
      }),
      init: (dark) => {
        document.documentElement.classList.toggle('dark', dark)
        set({ dark })
      },
    }),
    { name: 'evenin-theme' }
  )
)
