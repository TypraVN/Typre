import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UiMode = 'light' | 'dark'

interface UiThemeState {
  mode: UiMode
  toggle: () => void
}

export const useUiThemeStore = create<UiThemeState>()(
  persist(
    (set) => ({
      mode: 'dark',
      toggle: () => set((s) => ({ mode: s.mode === 'dark' ? 'light' : 'dark' })),
    }),
    { name: 'codetyping-ui-mode' },
  ),
)
