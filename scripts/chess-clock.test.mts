/**
 * Kiểm đồng hồ. Chạy cùng `npm run test:chess`.
 *
 * Bơm mốc thời gian vào thay vì gọi `Date.now()` thật — test đồng hồ mà phải `sleep` thì
 * vừa chậm vừa hay hỏng vặt trên máy chậm.
 */

import {
  INITIAL_MS,
  flagged,
  formatClock,
  hasMatingMaterial,
  newClock,
  remaining,
  stop,
  switchTurn,
  timeoutResult,
} from '../src/lib/chess/clock'

let passed = 0
const failures: string[] = []

function check(label: string, got: unknown, want: unknown) {
  const a = JSON.stringify(got)
  const b = JSON.stringify(want)
  if (a === b) {
    passed++
    return
  }
  failures.push(`  ${label}\n      mong doi: ${b}\n      nhan duoc: ${a}`)
}

// ── Hiển thị ─────────────────────────────────────────────────────────────────
check('15 phut', formatClock(INITIAL_MS), '15:00')
check('1 phut 7 giay', formatClock(67_000), '1:07')
check('duoi 10 giay co phan muoi', formatClock(9_400), '0:09.4')
check('het gio', formatClock(0), '0:00.0')
check('am cung ve 0', formatClock(-500), '0:00.0')
/**
 * Làm tròn XUỐNG, không làm tròn gần nhất: hiện "0:01" khi thực tế còn 0,4 giây là hứa
 * với người chơi một giây họ không có.
 */
check('lam tron xuong', formatClock(1_900), '0:01.9')

// ── Đếm giờ bằng mốc thời gian ───────────────────────────────────────────────
{
  const t0 = 1_000_000
  let clock = newClock('w')

  // Chưa chạy thì không trừ gì, dù thời gian trôi bao lâu.
  check('dung yen thi khong tru', remaining(clock, t0 + 60_000), {
    whiteMs: INITIAL_MS,
    blackMs: INITIAL_MS,
  })

  clock = { ...clock, runningSince: t0 }

  check('chi tru ben dang di', remaining(clock, t0 + 5_000), {
    whiteMs: INITIAL_MS - 5_000,
    blackMs: INITIAL_MS,
  })

  // Trắng đi sau 5 giây → chốt giờ trắng, chuyển sang đen.
  clock = switchTurn(clock, 'b', t0 + 5_000)
  check('chot gio sau nuoc di', clock.base, {
    whiteMs: INITIAL_MS - 5_000,
    blackMs: INITIAL_MS,
  })

  check('gio den chay tiep', remaining(clock, t0 + 8_000), {
    whiteMs: INITIAL_MS - 5_000,
    blackMs: INITIAL_MS - 3_000,
  })

  clock = stop(clock, t0 + 8_000)
  check('dung lai thi chot', clock.runningSince, null)
  check('dung roi thi thoi gian troi khong tru', remaining(clock, t0 + 999_999), {
    whiteMs: INITIAL_MS - 5_000,
    blackMs: INITIAL_MS - 3_000,
  })
}

// ── Tab chạy nền không được lợi giờ ──────────────────────────────────────────
{
  /**
   * Điểm mấu chốt của cách tính này.
   *
   * Đếm lùi từng nhịp thì tab nền bị trình duyệt bóp xuống 1 nhịp/giây và người chuyển
   * tab được tặng giờ. Tính bằng hiệu hai mốc thời gian thì một bước nhảy 10 phút cũng
   * trừ đúng 10 phút.
   */
  const t0 = 2_000_000
  const clock = { ...newClock('w'), runningSince: t0 }

  check('nhay 10 phut van tru du', remaining(clock, t0 + 600_000), {
    whiteMs: INITIAL_MS - 600_000,
    blackMs: INITIAL_MS,
  })
  check('het gio thi bao co', flagged(remaining(clock, t0 + INITIAL_MS + 1)), 'w')
  check('con gio thi khong bao', flagged(remaining(clock, t0 + 1_000)), null)
}

// ── Luật FIDE 6.9: hết giờ mà đối thủ không đủ quân chiếu hết = HOÀ ──────────
{
  const start = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
  check('the ban dau: trang du quan', hasMatingMaterial(start, 'w'), true)
  check('the ban dau: den du quan', hasMatingMaterial(start, 'b'), true)

  // Vua trơn — không thể chiếu hết bằng cách nào.
  check('chi co vua', hasMatingMaterial('7k/8/8/8/8/8/8/K7 w - - 0 1', 'w'), false)

  // Vua + một tượng: không đủ.
  check('vua + 1 tuong', hasMatingMaterial('7k/8/8/8/8/8/8/KB6 w - - 0 1', 'w'), false)

  // Vua + một mã: không đủ.
  check('vua + 1 ma', hasMatingMaterial('7k/8/8/8/8/8/8/KN6 w - - 0 1', 'w'), false)

  // Hai mã: hiếm nhưng chiếu hết được nếu đối thủ đi dở, nên tính là ĐỦ.
  check('vua + 2 ma', hasMatingMaterial('7k/8/8/8/8/8/8/KNN5 w - - 0 1', 'w'), true)

  // Một tốt là đủ, vì nó phong được thành Hậu.
  check('vua + 1 tot', hasMatingMaterial('7k/8/8/8/8/8/P7/K7 w - - 0 1', 'w'), true)

  check('vua + 1 xe', hasMatingMaterial('7k/8/8/8/8/8/8/KR6 w - - 0 1', 'w'), true)
  check('vua + 1 hau', hasMatingMaterial('7k/8/8/8/8/8/8/KQ6 w - - 0 1', 'w'), true)

  // Đọc đúng bên: quân đen trong cùng một thế.
  check('doc dung ben den', hasMatingMaterial('7k/8/8/8/8/8/8/KQ6 w - - 0 1', 'b'), false)
}

// ── Kết quả khi hết giờ ──────────────────────────────────────────────────────
{
  const start = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

  check('the day du: het gio la THUA', timeoutResult(start, 'w'), { loser: 'w', draw: false })

  /**
   * Luật FIDE 6.9. Trắng hết giờ, nhưng Đen chỉ còn mỗi vua nên không thể chiếu hết —
   * HOÀ chứ không phải Đen thắng.
   *
   * Đây là lý do hàm này nằm ở `clock.ts` chứ không nằm trong component: một điều luật
   * thì phải kiểm được bằng test, không phải bằng cách dựng thế cờ trên giao diện rồi
   * ngồi đợi 15 phút.
   */
  check(
    'doi thu chi con vua: HOA',
    timeoutResult('7k/8/8/8/8/8/P7/K7 w - - 0 1', 'w'),
    { loser: 'w', draw: true },
  )

  check(
    'doi thu co vua + 1 ma: HOA',
    timeoutResult('7k/8/8/8/8/8/8/KN6 b - - 0 1', 'b'),
    { loser: 'b', draw: true },
  )

  check(
    'doi thu co vua + 1 xe: THUA that',
    timeoutResult('7k/8/8/8/8/8/8/KR6 b - - 0 1', 'b'),
    { loser: 'b', draw: false },
  )
}

console.log(`\n${passed}/${passed + failures.length} ca dat`)

if (failures.length > 0) {
  console.log(`\n${failures.length} ca HONG:\n`)
  console.log(failures.join('\n\n'))
  process.exit(1)
}

console.log('Tat ca deu dat.\n')
