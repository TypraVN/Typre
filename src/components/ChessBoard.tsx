import { useEffect, useRef, useState } from 'react'
import type { BoardPiece } from '../lib/chess/chessService'
import { PIECE_SPRITES, SPRITE_VIEW_BOX } from '../lib/chess/pieceSprites'
import type { Color, Square } from '../lib/chess/types'

interface ChessBoardProps {
  pieces: BoardPiece[]
  /** Nước vừa đi, để tô sáng hai ô — người chơi cần thấy bot vừa làm gì. */
  lastMove: { from: Square; to: Square } | null
  /**
   * Nước LÙI, chỉ để trượt quân — KHÔNG tô ô cam.
   *
   * Tách riêng khỏi `lastMove` vì hai việc đó xung đột nhau ở đây: muốn quân trượt về vị
   * trí cũ (nên cần một cặp ô đưa vào animation) nhưng ô cam đánh dấu "nước vừa đi" phải
   * biến mất — nước vừa lùi có còn được coi là "vừa đi" nữa đâu. Gộp chung một prop thì
   * ô cam sẽ hiện sai: một vòng cam trên ô vừa lùi TỚI (đúng quân) và một vòng trên ô
   * TRƯỚC ĐÓ quân đứng — mà ô đó giờ đã trống, vòng cam nổi giữa ô trống nhìn rất kỳ.
   */
  undoMove: { from: Square; to: Square } | null
  /**
   * Xe đi kèm khi nhập thành — để nó cũng TRƯỢT thay vì bật tức thì.
   *
   * `lastMove` lúc nhập thành chỉ mang ô của VUA (đúng cú pháp `board.move('e1','g1')`
   * người chơi gõ). Không có prop riêng này thì Xe — quân THỨ HAI cùng di chuyển trong
   * MỘT nước cờ duy nhất — hoàn toàn đứng ngoài hệ thống animation, chỉ đổi vị trí tức
   * thời theo state mới trong khi Vua đang trượt mượt bên cạnh.
   */
  castleRook: { from: Square; to: Square } | null
  /**
   * Ô vừa PHONG HẬU (hay phong quân khác) — để chạy hiệu ứng biến hoá Tốt → quân mới.
   *
   * Chỉ cần MỘT ô, không cần biết phong thành quân gì: quân MỚI React đã tự vẽ sẵn tại
   * đúng ô này (state đã đổi loại quân) — hiệu ứng chỉ cần biết "biến hoá xảy ra ở đâu",
   * còn "đổi thành gì" đọc thẳng từ quân đang đứng đó (xem `promotionPulse`).
   */
  promotedSquare: Square | null
  /**
   * Ô Vua vừa bị CHIẾU HẾT — để chạy hiệu ứng giơ cờ trắng đầu hàng. `null` ở mọi nước đi
   * khác, kể cả chiếu thường (chưa hết ván thì chưa đầu hàng).
   */
  checkmatedSquare: Square | null
  /** Ô của vua đang bị chiếu, tô đỏ. */
  checkSquare: Square | null
  /**
   * Quân vừa bị ăn — để chạy hiệu ứng TAN THÀNH PIXEL đúng lúc quân ăn nó chạm bàn.
   *
   * Không suy từ `captured` (khu quân chết): mảng đó chỉ có type+color, không có Ô quân
   * đã đứng trước khi mất — hiệu ứng cần đúng ô đó để biết vẽ hiệu ứng ở đâu trên bàn.
   */
  capturedPiece: { square: Square; type: string; color: Color } | null
  /**
   * Các ô quân vừa gõ sai ĐI ĐƯỢC.
   *
   * Hiện sau khi người chơi nhập một nước không hợp lệ: câu lỗi đã liệt kê bằng chữ,
   * nhưng chấm trên bàn thì thấy ngay không phải dò.
   */
  hintSquares: Square[]
  /** Quân đã bị ăn, theo màu quân bị ăn, giữ đúng thứ tự bị ăn. */
  captured: { w: string[]; b: string[] }
  /** Xoay bàn để bên đen ở dưới. */
  flipped: boolean
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'] as const

/**
 * Đường cong và thời lượng ĐO TRỰC TIẾP từ lichess.org, không suy đoán.
 *
 * Gắn `MutationObserver` vào bàn cờ của lichess, tự đi ba nước xa gần khác nhau (Tốt hai
 * ô — 62px, Mã nhảy — 69px, Hậu chéo bốn ô — 175px, chênh nhau gần ba lần), rồi đọc lại
 * từng khung hình `transform` mà chessground (thư viện bàn cờ lichess dùng) tự vẽ bằng
 * `requestAnimationFrame`. Cả ba nước đều mất 297–305ms — KHÔNG lệ thuộc quãng đường.
 *
 * Bản trước ở đây làm ngược lại: thời lượng tăng theo khoảng cách (140–260ms). Nghe hợp
 * lý nhưng sai theo đúng chuẩn ngành — trang cờ lớn nhất không làm vậy. Quân đi xa hay
 * gần đều mất CÙNG một khoảng thời gian; cảm giác nhất quán mới là thứ "mượt", không phải
 * mô phỏng vật lý (vật đi xa phải mất lâu hơn).
 *
 * Đường cong cũng đo được, không đoán: lấy 11 mẫu đều theo thời gian trên nước Hậu chéo,
 * so khớp với các công thức easing kinh điển thì trùng KHÍT với "ease-in-out-cubic"
 * (t<0.5: 4t³, còn lại: 1-(-2t+2)³/2) ở cả 11 điểm, sai số dưới 0.003 — tức CHẬM lúc bắt
 * đầu, NHANH giữa chừng, CHẬM lại lúc dừng. Bản trước chỉ có nửa sau (ease-out thuần,
 * nhanh ngay từ đầu) nên quân bị GIẬT một cái lúc xuất phát rồi mới trôi êm — chưa mượt
 * bằng đường đối xứng đầy đủ.
 */
const EASE_GLIDE = 'cubic-bezier(0.65, 0, 0.35, 1)'

/**
 * Thời lượng trượt của quân.
 *
 * 300ms là số ĐO ĐƯỢC trên lichess — chuẩn ngành, nhưng "chuẩn" không phải lúc nào cũng
 * là thứ NGƯỜI CHƠI THẤY vừa mắt. Đã tăng một lần lên 480ms, vẫn bị chê nhanh — tăng tiếp
 * rõ rệt hơn nữa, theo đúng phản hồi thật chứ không cố thủ theo số đo.
 *
 * DÙNG CHUNG cho mọi nguồn nước đi — mình gõ, bot đi, đối thủ trên mạng đi — vì tất cả
 * đều đi qua đúng MỘT effect này, kích hoạt bởi cùng một `lastMove`. Không có chỗ nào
 * khác gọi animation riêng, nên không thể có chuyện bên nhanh bên chậm từ trong code.
 */
export const GLIDE_MS = 650

/**
 * Cho quân vừa đi TRƯỢT từ ô cũ sang ô mới.
 *
 * Không có nó thì quân biến mất chỗ này, hiện ra chỗ kia. Với nước mình tự gõ thì còn
 * đoán được, nhưng nước của bot hay của đối thủ trên mạng thì mắt không bắt kịp là quân
 * nào vừa đi — phải dò lại danh sách nước đi mới biết. Ô tô sáng có giúp, nhưng nó chỉ
 * cho biết KẾT QUẢ, không cho thấy chuyển động.
 *
 * Cách làm: quân đã được vẽ sẵn ở ô đích rồi, ta chỉ chạy ngược một hiệu ứng dời chỗ —
 * bắt đầu ở vị trí ô cũ rồi chạy về 0. Nhờ vậy không phải theo dõi danh tính từng quân
 * qua các nước đi, thứ vốn rắc rối vì nhập thành dời hai quân và phong cấp thì đổi hẳn
 * quân.
 *
 * Khoảng cách đo từ vị trí THẬT của hai ô trên màn hình, nên đúng ở mọi cỡ bàn và không
 * cần biết một ô rộng bao nhiêu.
 */
/**
 * Xe trong nhập thành trượt TRỄ hơn Vua đúng bấy nhiêu — một nhịp "một-hai" thay vì cả
 * hai quân lướt cùng lúc như một khối cứng. Khớp với độ trễ tiếng gõ thứ hai trong
 * `playCastle()` (lib/sound.ts) để hình và tiếng cùng một nhịp điệu.
 */
const CASTLE_ROOK_DELAY_MS = 90

/** Thời lượng màng khiên: dâng lên từ từ, giữ một nhịp, rồi tan. */
const SHIELD_MS = 1500

/** Bán kính khối cầu lửa, đơn vị theo lưới toạ độ 0-100 của `svg` bên trong. */
const FIREBALL_R = 44

/**
 * Đường viền BLOB mềm quanh (cx, cy) — vòng tròn bị méo NGẪU NHIÊN nhẹ ở từng điểm rồi
 * nối lại bằng đường cong (không phải đa giác góc cạnh) — cho dáng "khối lỏng hơi méo",
 * đúng ảnh tham chiếu (một quả cầu lửa/plasma, không phải hình tròn hoàn hảo).
 */
function blobPath(cx: number, cy: number, radius: number, points: number, wobble: number): string {
  const pts: [number, number][] = []
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * Math.PI * 2
    const r = radius * (1 + (Math.random() - 0.5) * 2 * wobble)
    pts.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)])
  }
  const mid = (a: [number, number], b: [number, number]): [number, number] => [
    (a[0] + b[0]) / 2,
    (a[1] + b[1]) / 2,
  ]
  const start = mid(pts[0], pts[pts.length - 1])
  let d = `M ${start[0].toFixed(2)} ${start[1].toFixed(2)}`
  for (let i = 0; i < points; i++) {
    const cur = pts[i]
    const next = pts[(i + 1) % points]
    const m = mid(cur, next)
    d += ` Q ${cur[0].toFixed(2)} ${cur[1].toFixed(2)} ${m[0].toFixed(2)} ${m[1].toFixed(2)}`
  }
  return `${d} Z`
}

