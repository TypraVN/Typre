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
  /** Tên khái niệm, hiện làm tiêu đề thẻ "vừa gõ gì" sau khi xong bài. */
  title?: string
  code: string
  /**
   * Đoạn code này LÀM GÌ, hiện ra sau khi gõ xong.
   *
   * Viết như giải thích cho đồng nghiệp: nói kết quả thật sự xảy ra, không đọc lại tên
   * hàm ("gọi filter rồi gọi map" là vô nghĩa với người chưa biết). Một hai câu, không
   * dấu chấm cuối nếu chỉ một câu.
   *
   * Không bắt buộc: bài nào chưa có thì thẻ tự ẩn, không hiện khung rỗng.
   */
  explain?: string
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
