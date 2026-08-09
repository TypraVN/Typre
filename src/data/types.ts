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
}