/**
 * KHỐI CẦU LỬA bao quanh Vua khi vừa nhập thành — bro gửi ảnh tham chiếu một quả cầu
 * plasma/lửa, không phải mái vòm kính hay mảnh vỡ pha lê (hai bản trước đều bị chê, xem
 * lịch sử ở trên). Chốt qua một trang demo tương tác (chỉnh bằng thanh trượt) trước khi
 * đưa vào đây — mọi con số dưới là đúng bộ bro đã tự chỉnh và chốt trên demo đó, không
 * phải đoán (đã qua vài lần chốt lại): méo viền = 0 (gần tròn hoàn hảo, không lởm chởm),
 * ruột RẤT mờ (opacity gốc 0.1 — gần như trong suốt), KHÔNG glow (bỏ hẳn drop-shadow),
 * 60 tia lửa.
 *
 * Hai phần, cùng dùng MỘT đường viền `outerD` (blob méo — méo=0 thì thực chất là một
 * hình tròn xấp xỉ bằng đường cong bezier, không phải `<circle>` dựng riêng):
 *  1. `body` — tô bằng gradient toả tâm, ruột mờ gần như trong suốt rồi rực lên đúng
 *     đường biên (đa số "thấy" được của khối là viền sáng, không phải phần tô đặc).
 *  2. viền lửa mảnh bám sát đường biên đó.
 * Cộng thêm các tia lửa nhỏ bay trôi lên và mờ dần quanh khối.
 */
function shieldPulse(cell: HTMLElement, startMs: number): void {
  const svgNS = 'http://www.w3.org/2000/svg'

  const wrap = document.createElement('div')
  wrap.setAttribute('aria-hidden', 'true')
  wrap.style.position = 'absolute'
  // RỘNG HƠN quân Vua rõ ràng — chốt qua nhiều vòng chỉnh trên demo, xem lịch sử ở trên.
  wrap.style.inset = '-12%'
  wrap.style.pointerEvents = 'none'

  const svg = document.createElementNS(svgNS, 'svg')
  svg.setAttribute('viewBox', '0 0 100 100')
  svg.style.position = 'absolute'
  svg.style.inset = '0'
  svg.style.width = '100%'
  svg.style.height = '100%'
  // Glow = 0 trong bộ đã chốt — bỏ hẳn drop-shadow, viền lửa (`rim`, xem dưới) tự đủ nổi
  // bật, không cần thêm quầng mờ bên ngoài nữa.

  const defs = document.createElementNS(svgNS, 'defs')
  /*
    `gradientUnits="userSpaceOnUse"` là chỗ mấu chốt — THIẾU dòng này là lỗi thật đã gặp ở
    bản mảnh vỡ trước: SVG mặc định "objectBoundingBox", cx/cy/r tính theo khung bao của
    RIÊNG hình đang tô, không phải theo toạ độ chung của cả `svg`. Với một khối cầu chỉ có
    MỘT hình (`body`) thì hai cách nghe như tương đương, nhưng khai rõ vẫn giữ đúng ý
    nghĩa "tâm gradient là tâm khối cầu" — chốt luôn quy ước này cho nhất quán với các
    hiệu ứng SVG-gradient khác trong file, tránh lặp lại đúng lỗi đã tốn công tìm ra.
  */
  const gradId = 'shield-grad-' + Math.random().toString(36).slice(2)
  const grad = document.createElementNS(svgNS, 'radialGradient')
  grad.setAttribute('id', gradId)
  grad.setAttribute('gradientUnits', 'userSpaceOnUse')
  grad.setAttribute('cx', '50')
  grad.setAttribute('cy', '50')
  grad.setAttribute('r', String(FIREBALL_R * 1.05))
  const stops: [number, string, number][] = [
    [0, '234,88,12', 0.055],
    [55, '234,88,12', 0.07],
    [82, '253,224,71', 0.115],
    [96, '253,224,71', 1],
    [100, '253,224,71', 0],
  ]
  for (const [offset, color, opacity] of stops) {
    const stop = document.createElementNS(svgNS, 'stop')
    stop.setAttribute('offset', `${offset}%`)
    stop.setAttribute('stop-color', `rgb(${color})`)
    stop.setAttribute('stop-opacity', String(opacity))
    grad.appendChild(stop)
  }
  defs.appendChild(grad)
  svg.appendChild(defs)

  const outerD = blobPath(50, 50, FIREBALL_R, 11, 0)

  const body = document.createElementNS(svgNS, 'path')
  body.setAttribute('d', outerD)
  body.setAttribute('fill', `url(#${gradId})`)
  svg.appendChild(body)

  const rim = document.createElementNS(svgNS, 'path')
  rim.setAttribute('d', outerD)
  rim.setAttribute('fill', 'none')
  rim.setAttribute('stroke', 'rgba(253,224,71,0.9)')
  rim.setAttribute('stroke-width', '0.6')
  svg.appendChild(rim)

  /*
    TIA LỬA nhỏ trôi lên rồi mờ dần quanh khối — chi tiết tàn lửa bay ra trong ảnh mẫu.
    Mỗi tia `delay` ÂM một khoảng ngẫu nhiên: animate() vẫn chạy full duration như thường,
    nhưng delay âm coi như đã trôi qua đúng bấy nhiêu mili giây rồi mới bắt đầu render —
    khiến các tia không đồng loạt xuất hiện cùng một pha, đỡ cảm giác "cả chùm nhấp nháy
    cùng lúc" của một hiệu ứng lặp.
  */
  const SPARK_COUNT = 60
  for (let i = 0; i < SPARK_COUNT; i++) {
    const angle = Math.random() * Math.PI * 2
    const dist = FIREBALL_R * (0.85 + Math.random() * 0.55)
    const sx = 50 + dist * Math.cos(angle)
    const sy = 50 + dist * Math.sin(angle)

    const spark = document.createElementNS(svgNS, 'circle')
    spark.setAttribute('cx', String(sx))
    spark.setAttribute('cy', String(sy))
    spark.setAttribute('r', String(0.4 + Math.random() * 0.7))
    spark.setAttribute('fill', 'rgba(253,224,71,0.95)')

    const drift = 2 + Math.random() * 4
    const dur = 900 + Math.random() * 1600
    spark.animate(
      [
        { transform: 'translateY(0px)', opacity: 0.2 },
        { transform: `translateY(-${drift}px)`, opacity: 1, offset: 0.5 },
        { transform: `translateY(-${drift * 2}px)`, opacity: 0 },
      ],
      { duration: dur, iterations: Infinity, easing: 'ease-out', delay: -Math.random() * dur },
    )
    svg.appendChild(spark)
  }

  wrap.appendChild(svg)
  cell.appendChild(wrap)

  /*
    DÂNG LÊN TỪ DƯỚI thay vì phồng đều từ tâm ra mọi hướng (bản trước) — theo đúng yêu
    cầu. `clip-path: inset(top% 0 0 0)` cắt bỏ phần TRÊN của khối theo đúng `top%` đó;
    bắt đầu ở 100% (cắt hết, không còn gì hiện) rồi giảm dần về 0% (hiện trọn) thì phần
    LỘ RA luôn bắt đầu từ MÉP DƯỚI rồi lớn dần lên trên — đúng cơ chế "mọc lên từ dưới"
    thay vì "phồng ra từ tâm". Cộng thêm `translateY` từ lệch xuống về đúng vị trí và
    `scale` từ nhỏ lên, cho cảm giác khối đang TRỒI LÊN chứ không chỉ đang HIỆN RA.

    TỪ TỪ hơn bản trước: đoạn "dâng lên" kéo dài tới 40% thời lượng (`SHIELD_MS` cũng đã
    tăng 1100→1500ms) — gấp đôi thời gian đoạn phồng lên cũ (22% của 1100ms), đủ chậm để
    mắt kịp thấy rõ CHUYỂN ĐỘNG dâng lên, không phải một cái chớp nhoáng.
  */
  const animation = wrap.animate(
    [
      { opacity: 0, transform: 'translateY(22%) scale(0.7)', clipPath: 'inset(100% 0% 0% 0%)' },
      { opacity: 1, transform: 'translateY(0%) scale(1.04)', clipPath: 'inset(0% 0% 0% 0%)', offset: 0.4 },
      { opacity: 1, transform: 'translateY(0%) scale(1)', clipPath: 'inset(0% 0% 0% 0%)', offset: 0.5 },
      { opacity: 1, transform: 'translateY(0%) scale(1)', clipPath: 'inset(0% 0% 0% 0%)', offset: 0.78 },
      { opacity: 0, transform: 'translateY(0%) scale(1.08)', clipPath: 'inset(0% 0% 0% 0%)' },
    ],
    /*
      `fill: 'backwards'` — THIẾU dòng này là lỗi thật vừa bị bắt, không phải chuyện nhỏ.
      `wrap` không có `opacity` inline nào cả, nên TRẠNG THÁI TỰ NHIÊN của nó là hiện rõ
      100%. Có `delay` mà không khai `fill`, trình duyệt chỉ áp dụng animation từ lúc nó
      THỰC SỰ bắt đầu (sau khi delay trôi qua) — suốt khoảng `delay` (Vua còn đang trượt,
      nhập thành CHƯA XONG), khiên vẫn hiện ra ở trạng thái tự nhiên đó, tức là RÕ NGAY
      TỪ ĐẦU, rồi mới "biến mất" đột ngột đúng lúc animation thật sự bắt đầu (khung hình
      đầu là `opacity: 0`). `fill: 'backwards'` áp dụng SẴN khung hình đầu tiên trong suốt
      lúc chờ delay, giữ khiên vô hình đúng cho tới khi nhập thành xong.
    */
    { duration: SHIELD_MS, delay: startMs, easing: 'ease-out', fill: 'backwards' },
  )

  /*
    Nâng Z-INDEX của Ô ngay lúc khiên bắt đầu HIỆN — không phải lúc gọi hàm này.

    64 ô cờ là ANH EM cùng cấp trong một lưới CSS Grid; ô nào đứng SAU trong DOM thì vẽ
    ĐÈ LÊN ô trước (không khai z-index thì thắng thua tính theo thứ tự cây, không phải
    "cùng z-index thì không đè nhau"). Khiên tràn ra ngoài ô Vua tới 32% mỗi phía — quá
    nửa quãng tràn đó rơi vào Ô BÊN CẠNH đứng SAU trong DOM (ô bên phải, ô cùng cột ở
    hàng dưới), và Ô ĐÓ có nền riêng — nó VẼ ĐÈ lên đúng phần khiên lẽ ra phải nổi lên
    trên, nuốt mất phần lớn quầng sáng. Kết quả: bao nhiêu công sức phóng to khiên coi
    như vô nghĩa, người chơi chỉ thấy một vệt mờ nhỏ xíu chứ không phải "bao bọc".

    KHÔNG nâng z-index NGAY LÚC GỌI HÀM (t=0): `slide()` của chính quân Vua cũng tạm nâng
    z-index của ô này lúc trượt (xem trên) rồi tự hạ về `''` khi trượt xong, ở mốc
    `GLIDE_MS` — TRƯỚC lúc khiên kịp hiện (`startMs` luôn muộn hơn `GLIDE_MS`, xem chỗ
    gọi). Nâng z-index ngay ở đây thì bị chính cú hạ đó xoá mất trước khi khiên cần dùng
    tới. Phải đợi ĐÚNG lúc khiên bắt đầu hiện (`startMs`) rồi mới nâng, để không đụng vào
    mốc dọn dẹp của hiệu ứng trượt.
  */
  const raiseId = setTimeout(() => {
    cell.style.zIndex = '20'
  }, startMs)

  const remove = (): void => {
    clearTimeout(raiseId)
    cell.style.zIndex = ''
    wrap.remove()
  }
  animation.finished.then(remove, remove)
}

