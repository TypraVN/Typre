import { createHighlighterCore, type HighlighterCore } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'

export const CODE_THEMES = ['dark-plus', 'dracula', 'monokai', 'one-dark-pro'] as const
export type CodeTheme = (typeof CODE_THEMES)[number]

export const THEME_LABELS: Record<CodeTheme, string> = {
  'dark-plus': 'VS Code',
  dracula: 'Dracula',
  monokai: 'Monokai',
  'one-dark-pro': 'One Dark Pro',
}

/**
 * Mỗi lựa chọn theme có 2 biến thể: bản tối dùng cho dark mode, bản sáng cho light mode.
 * Nếu light mode vẫn dùng theme tối thì chữ (màu nhạt) sẽ chìm trên nền trắng.
 * VS Code và One Dark có bản sáng chính thức; Dracula/Monokai thì không, nên ghép
 * với theme sáng gần gũi nhất về cảm giác màu (pastel / ấm).
 */
const THEME_VARIANTS = {
  'dark-plus': { dark: 'dark-plus', light: 'light-plus' },
  dracula: { dark: 'dracula', light: 'catppuccin-latte' },
  monokai: { dark: 'monokai', light: 'solarized-light' },
  'one-dark-pro': { dark: 'one-dark-pro', light: 'one-light' },
} as const satisfies Record<CodeTheme, { dark: string; light: string }>

export type ShikiTheme = (typeof THEME_VARIANTS)[CodeTheme]['dark' | 'light']

export function resolveTheme(theme: CodeTheme, uiMode: 'light' | 'dark'): ShikiTheme {
  return THEME_VARIANTS[theme][uiMode]
}

// Import động như lang: 8 theme mà chỉ tải đúng cái đang dùng.
const THEME_LOADERS: Record<ShikiTheme, () => Promise<{ default: unknown }>> = {
  'dark-plus': () => import('@shikijs/themes/dark-plus'),
  'light-plus': () => import('@shikijs/themes/light-plus'),
  dracula: () => import('@shikijs/themes/dracula'),
  'catppuccin-latte': () => import('@shikijs/themes/catppuccin-latte'),
  monokai: () => import('@shikijs/themes/monokai'),
  'solarized-light': () => import('@shikijs/themes/solarized-light'),
  'one-dark-pro': () => import('@shikijs/themes/one-dark-pro'),
  'one-light': () => import('@shikijs/themes/one-light'),
}

export const LANGS = [
  'javascript',
  'typescript',
  'csharp',
  'python',
  'java',
  'go',
  'sql',
  'bash',
  'cpp',
  'rust',
  'html',
  'css',
  'json',
] as const

// Chỉ những lang có trong LANG_LOADERS mới highlight được — dùng type này thay
// `string` để TypeScript chặn sớm nếu truyền lang chưa hỗ trợ.
export type CodeLanguage = (typeof LANGS)[number]

// Import động từng lang: mỗi lang thành 1 chunk riêng, chỉ tải khi người dùng
// thật sự chọn ngôn ngữ đó. Nếu import tĩnh cả 10 thì bundle đầu tăng gấp đôi.
const LANG_LOADERS: Record<CodeLanguage, () => Promise<{ default: unknown }>> = {
  javascript: () => import('@shikijs/langs/javascript'),
  typescript: () => import('@shikijs/langs/typescript'),
  csharp: () => import('@shikijs/langs/csharp'),
  python: () => import('@shikijs/langs/python'),
  java: () => import('@shikijs/langs/java'),
  go: () => import('@shikijs/langs/go'),
  sql: () => import('@shikijs/langs/sql'),
  bash: () => import('@shikijs/langs/bash'),
  cpp: () => import('@shikijs/langs/cpp'),
  rust: () => import('@shikijs/langs/rust'),
  html: () => import('@shikijs/langs/html'),
  css: () => import('@shikijs/langs/css'),
  json: () => import('@shikijs/langs/json'),
}

let highlighterPromise: Promise<HighlighterCore> | null = null

/**
 * Bản đã resolve của core, giữ riêng để đọc ĐỒNG BỘ.
 *
 * `highlighterPromise` chỉ đọc được qua `await`, mà chờ một microtask cũng đủ để React
 * vẽ xong một khung hình không màu — đó chính là cái nháy khi đổi bài trong cùng một
 * ngôn ngữ đã tải sẵn.
 */
let coreInstance: HighlighterCore | null = null

function getCore(): Promise<HighlighterCore> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighterCore({
      themes: [],
      langs: [],
      // Engine JS thuần: tránh tải file WASM ~600kB của Oniguruma.
      engine: createJavaScriptRegexEngine(),
    }).then((core) => {
      coreInstance = core
      return core
    })
  }
  return highlighterPromise
}

const loadedLangs = new Set<CodeLanguage>()
const loadedThemes = new Set<ShikiTheme>()

/**
 * Core dùng được NGAY nếu ngôn ngữ và theme đã nạp xong, ngược lại `null`.
 *
 * Cho phép tô màu ngay trong lúc render thay vì đợi một effect — không có nó thì mỗi lần
 * đổi bài đều nháy mất màu một nhịp dù chẳng phải tải thêm gì.
 */
export function getLoadedHighlighter(
  lang: CodeLanguage,
  theme: ShikiTheme,
): HighlighterCore | null {
  if (!coreInstance || !loadedLangs.has(lang) || !loadedThemes.has(theme)) return null
  return coreInstance
}

/** Ngôn ngữ đang tải dở — chặn nạp trùng khi rê chuột qua lại nhiều lần. */
const prefetching = new Set<CodeLanguage>()

/**
 * Nạp trước grammar của một ngôn ngữ, gọi khi người dùng mới RÊ CHUỘT lên nút.
 *
 * Khoảng cách giữa lúc rê chuột và lúc bấm thường đủ để tải xong (grammar nặng nhất là
 * C++ ~46KB), nên cú bấm không còn phải chờ. Ai không rê tới thì không tốn gì — vẫn giữ
 * nguyên lợi ích của việc tách chunk theo ngôn ngữ.
 */
export function prefetchLanguage(lang: CodeLanguage): void {
  if (loadedLangs.has(lang) || prefetching.has(lang)) return

  prefetching.add(lang)
  // Phải ĐĂNG KÝ hẳn vào core, không chỉ kéo file về: chỉ tải module thì `loadedLangs`
  // vẫn rỗng, nên lúc bấm `getLoadedHighlighter` trả null và màu vẫn nháy một nhịp.
  // Lỗi mạng thì bỏ qua — lát nữa bấm vào sẽ thử lại.
  void ensureLang(lang).catch(() => prefetching.delete(lang))
}

/**
 * Trả về highlighter đã đảm bảo `lang` và `theme` được nạp xong.
 * Gọi nhiều lần với cùng cặp thì chỉ nạp 1 lần.
 */
async function ensureLang(lang: CodeLanguage): Promise<HighlighterCore> {
  const core = await getCore()
  if (loadedLangs.has(lang)) return core

  const mod = await LANG_LOADERS[lang]()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await core.loadLanguage(mod.default as any)
  loadedLangs.add(lang)

  return core
}

async function ensureTheme(theme: ShikiTheme): Promise<HighlighterCore> {
  const core = await getCore()
  if (loadedThemes.has(theme)) return core

  const mod = await THEME_LOADERS[theme]()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await core.loadTheme(mod.default as any)
  loadedThemes.add(theme)

  return core
}

export async function getHighlighterFor(
  lang: CodeLanguage,
  theme: ShikiTheme,
): Promise<HighlighterCore> {
  await ensureLang(lang)
  return ensureTheme(theme)
}
