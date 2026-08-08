import type { SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/**
 * Chỉ đọc env — cố ý KHÔNG import giá trị nào từ '@supabase/supabase-js' ở đây
 * (chỉ `import type`, bị xoá lúc build) để package ~120kB không lọt vào bundle đầu.
 * Người chỉ vào gõ code sẽ không phải tải nó.
 */
export const isLeaderboardEnabled = Boolean(url && anonKey)

// Cho phép gọi thẳng REST của Supabase (vd endpoint /auth/v1/settings) mà không
// phải kéo cả client về. Khoá này public by design, bảo mật dựa vào RLS.
export const supabaseConfig = url && anonKey ? { url, anonKey } : null

let clientPromise: Promise<SupabaseClient | null> | null = null

/** Tải client theo yêu cầu (chunk riêng), cache lại để chỉ khởi tạo 1 lần. */
export function getSupabase(): Promise<SupabaseClient | null> {
  if (!isLeaderboardEnabled) return Promise.resolve(null)

  if (!clientPromise) {
    clientPromise = import('@supabase/supabase-js').then(({ createClient }) =>
      createClient(url as string, anonKey as string),
    )
  }

  return clientPromise
}