/**
 * PHONG HẬU (hay phong quân khác): quân biến hoá TỪ TỪ từ Tốt sang quân mới, không phải
 * đổi phắt. Mọi con số dưới đây (đếm tia lửa, bán kính, độ loé, tổng thời lượng, tông vàng
 * kim) đã chốt qua một trang demo tương tác riêng — không phải đoán.
 *
 * Cách dựng ĐÃ ĐỔI một lần giữa chừng: bản đầu rã quân thành TỪNG Ô PIXEL rồi cho biến
 * mất/hiện theo hàng — bị chê ra "vệt sọc" khắp hình, vì mỗi `<rect>` 1x1 tự khử răng cưa
 * theo rìa CỦA RIÊNG NÓ khi phóng to, không "biết" ô liền kề. Bản này quay về nguyên tắc
 * pieceSprites.ts (mỗi màu MỘT path gộp, liền mạch) và dùng `clip-path` cắt trên NGUYÊN
 * hình để "biến hoá từ dưới lên" — không có rìa nào giữa hai đoạn cùng path để lộ ra.
 *
 * Quân MỚI chính là quân React đã vẽ sẵn tại ô này (state đã đổi loại quân) — chỉ cần
 * cho lộ dần từ dưới lên bằng clip-path. Quân Tốt thì không còn tồn tại trong state nữa
 * (đã thành Hậu), nên phải dựng TẠM một bản sao đè lên đúng chỗ, cho biến mất cùng hướng
 * rồi tự dọn — không đụng gì tới cây DOM thật của React.
 */
function promotionPulse(cell: HTMLElement, startMs: number, color: Color): void {
  const svgNS = 'http://www.w3.org/2000/svg'
  const realPiece = cell.querySelector('svg')
  if (!realPiece) return

  const smooth = 'cubic-bezier(0.45, 0, 0.2, 1)'
  const totalMs = 1550
  const crossMs = totalMs * 0.85

  /*
    Tốt biến mất XONG HẲN rồi Hậu mới bắt đầu hiện — KHÔNG chồng lấn giữa chừng nữa.

    Bản trước cho cả hai chạy CÙNG LÚC (mirror cùng offset 0.45), tưởng là "quét liền
    mạch" nhưng sai: có một khoảng cả hai cùng lộ ra MỘT PHẦN — mà Tốt (thân hẹp, đầu
    tròn nhỏ) và Hậu (vương miện toè rộng nhiều nhánh) là hai silhouette khác hẳn nhau,
    nên đúng lúc chồng lấn đó phần đầu hai quân đè lên nhau nhìn như một hình méo mó,
    không phải một quân đang biến hình mượt. Tách hẳn hai pha nối tiếp thì không bao giờ
    có khung hình nào hiện ĐỒNG THỜI hai silhouette khác nhau nữa.
  */
  const pawnMs = crossMs * 0.38
  const queenMs = crossMs - pawnMs

  // Quân MỚI (đã có sẵn trong DOM, do React vẽ) hiện dần từ dưới lên, SAU KHI Tốt đã tan hết.
  const revealAnim = realPiece.animate(
    [
      { clipPath: 'inset(100% 0 0 0)' },
      { clipPath: 'inset(0% 0 0 0)' },
    ],
    { duration: queenMs, delay: startMs + pawnMs, easing: smooth, fill: 'backwards' },
  )
  // Reset về style gốc SAU khi hiện xong — không giữ `fill:'forwards'` vĩnh viễn, để lần
  // phong cấp/di chuyển KHÁC sau này không bị chồng một clip-path cũ vô hình lên quân.
  revealAnim.finished.then(
    () => {
      realPiece.style.clipPath = ''
    },
    () => {},
  )

  // Bản sao TẠM của Tốt, đè đúng chỗ quân mới — biến mất CÙNG HƯỚNG (dưới lên) rồi tự dọn.
  const pawnGroups = PIECE_SPRITES[`${color}P`] ?? []
  const overlay = document.createElement('div')
  overlay.setAttribute('aria-hidden', 'true')
  overlay.className = 'absolute inset-0 flex items-center justify-center pointer-events-none'
  const pawnSvg = document.createElementNS(svgNS, 'svg')
  pawnSvg.setAttribute('viewBox', SPRITE_VIEW_BOX)
  pawnSvg.setAttribute('shape-rendering', 'crispEdges')
  pawnSvg.setAttribute('class', 'w-[86%] h-[86%]')
  for (const g of pawnGroups) {
    const p = document.createElementNS(svgNS, 'path')
    p.setAttribute('d', g.d)
    p.setAttribute('stroke', g.stroke)
    p.setAttribute('fill', 'none')
    pawnSvg.appendChild(p)
  }
  overlay.appendChild(pawnSvg)
  cell.appendChild(overlay)
  pawnSvg.animate(
    [
      { clipPath: 'inset(0 0 0% 0)' },
      { clipPath: 'inset(0 0 100% 0)' },
    ],
    { duration: pawnMs, delay: startMs, easing: smooth, fill: 'both' },
  )

  /*
    Quầng sáng: MỘT khối gradient tròn riêng, không phải `drop-shadow` phủ lên SVG — thử
    qua rồi, ra viền lởm chởm ôm sát từng bậc thang của pixel-art (`shape-rendering:
    crispEdges`), y hệt lỗi "vệt sọc" đã gặp và sửa ở demo. Gradient tròn thuần thì không
    có rìa nào bắt nguồn từ hình quân để lộ ra.
  */
  const glowEl = document.createElement('div')
  glowEl.setAttribute('aria-hidden', 'true')
  glowEl.style.position = 'absolute'
  glowEl.style.inset = '-25%'
  glowEl.style.borderRadius = '50%'
  glowEl.style.pointerEvents = 'none'
  glowEl.style.background = 'radial-gradient(closest-side, rgba(250,204,21,.55), rgba(250,204,21,0) 70%)'
  cell.appendChild(glowEl)
  glowEl.animate(
    [
      { opacity: 0, transform: 'scale(0.6)' },
      { opacity: 1, transform: 'scale(1)', offset: 0.85 },
      { opacity: 0.6, transform: 'scale(1)' },
    ],
    { duration: crossMs, delay: startMs, easing: smooth, fill: 'both' },
  )

  // Tia lửa bắn quanh, rộ lên đúng lúc quân mới gần hiện xong (không phải ngay từ đầu).
  const sparkWrap = document.createElement('div')
  sparkWrap.setAttribute('aria-hidden', 'true')
  sparkWrap.style.position = 'absolute'
  sparkWrap.style.inset = '-60%'
  sparkWrap.style.pointerEvents = 'none'
  const sparkSvg = document.createElementNS(svgNS, 'svg')
  sparkSvg.setAttribute('viewBox', '0 0 200 200')
  sparkSvg.style.width = '100%'
  sparkSvg.style.height = '100%'
  const SPARK_COUNT = 18
  const SPARK_RADIUS = 102
  const sparkDelay = startMs + crossMs * 0.55
  let sparkLifespan = 0
  for (let i = 0; i < SPARK_COUNT; i++) {
    const angle = (Math.PI * 2 * i) / SPARK_COUNT + (Math.random() * 0.4 - 0.2)
    const dist = SPARK_RADIUS * (0.6 + Math.random() * 0.5)
    const dx = Math.cos(angle) * dist
    const dy = Math.sin(angle) * dist
    const r = 1.4 + Math.random() * 1.6
    const spark = document.createElementNS(svgNS, 'circle')
    spark.setAttribute('cx', '100')
    spark.setAttribute('cy', '100')
    spark.setAttribute('r', String(r))
    spark.setAttribute('fill', 'rgba(253,224,71,1)')
    sparkSvg.appendChild(spark)

    const ownDelay = Math.random() * totalMs * 0.25
    const duration = totalMs * 0.75
    sparkLifespan = Math.max(sparkLifespan, ownDelay + duration)
    spark.animate(
      [
        { transform: 'translate(0,0) scale(0.4)', opacity: 0 },
        { transform: 'translate(0,0) scale(1)', opacity: 1, offset: 0.15 },
        { transform: `translate(${dx}px, ${dy}px) scale(0.3)`, opacity: 0 },
      ],
      { duration, delay: sparkDelay + ownDelay, easing: 'cubic-bezier(0.16,1,0.3,1)', fill: 'both' },
    )
  }
  sparkWrap.appendChild(sparkSvg)
  cell.appendChild(sparkWrap)

  // Nâng z-index đúng lúc hiệu ứng bắt đầu — cùng lý do CSS Grid đã ghi ở `shieldPulse`:
  // ô liền kề đứng sau trong DOM sẽ vẽ đè lên phần quầng sáng/tia lửa tràn ra ngoài ô này.
  const raiseId = setTimeout(() => {
    cell.style.zIndex = '20'
  }, startMs)

  const cleanupAt = sparkDelay + sparkLifespan + 50
  setTimeout(() => {
    clearTimeout(raiseId)
    cell.style.zIndex = ''
    overlay.remove()
    glowEl.remove()
    sparkWrap.remove()
  }, cleanupAt)
}

