import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { RotateCcw } from 'lucide-react'

import type { DemoId } from '../data/types'

/**
 * Hoạt hình mô phỏng đoạn code vừa gõ THẬT SỰ làm gì.
 *
 * Gõ đúng ký tự không có nghĩa là hiểu. `numbers.filter(...).map(...)` chép lại được
 * trong 5 giây mà vẫn không hình dung ra mảng biến đổi thế nào — nên sau khi xong bài,
 * chạy luôn đoạn đó dưới dạng hình.
 *
 * Chỉ vài chục khái niệm chiếm phần lớn code thật, nên hoạt hình gắn theo KHÁI NIỆM
 * (`demo`) chứ không theo từng bài: một hoạt hình dùng lại cho mọi bài cùng khái niệm.
 */
const STEP_MS = 1100

/**
 * Chạy tới bước cuối rồi DỪNG, không lặp vô tận: hoạt hình lặp mãi ở bảng kết quả là
 * thứ nhấp nháy trong tầm mắt suốt lúc người ta đang đọc điểm.
 */
function useSteps(total: number) {
  const [step, setStep] = useState(0)
  const [runId, setRunId] = useState(0)
  // Người bật "giảm chuyển động" thì nhảy thẳng tới kết quả cuối, không chạy từng bước.
  const reduced = useRef(false)

  useEffect(() => {
    reduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduced.current) {
      setStep(total - 1)
      return
    }

    setStep(0)
    let current = 0
    const id = setInterval(() => {
      current += 1
      setStep(current)
      if (current >= total - 1) clearInterval(id)
    }, STEP_MS)

    return () => clearInterval(id)
  }, [total, runId])

  return { step, replay: () => setRunId((n) => n + 1) }
}

type Tone = 'idle' | 'keep' | 'drop' | 'result'

const TONE: Record<Tone, string> = {
  idle: 'border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-300',
  keep: 'border-orange-500 text-orange-600 dark:text-orange-400',
  drop: 'border-zinc-300 dark:border-zinc-700 text-zinc-400 dark:text-zinc-600 line-through opacity-40',
  result: 'border-orange-500 bg-orange-500/15 text-orange-600 dark:text-orange-400 font-bold',
}

function Box({ children, tone = 'idle' }: { children: ReactNode; tone?: Tone }) {
  return (
    <span
      className={`inline-flex items-center justify-center min-w-8 h-8 px-2 rounded border font-mono text-sm transition-all duration-300 ${TONE[tone]}`}
    >
      {children}
    </span>
  )
}

function Row({ children }: { children: ReactNode }) {
  return <div className="flex items-center justify-center gap-1.5 flex-wrap min-h-8">{children}</div>
}

/** Nhãn nhỏ bên trái một hàng, để biết đang xem mảng nào. */
function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="font-mono text-xs text-zinc-400 dark:text-zinc-500 mr-1">{children}</span>
  )
}

const NUMS = [1, 2, 3, 4, 5, 6]

function FilterMapFrame({ step }: { step: number }) {
  const kept = NUMS.filter((n) => n % 2 === 0)

  return (
    <div className="flex flex-col gap-2.5">
      {/* Hàng đầu giữ nguyên cả 6 số tới hết bước 1, để thấy RÕ số nào bị loại thay vì
          chúng biến mất trước khi mắt kịp bắt. */}
      <Row>
        <Tag>numbers</Tag>
        {NUMS.map((n) => (
          <Box key={n} tone={step === 0 ? 'idle' : n % 2 === 0 ? 'keep' : 'drop'}>
            {n}
          </Box>
        ))}
      </Row>

      {step >= 2 && (
        <Row>
          <Tag>filtered</Tag>
          {kept.map((n) => (
            <Box key={n} tone="keep">
              {n}
            </Box>
          ))}
        </Row>
      )}

      {step >= 3 && (
        <Row>
          <Tag>evens</Tag>
          {kept.map((n) => (
            <Box key={n} tone="result">
              {n * 2}
            </Box>
          ))}
        </Row>
      )}
    </div>
  )
}

const PRICES = [12, 5, 8]

