import type { Snippet, SnippetLanguage } from '../types'
import { drawFromBag } from '../../lib/shuffle'
import { javascriptSnippets } from './javascript'
import { typescriptSnippets } from './typescript'
import { csharpSnippets } from './csharp'
import { pythonSnippets } from './python'
import { javaSnippets } from './java'
import { goSnippets } from './go'
import { sqlSnippets } from './sql'
import { bashSnippets } from './bash'
import { cppSnippets } from './cpp'
import { rustSnippets } from './rust'
import { htmlSnippets } from './html'
import { cssSnippets } from './css'
import { jsonSnippets } from './json'
import { specialCharSnippets } from './specialChars'
// Bài khai báo hàng loạt (mục tiêu ~50 bài/ngôn ngữ) để riêng: file viết tay giữ nguyên,
// thêm bao nhiêu cũng không đụng vào phần đã có.
import { javascriptBulk } from './bulk/javascript'
import { typescriptBulk } from './bulk/typescript'
import { pythonBulk } from './bulk/python'
import { csharpBulk } from './bulk/csharp'
import { javaBulk } from './bulk/java'
import { goBulk } from './bulk/go'
import { sqlBulk } from './bulk/sql'
import { bashBulk } from './bulk/bash'
import { cppBulk } from './bulk/cpp'
import { rustBulk } from './bulk/rust'
import { htmlBulk } from './bulk/html'
import { cssBulk } from './bulk/css'
import { jsonBulk } from './bulk/json'
import { textBulk } from './bulk/text'

export const SNIPPETS: Record<SnippetLanguage, Snippet[]> = {
  javascript: [...javascriptSnippets, ...javascriptBulk],
  typescript: [...typescriptSnippets, ...typescriptBulk],
  csharp: [...csharpSnippets, ...csharpBulk],
  python: [...pythonSnippets, ...pythonBulk],
  java: [...javaSnippets, ...javaBulk],
  go: [...goSnippets, ...goBulk],
  sql: [...sqlSnippets, ...sqlBulk],
  bash: [...bashSnippets, ...bashBulk],
  cpp: [...cppSnippets, ...cppBulk],
  rust: [...rustSnippets, ...rustBulk],
  html: [...htmlSnippets, ...htmlBulk],
  css: [...cssSnippets, ...cssBulk],
  json: [...jsonSnippets, ...jsonBulk],
  text: [...specialCharSnippets, ...textBulk],
}

/**
 * "Túi trộn" cho từng ngôn ngữ: trộn cả danh sách rồi rút lần lượt, hết túi mới trộn
 * lại. Nhờ vậy người gõ liên tục sẽ đi qua HẾT các bài trước khi gặp lại bài nào —
 * random thuần (kể cả có loại bài vừa gõ) vẫn có thể ra một bài ba lần trong khi vài
 * bài khác chưa hiện lần nào.
 *
 * Giữ ở module scope (không phải state trong React) để việc đổi ngôn ngữ qua lại,
 * hay component remount, không làm mất tiến độ của túi.
 */
const bags: Partial<Record<SnippetLanguage, Snippet[]>> = {}

export function getRandomSnippet(language: SnippetLanguage, excludeId?: string): Snippet {
  const bag = (bags[language] ??= [])
  return drawFromBag(bag, SNIPPETS[language], excludeId)
}