/**
 * CHIẾU HẾT: Vua cúi gục nhẹ rồi giơ hai tay cầm cờ trắng đầu hàng, cờ phất qua lại liên
 * tục (không tự tắt — ván đã kết thúc, không có "nước tiếp theo" nào dọn nó đi, nên cứ để
 * yên cho tới khi ô này bị component khác dọn, ví dụ ván mới bắt đầu). Mọi con số (độ
 * cao/xoè tay, kích thước cờ, tốc độ phất, độ cúi) đã chốt qua demo tương tác riêng —
 * không phải đoán. CỐ Ý không tô thêm màu nền nào cho ô này — ô Vua bị chiếu đã tự đỏ sẵn
 * (`isCheck`/`landedCheck`), hiệu ứng chỉ cần chồng thêm hình, không cần một lớp nền khác.
 *
 * Cánh tay/cán cờ vẽ bằng khối vuông GỘP THÀNH MỘT path (không chia `<rect>` riêng từng
 * ô) — đúng bài học từ hiệu ứng phong hậu: nhiều rect rời rạc tự khử răng cưa theo rìa
 * CỦA RIÊNG NÓ, ra vệt sọc khi phóng to. Lá cờ dùng `<rect>` đơn (chỉ một hình, không có
 * gì để "hở" giữa các mảnh) nên an toàn.
 */
function surrenderPulse(cell: HTMLElement, startMs: number): void {
  const svgNS = 'http://www.w3.org/2000/svg'
  const king = cell.querySelector('svg')
  if (!king) return

  const SLUMP_DEG = 8
  const RISE_MS = 500
  const WAVE_DEG = 13
  const WAVE_MS = 550
  const FLAG_SCALE = 1.3
  const ARM_HEIGHT = 33
  const ARM_SPREAD = 30

  king.style.transformOrigin = '50% 90%'
  king.animate(
    [{ transform: 'rotate(0deg)' }, { transform: `rotate(${SLUMP_DEG}deg)` }],
    { duration: RISE_MS, delay: startMs, easing: 'ease-out', fill: 'forwards' },
  )

  const rig = document.createElementNS(svgNS, 'svg')
  rig.setAttribute('viewBox', '0 0 100 100')
  rig.setAttribute('shape-rendering', 'crispEdges')
  rig.style.position = 'absolute'
  rig.style.inset = '0'
  rig.style.width = '100%'
  rig.style.height = '100%'
  rig.style.pointerEvents = 'none'
  cell.appendChild(rig)

  for (const side of [-1, 1]) {
    const g = document.createElementNS(svgNS, 'g')
    const shoulderX = 50 + side * 8
    const shoulderY = 62
    const handX = shoulderX + side * (ARM_SPREAD * 0.35)
    const handY = shoulderY - ARM_HEIGHT

    // Bậc thang khối vuông từ vai lên tay — cỡ khối ~5 đơn vị, gần khớp cỡ nhìn-thấy-được
    // của một pixel quân Vua (quân cao 16 đơn vị trên khung ~106px, tức mỗi đơn vị pixel
    // ~6.6px) để mắt đọc ra "cùng một bộ pixel" chứ không phải hai chất liệu khác nhau.
    const unit = 5
    const steps = 3
    let armD = ''
    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1)
      const cx = shoulderX + (handX - shoulderX) * t - unit / 2
      const cy = shoulderY + (handY - shoulderY) * t - unit / 2
      armD += `M ${cx.toFixed(1)} ${cy.toFixed(1)} h ${unit} v ${unit} h ${-unit} Z `
    }
    const arm = document.createElementNS(svgNS, 'path')
    arm.setAttribute('d', armD.trim())
    arm.setAttribute('fill', '#2b2b2b')
    g.appendChild(arm)

    const poleUnit = unit * 0.55
    const poleTopX = handX + side * unit * 0.3
    const poleTopY = handY - 14 * FLAG_SCALE
    const poleSteps = Math.max(2, Math.round((handY - poleTopY) / poleUnit))
    let poleD = ''
    for (let i = 0; i < poleSteps; i++) {
      const t = i / (poleSteps - 1)
      const py = handY + (poleTopY - handY) * t
      poleD += `M ${(poleTopX - poleUnit / 2).toFixed(1)} ${(py - poleUnit / 2).toFixed(1)} h ${poleUnit} v ${poleUnit} h ${-poleUnit} Z `
    }
    const pole = document.createElementNS(svgNS, 'path')
    pole.setAttribute('d', poleD.trim())
    pole.setAttribute('fill', '#6b4a2b')
    g.appendChild(pole)

    // Lá cờ hình chữ nhật, gốc xoay đặt Ở CÁN (poleTopX, poleTopY) — phất là xoay quanh
    // mép cán, không xoay quanh tâm lá cờ như cờ thật tự cuộn tại chỗ.
    const flagGroup = document.createElementNS(svgNS, 'g')
    const fw = 13 * FLAG_SCALE
    const fh = 9 * FLAG_SCALE
    const flag = document.createElementNS(svgNS, 'rect')
    flag.setAttribute('x', String(side > 0 ? poleTopX : poleTopX - fw))
    flag.setAttribute('y', String(poleTopY - fh / 2))
    flag.setAttribute('width', String(fw))
    flag.setAttribute('height', String(fh))
    flag.setAttribute('fill', '#f5f5f5')
    flag.setAttribute('stroke', '#c8c8c8')
    flag.setAttribute('stroke-width', '0.6')
    flagGroup.appendChild(flag)
    flagGroup.style.transformOrigin = `${poleTopX}px ${poleTopY}px`
    g.appendChild(flagGroup)

    g.style.transformOrigin = '50px 62px'
    g.animate(
      [
        { transform: 'scale(0.3) translateY(10px)', opacity: 0 },
        { transform: 'scale(1) translateY(0px)', opacity: 1 },
      ],
      { duration: RISE_MS, delay: startMs, easing: 'cubic-bezier(0.34,1.56,0.64,1)', fill: 'backwards' },
    )

    flagGroup.animate(
      [
        { transform: `rotate(${-WAVE_DEG / 2}deg)` },
        { transform: `rotate(${WAVE_DEG / 2}deg)` },
        { transform: `rotate(${-WAVE_DEG / 2}deg)` },
      ],
      { duration: WAVE_MS, delay: startMs + RISE_MS, iterations: Infinity, easing: 'ease-in-out' },
    )

    rig.appendChild(g)
  }
}

