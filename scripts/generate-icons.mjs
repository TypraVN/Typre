/**
 * Sinh toàn bộ icon PNG/ICO từ hình logo, không cần thư viện ngoài.
 *
 * Vì sao tự vẽ thay vì dùng sharp/ImageMagick: logo chỉ là 4 hình chữ nhật bo góc, mà
 * thêm một dependency chỉ để rasterize bốn hình vuông là quá đắt — nhất là loại
 * dependency có binary phải build. `zlib` của Node đủ để viết PNG.
 *
 * Chạy: node scripts/generate-icons.mjs
 */

import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public')

/**
 * Logo trong hệ toạ độ 32×32, khớp `public/favicon.svg`. Sửa ở đây thì mọi kích thước
 * sinh ra đều đổi theo — không phải chỉnh tay từng file.
 */
const LOGO = {
  size: 32,
  background: { x: 0, y: 0, w: 32, h: 32, r: 7, color: [0x00, 0x00, 0x00] },
  bars: [
    { x: 8.5, y: 11, w: 3, h: 10, r: 1, color: [0xf9, 0x73, 0x16] },
    { x: 14.5, y: 7.5, w: 3, h: 17, r: 1, color: [0xfd, 0xba, 0x74] },
    { x: 20.5, y: 9.5, w: 3, h: 13, r: 1, color: [0xf9, 0x73, 0x16] },
  ],
}

/** Số điểm lấy mẫu mỗi chiều trong một pixel. 4×4 = 16 mẫu, đủ mượt ở cỡ 16px. */
const SAMPLES = 4

/** Khoảng cách có dấu tới hình chữ nhật bo góc — cách chuẩn, đúng cả khi r = 0. */
function insideRoundedRect(px, py, rect) {
  const innerX = Math.min(Math.max(px, rect.x + rect.r), rect.x + rect.w - rect.r)
  const innerY = Math.min(Math.max(py, rect.y + rect.r), rect.y + rect.h - rect.r)
  return Math.hypot(px - innerX, py - innerY) <= rect.r
}

/**
 * Vẽ logo ra mảng RGBA.
 *
 * `bleed` = bỏ bo góc và cho nền tràn hết khung. Cần cho apple-touch-icon (iOS tự bo góc,
 * icon đã bo sẵn thì thành bo hai lần) và cho icon maskable của Android.
 *
 * `inset` = thu nhỏ phần 3 vạch vào giữa, để icon maskable không bị mặt nạ tròn cắt mất.
 */
function render(size, { bleed = false, inset = 1 } = {}) {
  const scale = size / LOGO.size
  const pixels = Buffer.alloc(size * size * 4)

  const bg = bleed
    ? { ...LOGO.background, r: 0 }
    : LOGO.background

  const center = LOGO.size / 2
  const bars = LOGO.bars.map((bar) => ({
    x: center + (bar.x - center) * inset,
    y: center + (bar.y - center) * inset,
    w: bar.w * inset,
    h: bar.h * inset,
    r: bar.r * inset,
    color: bar.color,
  }))

  // Vẽ sau đè lên vẽ trước, nên duyệt ngược để lấy hình trên cùng tại mỗi điểm.
  const shapes = [bg, ...bars]

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      let r = 0
      let g = 0
      let b = 0
      let covered = 0

      for (let sy = 0; sy < SAMPLES; sy += 1) {
        for (let sx = 0; sx < SAMPLES; sx += 1) {
          const px = (x + (sx + 0.5) / SAMPLES) / scale
          const py = (y + (sy + 0.5) / SAMPLES) / scale

          let hit = null
          for (let i = shapes.length - 1; i >= 0; i -= 1) {
            if (insideRoundedRect(px, py, shapes[i])) {
              hit = shapes[i].color
              break
            }
          }

          if (hit) {
            r += hit[0]
            g += hit[1]
            b += hit[2]
            covered += 1
          }
        }
      }

      const offset = (y * size + x) * 4
      const total = SAMPLES * SAMPLES

      if (covered > 0) {
        pixels[offset] = Math.round(r / covered)
        pixels[offset + 1] = Math.round(g / covered)
        pixels[offset + 2] = Math.round(b / covered)
        pixels[offset + 3] = Math.round((covered / total) * 255)
      }
      // covered === 0 thì để nguyên 0,0,0,0 (trong suốt).
    }
  }

  return pixels
}

