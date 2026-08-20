import { getSupabase } from './supabase'

/**
 * Báo lỗi từ người dùng.
 *
 * Vì sao có: người dùng chỉ mô tả được "chỗ này lỗi". Thứ thật sự cần để sửa — thông báo
 * lỗi, trình duyệt, phiên bản build — thì họ không biết lấy ở đâu. App tự đính kèm.
 */

/** Giữ tối đa bấy nhiêu lỗi gần nhất. Đủ để thấy lỗi gốc và các lỗi kéo theo. */
const MAX_ERRORS = 5

/** Cắt bớt thông báo lỗi quá dài — stack của React có thể vài nghìn ký tự. */
const MAX_ERROR_CHARS = 300

export const MAX_MESSAGE_CHARS = 2000
export const MIN_MESSAGE_CHARS = 3

/** Khoảng chờ giữa hai lần gửi, chặn bấm nhầm nhiều lần. */
const COOLDOWN_MS = 30_000
const LAST_SENT_KEY = 'typre-last-report'

interface CapturedError {
  at: string
  message: string
}

const recentErrors: CapturedError[] = []

function remember(message: string): void {
  recentErrors.push({ at: new Date().toISOString(), message: message.slice(0, MAX_ERROR_CHARS) })
  if (recentErrors.length > MAX_ERRORS) recentErrors.shift()
}

/**
 * Bắt lỗi toàn cục để lúc người dùng bấm "báo lỗi" thì đã có sẵn nguyên nhân.
 *
 * Gọi MỘT LẦN lúc khởi động, TRƯỚC khi render: lỗi hay xảy ra sớm nhất là lúc dựng cây
 * component, gắn muộn là bỏ lỡ đúng cái cần bắt.
 *
 * Cố ý không bọc `console.error`: React đã in lỗi render qua đó, nhưng ghi đè một hàm
 * toàn cục là thứ gây rối cho người sau đọc code. Hai sự kiện dưới đây đủ cho lỗi thật.
 */
export function startErrorCapture(): void {
  window.addEventListener('error', (event) => {
    remember(event.message || String(event.error))
  })

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason
    remember(reason instanceof Error ? reason.message : String(reason))
  })
}

/** Cho `DialogBoundary` đẩy lỗi React vào — nó bắt lỗi nên `window.error` không thấy. */
export function recordError(error: Error): void {
  remember(error.message)
}

export interface ReportContext {
  /** Tên file bundle đang chạy — xác định CHÍNH XÁC bản build, không cần biến môi trường. */
  build: string
  url: string
  userAgent: string
  viewport: string
  language: string
  online: boolean
  recentErrors: CapturedError[]
}

/**
 * Đọc tên file bundle từ chính thẻ script đang chạy.
 *
 * Tên có hash nội dung nên xác định đúng bản build, mà không phải cắm biến môi trường hay
 * ghi số phiên bản bằng tay — thứ chắc chắn có ngày quên cập nhật.
 */
function buildId(): string {
  try {
    const script = document.querySelector<HTMLScriptElement>('script[type="module"][src]')
    return script ? (script.src.split('/').pop() ?? 'unknown') : 'unknown'
  } catch {
    return 'unknown'
  }
}

export function collectContext(): ReportContext {
  return {
    build: buildId(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    language: navigator.language,
    online: navigator.onLine,
    recentErrors: [...recentErrors],
  }
}

export function cooldownLeftMs(): number {
  try {
    const last = Number(localStorage.getItem(LAST_SENT_KEY)) || 0
    return Math.max(0, COOLDOWN_MS - (Date.now() - last))
  } catch {
    return 0
  }
}

export type SendResult = { ok: true } | { ok: false; reason: 'offline' | 'cooldown' | 'failed' }

export async function sendReport(message: string, userId: string | null): Promise<SendResult> {
  const text = message.trim()
  if (text.length < MIN_MESSAGE_CHARS) return { ok: false, reason: 'failed' }
  if (cooldownLeftMs() > 0) return { ok: false, reason: 'cooldown' }

  const supabase = await getSupabase()
  // Không cấu hình Supabase (hoặc bản tự dựng) thì không có chỗ để gửi — giao diện sẽ
  // chuyển sang cho copy nội dung ra clipboard.
  if (!supabase) return { ok: false, reason: 'offline' }

  const { error } = await supabase.from('reports').insert({
    message: text.slice(0, MAX_MESSAGE_CHARS),
    context: collectContext(),
    user_id: userId,
  })

  if (error) return { ok: false, reason: 'failed' }

  try {
    localStorage.setItem(LAST_SENT_KEY, String(Date.now()))
  } catch {
    // Không lưu được thì mất khoảng chờ, không đáng để báo lỗi ngược cho người dùng.
  }

  return { ok: true }
}

/** Nội dung để copy khi không gửi được — dán vào đâu cũng đọc được. */
export function asPlainText(message: string): string {
  const ctx = collectContext()
  const errors = ctx.recentErrors.map((e) => `  - ${e.message}`).join('\n') || '  (none)'

  return [
    'Typre bug report',
    '',
    message.trim(),
    '',
    `build:    ${ctx.build}`,
    `url:      ${ctx.url}`,
    `viewport: ${ctx.viewport}`,
    `browser:  ${ctx.userAgent}`,
    'recent errors:',
    errors,
  ].join('\n')
}