function ReduceFrame({ step }: { step: number }) {
  // Bước 0 là trạng thái đầu (sum = 0), mỗi bước sau ăn thêm một item.
  const eaten = step
  const sum = PRICES.slice(0, eaten).reduce((a, b) => a + b, 0)

  return (
    <div className="flex flex-col gap-2.5">
      <Row>
        <Tag>items</Tag>
        {PRICES.map((p, i) => (
          <Box key={i} tone={i < eaten ? 'drop' : 'idle'}>
            {p}
          </Box>
        ))}
      </Row>

      <Row>
        <Tag>sum</Tag>
        <Box tone={eaten === PRICES.length ? 'result' : 'keep'}>{sum}</Box>
        {eaten < PRICES.length && (
          <>
            <span className="font-mono text-sm text-zinc-400 dark:text-zinc-500">+</span>
            <Box tone="idle">{PRICES[eaten]}</Box>
          </>
        )}
      </Row>
    </div>
  )
}

function Field({ k, v, tone = 'idle' }: { k: string; v: string; tone?: Tone }) {
  return (
    <Box tone={tone}>
      <span className="opacity-60">{k}:</span>&nbsp;{v}
    </Box>
  )
}

function SpreadFrame({ step }: { step: number }) {
  return (
    <div className="flex flex-col gap-2.5">
      <Row>
        <Tag>defaults</Tag>
        <Field k="theme" v="'dark'" tone={step >= 1 ? 'drop' : 'idle'} />
        <Field k="size" v="12" tone={step >= 1 ? 'drop' : 'idle'} />
      </Row>

      <Row>
        <Tag>options</Tag>
        <Field k="size" v="16" tone={step >= 2 ? 'drop' : 'idle'} />
      </Row>

      <Row>
        <Tag>merged</Tag>
        {step >= 1 && <Field k="theme" v="'dark'" tone={step >= 3 ? 'result' : 'keep'} />}
        {/* `size` là chỗ đáng nhìn nhất: nó bị GHI ĐÈ, nên phải thấy 12 gạch bỏ ngay
            cạnh 16 chứ không chỉ thấy kết quả cuối. */}
        {step === 1 && <Field k="size" v="12" tone="keep" />}
        {step >= 2 && (
          <>
            <Field k="size" v="12" tone="drop" />
            <Field k="size" v="16" tone={step >= 3 ? 'result' : 'keep'} />
          </>
        )}
      </Row>
    </div>
  )
}

interface Demo {
  steps: number
  /** Phần code đang chạy ở bước này — nối hình với đúng chữ mình vừa gõ. */
  caption: string[]
  Frame: (props: { step: number }) => ReactNode
}

const DEMOS: Record<DemoId, Demo> = {
  'filter-map': {
    steps: 4,
    caption: [
      'numbers',
      '.filter((n) => n % 2 === 0)',
      '// 1, 3, 5 bị bỏ',
      '.map((n) => n * 2)',
    ],
    Frame: FilterMapFrame,
  },
  reduce: {
    steps: 4,
    // Caption phải nói ĐÚNG con số đang hiện: viết chung "sum = sum + 12" thì người đọc
    // không biết 12 đã được cộng vào chưa, mà đó lại là điều duy nhất cần hiểu ở reduce.
    caption: ['sum = 0  // giá trị khởi đầu', '0 + 12 → 12', '12 + 5 → 17', '17 + 8 → 25'],
    Frame: ReduceFrame,
  },
  spread: {
    steps: 4,
    caption: [
      '{ ...defaults, ...options }',
      '...defaults  // đổ vào trước',
      '...options  // ghi đè size',
      '// size = 16 thắng vì đứng sau',
    ],
    Frame: SpreadFrame,
  },
}

interface SnippetDemoProps {
  demo: DemoId
  label: string
  replayLabel: string
}

export function SnippetDemo({ demo, label, replayLabel }: SnippetDemoProps) {
  const { steps, caption, Frame } = DEMOS[demo]
  const { step, replay } = useSteps(steps)

  return (
    <div className="w-full pt-3 border-t border-zinc-300 dark:border-zinc-700">
      <div className="flex items-center justify-center gap-2 mb-2.5">
        <span className="font-mono text-xs uppercase tracking-wider text-orange-600 dark:text-orange-400">
          {label}
        </span>
        <button
          type="button"
          onClick={replay}
          title={replayLabel}
          aria-label={replayLabel}
          className="cursor-pointer text-zinc-400 hover:text-orange-500 transition-colors duration-150"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      <Frame step={step} />

      {/* Chừa chỗ cố định cho caption: chữ dài ngắn khác nhau mà không chừa thì cả bảng
          kết quả nhích lên xuống mỗi bước. */}
      <div className="mt-2.5 min-h-5 text-center font-mono text-xs text-zinc-500 dark:text-zinc-400">
        {caption[step]}
      </div>
    </div>
  )
}
