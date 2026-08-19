import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import {
  getHighlighterFor,
  getLoadedHighlighter,
  resolveTheme,
  type CodeTheme,
  type CodeLanguage,
  type ShikiTheme,
} from '../lib/highlighter'
import type { HighlighterCore } from 'shiki/core'
import type { CharStatus } from '../types/typing'

type UiMode = 'light' | 'dark'

interface CodeEditorDisplayProps {
  code: string
  language: CodeLanguage
  theme: CodeTheme
  uiMode: UiMode
  charStatuses: CharStatus[]
  cursor: number
  onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => void
}

// Nền khung code luôn trùng nền trang (xem index.css) để hai khối hoà làm một.
const CODE_BG: Record<UiMode, string> = { dark: '#1f1f1f', light: '#ffffff' }

// Màu dự phòng khi theme chưa nạp xong hoặc token không có màu riêng.
const FALLBACK_FG: Record<UiMode, string> = { dark: '#e4e4e7', light: '#27272a' }

// Đỏ nhạt chìm trên nền trắng nên light mode phải dùng đỏ đậm hơn.
const INCORRECT: Record<UiMode, { color: string; backgroundColor: string }> = {
  dark: { color: '#f87171', backgroundColor: 'rgba(239,68,68,0.4)' },
  light: { color: '#b91c1c', backgroundColor: 'rgba(239,68,68,0.25)' },
}

/**
 * Chiều cao dòng chốt cứng (không dùng `leading-relaxed` 29.25px) để chiều cao khung
 * luôn là bội số nguyên của dòng — lẻ nửa dòng ở mép dưới trông y như chữ bị tràn.
 */
const LINE_HEIGHT = 28

function Caret() {
  return <span className="absolute inset-y-0 -left-px w-[2px] bg-orange-400 animate-caret-blink" />
}

/** Màu của TỪNG ký tự trong bài, phẳng theo đúng thứ tự — khớp 1-1 với `charStatuses`. */
interface Painted {
  colors: string[]
  fg: string
}

/**
 * Đổi token của Shiki thành mảng màu theo từng ký tự.
 *
 * Tách riêng khỏi component để dùng được cho CẢ hai đường: tô ngay lúc render (khi
 * grammar đã sẵn) và tô sau khi tải xong.
 */
function paint(
  highlighter: HighlighterCore,
  code: string,
  language: CodeLanguage,
  shikiTheme: ShikiTheme,
  uiMode: UiMode,
): Painted {
  // Màu chữ mặc định lấy từ chính theme, không hardcode — nếu không thì ký tự không có
  // token màu (khoảng trắng, xuống dòng) sẽ sai màu ở light mode.
  const fg = highlighter.getTheme(shikiTheme).fg || FALLBACK_FG[uiMode]

  const lines = highlighter.codeToTokensBase(code, { lang: language, theme: shikiTheme })
  const colors: string[] = []

  lines.forEach((line, lineIndex) => {
    line.forEach((token) => {
      for (let i = 0; i < token.content.length; i += 1) colors.push(token.color ?? fg)
    })
    if (lineIndex < lines.length - 1) colors.push(fg)
  })

  return { colors, fg }
}

