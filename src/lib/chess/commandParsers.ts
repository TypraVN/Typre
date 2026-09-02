/**
 * Bộ phân tích câu lệnh đi cờ cho cả 14 ngôn ngữ.
 *
 * Ba nguyên tắc, và chúng là lý do file này dài hơn một đống regex:
 *
 * 1. NGHIÊM về cấu trúc và ký hiệu, DỄ về khoảng trắng. `board.move('e2','e4')` hợp lệ,
 *    `board.Move('e2','e4')` trong JavaScript thì không — JavaScript phân biệt hoa thường.
 *
 * 2. QUY TẮC DẤU NHÁY THEO ĐÚNG TỪNG NGÔN NGỮ. Đây là chỗ phân biệt bộ kiểm cú pháp thật
 *    với một regex bắt đại:
 *      - C# / Java: `'e2'` là KÝ TỰ ĐƠN, không phải chuỗi → chỉ nhận `"`
 *      - SQL: `"e2"` là TÊN ĐỊNH DANH theo chuẩn → chỉ nhận `'`
 *      - JSON: đặc tả chỉ cho `"`
 *      - Go: nhận `"` và cả backtick (chuỗi thô)
 *      - Python / JS / TS: nhận `'` và `"` (JS thêm backtick)
 *
 * 3. DẤU CHẤM PHẨY bắt buộc ở nơi ngôn ngữ thật sự bắt buộc (C#, Java, C++, Rust) và tuỳ
 *    chọn ở nơi không (JS/TS có ASI, Go bị gofmt xoá, Python thì thừa).
 *
 * Tệp này KHÔNG import chess.js. Việc của nó chỉ là chuỗi → `{ from, to }`.
 */

import {
  isPromotionPiece,
  isSquare,
  type ChessLanguage,
  type LanguageParser,
  type ParseError,
  type ParseResult,
  type PromotionPiece,
  type Square,
} from './types'

function fail(code: ParseError['code'], token?: string, at?: number): ParseResult {
  return { ok: false, error: { code, token, at } }
}

/**
 * Kiểm tra chung sau khi một parser đã tách được chuỗi thô.
 *
 * Gom về một chỗ vì cả 14 parser đều cần đúng ba kiểm tra này, và mỗi parser tự viết lại
 * là 14 cơ hội để lệch thông báo lỗi.
 */
function finish(
  raw: { from: string; to: string; promotion?: string },
  input: string,
): ParseResult {
  const from = raw.from.toLowerCase()
  const to = raw.to.toLowerCase()

  if (!isSquare(from)) {
    return fail('unknown-square', raw.from, input.indexOf(raw.from))
  }

  if (!isSquare(to)) {
    return fail('unknown-square', raw.to, input.indexOf(raw.to))
  }

  if (from === to) {
    return fail('same-square', from)
  }

  let promotion: PromotionPiece | undefined

  if (raw.promotion !== undefined && raw.promotion !== '') {
    const piece = normalisePromotion(raw.promotion)

    if (piece === null) {
      return fail('bad-promotion', raw.promotion, input.indexOf(raw.promotion))
    }

    promotion = piece
  }

  const move: { from: Square; to: Square; promotion?: PromotionPiece } = { from, to }
  if (promotion) move.promotion = promotion

  return { ok: true, move }
}

/**
 * Nhận cả ký hiệu ngắn (q) lẫn tên đầy đủ (Queen), vì C++/Rust dùng enum kiểu
 * `Piece::Queen` chứ không ai viết `Piece::Q`.
 */
function normalisePromotion(raw: string): PromotionPiece | null {
  const value = raw.toLowerCase()

  if (isPromotionPiece(value)) return value

  const byName: Record<string, PromotionPiece> = {
    queen: 'q',
    rook: 'r',
    bishop: 'b',
    knight: 'n',
  }

  return byName[value] ?? null
}

/** Chuỗi rỗng là lỗi riêng, không phải lỗi cú pháp — thông báo phải khác. */
function requireInput(input: string): ParseResult | null {
  return input.trim() === '' ? fail('empty') : null
}

function syntaxError(): ParseResult {
  return fail('syntax')
}

/**
 * Tạo parser từ một biểu thức chính quy có nhóm đặt tên `from`, `to` và `promotion`.
 *
 * Regex phải neo cả hai đầu (^…$) — thiếu neo thì `board.move('e2','e4') rm -rf /` cũng
 * lọt, vì phần thừa nằm ngoài vùng khớp.
 */
