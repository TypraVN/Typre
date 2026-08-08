import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SoundState {
  enabled: boolean
  toggle: () => void
}

export const useSoundStore = create<SoundState>()(
  persist(
    (set) => ({
      enabled: false,
      toggle: () => set((s) => ({ enabled: !s.enabled })),
    }),
    { name: 'codetyping-sound' },
  ),
)