function useSlideAnimation(
  lastMove: { from: Square; to: Square } | null,
  castleRook: { from: Square; to: Square } | null,
  promotedSquare: Square | null,
  promotedColor: Color | undefined,
  /** Ô Vua vừa bị CHIẾU HẾT (ván đã xong) — `null` ở mọi trường hợp khác. */
  checkmatedSquare: Square | null,
  flipped: boolean,
): React.RefObject<HTMLDivElement | null> {
  const boardRef = useRef<HTMLDivElement>(null)
  const from = lastMove?.from
  const to = lastMove?.to
  const rookFrom = castleRook?.from
  const rookTo = castleRook?.to

  useEffect(() => {
    const board = boardRef.current
    if (!board || !from || !to) return

    // Người đã tắt hiệu ứng chuyển động trong hệ điều hành thường tắt vì lý do sức khoẻ
    // (chóng mặt, buồn nôn), không phải vì sở thích. Bỏ qua hẳn chứ không rút ngắn.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    /**
     * Trượt MỘT quân từ `fromSq` sang `toSq`, xuất phát trễ `delay` so với lúc nước đi
     * được áp dụng. Trả về ô ĐÍCH (để gọi `shieldPulse` lên đúng ô Vua khi nhập thành,
     * hoặc `undefined` nếu không tìm thấy đủ ô/quân — cùng logic bỏ qua an toàn như bản
     * gốc).
     */
    const slide = (fromSq: Square, toSq: Square, delay: number): HTMLElement | undefined => {
      const fromCell = board.querySelector(`[data-square="${fromSq}"]`)
      const toCell = board.querySelector(`[data-square="${toSq}"]`)
      const piece = toCell?.querySelector('svg')
      if (!fromCell || !toCell || !piece) return undefined

      const a = fromCell.getBoundingClientRect()
      const b = toCell.getBoundingClientRect()

      /*
        Nâng ô đích lên trên trong lúc trượt.

        Các ô là anh em trong cùng một lưới, nên ô nào đứng sau trong DOM thì vẽ đè lên ô
        trước. Quân trượt sang trái sẽ chui XUỐNG DƯỚI những ô nó đi qua — nhìn như quân
        bị nuốt mất một nửa.
      */
      const cell = toCell as HTMLElement
      cell.style.zIndex = '10'

      const animation = piece.animate(
        [
          { transform: `translate(${a.left - b.left}px, ${a.top - b.top}px)` },
          { transform: 'none' },
        ],
        /*
          `fill: 'backwards'` — lỗi thật vừa bắt được ở quân Xe khi nhập thành, quân DUY
          NHẤT gọi `slide()` với `delay > 0` (90ms, xem `CASTLE_ROOK_DELAY_MS`).

          Không có `fill`, trong lúc CHỜ delay trôi qua thì animation chưa kích hoạt —
          trình duyệt vẽ quân theo trạng thái TỰ NHIÊN của nó, tức là `transform: none`
          (không có inline transform nào) — mà `none` LẠI TRÙNG với khung hình CUỐI của
          chính animation này (quân đã đứng đúng ô đích). Suốt 90ms đó quân hiện ra đã
          NẰM SẴN Ở Ô ĐÍCH — rồi đúng lúc animation kích hoạt, khung hình ĐẦU
          (`translate(...)`, tức lùi về vị trí ô xuất phát) áp vào NGAY LẬP TỨC, quân GIẬT
          lùi về ô cũ trong một khung hình, rồi mới trượt tới lại — đúng kiểu lỗi "đứng
          yên rồi nhảy một phát" đã tốn công sửa ở chỗ khác, sót lại đúng chỗ duy nhất có
          delay này. `fill: 'backwards'` áp khung hình ĐẦU tiên trong suốt lúc chờ delay,
          quân đứng ĐÚNG Ở Ô XUẤT PHÁT ngay từ đầu, không giật khi animation kích hoạt.
        */
        { duration: GLIDE_MS, delay, easing: EASE_GLIDE, fill: 'backwards' },
      )

      const clear = (): void => {
        cell.style.zIndex = ''
      }
      animation.finished.then(clear, clear)

      return cell
    }

    const kingCell = slide(from, to, 0)

    /*
      Nhập thành: Xe trượt THEO SAU Vua, không cùng lúc — xem `CASTLE_ROOK_DELAY_MS`.

      Quân vừa bị ăn KHÔNG còn tự bay sang khu quân chết ở đây nữa — từ khi có hiệu ứng
      tan pixel (`CaptureDissolve`, xem dưới), chính CÁC MẢNH PIXEL đảm nhận việc đó.
    */
    if (rookFrom && rookTo) {
      slide(rookFrom, rookTo, CASTLE_ROOK_DELAY_MS)

      // Khiên chỉ quanh VUA — Xe không phải thứ nhập thành bảo vệ — và chỉ hiện SAU KHI
      // xe (quân tới sau cùng) đã chạm bàn, không phải lúc vua tới trước.
      if (kingCell) shieldPulse(kingCell, CASTLE_ROOK_DELAY_MS + GLIDE_MS)
    }

    // Phong hậu (hay phong quân khác) LUÔN xảy ra đúng tại ô ĐÍCH của nước vừa đi — không
    // cần tra thêm ô nào khác, tái dùng thẳng `kingCell` (ô đích chung của `slide` trên).
    if (promotedSquare && promotedSquare === to && kingCell) {
      promotionPulse(kingCell, GLIDE_MS, promotedColor ?? 'w')
    }

    // Vua bị chiếu hết đứng NGUYÊN CHỖ (quân vừa đi TỚI mới là quân tạo ra thế chiếu hết,
    // không phải Vua) — không dùng lại `kingCell`, phải tự tra đúng ô của nó.
    if (checkmatedSquare) {
      const matedCell = board.querySelector(`[data-square="${checkmatedSquare}"]`)
      if (matedCell) surrenderPulse(matedCell as HTMLElement, GLIDE_MS)
    }

    /*
      KHÔNG huỷ animation trong cleanup — đây là lỗi vừa sửa, không phải sơ suất nhỏ.

      Bản trước cancel() animation cũ mỗi khi effect chạy lại, với lý do "nước tiếp theo
      tới trước khi nước này trượt xong thì quân đứng lệch ô". Nghe hợp lý nhưng sai: bot
      thường trả lời trong dưới 200ms — nhanh hơn hẳn thời lượng trượt (300-480ms) — nên
      HẦU NHƯ MỌI NƯỚC của mình đều bị nước bot tiếp theo cắt ngang. `animation.cancel()`
      xoá hiệu ứng, quân snap thẳng về `transform: none` (vị trí nghỉ) — đúng cái bị chê
      "chậm khúc đầu rồi nhảy một phát": nửa đầu là animation thật đang chạy, cú nhảy là
      lúc nó bị huỷ.

      Cancel là thừa: animation của nước TRƯỚC đang chạy trên quân ở Ô CỦA NƯỚC TRƯỚC,
      animation mới chạy trên quân ở ô KHÁC (hầu hết mọi nước đi tới ô khác nhau) — hai
      cái không hề đụng nhau, không có gì cần huỷ. Trường hợp hiếm gặp lại (cùng một ô bị
      đi qua hai lần liên tiếp rất nhanh) thì trình duyệt tự xử lý hợp lý: animation mới
      thắng thế cho thuộc tính đang tranh chấp, không "lệch ô" như lo ngại ban đầu.
    */
    // `flipped` có mặt vì lật bàn làm hai ô đổi chỗ trên màn hình: giữ nguyên hiệu ứng cũ
    // là quân trượt ngược hướng.
  }, [from, to, rookFrom, rookTo, promotedSquare, promotedColor, checkmatedSquare, flipped])

  return boardRef
}

/**
 * Trễ mốc "nước vừa đi" đúng bằng thời lượng trượt — để vòng cam đánh dấu ô chỉ bật lên
 * khi quân đã THẬT SỰ tới nơi, không phải lúc nó vừa xuất phát.
 *
 * `lastMove` (tham số của `ChessBoard`) phải đến NGAY LẬP TỨC vì nó là thứ kích hoạt
 * `useSlideAnimation` — trễ nó thì animation cũng trễ theo, quân đứng yên 650ms rồi mới
 * nhúc nhích. Nhưng dùng CHÍNH `lastMove` đó để tô vòng cam thì vòng cam bật ngay từ lúc
 * xuất phát, sáng suốt cả quãng đường trong khi quân còn lơ lửng giữa chừng — cùng gốc
 * với lỗi tiếng động chưa khớp đã sửa trước đó, chỉ khác chỗ hiển thị.
 *
 * Nên tách hẳn: `lastMove` lo animation, giá trị TRẢ VỀ ở đây (trễ sau `GLIDE_MS`) lo tô
 * màu — ô cam chỉ sáng đúng lúc quân chạm bàn.
 */
function useLandedMove(lastMove: { from: Square; to: Square } | null) {
  const [landed, setLanded] = useState(lastMove)

  useEffect(() => {
    if (!lastMove) {
      setLanded(null)
      return
    }

    const id = setTimeout(() => setLanded(lastMove), GLIDE_MS)
    return () => clearTimeout(id)
  }, [lastMove])

  return landed
}

/**
 * Cùng nguyên lý với `useLandedMove`, cho ô đỏ báo chiếu.
 *
 * Ô vua sáng đỏ đại diện cho một SỰ THẬT ("vua đang bị chiếu") chỉ đúng khi quân gây
 * chiếu đã THẬT SỰ ở vị trí đe doạ — tức lúc nó chạm bàn, không phải lúc xuất phát. Cùng
 * lỗi với vòng cam, chỉ khác chỗ hiển thị nên tách hàm riêng thay vì ép dùng chung, vì
 * kiểu dữ liệu khác nhau (một ô, không phải một cặp from/to).
 *
 * Về `null` thì KHÔNG trễ — hoà/chiếu được đỡ/ván mới phải tắt đỏ ngay, trễ ở chiều đó
 * chỉ để lại một ô đỏ ma không còn ý nghĩa gì.
 */
function useLandedSquare(square: Square | null) {
  const [landed, setLanded] = useState(square)

  useEffect(() => {
    if (!square) {
      setLanded(null)
      return
    }

    const id = setTimeout(() => setLanded(square), GLIDE_MS)
    return () => clearTimeout(id)
  }, [square])

  return landed
}

/** Bao lâu thì hiệu ứng tan pixel chạy xong — sau đó ngừng vẽ khu chồng lên ô. */
const DISSOLVE_MS = 750

type CapturedPiece = { square: Square; type: string; color: Color } | null