function fromPattern(render: LanguageParser['render'], pattern: RegExp): LanguageParser {
  return {
    render,
    parse(input) {
      const empty = requireInput(input)
      if (empty) return empty

      const match = pattern.exec(input.trim())
      if (!match?.groups) return syntaxError()

      return finish(
        {
          from: match.groups.from ?? '',
          to: match.groups.to ?? '',
          promotion: match.groups.promotion,
        },
        input,
      )
    },
  }
}

/*
 * Các mảnh dùng lại. Viết dạng chuỗi rồi ghép để mỗi regex bên dưới còn đọc được.
 *
 * Cố ý KHÔNG kiểm tra `[a-h][1-8]` ngay trong regex: bắt lỏng ở đây rồi để `finish()` báo
 * lỗi giúp phân biệt được "sai cú pháp" với "ô cờ không tồn tại" — gõ `board.move('z9',
 * 'e4')` là cú pháp đúng mà ô sai, thông báo phải nói đúng điều đó.
 */
/** Tên enum quân cho C++/Rust — không ai viết `Piece::Q`. */
const PIECE_ENUM: Record<string, string> = {
  q: 'Queen',
  r: 'Rook',
  b: 'Bishop',
  n: 'Knight',
}

const TOKEN = '[A-Za-z0-9]+'
/** Khoảng trắng tuỳ chọn. */
const SP = '\\s*'
/** Khoảng trắng BẮT BUỘC — dùng giữa hai từ khoá, ví dụ `new Move`. */
const SP1 = '\\s+'

/** Chuỗi có dấu nháy khớp cặp. Backreference đảm bảo `'e2"` bị loại. */
function quoted(quotes: string, group: string): string {
  return `(?<${group}q>[${quotes}])(?<${group}>[^${quotes}]*)\\k<${group}q>`
}

