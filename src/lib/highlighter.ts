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

function getCore(): Promise<HighlighterCore> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighterCore({
      themes: [],
      langs: [],
      // Engine JS thuần: tránh tải file WASM ~600kB của Oniguruma.
      engine: createJavaScriptRegexEngine(),
    })
  }
  return highlighterPromise
}

const loadedLangs = new Set<CodeLanguage>()
const loadedThemes = new Set<ShikiTheme>()

/**
 * Trả về highlighter đã đảm bảo `lang` và `theme` được nạp xong.
 * Gọi nhiều lần với cùng cặp thì chỉ nạp 1 lần.
 */
export async function getHighlighterFor(
  lang: CodeLanguage,
  theme: ShikiTheme,
): Promise<HighlighterCore> {
  const core = await getCore()

  if (!loadedLangs.has(lang)) {
    const mod = await LANG_LOADERS[lang]()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await core.loadLanguage(mod.default as any)
    loadedLangs.add(lang)
  }

  if (!loadedThemes.has(theme)) {
    const mod = await THEME_LOADERS[theme]()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await core.loadTheme(mod.default as any)
    loadedThemes.add(theme)
  }

  return core
}
