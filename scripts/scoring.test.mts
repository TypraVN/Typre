/**
 * Kiểm bộ luật chấm điểm dùng chung (`typingCore.ts`) và phần kiểm tra của Edge Function
 * `submit-score` (`verify.ts`).
 *
 * Đây là thứ quyết định ai đứng hạng mấy: chấm sai một luật là bảng xếp hạng sai cho MỌI
 * người, và server với trình duyệt cùng sai y nhau nên không có gì báo động. Chỉ test
 * mới bắt được.
 */

import {
  KEY_BACKSPACE as BS,
  KEY_ENTER as ENTER,
  KEY_TAB as TAB,
  applyKey,
  initialCore,
  judgeTiming,
  scoreRun,
  type RunAction,
} from '../supabase/functions/_shared/typingCore.ts'
import { parseSubmission, verifyRun, type SnippetIndex } from '../supabase/functions/submit-score/verify.ts'

let passed = 0
const failures: string[] = []

function check(label: string, got: unknown, want: unknown) {
  const a = JSON.stringify(got)
  const b = JSON.stringify(want)
  if (a === b) {
    passed++
    return
  }
  failures.push(`  ${label}\n      mong doi : ${b}\n      nhan duoc: ${a}`)
}

/** Gõ lần lượt các phím, mỗi phím cách nhau `gap` ms. */
function run(keys: string[], gap = 200, start = 0): RunAction[] {
  return keys.map((key, i) => [start + i * gap, key])
}

/** Bộ sinh số giả ngẫu nhiên cố định — test phải ra cùng kết quả mọi lần chạy. */
function rng(seed: number) {
  let s = seed
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648
    return s / 2147483648
  }
}

/** Nhịp gõ giống người: khoảng cách 90–310 ms, lúc nhanh lúc chậm. */
function humanRun(keys: string[], seed = 7): RunAction[] {
  const next = rng(seed)
  let t = 0
  return keys.map((key, i) => {
    if (i > 0) t += 90 + Math.round(next() * 220)
    return [t, key]
  })
}

// ── Luật gõ ──────────────────────────────────────────────────────────────────
{
  const target = 'ab\n  cd'
  // Enter đúng chỗ tự nhảy qua 2 dấu cách thụt lề.
  const { stats, completed, state } = scoreRun(target, run(['a', 'b', ENTER, 'c', 'd']), false, 15000)
  check('go het bai: completed', completed, true)
  check('go het bai: thoi gian = phim cuoi', stats.elapsedMs, 800)
  check('Enter tu nhay thut le', state.statuses, ['correct', 'correct', 'correct', 'auto', 'auto', 'correct', 'correct'])
  // 5 ký tự đúng ('auto' không tính) trong 0,8s → 375 cpm → 75 wpm.
  check('wpm tinh tren ky tu dung', [stats.cpm, stats.wpm, stats.accuracy], [375, 75, 100])
}
{
  const target = 'x\n    y'
  // Enter nhảy qua 4 dấu cách thụt lề; lùi 2 lần về giữa dải đó; Tab nhảy qua 2 dấu
  // cách còn lại và tính đúng 2 ký tự đã gõ.
  const { state } = scoreRun(target, run(['x', ENTER, BS, BS, TAB, 'y']), false, 15000)
  check('Tab nhay qua dai dau cach', [state.cursor, state.typed], [7, 5])
}
{
  // Chế độ thường: gõ sai vẫn đi tiếp, backspace xoá đúng ô vừa gõ.
  const s1 = applyKey(initialCore('abc'), 'z', 'abc', false)
  check('thuong: go sai di tiep', [s1.state.cursor, s1.outcome, s1.expected], [1, 'wrong', 'a'])
  const s2 = applyKey(s1.state, BS, 'abc', false)
  check('thuong: backspace lui', [s2.state.cursor, s2.state.statuses[0]], [0, 'pending'])
}
{
  // Strict: 2 lần sai cần 2 lần backspace mới hết đỏ, lần thứ 3 mới lùi con trỏ.
  let s = initialCore('abc')
  s = applyKey(s, 'a', 'abc', true).state
  s = applyKey(s, 'z', 'abc', true).state
  s = applyKey(s, 'z', 'abc', true).state
  check('strict: sai giu con tro', [s.cursor, s.statuses[1], s.strictMisses], [1, 'incorrect', 2])
  s = applyKey(s, BS, 'abc', true).state
  check('strict: backspace 1 van do', [s.cursor, s.statuses[1]], [1, 'incorrect'])
  s = applyKey(s, BS, 'abc', true).state
  check('strict: backspace 2 het do', [s.cursor, s.statuses[1]], [1, 'pending'])
  s = applyKey(s, BS, 'abc', true).state
  check('strict: backspace 3 moi lui', s.cursor, 0)
}
{
  // Strict: accuracy tính cả các lần gõ sai, dù bài cuối cùng toàn chữ xanh.
  const { stats } = scoreRun('abcd', run(['a', 'z', 'b', 'c', 'd']), true, 15000)
  check('strict: accuracy tru lan sai', stats.accuracy, 80)
}
{
  // Hết giờ: phím sau mốc không tính, thời gian dừng ĐÚNG ở mốc.
  const actions = run(['a', 'b', 'c', 'd'], 400)
  const { stats, completed, state } = scoreRun('abcdefgh', actions, false, 1000)
  check('het gio: bo phim sau moc', state.cursor, 3)
  check('het gio: thoi gian = moc', [completed, stats.elapsedMs], [false, 1000])
}
{
  // Gõ xong bài rồi thì phím nào cũng vô hiệu.
  const { state } = scoreRun('ab', run(['a', 'b', 'c', BS]), false, 15000)
  check('xong bai: phim thua vo hieu', [state.cursor, state.typed], [2, 2])
}

