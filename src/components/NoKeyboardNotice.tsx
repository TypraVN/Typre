import { useEffect, useState } from 'react'
import { Keyboard, X as XIcon } from 'lucide-react'
import type { Translation } from '../i18n/translations'

/**
 * Khoá MỚI, không dùng lại 'typre-no-keyboard-dismissed' của thông báo cũ.
 *
 * Thông báo cũ nói "điện thoại không gõ được, hãy mở trên laptop". Người đã bấm tắt nó
 * chính là người đã đọc câu đó rồi bỏ đi — khi họ quay lại, đúng họ cần thấy rằng giờ gõ
 * được rồi. Dùng lại khoá cũ là giấu tin đó khỏi đúng những người cần nó nhất.
 */
const DISMISSED_KEY = 'typre-touch-typing-tip-dismissed'

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
 * Mách người vào bằng điện thoại cách bắt đầu gõ.
 *
 * Trước đây thông báo này nói "điện thoại không gõ được" — đúng vào lúc đó, vì vùng gõ là
 * `div` có `tabindex` mà bàn phím ảo chỉ mở cho ô nhập. Giờ đã có ô nhập ẩn phủ lên khung
 * code (`TouchTypingInput` trong CodeEditorDisplay), nên câu đó thành SAI, và còn đuổi
 * đúng những người lẽ ra đã gõ được.
 *
 * Vẫn giữ một dòng nhắc vì hai điều không tự nhìn ra: khung code trông không giống ô nhập
 * (không ai đoán là phải chạm vào nó), và bàn phím có tự sửa từ sẽ âm thầm làm sai điểm.
 *
 * Tắt được, và không chặn gì: bảng xếp hạng, hồ sơ, tra người chơi vẫn dùng bằng ngón tay.
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
