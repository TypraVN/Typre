import type { SnippetLanguage } from '../data/types'

/**
 * Đường dẫn tới các trang giới thiệu từng ngôn ngữ ở /practice/<slug>/.
 *
 * Phải khớp `slug` trong scripts/seo-pages-content.mjs. Chỉ `text` là lệch: rổ đó không
 * phải một ngôn ngữ nên trang của nó đặt tên theo nội dung.
 */
const SLUGS: Partial<Record<SnippetLanguage, string>> = {
  text: 'special-characters',
}

const LABELS: Partial<Record<SnippetLanguage, string>> = {
  csharp: 'C#',
  cpp: 'C/C++',
  text: 'special characters',
}

interface LanguageFooterProps {
  languages: readonly SnippetLanguage[]
  heading: string
}

/**
 * Liên kết tới 14 trang giới thiệu ngôn ngữ.
 *
 * Vì sao cần: các trang đó là trang TĨNH ngoài SPA, và trước khi có footer này thì không
 * chỗ nào trên site trỏ tới chúng — Google chỉ biết qua sitemap, tín hiệu yếu hơn liên kết
 * nội bộ nhiều. Trang mồ côi thì bò tới rất chậm hoặc không bò tới.
 *
 * Cố ý là liên kết THẬT, người dùng thấy được. Nhét link chỉ cho bot đọc (trong khối
 * `#root` mà React xoá ngay khi mount) là dựng nội dung riêng cho máy tìm kiếm — đúng
 * định nghĩa cloaking, và Google phạt chuyện đó.
 *
 * Dùng thẻ `a` thật với đường dẫn thật, không phải `onClick`: bot chỉ đi theo `href`.
 */
export function LanguageFooter({ languages, heading }: LanguageFooterProps) {
  return (
    <footer className="w-full max-w-3xl mx-auto mt-16 pt-6 border-t border-zinc-200 dark:border-zinc-800">
      <div className="mb-2 font-mono text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-600">
        {heading}
      </div>

      <nav className="flex flex-wrap gap-x-3 gap-y-1.5">
        {languages.map((lang) => (
          <a
            key={lang}
            href={`/practice/${SLUGS[lang] ?? lang}/`}
            className="font-mono text-xs text-zinc-400 dark:text-zinc-500 hover:text-orange-500 dark:hover:text-orange-400 transition-colors duration-150"
          >
            {LABELS[lang] ?? lang}
          </a>
        ))}
      </nav>
    </footer>
  )
}
