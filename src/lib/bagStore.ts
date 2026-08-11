/**
 * Lưu "túi trộn" xuống localStorage để việc chống lặp bài sống qua reload.
 *
 * Vì sao cần: túi nằm trong biến module, F5 là mất sạch → người dùng gõ 3 bài rồi tải
 * lại trang là có thể gặp lại đúng mấy bài đó, dù kho có 50 bài. Thứ tự lượt gõ là
 * chuyện của người dùng, không phải chuyện của một lần tải trang.
 *
 * Chỉ lưu ID CÒN LẠI trong túi (không lưu cả nội dung code): nhẹ, và nếu kho bài đổi
 * thì chỗ hydrate tự bỏ id lạ.
 */

const STORAGE_KEY = 'typre-bags'

type StoredBags = Record<string, string[]>

/**
 * Đọc một lần rồi giữ trong bộ nhớ: `getRandomSnippet` gọi liên tục, parse JSON mỗi
 * lần là vô ích. Cache cũng là nguồn sự thật khi ghi, nên không đọc lại sau khi ghi.
 */
let cache: StoredBags | null = null

function read(): StoredBags {
  if (cache !== null) return cache

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw === null ? {} : (JSON.parse(raw) as unknown)
    // Dữ liệu cũ/hỏng thì bắt đầu lại từ rỗng, chứ không để nó làm vỡ luồng gõ.
    cache = parsed !== null && typeof parsed === 'object' ? (parsed as StoredBags) : {}
  } catch {
    cache = {}
  }

  return cache
}

/** ID còn lại trong túi của rổ đó, hoặc null nếu chưa từng lưu. */
export function loadBagIds(key: string): string[] | null {
  const ids = read()[key]
  return Array.isArray(ids) ? ids : null
}

export function saveBagIds(key: string, ids: string[]): void {
  const bags = read()
  bags[key] = ids

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bags))
  } catch {
    // Hết quota hoặc chế độ riêng tư chặn ghi: bỏ qua. Mất khả năng nhớ qua reload
    // thì vẫn còn chống lặp trong phiên — không đáng để làm app dừng lại.
  }
}
