import { Lightbulb } from 'lucide-react'
import type { Snippet } from '../data/types'

/**
 * Đổi `code` trong lời giải thành code inline. Chỉ đúng một quy tắc markdown này —
 * kéo cả thư viện markdown vào để in được vài cặp backtick là quá thừa, mà `explain`
 * là dữ liệu mình tự viết nên không có chuyện HTML lạ chen vào.
 */
function renderInlineCode(text: string) {
  return text.split(/`([^`]+)`/g).map((part, i) =>
    // Chỉ mục lẻ luôn là phần nằm GIỮA cặp backtick (cách split với nhóm bắt hoạt động).
    i % 2 === 1 ? (
      <code
        key={i}
        className="font-mono text-[0.85em] px-1 py-px rounded bg-zinc-200 dark:bg-zinc-900 text-orange-600 dark:text-orange-400"
      >
        {part}
      </code>
    ) : (
      part
    ),
  )
}

interface SnippetMeaningProps {
  snippet: Snippet
  label: string
}

/**
 * "Vừa gõ gì": giải thích đoạn code ngay sau khi gõ xong.
 *
 * Mục đích là gõ xong thì HIỂU đoạn đó làm gì, không chỉ chép lại đúng ký tự. Cố ý chỉ
 * hiện ở bảng kết quả chứ không hiện lúc đang gõ: đọc trong lúc gõ là mất tập trung, mà
 * lời giải thích còn tiết lộ luôn phần code chưa gõ tới.
 *
 * Bài chưa có `explain` thì không hiện gì — thẻ rỗng còn tệ hơn không có thẻ.
 */
export function SnippetMeaning({ snippet, label }: SnippetMeaningProps) {
  if (!snippet.explain) return null

  return (
    <div className="w-full pt-3 border-t border-zinc-300 dark:border-zinc-700 animate-fade-in-up">
      <div className="flex items-center justify-center gap-1.5 mb-1.5 font-mono text-xs uppercase tracking-wider text-orange-600 dark:text-orange-400">
        <Lightbulb className="w-3.5 h-3.5" />
        {label}
      </div>

      {snippet.title && (
        <div className="text-center font-mono text-sm font-bold text-zinc-700 dark:text-zinc-200">
          {snippet.title}
        </div>
      )}

      {/* Không dùng font-mono cho phần này: đây là câu văn, chữ đơn cách đọc chậm hơn. */}
      <p className="text-center text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
        {renderInlineCode(snippet.explain)}
      </p>
    </div>
  )
}
