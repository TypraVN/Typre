import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SnippetLanguage } from '../data/types'

export type PracticeMode = 'code' | 'shortcuts' | 'leaderboard'
export type ShortcutSet = 'vscode' | 'vim'

interface PreferencesState {
  mode: PracticeMode
  language: SnippetLanguage
  timeLimit: number
  shortcutSet: ShortcutSet
  setMode: (mode: PracticeMode) => void
  setLanguage: (language: SnippetLanguage) => void
  setTimeLimit: (timeLimit: number) => void
  setShortcutSet: (shortcutSet: ShortcutSet) => void
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      mode: 'code',
      language: 'javascript',
      timeLimit: 30,
      shortcutSet: 'vscode',
      setMode: (mode) => set({ mode }),
      setLanguage: (language) => set({ language }),
      setTimeLimit: (timeLimit) => set({ timeLimit }),
      setShortcutSet: (shortcutSet) => set({ shortcutSet }),
    }),
    {
      name: 'codetyping-preferences',
      // Từng có bản đổi mốc thời gian sang 20/35/65 rồi quay lại 15/30/60. Ai lỡ
      // chạy bản đó sẽ có `version: 1` trong localStorage — giữ nguyên số này để
      // zustand không coi là lệch phiên bản rồi VỨT hết cài đặt đã lưu. Mốc mồ côi
      // (20/35/65) không cần map ở đây: App.tsx tự đưa về mặc định nếu không hợp lệ.
      version: 1,
      migrate: (persisted) => persisted as PreferencesState,
    },
  ),
)
