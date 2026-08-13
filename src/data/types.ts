export type SnippetLanguage =
  | 'javascript'
  | 'typescript'
  | 'csharp'
  | 'python'
  | 'java'
  | 'go'
  | 'sql'
  | 'bash'
  | 'cpp'
  | 'rust'
  | 'html'
  | 'css'
  | 'json'
  | 'text'

export interface Snippet {
  id: string
  language: SnippetLanguage
  /** Không hiển thị ở đâu cả — chỉ để đọc dữ liệu cho dễ. Bài khai báo hàng loạt bỏ qua. */
  title?: string
  code: string
  /**
   * Khái niệm để chọn hoạt hình mô phỏng code này chạy (xem `SnippetDemo`).
   *
   * Gắn theo khái niệm chứ không theo bài: mọi bài dùng `reduce` đều chỉ về cùng một
   * hoạt hình, nên thêm hoạt hình một lần là hàng chục bài có ngay.
   */
  demo?: DemoId
}

/** Danh sách hoạt hình đã có. Thêm khái niệm mới thì thêm ở đây và trong `SnippetDemo`. */
export type DemoId = 'filter-map' | 'reduce' | 'spread'