const PARSERS: Record<ChessLanguage, LanguageParser> = {
  // ── JavaScript ────────────────────────────────────────────────────────────────
  // Nhận cả ba loại nháy vì JS cho phép cả ba. Chấm phẩy tuỳ chọn: ASI là thật, và
  // `board.move('e2','e4')` không có chấm phẩy vẫn chạy được trong trình duyệt.
  javascript: fromPattern(
    (from, to, p) => `board.move('${from}', '${to}'${p ? `, '${p}'` : ''});`,
    new RegExp(
      `^board${SP}\\.${SP}move${SP}\\(${SP}${quoted(`'"\``, 'from')}${SP},${SP}` +
        `${quoted(`'"\``, 'to')}${SP}(?:,${SP}${quoted(`'"\``, 'promotion')}${SP})?\\)${SP};?$`,
    ),
  ),

  // ── TypeScript ────────────────────────────────────────────────────────────────
  // Dạng đối tượng có kiểu là cách viết TypeScript thật sự dùng cho API kiểu này —
  // `move(options: MoveInput)` đọc rõ hơn hai tham số vị trí không tên.
  //
  // NHƯNG vẫn nhận dạng vị trí của JavaScript: TypeScript là tập cha của JavaScript, từ
  // chối một câu lệnh TypeScript hợp lệ thì bộ kiểm cú pháp này sai chứ không phải người
  // gõ sai.
  typescript: {
    render: (from, to, p) =>
      `board.move({ from: '${from}', to: '${to}'${p ? `, promotion: '${p}'` : ''} });`,
    parse(input) {
      const empty = requireInput(input)
      if (empty) return empty

      const text = input.trim()

      const objectForm = new RegExp(
        `^board${SP}\\.${SP}move${SP}\\(${SP}\\{${SP}` +
          `from${SP}:${SP}${quoted(`'"\``, 'from')}${SP},${SP}` +
          `to${SP}:${SP}${quoted(`'"\``, 'to')}` +
          `(?:${SP},${SP}promotion${SP}:${SP}${quoted(`'"\``, 'promotion')})?` +
          `${SP},?${SP}\\}${SP}\\)${SP};?$`,
      )

      const objectMatch = objectForm.exec(text)
      if (objectMatch?.groups) {
        return finish(
          {
            from: objectMatch.groups.from ?? '',
            to: objectMatch.groups.to ?? '',
            promotion: objectMatch.groups.promotion,
          },
          input,
        )
      }

      // Dạng vị trí của JavaScript cũng là TypeScript hợp lệ.
      const positional = PARSERS.javascript.parse(input)
      if (positional.ok) return positional

      return syntaxError()
    },
  },

  // ── C# ────────────────────────────────────────────────────────────────────────
  // Hai dạng như đề bài: chuỗi, hoặc enum `Square.E2`.
  //
  // CHỈ nhận nháy kép — trong C# `'e2'` là ký tự đơn và không biên dịch được với hai ký
  // tự. Chấm phẩy BẮT BUỘC. Tên phương thức `Move` viết hoa theo quy ước C#, nhưng biến
  // nhận cả `board` lẫn `Board`.
  csharp: {
    render: (from, to, p) => `board.Move("${from}", "${to}"${p ? `, '${p}'` : ''});`,
    parse(input) {
      const empty = requireInput(input)
      if (empty) return empty

      const text = input.trim()

      const stringForm = new RegExp(
        `^[Bb]oard${SP}\\.${SP}Move${SP}\\(${SP}${quoted('"', 'from')}${SP},${SP}` +
          `${quoted('"', 'to')}${SP}(?:,${SP}'(?<promotion>${TOKEN})'${SP})?\\)${SP};$`,
      )

      const enumForm = new RegExp(
        `^[Bb]oard${SP}\\.${SP}Move${SP}\\(${SP}Square\\.(?<from>${TOKEN})${SP},${SP}` +
          `Square\\.(?<to>${TOKEN})${SP}(?:,${SP}Piece\\.(?<promotion>${TOKEN})${SP})?\\)${SP};$`,
      )

      const match = stringForm.exec(text) ?? enumForm.exec(text)
      if (!match?.groups) return syntaxError()

      return finish(
        {
          from: match.groups.from ?? '',
          to: match.groups.to ?? '',
          promotion: match.groups.promotion,
        },
        input,
      )
    },
  },

  // ── Python ────────────────────────────────────────────────────────────────────
  // Nháy đơn và kép đều được, backtick thì không — Python không có nháy backtick.
  // Chấm phẩy hợp lệ về cú pháp nhưng không ai viết, nên nhận mà không đòi.
  python: fromPattern(
    (from_, to, p) => `board.move("${from_}", "${to}"${p ? `, "${p}"` : ''})`,
    new RegExp(
      `^board${SP}\\.${SP}move${SP}\\(${SP}${quoted(`'"`, 'from')}${SP},${SP}` +
        `${quoted(`'"`, 'to')}${SP}(?:,${SP}${quoted(`'"`, 'promotion')}${SP})?\\)${SP};?$`,
    ),
  ),

  // ── Java ──────────────────────────────────────────────────────────────────────
  // `new Move(...)` là đối tượng, đúng thói quen Java. Chỉ nháy kép, chấm phẩy bắt buộc.
  java: fromPattern(
    (from, to, p) => `board.makeMove(new Move("${from}", "${to}"${p ? `, '${p}'` : ''}));`,
    new RegExp(
      `^board${SP}\\.${SP}makeMove${SP}\\(${SP}new${SP1}Move${SP}\\(${SP}` +
        `${quoted('"', 'from')}${SP},${SP}${quoted('"', 'to')}` +
        `${SP}(?:,${SP}'(?<promotion>${TOKEN})'${SP})?\\)${SP}\\)${SP};$`,
    ),
  ),

  // ── Go ────────────────────────────────────────────────────────────────────────
  // `Move` viết hoa vì đó là phương thức xuất khẩu — chữ thường là không gọi được từ gói
  // khác. Nhận cả backtick vì chuỗi thô của Go là thật. Không đòi chấm phẩy: gofmt xoá.
  go: fromPattern(
    (from, to, p) => `board.Move("${from}", "${to}"${p ? `, "${p}"` : ''})`,
    new RegExp(
      `^board${SP}\\.${SP}Move${SP}\\(${SP}${quoted('"`', 'from')}${SP},${SP}` +
        `${quoted('"`', 'to')}${SP}(?:,${SP}${quoted('"`', 'promotion')}${SP})?\\)${SP};?$`,
    ),
  ),

  // ── SQL ───────────────────────────────────────────────────────────────────────
  // Chỉ nháy đơn: trong SQL chuẩn `"e4"` là TÊN CỘT chứ không phải chuỗi. Từ khoá không
  // phân biệt hoa thường nên regex gắn cờ `i`, còn `finish()` tự hạ ô cờ về chữ thường.
  sql: fromPattern(
    (from, to, p) =>
      `UPDATE board SET pos = '${to}'${p ? `, promote = '${p}'` : ''} WHERE piece = '${from}';`,
    new RegExp(
      `^UPDATE\\s+board\\s+SET\\s+pos${SP}=${SP}'(?<to>${TOKEN})'` +
        `(?:${SP},${SP}promote${SP}=${SP}'(?<promotion>${TOKEN})')?` +
        `\\s+WHERE\\s+piece${SP}=${SP}'(?<from>${TOKEN})'${SP};?$`,
      'i',
    ),
  ),

  // ── Bash ──────────────────────────────────────────────────────────────────────
  // Cờ dòng lệnh đảo thứ tự được, vì thực tế không ai nhớ thứ tự cờ. Giá trị có thể để
  // trần hoặc bọc nháy — cả hai đều hợp lệ trong shell.
  bash: {
    render: (from, to, p) => `chess --from ${from} --to ${to}${p ? ` --promote ${p}` : ''}`,
    parse(input) {
      const empty = requireInput(input)
      if (empty) return empty

      const text = input.trim()

      if (!/^chess\s/.test(text)) return syntaxError()

      const flags = new Map<string, string>()
      const flagPattern = /--(from|to|promote)(?:=|\s+)(?:'([^']*)'|"([^"]*)"|(\S+))/g

      let seen: RegExpExecArray | null
      let consumed = 'chess'.length

      while ((seen = flagPattern.exec(text)) !== null) {
        const value = seen[2] ?? seen[3] ?? seen[4] ?? ''
        flags.set(seen[1]!, value)
        consumed = seen.index + seen[0].length
      }

      // Còn chữ thừa sau cờ cuối cùng là sai cú pháp, không phải "cứ có --from là xong".
      if (text.slice(consumed).trim() !== '') return syntaxError()

      const from = flags.get('from')
      const to = flags.get('to')

      if (from === undefined || to === undefined) return syntaxError()

      return finish({ from, to, promotion: flags.get('promote') }, input)
    },
  },

  // ── C / C++ ───────────────────────────────────────────────────────────────────
  // Enum lồng phạm vi `Square::E2`. Chấm phẩy bắt buộc.
  cpp: fromPattern(
    (from, to, p) =>
      `board.move(Square::${from.toUpperCase()}, Square::${to.toUpperCase()}${p ? `, Piece::${PIECE_ENUM[p]}` : ''});`,
    new RegExp(
      `^board${SP}\\.${SP}move${SP}\\(${SP}Square::(?<from>${TOKEN})${SP},${SP}` +
        `Square::(?<to>${TOKEN})${SP}(?:,${SP}Piece::(?<promotion>${TOKEN})${SP})?\\)${SP};$`,
    ),
  ),

  // ── Rust ──────────────────────────────────────────────────────────────────────
  // `move` là từ khoá của Rust nên phương thức phải tên khác — `move_piece`, đúng lối
  // đặt tên snake_case. Chấm phẩy bắt buộc.
  rust: fromPattern(
    (from, to, p) =>
      `board.move_piece(Square::${from.toUpperCase()}, Square::${to.toUpperCase()}${p ? `, Piece::${PIECE_ENUM[p]}` : ''});`,
    new RegExp(
      `^board${SP}\\.${SP}move_piece${SP}\\(${SP}Square::(?<from>${TOKEN})${SP},${SP}` +
        `Square::(?<to>${TOKEN})${SP}(?:,${SP}Piece::(?<promotion>${TOKEN})${SP})?\\)${SP};$`,
    ),
  ),

  // ── HTML ──────────────────────────────────────────────────────────────────────
  // Thuộc tính đảo thứ tự được và không phân biệt hoa thường — đúng như HTML thật.
  html: {
    render: (from, to, p) =>
      `<move from="${from}" to="${to}"${p ? ` promote="${p}"` : ''} />`,
    parse(input) {
      const empty = requireInput(input)
      if (empty) return empty

      const text = input.trim()

      const shell = /^<move((?:\s+[a-zA-Z-]+\s*=\s*(?:"[^"]*"|'[^']*'))*)\s*\/?>$/.exec(text)
      if (!shell) return syntaxError()

      const attrs = new Map<string, string>()
      const attrPattern = /([a-zA-Z-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g

      let seen: RegExpExecArray | null
      while ((seen = attrPattern.exec(shell[1] ?? '')) !== null) {
        attrs.set(seen[1]!.toLowerCase(), seen[2] ?? seen[3] ?? '')
      }

      const from = attrs.get('from')
      const to = attrs.get('to')

      if (from === undefined || to === undefined) return syntaxError()

      return finish({ from, to, promotion: attrs.get('promote') }, input)
    },
  },

  // ── CSS ───────────────────────────────────────────────────────────────────────
  // Khai báo cuối được phép bỏ chấm phẩy, đúng luật CSS thật.
  css: fromPattern(
    (from, to, p) => `piece[from="${from}"] { to: ${to};${p ? ` promote: ${p};` : ''} }`,
    new RegExp(
      `^piece\\[from${SP}=${SP}${quoted(`'"`, 'from')}\\]${SP}\\{${SP}` +
        `to${SP}:${SP}(?<to>${TOKEN})${SP}` +
        `(?:;${SP}(?:promote${SP}:${SP}(?<promotion>${TOKEN})${SP};?${SP})?)?` +
        `\\}$`,
    ),
  ),

  // ── JSON ──────────────────────────────────────────────────────────────────────
  // Dùng JSON.parse thật thay vì regex: đặc tả JSON có quá nhiều chi tiết (dấu phẩy
  // thừa, nháy đơn, khoá không bọc nháy) mà regex nào cũng bỏ sót vài cái. Người gõ sai
  // JSON thì phải nhận đúng thông báo của trình phân tích JSON.
  json: {
    render: (from, to, p) =>
      JSON.stringify(p ? { from, to, promotion: p } : { from, to }),
    parse(input) {
      const empty = requireInput(input)
      if (empty) return empty

      let parsed: unknown

      try {
        parsed = JSON.parse(input)
      } catch {
        return fail('syntax')
      }

      if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return fail('syntax')
      }

      const record = parsed as Record<string, unknown>
      const from = record.from
      const to = record.to
      const promotion = record.promotion

      if (typeof from !== 'string' || typeof to !== 'string') {
        return fail('syntax')
      }

      if (promotion !== undefined && typeof promotion !== 'string') {
        return fail('bad-promotion', String(promotion))
      }

      return finish({ from, to, promotion }, input)
    },
  },

  // ── Ký tự đặc biệt ────────────────────────────────────────────────────────────
  // Bộ này trong app không phải một ngôn ngữ mà là bài luyện dấu, nên cú pháp cũng thuần
  // ký hiệu: `e2->e4`. Nhận cả `->` và `=>` vì đó đúng là hai cụm toán tử bài luyện nhắm
  // tới. Phong quân viết `=q` như ký hiệu cờ vua chuẩn.
  text: fromPattern(
    (from, to, p) => `${from}->${to}${p ? `=${p}` : ''}`,
    new RegExp(
      `^(?<from>${TOKEN})${SP}(?:->|=>)${SP}(?<to>${TOKEN})` +
        `(?:${SP}=${SP}(?<promotion>[A-Za-z]+))?$`,
    ),
  ),
}

export function getParser(language: ChessLanguage): LanguageParser {
  return PARSERS[language]
}

export function parseCommand(language: ChessLanguage, input: string): ParseResult {
  return PARSERS[language].parse(input)
}

/**
 * Ba câu lệnh mẫu của một ngôn ngữ: đi thường, nhập thành, phong quân.
 *
 * Nhập thành và phong quân PHẢI có trong gợi ý. Chỉ đưa một ví dụ đi thường thì người
 * chơi không có cách nào đoán ra nhập thành là "đi vua hai ô" — họ sẽ thử `O-O`, bị báo
 * sai cú pháp, rồi bỏ cuộc giữa ván.
 */
export function examplesFor(language: ChessLanguage): {
  move: string
  castle: string
  promote: string
} {
  const { render } = PARSERS[language]

  return {
    move: render('e2', 'e4'),
    // Nhập thành gần: vua e1 đi hai ô sang g1. Engine tự hiểu và ghi biên bản là O-O.
    castle: render('e1', 'g1'),
    promote: render('e7', 'e8', 'q'),
  }
}

/** Câu lệnh mẫu cho một nước cụ thể — dùng trong gợi ý và thông báo. */
export function renderCommand(
  language: ChessLanguage,
  from: Square,
  to: Square,
  promotion?: PromotionPiece,
): string {
  return PARSERS[language].render(from, to, promotion)
}

export { PARSERS }