export const CodeEditorDisplay = forwardRef<HTMLDivElement, CodeEditorDisplayProps>(
  ({ code, language, theme, uiMode, charStatuses, cursor, onKeyDown }, ref) => {
    const [painted, setPainted] = useState<Painted | null>(null)

    // Cần ref nội bộ để tự cuộn khung; ref của App chỉ dùng để focus nên chuyển tiếp là đủ.
    const boxRef = useRef<HTMLDivElement>(null)
    const cursorRef = useRef<HTMLSpanElement>(null)
    useImperativeHandle(ref, () => boxRef.current as HTMLDivElement)

    const shikiTheme = resolveTheme(theme, uiMode)

    /**
     * Tô ngay trong lúc render nếu grammar và theme đã nạp sẵn.
     *
     * Đây là trường hợp THƯỜNG GẶP NHẤT: bấm "next snippet" trong cùng một ngôn ngữ.
     * Bản trước luôn `setColors(null)` rồi mới tô lại trong effect, nên lần đổi bài nào
     * cũng nháy mất màu một nhịp dù chẳng phải tải thêm gì.
     */
    const sync = useMemo(() => {
      const ready = getLoadedHighlighter(language, shikiTheme)
      return ready ? paint(ready, code, language, shikiTheme, uiMode) : null
    }, [code, language, shikiTheme, uiMode])

    useEffect(() => {
      // Đã tô xong ngay lúc render thì không cần chạm tới state.
      if (sync) return

      let cancelled = false
      setPainted(null)

      getHighlighterFor(language, shikiTheme).then((highlighter) => {
        if (!cancelled) setPainted(paint(highlighter, code, language, shikiTheme, uiMode))
      })

      return () => {
        cancelled = true
      }
    }, [sync, code, language, shikiTheme, uiMode])

    const colors = sync?.colors ?? painted?.colors ?? null
    const fg = sync?.fg ?? painted?.fg ?? FALLBACK_FG[uiMode]

    /*
     * Thanh cuộn bị ẩn nên phải tự kéo khung theo con trỏ, không thì gõ tới đoạn
     * dưới của snippet dài là mất dấu. Tính bằng getBoundingClientRect (không dùng
     * scrollIntoView) để chỉ cuộn trong khung, không kéo cả trang.
     */
    useEffect(() => {
      const caret = cursorRef.current
      if (!caret) return

      // Cuộn TRONG khung, không kéo cả trang (đó là lý do tự tính scrollTop thay vì
      // gọi scrollIntoView — hàm đó cuộn luôn cả trang).
      // Khung ôm sát nội dung nên bình thường không có gì để cuộn. Chỉ khi màn quá hẹp
      // làm dòng dài tự xuống dòng và khung cao hơn cửa sổ thì mới kéo con trỏ vào tầm
      // nhìn — `nearest` để không giật trang ở trường hợp thường.
      const caretRect = caret.getBoundingClientRect()
      if (caretRect.top < 0 || caretRect.bottom > window.innerHeight) {
        caret.scrollIntoView({ block: 'nearest' })
      }
    }, [cursor])

    return (
      <div
        ref={boxRef}
        tabIndex={0}
        onKeyDown={onKeyDown}
        style={{
          lineHeight: `${LINE_HEIGHT}px`,
          backgroundColor: CODE_BG[uiMode],
          // TẮT ligature. JetBrains Mono gộp `=>` thành `⇒`, `!=` thành `≠`...
          // App vẽ từng ký tự 1 span nên ligature làm ký tự hiển thị sai lệch khi
          // gõ tới giữa cặp (user báo "gõ dấu = thì bị mất dấu ="). App luyện gõ
          // phải hiện đúng từng ký tự như nó vốn là.
          fontVariantLigatures: 'none',
          fontFeatureSettings: '"liga" 0, "calt" 0, "clig" 0, "dlig" 0',
        }}
        // Không đặt chiều cao: khung ôm sát bài đang gõ (tối đa 4 dòng) nên không thừa
        // khoảng trống, không cuộn, và không có dòng nào bị giấu dưới mép.
        className="font-mono text-lg whitespace-pre-wrap outline-none rounded-lg p-4 animate-fade-in"
      >
        {code.split('').map((char, i) => {
          const status = charStatuses[i]
          const color = colors?.[i] ?? fg

          let style: React.CSSProperties = { color }
          let className = 'relative'

          if (status === 'incorrect') {
            style = INCORRECT[uiMode]
          } else if (status === 'pending') {
            className += ' opacity-40'
          }

          return (
            <span
              key={i}
              ref={i === cursor ? cursorRef : undefined}
              className={className}
              style={style}
            >
              {i === cursor && <Caret />}
              {char}
            </span>
          )
        })}
        {cursor === code.length && (
          <span ref={cursorRef} className="relative">
            <Caret />
          </span>
        )}
      </div>
    )
  },
)