/**
 * Quân bị ăn có BA giai đoạn: ĐỨNG YÊN tại chỗ (chờ quân ăn chạm bàn) → TAN PIXEL → HẾT
 * HẲN — không quay về giai đoạn nào trước đó.
 *
 * `pending`: đứng yên, hiện ngay lúc `capturedPiece` có giá trị (t=0, cùng lúc nước đi
 * được áp dụng) cho tới khi quân ăn chạm bàn. Thiếu giai đoạn này thì ô bị ăn TRỐNG TRƠN
 * suốt lúc quân ăn còn đang trượt tới — DOM ở ô đó đã đổi sang quân ăn ngay từ t=0, chỉ
 * đang bị dịch chuyển bằng transform để NHÌN như còn ở ô cũ (xem `useSlideAnimation`) —
 * quân bị ăn coi như biến mất trước khi bị đụng tới, đúng lỗi vừa được báo.
 *
 * `dissolving`: tan vỡ, trễ đúng `GLIDE_MS` cho khớp lúc quân ăn chạm bàn (cùng lý do với
 * `useLandedMove`/`useLandedSquare`), tự tắt sau `DISSOLVE_MS` nữa khi hiệu ứng chạy xong.
 *
 * `consumedRef` là chốt chặn KHÔNG CHO `pending` BẬT LẠI sau khi `dissolving` đã tắt.
 * Không có nó thì `pending` chỉ đơn thuần suy từ "có `capturedPiece` mà không đang tan" —
 * đúng lúc quân CHƯA tan (giai đoạn 1), nhưng cũng đúng y hệt lúc quân ĐÃ tan xong (giai
 * đoạn 3, vì `dissolving` cũng đã về `null`) — quân bị ăn đứng yên trở lại vĩnh viễn sau
 * khi vừa tan biến, vì `capturedPiece` chỉ được xoá ở nước đi TIẾP THEO chứ không phải
 * ngay khi hiệu ứng chạy xong. Nhớ lại nước nào ĐÃ được cho tan (dù `dissolving` có tắt
 * hay không) thì phân biệt được giai đoạn 1 và giai đoạn 3 — hai giai đoạn có cùng điều
 * kiện suy ra ở trên nhưng phải hiện khác hẳn nhau (một cái đứng yên, một cái không hiện
 * gì).
 */
function useCaptureDissolve(capturedPiece: CapturedPiece): {
  pending: CapturedPiece
  dissolving: CapturedPiece
} {
  const [dissolving, setDissolving] = useState<CapturedPiece>(null)
  const consumedRef = useRef<CapturedPiece>(null)

  useEffect(() => {
    if (!capturedPiece) return

    const showId = setTimeout(() => {
      consumedRef.current = capturedPiece
      setDissolving(capturedPiece)
    }, GLIDE_MS)
    return () => clearTimeout(showId)
  }, [capturedPiece])

  useEffect(() => {
    if (!dissolving) return

    const clearId = setTimeout(() => setDissolving(null), DISSOLVE_MS)
    return () => clearTimeout(clearId)
  }, [dissolving])

  const pending = capturedPiece && consumedRef.current !== capturedPiece ? capturedPiece : null

  return { pending, dissolving }
}

/** Tên đầy đủ để đọc màn hình đọc ra, thay cho một chữ cái. */
const PIECE_NAME: Record<string, string> = {
  k: 'king',
  q: 'queen',
  r: 'rook',
  b: 'bishop',
  n: 'knight',
  p: 'pawn',
}

