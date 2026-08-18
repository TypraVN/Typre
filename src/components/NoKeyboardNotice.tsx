import { useEffect, useState } from 'react'
import { Keyboard, X as XIcon } from 'lucide-react'
import type { Translation } from '../i18n/translations'

const DISMISSED_KEY = 'typre-no-keyboard-dismissed'

/**
 * Thiết bị này gần như chắc chắn không có bàn phím cứng.
 *
 * `pointer: coarse` = ngón tay là con trỏ chính. Máy tính có màn cảm ứng vẫn báo `fine`
 * vì còn chuột, nên điều kiện này không bắt nhầm họ. Cộng thêm màn hẹp để loại tablet
 * đang cắm bàn phím rời.
 *
 * Không chắc 100% — vẫn có iPad màn nhỏ cắm bàn phím — nên thông báo phải TẮT ĐƯỢC, không
 * được chặn app.
 */
function likelyNoKeyboard(): boolean {
  try {
    return window.matchMedia('(pointer: coarse)').matches && window.innerWidth < 768
  } catch {
    return false
  }
}

interface NoKeyboardNoticeProps {
  t: Translation
}

/**
 * Báo cho người vào bằng điện thoại rằng cần bàn phím cứng.
 *
 * Vì sao cần: vùng gõ là `div` có `tabindex`, không phải `input`/`textarea`/
 * `contenteditable` — mà bàn phím ảo của iOS/Android CHỈ bật với ba loại đó. Trên điện
 * thoại, chạm vào vùng gõ không có gì hiện lên và không gõ được ký tự nào.
 *
 * Phần lớn người bấm link từ Hacker News, Reddit hay dev.to là đang cầm điện thoại. Không
 * có dòng này thì họ mở ra, thấy một trang có vẻ hỏng, đóng lại và không bao giờ mở lại
 * trên máy tính. Một dòng chữ biến "trang hỏng" thành "trang hẹn gặp lại".
 *
 * CỐ Ý không chặn app: bảng xếp hạng, hồ sơ, tra người chơi vẫn dùng được bằng ngón tay.
 */
export function NoKeyboardNotice({ t }: NoKeyboardNoticeProps) {
  // Tính trong effect chứ không phải lúc render: `matchMedia` và `innerWidth` không có ở
  // phía server, và ở đây còn phải đọc localStorage.
  const [show, setShow] = useState(false)

  useEffect(() => {
    let dismissed = false
    try {
      dismissed = localStorage.getItem(DISMISSED_KEY) === '1'
    } catch {
      // Chế độ riêng tư chặn localStorage — cứ hiện, thà nhắc lại còn hơn im lặng.
    }

    setShow(!dismissed && likelyNoKeyboard())
  }, [])

  if (!show) return null

  const dismiss = () => {
    setShow(false)
    try {
      localStorage.setItem(DISMISSED_KEY, '1')
    } catch {
      // Không lưu được thì lần sau hiện lại — chấp nhận được.
    }
  }

  return (
    <div
      role="status"
      className="w-full max-w-md mx-auto flex items-start gap-3 px-4 py-3 rounded-xl border border-orange-500/40 bg-orange-500/10 text-left"
    >
      <Keyboard className="w-5 h-5 shrink-0 mt-0.5 text-orange-600 dark:text-orange-400" />

      <div className="flex-1 min-w-0">
        <div className="font-mono text-sm font-bold text-orange-600 dark:text-orange-400">
          {t.noKeyboardTitle}
        </div>
        <p className="mt-0.5 font-mono text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
          {t.noKeyboardBody}
        </p>
      </div>

      <button
        type="button"
        onClick={dismiss}
        aria-label={t.dismiss}
        className="shrink-0 cursor-pointer text-zinc-400 hover:text-orange-500 transition-colors duration-150"
      >
        <XIcon className="w-4 h-4" />
      </button>
    </div>
  )
}
