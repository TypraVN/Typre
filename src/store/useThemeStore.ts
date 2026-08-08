import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CodeTheme } from '../lib/highlighter'

interface ThemeState {
  theme: CodeTheme
  setTheme: (theme: CodeTheme) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'dark-plus',
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'codetyping-theme' },
  ),
)