export function ChessBoard({
  pieces,
  lastMove,
  undoMove,
  castleRook,
  promotedSquare,
  checkmatedSquare,
  checkSquare,
  capturedPiece,
  hintSquares,
  captured,
  flipped,
}: ChessBoardProps) {
  const hints = new Set(hintSquares)
  const bySquare = new Map(pieces.map((piece) => [piece.square, piece]))

  const files = flipped ? [...FILES].reverse() : FILES
  const ranks = flipped ? [...RANKS].reverse() : RANKS

  // Chỉ cần MÀU quân vừa phong — đọc thẳng từ quân đang đứng ở ô đó (đã là quân MỚI sau
  // phong cấp), không cần thêm state/prop nào khác để biết "ai vừa phong".
  const promotedColor = promotedSquare ? bySquare.get(promotedSquare)?.color : undefined
  const boardRef = useSlideAnimation(
    undoMove ?? lastMove,
    castleRook,
    promotedSquare,
    promotedColor,
    checkmatedSquare,
    flipped,
  )
  // Chỉ dùng để TÔ VÒNG CAM / Ô ĐỎ — animation vẫn đọc `lastMove` gốc ở trên.
  const landedMove = useLandedMove(lastMove)
  const landedCheck = useLandedSquare(checkSquare)
  const { pending: pendingCapture, dissolving } = useCaptureDissolve(capturedPiece)

  return (
    /*
      Ref bọc CẢ bàn cờ lẫn khu quân chết.

      Hiệu ứng quân bị ăn phải đo khoảng cách từ một ô trên bàn tới một chỗ trong khu quân
      chết. Hai thứ đó nằm dưới cùng một gốc thì chỉ một lần `querySelector` là tìm được
      cả hai, không phải chuyền ref qua lại.
    */
    <div ref={boardRef} className="inline-flex gap-2 select-none font-mono">
      {/*
        Khung viền quanh bàn.

        Trước đây 64 ô cờ chỉ nổi trên nền trang, không có gì phân định "đây là một cái
        bàn cờ" — nhất là ở chủ đề sáng, nơi ô sáng của bàn gần trùng màu nền trang. Viền
        dày + nền riêng cho phần rìa (chỗ toạ độ đứng) biến 64 ô rời rạc thành MỘT vật thể
        có mép, có khối — như bàn cờ thật có viền gỗ bọc quanh mặt cờ.

        Toạ độ vẫn đứng NGOÀI 64 ô như trước (mỗi số/chữ là một ô riêng trong cùng lưới),
        chỉ khác là giờ chúng đứng trên nền của khung thay vì nền trong suốt.
      */}
      <div className="rounded-md border-[3px] border-zinc-400 dark:border-zinc-600 bg-zinc-200 dark:bg-zinc-800 p-1.5 shadow-sm">
      <div className="grid grid-cols-[auto_repeat(8,minmax(0,1fr))] gap-0">
        {ranks.map((rank) => (
          <Row key={rank} rank={rank}>
            {files.map((file) => {
              const square = `${file}${rank}` as Square
              const piece = bySquare.get(square)

              /**
               * Ô sáng khi tổng chỉ số hàng + cột là chẵn. Tính từ ký tự chứ không từ
               * chỉ số mảng, nên lật bàn không làm đảo màu ô.
               */
              const light = (file.charCodeAt(0) - 97 + Number(rank)) % 2 === 1

              const isLast = landedMove?.from === square || landedMove?.to === square
              const isCheck = landedCheck === square
              const isHint = hints.has(square)

              return (
                <div
                  key={square}
                  data-square={square}
                  className={[
                    'relative flex items-center justify-center',
                    /*
                      Chỉ MÀU NỀN chuyển mượt (báo chiếu) — VIỀN CAM (báo nước vừa đi) thì
                      KHÔNG, bật tức thì.

                      Trước cả hai cùng transition 150ms, với lý do "quân đã trượt êm, ô
                      đổi màu cái rụp thì lệch tông". Đúng cho lúc đó, nhưng sai từ khi vòng
                      cam đổi sang bật TRỄ đúng lúc quân hạ cánh (`useLandedMove`, xem
                      trên): quân đứng yên rồi, viền còn mờ dần thêm 150ms nữa mới rõ — tự
                      cộng thêm một nhịp trễ vào đúng chỗ vừa canh cho hết trễ. Bỏ transition
                      khỏi viền để nó bật ĐÚNG lúc quân chạm bàn, không trễ thêm dù chỉ
                      150ms.
                    */
                    'transition-[background-color] duration-150 ease-out',
                    /*
                      Cận trên 4rem chứ không lớn hơn: bàn cờ thành 512px, vẫn nằm gọn
                      cạnh cột cài đặt trong khung `max-w-6xl` của ChessMode, và vẫn vừa
                      một màn hình laptop cùng với ô nhập lệnh bên dưới. Cận dưới giữ
                      nguyên 2rem để bàn cờ không tràn trên điện thoại hẹp.
                    */
                    'w-[clamp(2rem,10vw,4rem)] h-[clamp(2rem,10vw,4rem)]',
                    isLast && 'ring-2 ring-inset ring-orange-500 dark:ring-orange-400',
                    /*
                      Ô cờ giữ tông XÁM VỪA ở cả hai chủ đề, không tối theo app.

                      Bản trước ở chủ đề tối dùng zinc-600/700, gần như đen. Quân trắng
                      thì nổi, nhưng quân đen hết chỗ: ruột quân, mảng tối của quân và
                      nền ô dồn vào cùng một khoảng độ sáng, và cả bên đen thành sáu cái
                      bóng bẹt. Bàn cờ thật cũng vậy — không có bàn nào ô sẫm hơn quân
                      sẫm.
                    */
                    /*
                      Báo chiếu THAY nền ô, chứ không chồng thêm một lớp nền nữa.

                      Bản trước ghép cả hai lớp `bg-` vào cùng một thẻ. Tailwind cho chúng
                      độ ưu tiên NGANG NHAU, nên cái nào thắng là do thứ tự trong file CSS
                      sinh ra chứ không do thứ tự mình viết — và màu ô thắng. Vua bị chiếu
                      mà ô vẫn xám y hệt ô thường, không báo lỗi, không ai thấy.

                      Chọn một trong hai bằng if-else thì không còn gì để tranh nhau.
                    */
                    isCheck
                      ? 'bg-red-400 dark:bg-red-500'
                      : light
                        ? 'bg-zinc-300 dark:bg-zinc-400'
                        : 'bg-zinc-400 dark:bg-zinc-500',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {isHint && (
                    /* Chấm tròn giữa ô, không tô nền: tô nền sẽ đè lên ô tô sáng của
                       nước vừa đi và người chơi không phân biệt được hai loại. */
                    <span
                      aria-hidden
                      className="absolute w-3 h-3 rounded-full bg-orange-500/70 dark:bg-orange-400/70 animate-fade-in"
                    />
                  )}
                  {piece && <Piece color={piece.color} type={piece.type} square={square} />}
                  {/*
                    Quân bị ăn ĐỨNG YÊN tại chỗ cho tới lúc bị đụng, không biến mất ngay
                    lúc nước đi vừa gửi.

                    Không vẽ gì ở đây thì ô này trống trơn suốt quãng quân ăn còn đang
                    trượt tới: DOM đã đổi sang quân ăn ngay từ t=0, chỉ đang bị dịch
                    chuyển bằng transform để NHÌN như còn ở ô cũ (xem `useSlideAnimation`)
                    — quân bị ăn coi như biến mất trước khi bị đụng tới.

                    `pendingCapture` (xem `useCaptureDissolve`) tự tắt đúng lúc chuyển
                    sang `dissolving`, và KHÔNG bật lại sau khi đã tan xong — hai điều đó
                    hook lo hết, ở đây chỉ cần vẽ.
                  */}
                  {pendingCapture?.square === square && (
                    <div
                      aria-hidden
                      className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    >
                      <Piece color={pendingCapture.color} type={pendingCapture.type} />
                    </div>
                  )}
                  {dissolving?.square === square && (
                    <CaptureDissolve
                      type={dissolving.type}
                      color={dissolving.color}
                      boardRef={boardRef}
                    />
                  )}
                </div>
              )
            })}
          </Row>
        ))}

        {/* Ô góc trống dưới cột số hàng. */}
        <div />
        {files.map((file) => (
          <div
            key={file}
            className="text-center text-[11px] font-bold text-zinc-500 dark:text-zinc-400 pt-1"
          >
            {file}
          </div>
        ))}
      </div>
      </div>

      {/*
        `topColor` là màu ngồi Ở TRÊN bàn — dùng để `Graveyard` biết khay nào đứng trên,
        khay nào đứng dưới. Còn quân nào rơi vào khay nào (chiến lợi phẩm của bên đó) là
        việc của `Graveyard`, xem comment trong đó.
      */}
      <Graveyard captured={captured} topColor={flipped ? 'w' : 'b'} />
    </div>
  )
}

/**
 * Quân đã chết, đứng thành hàng bên phải bàn.
 *
 * Đây không chỉ là trang trí. Quân biến mất không dấu vết thì muốn biết ai đang hơn quân
 * phải đọc lại cả biên bản; bày ra đây thì liếc một cái là thấy.
 *
 * Khay bên nào hiện QUÂN ĐỐI PHƯƠNG BÊN ĐÓ ĂN ĐƯỢC — như chiến lợi phẩm, đúng quy ước mọi
 * bàn cờ thật — KHÔNG PHẢI quân của chính bên đó vừa mất. Bản trước làm ngược: khay bên
 * Đen lại hiện quân Đen đã chết, tức bày ra đúng thứ Đen vừa MẤT ngay cạnh Đen, sai hẳn ý
 * nghĩa. Test được bằng mắt: Mã Đen ăn Tốt Trắng thì con Tốt Trắng đó phải nổi lên ở khay
 * PHÍA ĐEN (bên vừa ăn được nó), không phải khay phía Trắng.
 */
function Graveyard({
  captured,
  topColor,
}: {
  captured: { w: string[]; b: string[] }
  topColor: Color
}) {
  const bottomColor: Color = topColor === 'w' ? 'b' : 'w'

  return (
    /*
      Bề rộng bám theo ĐÚNG công thức của ô cờ, chỉ chia đôi.

      Bản đầu tôi cho khu này một công thức riêng theo bề rộng cửa sổ. Sai: ô cờ có trần
      4rem còn cửa sổ thì không, nên màn hình càng rộng hai bên càng lệch nhau — trên máy
      này quân chết bé bằng 1/5 quân trên bàn, nhìn không ra quân gì.

      Hẹp được, vì quân chết xếp CHỒNG MÉP lên nhau chứ không đứng rời ra — xem `Grave`.
    */
    <div className="w-[clamp(2.6rem,12.5vw,5rem)] flex flex-col justify-between py-0.5">
      {/*
        Khay TRÊN hiện quân màu `bottomColor` — vì bên NGỒI TRÊN (`topColor`) chính là bên
        đã ĂN những quân đó. `color` truyền cho `Grave` luôn là màu THẬT của quân bị ăn
        (để vẽ đúng icon và để `data-grave` khớp với hiệu ứng bay trong `useSlideAnimation`
        — hiệu ứng đó tra theo màu quân, không theo vị trí trên/dưới), chỉ có THỨ TỰ hai
        dòng dưới đây là đổi.
      */}
      <Grave color={bottomColor} types={captured[bottomColor]} />
      <Grave color={topColor} types={captured[topColor]} />
    </div>
  )
}

/**
 * Bề rộng phần chồng mép giữa hai quân chết cạnh nhau.
 *
 * Xếp rời nhau thì mười lăm quân — trận tàn sát nặng nhất có thể — cần 720px chiều cao
 * trong khi bàn cờ chỉ cao 409px, tức tràn hẳn ra ngoài. Số này đo ra rồi mới sửa.
 *
 * Chồng mép là cách khay quân chết của bàn cờ thật vẫn làm: quân sau che một phần quân
 * trước, vẫn đếm được mà chiếm chưa tới hai phần ba chỗ.
 */
/*
  Viết THẲNG con số vào tên lớp, không ghép chuỗi.

  Tailwind quét chữ trong mã nguồn để biết cần sinh ra lớp CSS nào. Ghép bằng biến thì thứ
  nó nhìn thấy là `pl-[${...}]` — không phải tên lớp hợp lệ — nên lớp đó không bao giờ
  được sinh, và bố cục hỏng lặng lẽ trong khi mã vẫn biên dịch trôi.

  Cái giá là con số bị nhắc hai lần; đổi thì phải đổi cả hai.
*/

/*
  Đệm trái của hàng bằng ĐÚNG phần chồng mép, và mọi quân lùi trái đúng bấy nhiêu.

  Hai thứ bù trừ nhau nên quân mở đầu mỗi hàng nằm sát mép trái — kể cả những hàng sinh ra
  do xuống dòng. Dùng `first:` thay thế thì chỉ đúng cho quân đầu tiên của cả khay, còn
  quân mở đầu các hàng sau vẫn thụt ra ngoài.
*/
const GRAVE_ROW = 'flex flex-wrap content-start pl-[clamp(0.38rem,1.9vw,0.76rem)]'
const GRAVE_SLOT =
  'w-[clamp(1rem,5vw,2rem)] h-[clamp(1rem,5vw,2rem)] flex items-center justify-center ml-[calc(-1*clamp(0.38rem,1.9vw,0.76rem))]'

function Grave({ color, types }: { color: Color; types: string[] }) {
  return (
    <div
      data-grave={color}
      /*
        Nền cùng tông với ô cờ, KHÔNG để trong suốt.

        Bộ quân này được vẽ để đứng trên mặt bàn: quân đen là ruột sẫm bọc viền sáng, và
        nó chỉ đọc được khi nền sáng hơn ruột. Thả lên nền app thì ruột quân đen (độ sáng
        0.37) gần trùng nền (0.24), cả quân biến thành mỗi cái viền — đo ra đúng như vậy
        chứ không phải cảm giác.

        Nền chỉ hiện khi đã có quân chết, để lúc mới vào ván không thừa ra hai mảng xám.
      */
      className={
        types.length > 0
          ? `${GRAVE_ROW} rounded bg-zinc-400 dark:bg-zinc-500 py-0.5`
          : GRAVE_ROW
      }
    >
      {types.map((type, index) => (
        <span
          /*
            Khoá theo VỊ TRÍ trong hàng, không theo loại quân.

            Danh sách chỉ mọc thêm ở cuối và không bao giờ đảo thứ tự, nên vị trí là danh
            tính ổn định. Khoá theo loại quân thì tám con Tốt trùng khoá nhau.
          */
          key={index}
          className={GRAVE_SLOT}
        >
          <Piece color={color} type={type} />
        </span>
      ))}
    </div>
  )
}

/**
 * Cạnh lưới của hiệu ứng tan pixel — 8×8 = 64 mảnh.
 *
 * Từng thử 4×4 (16 mảnh): mỗi mảnh quá to, bay ra trông như vài viên gạch rơi chứ không
 * ra chất "một đám bụi pixel". Mịn hơn thì mắt đọc ra ĐÁM ĐÔNG hạt nhỏ tan ra, đúng cảm
 * giác pixel-dissolve hơn hẳn vài khối lớn.
 */
const DISSOLVE_GRID = 8

/**
 * Quân bị ăn TAN THÀNH PIXEL rồi BAY VỀ khay quân chết của bên vừa ăn nó, thay vì biến
 * mất cái rụp hay tan tại chỗ.
 *
 * KHÔNG cắt (`clip-path`) hình quân thật thành từng mảnh — đã thử và gần như vô hình: bộ
 * sprite này chỉ vẽ bằng NÉT VIỀN (`fill="none"`, xem `Piece`), nên phần lớn trong số
 * `DISSOLVE_GRID`² ô cắt ra rơi vào chỗ KHÔNG có nét nào đi qua, để lại toàn ô trống; vài
 * ô trúng nét thì cũng chỉ hiện một sợi chỉ mảnh 1 đơn vị. Tranh nét cắt lát không ra
 * "mảnh pixel" nhìn thấy được.
 *
 * Thay bằng khối màu ĐẶC, lấy đúng BẢNG MÀU của quân đó (`PIECE_SPRITES[key]` — mỗi nhóm
 * nét có sẵn một màu `stroke`, gom lại là đủ bộ màu quân dùng để tô/đổ bóng). Mỗi ô random
 * một màu trong bảng đó — vừa chắc chắn hiện rõ (khối đặc, không phải nét mảnh), vừa vẫn
 * đúng tông màu của quân vừa mất.
 *
 * Từng mảnh bay theo hướng khay quân chết (kèm lệch ngẫu nhiên nhẹ quanh hướng đó, không
 * bay thẳng hàng cứng nhắc) rồi mờ dần bằng WAAPI (cùng cơ chế với hiệu ứng trượt quân,
 * xem `useSlideAnimation`) — độ trễ mỗi mảnh cũng ngẫu nhiên nên các ô không tan cùng lúc.
 *
 * Đích đến đo qua `boardRef`: tìm đúng khay quân chết theo MÀU của quân bị ăn (không theo
 * vị trí trên/dưới — hai khay có thể đảo chỗ tuỳ bên nào ngồi trên, xem `Graveyard`), lấy
 * ô CUỐI khay đó — nó đã được vẽ sẵn ở đúng vị trí quân này sẽ dừng lại, cùng thủ thuật
 * "quân đã đứng sẵn ở đích, chỉ cho hiệu ứng xuất phát từ nơi khác" như `useSlideAnimation`.
 */
function CaptureDissolve({
  color,
  type,
  boardRef,
}: {
  color: Color
  type: string
  boardRef: React.RefObject<HTMLDivElement | null>
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const groups = PIECE_SPRITES[`${color}${type.toUpperCase()}`] ?? []
  const palette = [...new Set(groups.map((g) => g.stroke))]

  useEffect(() => {
    const container = containerRef.current
    const board = boardRef.current
    if (!container || !board) return

    // Người tắt hiệu ứng chuyển động thì quân biến mất ngay, không vỡ vụn — xem lý do ở
    // `useSlideAnimation`.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const grave = board.querySelector(`[data-grave="${color}"] > :last-child`)
    const cells = container.querySelectorAll<HTMLElement>('[data-dissolve-cell]')

    // Không thấy khay đích (chưa kịp vẽ, hoặc cấu trúc đổi) thì tan tại chỗ như bản trước
    // — còn hơn ném mảnh vỡ bay về toạ độ (0,0) không có nghĩa gì.
    const origin = container.getBoundingClientRect()
    const target = grave?.getBoundingClientRect()
    const flyDx = target ? target.left + target.width / 2 - (origin.left + origin.width / 2) : 0
    const flyDy = target ? target.top + target.height / 2 - (origin.top + origin.height / 2) : 0

    // Số điểm lấy mẫu dọc đường cong. WAAPI chỉ nội suy THẲNG giữa hai keyframe liền
    // nhau — muốn đường bay CONG thì phải tự chia nhỏ đường cong thành nhiều đoạn thẳng
    // ngắn nối tiếp, đủ điểm để mắt đọc ra một cung tròn mượt chứ không phải đường gấp
    // khúc.
    const ARC_STEPS = 14

    cells.forEach((cell) => {
      // Lệch ngẫu nhiên quanh hướng bay chính — mỗi mảnh đi một đường hơi khác nhau, như
      // một đám bụi chứ không phải một khối cứng di chuyển chung.
      const dx = flyDx + (Math.random() - 0.5) * 30
      const dy = flyDy + (Math.random() - 0.5) * 30
      // Xoay khi bay: hạt pixel vô tri xoay tự do, không giữ hướng cứng như một vật có
      // "mặt trước" — chính cái xoay lộn xộn này là thứ tố cáo đây là bụi vỡ, không phải
      // một quân cờ thu nhỏ đang bay nguyên vẹn.
      const spin = (Math.random() - 0.5) * 420

      /*
        Điểm ĐIỀU KHIỂN của cung bezier bậc hai — đặt ở giữa đường đi rồi kéo LÊN TRÊN
        (toạ độ Y âm hơn), giống đạn đạo/pháo hoa trong phim: phóng lên rồi vòng xuống
        đích, không đi thẳng một đường. Độ cao cung tỉ lệ với khoảng cách bay (xa thì
        vòng cao hơn mới ra dáng cung, gần thì cung thấp lại — tỉ lệ cố định, không phải
        một số tuyệt đối), cộng thêm chút ngẫu nhiên để 64 mảnh không vòng cùng một hình.
      */
      /*
        Điểm điều khiển đặt Ở TRÊN GỐC XUẤT PHÁT, không phải "trên trung điểm đường đi".
        Khay quân chết gần như luôn nằm THẤP HƠN ô cờ trên màn hình (cột thông tin bên
        phải thấp hơn hẳn bàn cờ) — lấy `dy / 2 - arcHeight` thì `dy` dương lớn kéo điểm
        điều khiển xuống THEO đích, cung gần như thẳng, không hề nhô lên. Bỏ hẳn `dy` ra
        khỏi công thức: cung LUÔN vọt lên trên ô xuất phát trước, bất kể đích ở đâu.
      */
      const distance = Math.hypot(dx, dy)
      const arcHeight = Math.max(28, distance * (0.45 + Math.random() * 0.25))
      const controlX = dx / 2 + (Math.random() - 0.5) * 20
      const controlY = -arcHeight

      const keyframes: Keyframe[] = []
      for (let i = 0; i <= ARC_STEPS; i++) {
        const t = i / ARC_STEPS
        const inv = 1 - t
        // Bezier bậc hai: P(t) = (1-t)²·P0 + 2(1-t)t·P1 + t²·P2, P0 = gốc (0,0).
        const x = 2 * inv * t * controlX + t * t * dx
        const y = 2 * inv * t * controlY + t * t * dy

        keyframes.push({
          transform: `translate(${x}px, ${y}px) rotate(${spin * t}deg) scale(${1 - 0.75 * t})`,
          // Giữ gần như đặc suốt nửa đầu đường cong (đang bốc lên) rồi mới mờ dần nửa
          // sau (đang rơi xuống đích) — mờ đều suốt cung thì mảnh đã tan gần hết trước
          // khi bay được nửa đường, cung vẽ ra không kịp nhìn thấy.
          opacity: t < 0.45 ? 1 : 1 - (t - 0.45) / 0.55,
        })
      }

      cell.animate(keyframes, {
        duration: DISSOLVE_MS,
        delay: Math.random() * 120,
        easing: 'ease-out',
        fill: 'forwards',
      })
    })
  }, [boardRef, color])

  const cells = []
  for (let row = 0; row < DISSOLVE_GRID; row++) {
    for (let col = 0; col < DISSOLVE_GRID; col++) {
      const bg = palette[Math.floor(Math.random() * palette.length)] ?? (color === 'w' ? '#fdfdfd' : '#000')

      cells.push(
        <div
          key={`${row}-${col}`}
          data-dissolve-cell
          className="absolute"
          style={{
            width: `${100 / DISSOLVE_GRID}%`,
            height: `${100 / DISSOLVE_GRID}%`,
            left: `${(col * 100) / DISSOLVE_GRID}%`,
            top: `${(row * 100) / DISSOLVE_GRID}%`,
            backgroundColor: bg,
          }}
        />,
      )
    }
  }

  return (
    <div aria-hidden className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div ref={containerRef} className="relative w-[86%] h-[86%]">
        {cells}
      </div>
    </div>
  )
}

function Piece({ color, type, square }: { color: string; type: string; square?: Square }) {
  // Khoá đúng quy ước lichess: "wK", "bN"... — quân trắng/đen là hai bức pixel-art RIÊNG
  // BIỆT trong bộ này (không phải một hình tô hai màu như Cburnett), nên tra thẳng theo
  // màu chứ không tô màu sau.
  const key = `${color}${type.toUpperCase()}`
  const groups = PIECE_SPRITES[key]
  if (!groups) return null

  const white = color === 'w'

  return (
    <svg
      viewBox={SPRITE_VIEW_BOX}
      /*
        Chừa lề trong ô: quân chạm sát mép thì cả bàn trông chật, và hai quân đứng cạnh
        nhau dính vào nhau thành một khối.
      */
      className="w-[86%] h-[86%]"
      /*
        Tắt khử răng cưa. Bộ pixel này chủ đích là pixel-art: mỗi nét là một hàng ô vuông
        1 đơn vị. Không có thuộc tính này thì trình duyệt làm mờ mép và mất hẳn chất pixel.
      */
      shapeRendering="crispEdges"
      role="img"
      // Quân trong khu quân chết không còn ô nào, nên đọc là "đã bị ăn" thay cho vị trí.
      aria-label={`${white ? 'white' : 'black'} ${PIECE_NAME[type] ?? type} ${
        square ? `on ${square}` : 'captured'
      }`}
    >
      {groups.map((g, i) => (
        // Mặc định stroke-width là 1 đơn vị — khớp đúng lưới 16×16, không cần khai báo.
        <path key={i} d={g.d} stroke={g.stroke} fill="none" />
      ))}
    </svg>
  )
}

function Row({ rank, children }: { rank: string; children: React.ReactNode }) {
  return (
    <>
      <div className="flex items-center justify-end pr-1.5 text-[11px] font-bold text-zinc-500 dark:text-zinc-400">
        {rank}
      </div>
      {children}
    </>
  )
}
