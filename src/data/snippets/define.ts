import type { Snippet, SnippetLanguage } from '../types'

/**
 * Một bài khai báo hàng loạt: chỉ code, hoặc kèm lời giải thích và tên khái niệm.
 *
 * Dạng tuple thay vì object để dòng dữ liệu vẫn gọn — 2.000 bài mà mỗi bài là một
 * object nhiều dòng thì file phình lên toàn khung sườn lặp lại.
 */
export type SnippetInput =
  | string
  | [code: string, explain: string]
  | [code: string, explain: string, title: string]

/**
 * Khai báo hàng loạt snippet chỉ bằng chuỗi code. Dạng object đầy đủ tốn 6 dòng cho
 * mỗi bài — với mục tiêu ~50 bài/ngôn ngữ thì file dữ liệu sẽ phình lên hàng nghìn
 * dòng chỉ toàn khung sườn lặp lại.
 *
 * `prefix` phải khác với id của các bài viết tay trong cùng ngôn ngữ, vì id là thứ
 * dùng để loại bài vừa gõ khỏi lượt kế tiếp — trùng id là loại nhầm bài.
 */
export function defineSnippets(
  language: SnippetLanguage,
  prefix: string,
  codes: SnippetInput[],
): Snippet[] {
  return codes.map((input, i) => {
    // Thứ tự trong mảng quyết định id, nên thêm lời giải thích cho một bài KHÔNG được
    // làm id các bài khác xê dịch: người đang giữ link thách đấu `#/c/<id>` sẽ mở ra
    // một bài hoàn toàn khác.
    const base = { id: `${prefix}-${i + 1}`, language }

    if (typeof input === 'string') return { ...base, code: input }

    const [code, explain, title] = input
    return { ...base, code, explain, title }
  })
}
