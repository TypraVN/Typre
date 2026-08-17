/**
 * Vẽ ảnh kết quả để chia sẻ.
 *
 * Vì sao cần: link chữ thì gần như không ai bấm, còn ảnh có con số đẹp thì người ta
 * post. Mỗi ảnh mang theo `typre.dev` nên ai xem cũng biết chỗ nào ra — đây là kênh
 * duy nhất mà người dùng tự quảng cáo hộ, không phải đi đăng từng nơi.
 *
 * Dùng đúng cỡ 1200x630 như ảnh OG: đây là cỡ Twitter/X, Facebook, LinkedIn, Discord,
 * Slack, Zalo đều nhận và không cắt.
 */

const W = 1200
const H = 630

const ORANGE = '#f97316'
const ORANGE_SOFT = '#fdba74'
const BG = '#18181b'
const WHITE = '#fafafa'
const ZINC_400 = '#a1a1aa'
const ZINC_500 = '#71717a'
const ZINC_700 = '#3f3f46'

export interface ResultCardData {
  wpm: number
  accuracy: number
  rawWpm: number
  consistency: number
  /** Tên ngôn ngữ, hoặc null khi người dùng gõ code tự dán. */
  language: string | null
  timeLimit: number
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

/** Logo ba vạch, vẽ lại bằng hình khối thay vì nạp ảnh — không cần chờ tải thêm file. */
function drawLogo(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const unit = size / 32

  ctx.fillStyle = '#000000'
  roundRect(ctx, x, y, size, size, 7 * unit)
  ctx.fill()

  const colors = [ORANGE, ORANGE_SOFT, ORANGE]
  const widths = [16, 11, 7]

  colors.forEach((color, i) => {
    ctx.fillStyle = color
    roundRect(ctx, x + 8 * unit, y + (8 + i * 6) * unit, widths[i] * unit, 3 * unit, 1.5 * unit)
    ctx.fill()
  })
}

/** Ô nhãn bo tròn ở góc trên phải: ngôn ngữ và mốc thời gian của lượt gõ. */
function drawChip(ctx: CanvasRenderingContext2D, rightX: number, y: number, text: string) {
  ctx.font = '500 24px "JetBrains Mono", monospace'
  const padding = 20
  const width = ctx.measureText(text).width + padding * 2
  const height = 48
  const x = rightX - width

  ctx.strokeStyle = ZINC_700
  ctx.lineWidth = 1.5
  roundRect(ctx, x, y, width, height, 10)
  ctx.stroke()

  ctx.fillStyle = ZINC_400
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, x + padding, y + height / 2 + 1)
}

/**
 * Chờ font tải xong rồi mới vẽ.
 *
 * Vẽ trước là canvas rơi về font mặc định của hệ thống, ảnh ra khác hẳn giao diện app —
 * và đây là ảnh người dùng đem đi post, không sửa lại được sau đó.
 */
async function ensureFonts(): Promise<void> {
  try {
    await document.fonts.ready
  } catch {
    // Trình duyệt không hỗ trợ thì vẫn vẽ, chỉ là font có thể lệch — thà có ảnh.
  }
}

export async function renderResultCard(data: ResultCardData): Promise<Blob | null> {
  await ensureFonts()

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H

  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  ctx.fillStyle = BG
  ctx.fillRect(0, 0, W, H)

  // Vạch cam trên cùng: nhận ra thương hiệu ngay cả khi ảnh bị thu nhỏ trong feed.
  ctx.fillStyle = ORANGE
  ctx.fillRect(0, 0, W, 6)

  drawLogo(ctx, 72, 52, 64)

  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = WHITE
  ctx.font = '700 52px "Space Grotesk", sans-serif'
  ctx.fillText('Typre', 152, 108)

  drawChip(
    ctx,
    W - 72,
    58,
    data.language ? `${data.language} · ${data.timeLimit}s` : `your own code · ${data.timeLimit}s`,
  )

  // WPM là con số duy nhất người ta đem đi khoe, nên cho nó chiếm hẳn giữa ảnh. Các số
  // còn lại chỉ là ngữ cảnh — nhồi thêm chỉ làm loãng thứ đáng nhìn.
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = ORANGE
  ctx.font = '700 200px "JetBrains Mono", monospace'
  const wpmText = String(data.wpm)
  const wpmWidth = ctx.measureText(wpmText).width

  ctx.font = '400 48px "JetBrains Mono", monospace'
  const unitWidth = ctx.measureText(' wpm').width

  // Canh giữa cả khối "số + chữ wpm", không phải canh giữa riêng con số — canh riêng thì
  // khối trông lệch sang trái vì chữ "wpm" đẩy trọng tâm sang phải.
  const blockX = (W - (wpmWidth + unitWidth)) / 2
  const baseline = 356

  ctx.font = '700 200px "JetBrains Mono", monospace'
  ctx.fillStyle = ORANGE
  ctx.fillText(wpmText, blockX, baseline)

  ctx.font = '400 48px "JetBrains Mono", monospace'
  ctx.fillStyle = ZINC_500
  ctx.fillText(' wpm', blockX + wpmWidth, baseline)

  // Ba số phụ, canh giữa thành một dòng.
  const stats = [
    `accuracy ${data.accuracy}%`,
    `raw ${data.rawWpm}`,
    `consistency ${data.consistency}%`,
  ]
  const separator = '   ·   '

  ctx.font = '400 28px "JetBrains Mono", monospace'
  const statsLine = stats.join(separator)
  const statsWidth = ctx.measureText(statsLine).width

  ctx.fillStyle = ZINC_400
  ctx.textAlign = 'left'
  ctx.fillText(statsLine, (W - statsWidth) / 2, 440)

  ctx.fillStyle = ZINC_500
  ctx.font = '400 24px "JetBrains Mono", monospace'
  ctx.fillText('typing practice for programmers', 72, H - 44)

  ctx.fillStyle = ORANGE
  ctx.font = '500 28px "JetBrains Mono", monospace'
  ctx.textAlign = 'right'
  ctx.fillText('typre.dev', W - 72, H - 44)

  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), 'image/png'))
}

/** Tên file mang theo điểm và ngôn ngữ, để thư mục Downloads không đầy `image (3).png`. */
export function resultCardFilename(data: ResultCardData): string {
  const where = data.language ?? 'own-code'
  return `typre-${data.wpm}wpm-${where}-${data.timeLimit}s.png`
}
