import type { SnippetLanguage } from '../data/types'

/**
 * Lấy code từ link GitHub / Gist để luyện gõ, thay cho việc copy tay.
 *
 * Gọi THẲNG từ trình duyệt, không qua server của mình: `raw.githubusercontent.com` và
 * `api.github.com` đều trả `Access-Control-Allow-Origin: *`. Không cần token, nên chỉ đọc
 * được repo và gist CÔNG KHAI — link repo riêng tư trả 404 y như link sai.
 *
 * Cố ý KHÔNG tự kéo code từ GitHub Trending hay repo ngẫu nhiên: code của người khác có
 * giấy phép riêng, và chất lượng thì không kiểm soát được. Ở đây người dùng tự chọn file
 * mình muốn luyện, giống hệt việc họ tự copy rồi dán vào.
 */

export type ImportErrorCode = 'invalid-url' | 'not-found' | 'rate-limit' | 'too-large' | 'not-text' | 'network'

export class ImportError extends Error {
  readonly code: ImportErrorCode

  constructor(code: ImportErrorCode) {
    super(code)
    this.code = code
  }
}

export interface ImportedCode {
  code: string
  /** Đoán từ đuôi file; `undefined` khi không nhận ra (giữ ngôn ngữ đang chọn). */
  language: SnippetLanguage | undefined
  fileName: string
}

/** Một dải dòng chọn bằng `#L10-L40` trên link GitHub (đánh số từ 1, gồm cả hai đầu). */
interface LineRange {
  start: number
  end: number
}

type Source =
  | { kind: 'raw'; url: string; fileName: string; lines: LineRange | null }
  | { kind: 'gist'; id: string; fileHint: string | null }

/**
 * File lớn hơn mức này thì không tải hết: hộp dán code chỉ giữ 3.000 ký tự, tải 5 MB về
 * chỉ để vứt gần hết là phí mạng của người dùng (nhất là trên điện thoại).
 */
const MAX_DOWNLOAD_BYTES = 512 * 1024

const EXTENSIONS: Record<string, SnippetLanguage> = {
  js: 'javascript',
  mjs: 'javascript',
  cjs: 'javascript',
  jsx: 'javascript',
  ts: 'typescript',
  mts: 'typescript',
  cts: 'typescript',
  tsx: 'typescript',
  py: 'python',
  cs: 'csharp',
  java: 'java',
  go: 'go',
  sql: 'sql',
  sh: 'bash',
  bash: 'bash',
  zsh: 'bash',
  c: 'cpp',
  h: 'cpp',
  cc: 'cpp',
  cpp: 'cpp',
  cxx: 'cpp',
  hpp: 'cpp',
  rs: 'rust',
  html: 'html',
  htm: 'html',
  css: 'css',
  json: 'json',
  md: 'text',
  txt: 'text',
}

export function languageFromFileName(fileName: string): SnippetLanguage | undefined {
  const dot = fileName.lastIndexOf('.')
  if (dot === -1) return undefined
  return EXTENSIONS[fileName.slice(dot + 1).toLowerCase()]
}

/** `#L12` hoặc `#L12-L40` → dải dòng. Dải ngược (`#L40-L12`) thì đảo lại cho đúng. */
function parseLineRange(hash: string): LineRange | null {
  const match = /^#L(\d+)(?:-L(\d+))?$/.exec(hash)
  if (!match) return null

  const a = Number(match[1])
  const b = match[2] ? Number(match[2]) : a
  return { start: Math.min(a, b), end: Math.max(a, b) }
}

/**
 * Đọc link người dùng dán vào. Nhận:
 *   - github.com/<owner>/<repo>/blob/<ref>/<path>[#L10-L40]
 *   - raw.githubusercontent.com/<owner>/<repo>/<ref>/<path>
 *   - gist.github.com/<user>/<id>[#file-<tên>]
 */
