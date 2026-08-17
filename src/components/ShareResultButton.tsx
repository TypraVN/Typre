import { useState } from 'react'
import { ImageDown, Copy, Check } from 'lucide-react'
import { renderResultCard, resultCardFilename, type ResultCardData } from '../lib/resultCard'

interface ShareResultButtonProps {
  data: ResultCardData
  className: string
  saveLabel: string
  copyLabel: string
  copiedLabel: string
  failedLabel: string
}

/**
 * Có sao chép ảnh vào clipboard được không.
 *
 * Chrome/Edge có `ClipboardItem`, Firefox thì không — nên nút copy chỉ hiện khi thật sự
 * dùng được, thay vì hiện rồi báo lỗi. Kiểm ở mức module: khả năng này không đổi giữa
 * các lần render.
 */
const CAN_COPY_IMAGE =
  typeof window !== 'undefined' &&
  typeof ClipboardItem !== 'undefined' &&
  !!navigator.clipboard?.write

type State = 'idle' | 'working' | 'copied' | 'failed'

export function ShareResultButton({
  data,
  className,
  saveLabel,
  copyLabel,
  copiedLabel,
  failedLabel,
}: ShareResultButtonProps) {
  const [state, setState] = useState<State>('idle')

  const save = async () => {
    setState('working')

    const blob = await renderResultCard(data)
    if (!blob) {
      setState('failed')
      return
    }

    // Tải file bằng thẻ `a` tạo tạm: không cần server, và giữ được tên file có điểm.
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = resultCardFilename(data)
    link.click()

    // Thu hồi NGAY là Firefox huỷ luôn lượt tải đang bắt đầu; chờ một nhịp rồi mới dọn.
    setTimeout(() => URL.revokeObjectURL(url), 10_000)
    setState('idle')
  }

  const copy = async () => {
    setState('working')

    try {
      const blob = await renderResultCard(data)
      if (!blob) throw new Error('render failed')

      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      setState('copied')
      setTimeout(() => setState('idle'), 2000)
    } catch {
      // Hay gặp nhất: người dùng chưa cấp quyền clipboard, hoặc tab không được focus.
      setState('failed')
      setTimeout(() => setState('idle'), 2500)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={save}
        disabled={state === 'working'}
        className={`${className} flex items-center gap-1.5 disabled:opacity-50`}
      >
        <ImageDown className="w-4 h-4" />
        {state === 'failed' ? failedLabel : saveLabel}
      </button>

      {CAN_COPY_IMAGE && (
        <button
          type="button"
          onClick={copy}
          disabled={state === 'working'}
          className={`${className} flex items-center gap-1.5 disabled:opacity-50`}
        >
          {state === 'copied' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {state === 'copied' ? copiedLabel : copyLabel}
        </button>
      )}
    </>
  )
}
