import { forwardRef, memo, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import type { FormEvent, KeyboardEvent, Ref } from 'react'
import { flushSync } from 'react-dom'
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
  /** Ba thao tác cho ô nhập ẩn trên thiết bị cảm ứng — xem `TouchTypingInput`. */
  onTypeChar: (char: string) => void
  onEnter: () => void
  onBackspace: () => void
}

/**
 * Thiết bị mà ngón tay là con trỏ chính (điện thoại, tablet).
 *
 * Đọc MỘT LẦN lúc mở trang: xoay máy hay cắm bàn phím rời giữa chừng không đổi được
 * `pointer`. Máy tính có màn cảm ứng vẫn báo `fine` vì còn chuột, nên không bị bắt nhầm —
 * đúng điều kiện `NoKeyboardNotice` đã dùng.
 */
function isTouchPrimary(): boolean {
  try {
    return window.matchMedia('(pointer: coarse)').matches
  } catch {
    return false
  }
}

const TOUCH_PRIMARY = typeof window !== 'undefined' && isTouchPrimary()

/**
 * Ô nhập ẩn để bàn phím ẢO bật lên được.
 *
 * Vì sao cần: khung gõ là `div` có `tabindex`, mà bàn phím ảo của iOS/Android CHỈ mở
 * cho `input`/`textarea`/`contenteditable`. Ô này phủ trùng lên khung code, trong suốt:
 * chạm vào khung là chạm vào ô, bàn phím bật lên.
 *
 * Hai loại bàn phím, hai đường:
 *   - iPhone, và bàn phím rời cắm vào tablet: gửi keydown có `key` thật ('a', '{'...).
 *     Để nó nổi lên `onKeyDown` của khung như trên máy tính — engine xử lý và
 *     `preventDefault`, nên ô nhập không nhận ký tự, không có sự kiện `input` thừa.
 *   - Android (Gboard...): keydown báo `Unidentified` cho MỌI phím, ký tự chỉ lộ ra khi đã
 *     chèn vào ô. Chặn keydown đó lại (không cho engine chấm phím "Unidentified" là sai),
 *     rồi đọc ở sự kiện `input`.
 *
 * Đọc `input` bằng cách SO NỘI DUNG trước và sau, không tin từng sự kiện: bàn phím có gợi
 * ý từ sẽ thay CẢ MỘT TỪ một lúc ("teh" → "the"), không phải một ký tự. Phần chung ở đầu
 * giữ nguyên; phần cũ khác đi thì lùi bấy nhiêu, phần mới thì gõ bấy nhiêu.
 */
function TouchTypingInput({
  onTypeChar,
  onEnter,
  onBackspace,
}: Pick<CodeEditorDisplayProps, 'onTypeChar' | 'onEnter' | 'onBackspace'>) {
  /*
    Gọi qua ref chứ không gọi thẳng prop: một lần `input` có thể chèn nhiều ký tự, mà mỗi
    hàm của engine đọc `cursor` trong closure của lần render đã tạo ra nó. Gọi ba lần liền
    cùng một closure là ba lần chấm cùng một ô. `flushSync` vẽ lại ngay sau mỗi thao tác,
    và ref được gán lại trong lần vẽ đó — thao tác kế tiếp luôn dùng closure mới.
  */
  const actions = useRef({ onTypeChar, onEnter, onBackspace })
  actions.current = { onTypeChar, onEnter, onBackspace }

  /** Nội dung ô nhập sau thao tác trước — mốc để so. */
  const lastValue = useRef('')
  const composing = useRef(false)

  const apply = (prev: string, next: string) => {
    let common = 0
    while (common < prev.length && common < next.length && prev[common] === next[common]) {
      common += 1
    }

    for (let i = common; i < prev.length; i += 1) {
      flushSync(() => actions.current.onBackspace())
    }
    for (const ch of next.slice(common)) {
      flushSync(() => (ch === '\n' ? actions.current.onEnter() : actions.current.onTypeChar(ch)))
    }
  }

  const reset = (el: HTMLTextAreaElement) => {
    el.value = ''
    lastValue.current = ''
  }

  const onInput = (e: FormEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget
    const native = e.nativeEvent as InputEvent

    // Ô đang rỗng mà người dùng xoá: không có gì để so — lùi đúng một ký tự trên bài.
    if (native.inputType?.startsWith('delete') && lastValue.current === '' && el.value === '') {
      flushSync(() => actions.current.onBackspace())
      return
    }

    apply(lastValue.current, el.value)
    lastValue.current = el.value

    /*
      Dọn ô về rỗng sau mỗi thao tác, để ô không phình mãi và để xoá luôn có thứ để xoá.
      TRỪ khi đang ghép chữ (gợi ý từ, gõ tiếng Việt): đổi nội dung giữa chừng là bộ gõ
      mất dấu từ đang ghép. Đợi `compositionend` rồi mới dọn.
    */
    if (!composing.current) reset(el)
  }

  return (
    <textarea
      aria-label="Type the code here"
      autoCapitalize="off"
      autoComplete="off"
      autoCorrect="off"
      spellCheck={false}
      // Không có `enterKeyHint` "send"/"go": Enter phải là xuống dòng, như trong code.
      enterKeyHint="enter"
      onCompositionStart={() => {
        composing.current = true
      }}
      onCompositionEnd={(e) => {
        composing.current = false
        reset(e.currentTarget)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Unidentified' || e.key === 'Process' || e.nativeEvent.isComposing) {
          // Bàn phím ảo Android: để sự kiện `input` xử lý, đừng cho engine chấm phím này.
          e.stopPropagation()
        }
      }}
      onInput={onInput}
      // 16px: nhỏ hơn là iOS tự phóng to cả trang khi chạm vào ô nhập.
      className="absolute inset-0 w-full h-full resize-none opacity-0 text-[16px] cursor-text"
    />
  )
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

