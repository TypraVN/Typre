import type { Snippet, SnippetLanguage } from '../types'
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

export const SNIPPETS: Record<SnippetLanguage, Snippet[]> = {
  javascript: javascriptSnippets,
  typescript: typescriptSnippets,
  csharp: csharpSnippets,
  python: pythonSnippets,
  java: javaSnippets,
  go: goSnippets,
  sql: sqlSnippets,
  bash: bashSnippets,
  cpp: cppSnippets,
  rust: rustSnippets,
  html: htmlSnippets,
  css: cssSnippets,
  json: jsonSnippets,
  text: specialCharSnippets,
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

function shuffled(list: Snippet[]): Snippet[] {
  const pool = [...list]
  // Fisher-Yates: mọi thứ tự đều có xác suất như nhau.
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool
}

export function getRandomSnippet(language: SnippetLanguage, excludeId?: string): Snippet {
  let bag = bags[language]

  if (!bag || bag.length === 0) {
    bag = shuffled(SNIPPETS[language])
    // Chỗ duy nhất còn có thể trùng là ranh giới giữa hai túi: bài cuối túi trước và
    // bài đầu túi sau. Nếu trùng thì đẩy nó xuống cuối túi mới.
    if (excludeId && bag.length > 1 && bag[0].id === excludeId) {
      bag.push(bag.shift() as Snippet)
    }
    bags[language] = bag
  }

  return bag.shift() as Snippet
}
