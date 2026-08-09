/**
 * Fisher-Yates: mọi thứ tự đều có xác suất như nhau. Trả về mảng MỚI, không sửa mảng gốc
 * (mảng gốc là dữ liệu tĩnh của app, sửa vào là hỏng cho mọi chỗ khác).
 */
export function shuffle<T>(list: readonly T[]): T[] {
  const out = [...list]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/**
 * Rút một phần tử khỏi "túi trộn", tự trộn lại khi hết. Người dùng đi qua HẾT danh sách
 * rồi mới gặp lại — random thuần vẫn có thể ra một mục ba lần trong khi mục khác chưa
 * hiện lần nào.
 *
 * `excludeId` xử lý chỗ duy nhất còn có thể trùng: bài cuối túi trước gặp bài đầu túi sau.
 * Túi được sửa TẠI CHỖ, nên gọi kèm mảng của chính người gọi (ref/biến module).
 */
export function drawFromBag<T extends { id: string }>(
  bag: T[],
  pool: readonly T[],
  excludeId?: string,
): T {
  if (bag.length === 0) {
    bag.push(...shuffle(pool))
    if (excludeId && bag.length > 1 && bag[0].id === excludeId) {
      bag.push(bag.shift() as T)
    }
  }
  return bag.shift() as T
}
