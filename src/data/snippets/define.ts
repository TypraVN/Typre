import type { Snippet, SnippetLanguage } from '../types'

/**
 * Khai báo hàng loạt snippet chỉ bằng chuỗi code. Dạng object đầy đủ tốn 6 dòng cho
 * mỗi bài — với mục tiêu ~50 bài/ngôn ngữ thì file dữ liệu sẽ phình lên hàng nghìn
 * dòng chỉ toàn khung sườn lặp lại.
 *
 * `prefix` phải khác với id của các bài viết tay trong cùng ngôn ngữ, vì id là thứ
 * dùng để loại bài vừa gõ khỏi lượt kế tiếp — trùng id là loại nhầm bài.
 *
 * Thứ tự trong mảng quyết định id: chèn hay xoá một bài giữa mảng là làm id mọi bài
 * sau nó xê dịch, và người đang giữ link thách đấu `#/c/<id>` sẽ mở ra một bài khác.
 * Thêm bài mới thì thêm vào CUỐI.
 */
export function defineSnippets(
  language: SnippetLanguage,
  prefix: string,
  codes: string[],
): Snippet[] {
  return codes.map((code, i) => ({
    id: `${prefix}-${i + 1}`,
    language,
    code,
  }))
}