export function parseSource(input: string): Source | null {
  let url: URL
  try {
    url = new URL(input.trim())
  } catch {
    return null
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null

  const parts = url.pathname.split('/').filter(Boolean)
  const host = url.hostname.toLowerCase()

  if (host === 'github.com' || host === 'www.github.com') {
    // owner / repo / blob / ref / ...path
    if (parts.length < 5 || parts[2] !== 'blob') return null
    const [owner, repo, , ...rest] = parts
    const path = rest.join('/')
    return {
      kind: 'raw',
      url: `https://raw.githubusercontent.com/${owner}/${repo}/${path}`,
      fileName: rest[rest.length - 1],
      lines: parseLineRange(url.hash),
    }
  }

  if (host === 'raw.githubusercontent.com') {
    if (parts.length < 4) return null
    return { kind: 'raw', url: `https://raw.githubusercontent.com/${parts.join('/')}`, fileName: parts[parts.length - 1], lines: null }
  }

  if (host === 'gist.github.com') {
    // user / id — hoặc chỉ id. Id gist là chuỗi hex.
    const id = parts.find((p) => /^[0-9a-f]{20,}$/i.test(p))
    if (!id) return null
    // `#file-app-js` → gợi ý chọn đúng file trong gist nhiều file.
    const fileHint = url.hash.startsWith('#file-') ? url.hash.slice('#file-'.length).toLowerCase() : null
    return { kind: 'gist', id, fileHint }
  }

  return null
}

async function request(url: string, signal?: AbortSignal): Promise<Response> {
  let res: Response
  try {
    res = await fetch(url, { signal })
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err
    throw new ImportError('network')
  }

  if (res.status === 404) throw new ImportError('not-found')
  // API GitHub báo hết lượt bằng 403 (hoặc 429) kèm `X-RateLimit-Remaining: 0`.
  if (res.status === 403 || res.status === 429) throw new ImportError('rate-limit')
  if (!res.ok) throw new ImportError('network')

  const length = Number(res.headers.get('content-length') ?? 0)
  if (length > MAX_DOWNLOAD_BYTES) throw new ImportError('too-large')
  return res
}

/** Ký tự NUL trong nội dung = file nhị phân (ảnh, file nén) chứ không phải code. */
function looksBinary(text: string): boolean {
  return text.slice(0, 8000).includes('\u0000')
}

function sliceLines(text: string, range: LineRange | null): string {
  if (!range) return text
  const lines = text.split(/\r?\n/)
  return lines.slice(range.start - 1, range.end).join('\n')
}

interface GistFile {
  filename: string
  content?: string
  truncated?: boolean
  raw_url?: string
  size?: number
}

/** Chọn file trong gist: đúng file `#file-...` nếu có, không thì file code đầu tiên. */
function pickGistFile(files: GistFile[], hint: string | null): GistFile | undefined {
  if (hint) {
    // GitHub tạo anchor bằng cách viết thường và đổi `.` thành `-`: `App.js` → `file-app-js`.
    const matched = files.find((f) => f.filename.toLowerCase().replace(/[^a-z0-9]+/g, '-') === hint)
    if (matched) return matched
  }
  return files.find((f) => languageFromFileName(f.filename) !== undefined) ?? files[0]
}

export async function importFromGitHub(input: string, signal?: AbortSignal): Promise<ImportedCode> {
  const source = parseSource(input)
  if (!source) throw new ImportError('invalid-url')

  if (source.kind === 'raw') {
    const res = await request(source.url, signal)
    const text = await res.text()
    if (text.length > MAX_DOWNLOAD_BYTES) throw new ImportError('too-large')
    if (looksBinary(text)) throw new ImportError('not-text')

    return {
      code: sliceLines(text, source.lines),
      language: languageFromFileName(source.fileName),
      fileName: source.fileName,
    }
  }

  const res = await request(`https://api.github.com/gists/${source.id}`, signal)
  const gist = (await res.json()) as { files?: Record<string, GistFile> }
  const file = pickGistFile(Object.values(gist.files ?? {}), source.fileHint)
  if (!file) throw new ImportError('not-found')

  let content = file.content ?? ''
  // API cắt nội dung file lớn (>1 MB) và để `truncated: true` — lấy bản đầy đủ qua raw_url.
  if (file.truncated && file.raw_url) {
    if ((file.size ?? 0) > MAX_DOWNLOAD_BYTES) throw new ImportError('too-large')
    content = await (await request(file.raw_url, signal)).text()
  }
  if (looksBinary(content)) throw new ImportError('not-text')

  return { code: content, language: languageFromFileName(file.filename), fileName: file.filename }
}