const CRC_TABLE = (() => {
  const table = new Int32Array(256)
  for (let n = 0; n < 256; n += 1) {
    let c = n
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c
  }
  return table
})()

function crc32(buf) {
  let c = 0xffffffff
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function pngChunk(type, data) {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)

  const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data])

  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(typeAndData))

  return Buffer.concat([length, typeAndData, crc])
}

function encodePng(size, pixels) {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // colour type: RGBA
  ihdr[10] = 0 // deflate
  ihdr[11] = 0 // filter
  ihdr[12] = 0 // không interlace

  // Mỗi dòng phải có một byte filter đứng trước; 0 = không filter.
  const raw = Buffer.alloc(size * (size * 4 + 1))
  for (let y = 0; y < size; y += 1) {
    raw[y * (size * 4 + 1)] = 0
    pixels.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4)
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', deflateSync(raw, { level: 9 })),
    pngChunk('IEND', Buffer.alloc(0)),
  ])
}

/**
 * ICO bọc thẳng dữ liệu PNG — mọi trình duyệt hiện dùng đều đọc được, và nhẹ hơn nhiều
 * so với bitmap BMP kiểu cũ.
 */
function encodeIco(entries) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0) // reserved
  header.writeUInt16LE(1, 2) // type: icon
  header.writeUInt16LE(entries.length, 4)

  const directory = Buffer.alloc(entries.length * 16)
  let offset = header.length + directory.length

  entries.forEach((entry, i) => {
    const at = i * 16
    // 256 phải ghi là 0 theo đặc tả; ở đây không dùng cỡ đó nhưng cứ xử lý cho đúng.
    directory[at] = entry.size >= 256 ? 0 : entry.size
    directory[at + 1] = entry.size >= 256 ? 0 : entry.size
    directory[at + 2] = 0 // số màu trong palette
    directory[at + 3] = 0 // reserved
    directory.writeUInt16LE(1, at + 4) // color planes
    directory.writeUInt16LE(32, at + 6) // bits per pixel
    directory.writeUInt32LE(entry.png.length, at + 8)
    directory.writeUInt32LE(offset, at + 12)
    offset += entry.png.length
  })

  return Buffer.concat([header, directory, ...entries.map((e) => e.png)])
}

function write(name, buffer) {
  writeFileSync(join(OUT_DIR, name), buffer)
  console.log(`${name.padEnd(26)} ${String(buffer.length).padStart(6)} bytes`)
}

mkdirSync(OUT_DIR, { recursive: true })

// Google Search cần favicon ít nhất 48×48 và ưu tiên tìm /favicon.ico ở gốc.
const icoSizes = [16, 32, 48]
write(
  'favicon.ico',
  encodeIco(icoSizes.map((size) => ({ size, png: encodePng(size, render(size)) }))),
)

// PNG cho manifest: Chrome muốn có 192 và 512 để cho phép cài đặt.
for (const size of [192, 512]) {
  write(`icon-${size}.png`, encodePng(size, render(size)))
}

/**
 * Icon maskable: Android cắt theo mặt nạ (tròn, vuông tròn góc...) nên nội dung phải nằm
 * trong vùng an toàn giữa. Nền tràn viền, 3 vạch thu về 62%.
 */
write('icon-maskable-512.png', encodePng(512, render(512, { bleed: true, inset: 0.62 })))

/**
 * apple-touch-icon: iOS TỰ bo góc và KHÔNG hỗ trợ trong suốt. Icon đã bo sẵn thì thành
 * bo hai lần, nhìn như bị gọt.
 */
write('apple-touch-icon.png', encodePng(180, render(180, { bleed: true, inset: 0.86 })))
