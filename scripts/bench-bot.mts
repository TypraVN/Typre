import { pickMove, type BotLevel } from '../src/lib/chess/chessBot'

const OPENING = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
const MID = 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4'

const levels: BotLevel[] = ['easy', 'medium', 'hard']

for (const level of levels) {
  for (const [name, fen] of [['khai cuoc', OPENING], ['trung cuoc', MID]] as const) {
    const started = Date.now()
    pickMove(fen, { level })
    console.log(level.padEnd(7), name.padEnd(11), Date.now() - started, 'ms')
  }
}
