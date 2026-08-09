import { getSupabase, supabaseConfig } from './supabase'
import type { Session, User } from '@supabase/supabase-js'

export type OAuthProvider = 'google' | 'github'

export interface AppUser {
  id: string
  displayName: string
  avatarUrl: string | null
  /** Ngày tạo tài khoản (ISO) — Supabase trả sẵn, dùng cho ô "Joined". */
  createdAt: string | null
  email: string | null
  /** Cách đã đăng nhập: 'github' | 'google' | 'email'... để hiện ở Account settings. */
  provider: string | null
}

/** Lấy tên/avatar từ metadata OAuth — mỗi provider đặt key hơi khác nhau. */
export function toAppUser(user: User): AppUser {
  const meta = user.user_metadata ?? {}
  const displayName =
    (meta.user_name as string | undefined) ??  // GitHub: username
    (meta.full_name as string | undefined) ??  // Google: họ tên
    (meta.name as string | undefined) ??
    user.email?.split('@')[0] ??
    'user'

  return {
    id: user.id,
    displayName,
    avatarUrl: (meta.avatar_url as string | undefined) ?? (meta.picture as string | undefined) ?? null,
    createdAt: user.created_at ?? null,
    email: user.email ?? null,
    provider: (user.app_metadata?.provider as string | undefined) ?? null,
  }
}

// Thứ tự này là thứ tự hiển thị nút trên màn đăng nhập.
export const SUPPORTED_PROVIDERS: OAuthProvider[] = ['google', 'github']

let providersPromise: Promise<OAuthProvider[]> | null = null

/**
 * Hỏi Supabase provider nào đang thật sự bật, để không hiện nút đăng nhập bấm vào
 * là lỗi "Unsupported provider". Bật thêm provider trên dashboard thì nút tự hiện,
 * không phải sửa code. Kết quả cache cả phiên.
 */
export function getEnabledProviders(): Promise<OAuthProvider[]> {
  if (!supabaseConfig) return Promise.resolve([])

  if (!providersPromise) {
    providersPromise = fetch(`${supabaseConfig.url}/auth/v1/settings`, {
      headers: { apikey: supabaseConfig.anonKey },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        const external = (json?.external ?? {}) as Record<string, boolean>
        return SUPPORTED_PROVIDERS.filter((p) => external[p])
      })
      // Gọi hỏng (mất mạng...) thì hiện hết còn hơn khoá sạch đường đăng nhập.
      .catch(() => SUPPORTED_PROVIDERS)
  }

  return providersPromise
}

export async function signInWith(provider: OAuthProvider): Promise<{ error: string | null }> {
  const supabase = await getSupabase()
  if (!supabase) return { error: 'not-configured' }

  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: window.location.origin },
  })

  return { error: error ? error.message : null }
}

/**
 * Đăng nhập bằng email: Supabase gửi 1 đường link tới hộp thư, bấm vào là vào thẳng.
 * Không có mật khẩu nên không phải lưu/giữ gì cả.
 */
export async function signInWithEmail(email: string): Promise<{ error: string | null }> {
  const supabase = await getSupabase()
  if (!supabase) return { error: 'not-configured' }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin },
  })

  return { error: error ? error.message : null }
}

/** Supabase mặc định tối thiểu 6; đặt 8 cho chặt hơn và nói rõ trên UI. */
export const PASSWORD_MIN = 8

/**
 * Đăng ký bằng email + mật khẩu. `needsConfirmation` = Supabase đang bắt xác nhận
 * email (mặc định BẬT) nên chưa có session ngay: phải vào hộp thư bấm link đã.
 */
export async function signUpWithPassword(
  email: string,
  password: string,
): Promise<{ error: string | null; needsConfirmation: boolean }> {
  const supabase = await getSupabase()
  if (!supabase) return { error: 'not-configured', needsConfirmation: false }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: window.location.origin },
  })

  return {
    error: error ? error.message : null,
    needsConfirmation: !error && !data.session && Boolean(data.user),
  }
}

export async function signInWithPassword(
  email: string,
  password: string,
): Promise<{ error: string | null }> {
  const supabase = await getSupabase()
  if (!supabase) return { error: 'not-configured' }

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  return { error: error ? error.message : null }
}

/** Gửi mail đặt lại mật khẩu. Link trong mail sẽ mở app kèm session tạm thời. */
export async function sendPasswordReset(email: string): Promise<{ error: string | null }> {
  const supabase = await getSupabase()
  if (!supabase) return { error: 'not-configured' }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin,
  })
  return { error: error ? error.message : null }
}

/** Đặt mật khẩu mới — chỉ chạy được khi đang có session (kể cả session từ link recovery). */
export async function updatePassword(password: string): Promise<{ error: string | null }> {
  const supabase = await getSupabase()
  if (!supabase) return { error: 'not-configured' }

  const { error } = await supabase.auth.updateUser({ password })
  return { error: error ? error.message : null }
}

/**
 * Đăng nhập lỗi thì Supabase quay về app kèm `error_description` trong hash (hoặc
 * query). Không đọc ra thì người dùng chỉ thấy màn hình bình thường và không hiểu vì
 * sao mình vẫn chưa đăng nhập được. Đọc xong DỌN URL luôn để reload không hiện lại.
 */
export function readAuthErrorFromUrl(): string | null {
  const fromHash = new URLSearchParams(window.location.hash.replace(/^#/, ''))
  const fromQuery = new URLSearchParams(window.location.search)
  const description =
    fromHash.get('error_description') ??
    fromQuery.get('error_description') ??
    fromHash.get('error') ??
    fromQuery.get('error')

  if (!description) return null

  window.history.replaceState(null, '', window.location.pathname)
  return description.replace(/\+/g, ' ')
}

export async function signOut(): Promise<void> {
  const supabase = await getSupabase()
  if (!supabase) return
  await supabase.auth.signOut()
}

export async function getCurrentSession(): Promise<Session | null> {
  const supabase = await getSupabase()
  if (!supabase) return null
  const { data } = await supabase.auth.getSession()
  return data.session
}

/**
 * Vẫn trả về hàm huỷ ngay lập tức (đồng bộ) dù client tải bất đồng bộ:
 * nếu component unmount trước khi client tải xong thì `cancelled` chặn đăng ký,
 * tránh rò rỉ listener.
 */
export function onAuthChange(
  cb: (session: Session | null, event: string) => void,
): () => void {
  let cancelled = false
  let unsubscribe: (() => void) | null = null

  getSupabase().then((supabase) => {
    if (!supabase || cancelled) return
    const { data } = supabase.auth.onAuthStateChange((event, session) => cb(session, event))
    unsubscribe = () => data.subscription.unsubscribe()
  })

  return () => {
    cancelled = true
    unsubscribe?.()
  }
}