/**
 * Một ký tự trong bài.
 *
 * Tách ra và `memo` vì mỗi lần gõ chỉ có 1–2 ký tự đổi trạng thái (ô vừa gõ, và con
 * trỏ dời đi), nhưng bản trước vẽ lại TOÀN BỘ bài. Đo trên bài 2.860 ký tự (mức trần
 * của "your code"): 15 ms mỗi phím, có lúc 28–65 ms — quá một khung hình 16,7 ms, và
 * trên điện thoại yếu chậm hơn 4–5 lần là thấy chữ trễ sau tay.
 *
 * Props CHỈ là giá trị nguyên thuỷ để `memo` so được: dựng `style` ngay trong này, không
 * truyền object từ ngoài vào (object mới mỗi lần render là `memo` luôn coi như đã đổi).
 */
const Char = memo(function Char({
  char,
  status,
  color,
  uiMode,
  isCursor,
  cursorRef,
}: {
  char: string
  status: CharStatus
  color: string
  uiMode: UiMode
  isCursor: boolean
  cursorRef?: Ref<HTMLSpanElement>
}) {
  let style: React.CSSProperties = { color }
  let className = 'relative'

  if (status === 'incorrect') {
    style = INCORRECT[uiMode]
  } else if (status === 'pending') {
    className += ' opacity-40'
  }

  return (
    <span ref={cursorRef} className={className} style={style}>
      {isCursor && <Caret />}
      {char}
    </span>
  )
})

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
  (
    { code, language, theme, uiMode, charStatuses, cursor, onKeyDown, onTypeChar, onEnter, onBackspace },
    ref,
  ) => {
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

    // Tách ký tự một lần cho mỗi bài, không phải mỗi lần gõ.
    const chars = useMemo(() => code.split(''), [code])

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
        className="relative font-mono text-lg whitespace-pre-wrap outline-none rounded-lg p-4 animate-fade-in"
      >
        {chars.map((char, i) => (
          <Char
            key={i}
            char={char}
            status={charStatuses[i]}
            color={colors?.[i] ?? fg}
            uiMode={uiMode}
            isCursor={i === cursor}
            cursorRef={i === cursor ? cursorRef : undefined}
          />
        ))}
        {cursor === code.length && (
          <span ref={cursorRef} className="relative">
            <Caret />
          </span>
        )}
        {/* Chỉ trên thiết bị cảm ứng: trên máy tính, ô này mà chặn ngang thì cú click vào
            khung sẽ đưa focus sang ô nhập thay vì khung — đổi cả đường nhận phím đang chạy. */}
        {TOUCH_PRIMARY && (
          <TouchTypingInput onTypeChar={onTypeChar} onEnter={onEnter} onBackspace={onBackspace} />
        )}
      </div>
    )
  },
)
