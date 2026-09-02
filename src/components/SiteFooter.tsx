import { LANGUAGES, PRACTICE_SLUG } from '../data/languages'

/**
 * Chân trang.
 *
 * Không phải để trang trí. Trước khi có nó, bản ĐÃ RENDER của trang chủ — đúng cái Google
 * lập chỉ mục — nhắc tên "Typre" đúng một lần và không có lấy một liên kết nào tới 14
 * trang /practice/.
 *
 * Nguyên nhân: cả khối chữ SEO nằm trong `#root` của index.html, mà `createRoot` thì xoá
 * sạch nội dung sẵn có của thẻ chứa ngay khi mount. Khối đó chỉ còn tác dụng với con bot
 * không chạy JavaScript. Muốn Google thấy thì phải nằm trong cây React.
 *
 * Chân trang giải quyết đúng ba việc đó: tên thương hiệu, liên kết ra ngoài để đối chiếu
 * `sameAs` trong schema, và đường dẫn nội bộ xuống các trang ngôn ngữ.
 */
export function SiteFooter() {
  return (
    <footer className="w-full max-w-4xl mt-16 pt-6 border-t border-zinc-200 dark:border-zinc-800 text-[13px] text-zinc-500 dark:text-zinc-400">
      <p>
        <strong className="text-zinc-700 dark:text-zinc-300">Typre</strong> — typing practice
        for programmers. Real code in 14 languages, free, works offline.
      </p>

      {/*
        Liệt kê CẢ 14 ngôn ngữ chứ không phải vài cái tiêu biểu. Mỗi trang /practice/ nhắm
        một từ khoá riêng ("practice typing Python code"...), và trang nào không được trang
        chủ trỏ tới thì chỉ tồn tại trong sitemap — Google tìm ra nhưng không dồn sức mạnh
        liên kết xuống.
      */}
      <nav className="mt-3 flex flex-wrap gap-x-3 gap-y-1" aria-label="Practice by language">
        {LANGUAGES.map((language) => (
          <a
            key={language}
            href={`/practice/${PRACTICE_SLUG[language]}/`}
            className="hover:text-orange-500 dark:hover:text-orange-400"
          >
            {/*
              Chữ neo lấy từ SLUG chứ không phải id. Với 13 ngôn ngữ thì hai thứ như nhau,
              nhưng `text` trỏ tới /practice/special-characters/ — hiện chữ "text" là vừa
              phí chữ neo (thứ máy tìm đọc để biết trang đích nói về cái gì) vừa chẳng nói
              lên điều gì với người đọc.
            */}
            {PRACTICE_SLUG[language].replace(/-/g, ' ')}
          </a>
        ))}
      </nav>

      <p className="mt-3">
        {/*
          `sameAs` trong schema chỉ đáng tin khi trang có liên kết thật tới đúng chỗ đó.
          Khai một hồ sơ mà cả site không trỏ tới thì đó là lời khai một chiều.
        */}
        <a
          href="https://github.com/TypraVN/Typre"
          rel="noopener"
          className="hover:text-orange-500 dark:hover:text-orange-400"
        >
          Source on GitHub
        </a>
      </p>
    </footer>
  )
}