// ── Nhịp gõ ──────────────────────────────────────────────────────────────────
{
  const keys = 'const total = items.length;'.split('')
  check('nhip nguoi: qua', judgeTiming(humanRun(keys), 60000), null)
  check('nhip deu tam tap: robotic', judgeTiming(run(keys, 100), 60000), 'robotic')
  check('ca loat cung luc: bursts', judgeTiming(run(keys, 0), 60000), 'bursts')
  check('qua it phim: khong xet', judgeTiming(run(keys.slice(0, 10), 100), 60000), null)
  // Vài cặp phím đè nhau khi gõ nhanh là bình thường.
  const human = humanRun(keys)
  const rollover = human.map(([t, k], i): RunAction => [i % 9 === 1 ? human[i - 1][0] + 3 : t, k])
  check('vai cap de nhau: qua', judgeTiming(rollover, 60000), null)
}

// ── Kiểm tra của server ──────────────────────────────────────────────────────
const CODE = 'const total = items.reduce((sum, x) => sum + x.price, 0);'
const INDEX: SnippetIndex = {
  version: 1,
  snippets: { 'js-1': ['javascript', CODE], 'js-long-1': ['javascript', 'x'] },
  pools: { 'javascript|30': ['js-1'], 'javascript|60': ['js-long-1'] },
}
const RUN_ID = '3f2b8a5e-1c4d-4e6f-8a9b-0c1d2e3f4a5b'
const good = { snippetId: 'js-1', language: 'javascript', timeLimit: 30, strict: false, runId: RUN_ID }

{
  const sub = parseSubmission({ ...good, actions: humanRun(CODE.split('')) })
  const verdict = sub && verifyRun(sub, INDEX)
  check('luot that: duoc ghi', verdict && verdict.ok, true)
  if (verdict && verdict.ok) check('luot that: 100% accuracy', verdict.score.accuracy, 100)
}
check('bai la', verifyRun(parseSubmission({ ...good, snippetId: 'nope', actions: humanRun(['a']) })!, INDEX), {
  ok: false,
  error: 'unknown-snippet',
})
check(
  'sai ngon ngu',
  verifyRun(parseSubmission({ ...good, language: 'python', actions: humanRun(['a']) })!, INDEX),
  { ok: false, error: 'unknown-snippet' },
)
check(
  'sai ro (bai 30s gui o moc 60s)',
  verifyRun(parseSubmission({ ...good, timeLimit: 60, actions: humanRun(['a']) })!, INDEX),
  { ok: false, error: 'wrong-pool' },
)
check(
  'accuracy duoi 75%',
  verifyRun(parseSubmission({ ...good, actions: humanRun('xxxxxxxxxx'.split('')) })!, INDEX),
  { ok: false, error: 'not-eligible' },
)
check(
  'script go deu',
  verifyRun(parseSubmission({ ...good, actions: run(CODE.split(''), 100) })!, INDEX),
  { ok: false, error: 'robotic' },
)
check(
  'dan ca doan',
  verifyRun(parseSubmission({ ...good, actions: run(CODE.split(''), 0) })!, INDEX),
  { ok: false, error: 'not-eligible' },
)

// Thân request sai hình dạng — bỏ hết, không đoán ý.
check('thieu actions', parseSubmission({ ...good }), null)
check('thoi diem giam dan', parseSubmission({ ...good, actions: [[10, 'a'], [5, 'b']] }), null)
check('phim nhieu ky tu', parseSubmission({ ...good, actions: [[0, 'ab']] }), null)
check('moc thoi gian la', parseSubmission({ ...good, timeLimit: 45, actions: [[0, 'a']] }), null)
check('runId sai', parseSubmission({ ...good, runId: 'abc', actions: [[0, 'a']] }), null)

console.log(`\n${passed}/${passed + failures.length} ca dat`)

if (failures.length > 0) {
  console.log(`\n${failures.length} ca HONG:\n`)
  console.log(failures.join('\n\n'))
  process.exit(1)
}

console.log('Tat ca deu dat.\n')
