import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CustomCodeState {
  /** Code đã chuẩn hoá, rỗng = chưa dán gì. */
  code: string
  /** Đang luyện code của mình thay vì bài trong kho. */
  active: boolean
  setCode: (code: string) => void
  exit: () => void
}

/**
 * Store riêng, không nhét vào `usePreferencesStore`: code dán vào có thể tới vài nghìn
 * ký tự, mà preferences bị đọc ở nhiều chỗ và chỉ nên chứa vài cờ nhỏ.
 *
 * Có lưu xuống đĩa để F5 không mất đoạn code đang luyện — dán lại mỗi lần reload thì
 * chẳng ai dùng tính năng này lần thứ hai.
 */
export const useCustomCodeStore = create<CustomCodeState>()(
  persist(
    (set) => ({
      code: '',
      active: false,
      // Dán code là vào luyện luôn, không phải bấm thêm một nút nữa.
      setCode: (code) => set({ code, active: code.length > 0 }),
      // Thoát nhưng GIỮ code: quay lại kho bài rồi muốn luyện tiếp thì không phải dán lại.
      exit: () => set({ active: false }),
    }),
    { name: 'codetyping-custom-code' },
  ),
)
