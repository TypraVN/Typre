import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { getHighlighterFor, resolveTheme, type CodeTheme, type CodeLanguage } from '../lib/highlighter'
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

function Caret() {
  return <span className="absolute inset-y-0 -left-px w-[2px] bg-orange-400 animate-caret-blink" />
}

export const CodeEditorDisplay = forwardRef<HTMLDivElement, CodeEditorDisplayProps>(
  ({ code, language, theme, uiMode, charStatuses, cursor, onKeyDown }, ref) => {
    const [colors, setColors] = useState<string[] | null>(null)
    const [fg, setFg] = useState(FALLBACK_FG[uiMode])

    // Cần ref nội bộ để tự cuộn khung; ref của App chỉ dùng để focus nên chuyển tiếp là đủ.
    const boxRef = useRef<HTMLDivElement>(null)
    const cursorRef = useRef<HTMLSpanElement>(null)
    useImperativeHandle(ref, () => boxRef.current as HTMLDivElement)

    const shikiTheme = resolveTheme(theme, uiMode)

    useEffect(() => {
      let cancelled = false
      setColors(null)
      setFg(FALLBACK_FG[uiMode])

      getHighlighterFor(language, shikiTheme).then((highlighter) => {
        if (cancelled) return

        // Màu chữ mặc định lấy từ chính theme, không hardcode — nếu không thì
        // ký tự không có token màu (khoảng trắng, xuống dòng) sẽ sai màu ở light mode.
        const themeFg = highlighter.getTheme(shikiTheme).fg || FALLBACK_FG[uiMode]

        const lines = highlighter.codeToTokensBase(code, { lang: language, theme: shikiTheme })
        const flat: string[] = []
        lines.forEach((line, lineIndex) => {
          line.forEach((token) => {
            for (let i = 0; i < token.content.length; i += 1) flat.push(token.color ?? themeFg)
          })
          if (lineIndex < lines.length - 1) flat.push(themeFg)
        })

        setFg(themeFg)
        setColors(flat)
      })

      return () => {
        cancelled = true
      }
    }, [code, language, shikiTheme, uiMode])

    /*
     * Thanh cuộn bị ẩn nên phải tự kéo khung theo con trỏ, không thì gõ tới đoạn
     * dưới của snippet dài là mất dấu. Tính bằng getBoundingClientRect (không dùng
     * scrollIntoView) để chỉ cuộn trong khung, không kéo cả trang.
     */
    useEffect(() => {
      const box = boxRef.current
      const caret = cursorRef.current
      if (!box || !caret) return

      const boxRect = box.getBoundingClientRect()
      const caretRect = caret.getBoundingClientRect()
      const margin = 24

      if (caretRect.top < boxRect.top + margin) {
        box.scrollTop -= boxRect.top + margin - caretRect.top
      } else if (caretRect.bottom > boxRect.bottom - margin) {
        box.scrollTop += caretRect.bottom - (boxRect.bottom - margin)
      }
    }, [cursor])

    return (
      <div
        ref={boxRef}
        tabIndex={0}
        onKeyDown={onKeyDown}
        style={{
          backgroundColor: CODE_BG[uiMode],
          // TẮT ligature. JetBrains Mono gộp `=>` thành `⇒`, `!=` thành `≠`...
          // App vẽ từng ký tự 1 span nên ligature làm ký tự hiển thị sai lệch khi
          // gõ tới giữa cặp (user báo "gõ dấu = thì bị mất dấu ="). App luyện gõ
          // phải hiện đúng từng ký tự như nó vốn là.
          fontVariantLigatures: 'none',
          fontFeatureSettings: '"liga" 0, "calt" 0, "clig" 0, "dlig" 0',
        }}
        className="font-mono text-lg leading-relaxed whitespace-pre-wrap outline-none rounded-lg p-4 h-[260px] overflow-y-auto no-scrollbar animate-fade-in"
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
