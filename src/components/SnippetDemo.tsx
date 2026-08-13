import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { RotateCcw, ArrowDown } from 'lucide-react'
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
 *
 * Ba quy tắc để xem là hiểu, không phải xem cho đẹp:
 *  1. Ô kết quả nằm ĐÚNG cột của ô sinh ra nó, để mắt tự nối 2 → 2 → 4. Dồn hết về bên
 *     trái là mất luôn manh mối đâu ra đâu.
 *  2. Mọi hàng có mặt sẵn từ đầu, chỉ mờ/lệch rồi hiện dần. Chèn hàng mới giữa hoạt hình
 *     làm cả bảng kết quả nhảy, mắt phải tìm lại chỗ đang xem.
 *  3. Tên phép toán nằm trên mũi tên giữa hai hàng, sáng lên đúng lúc nó chạy — thay vì
 *     một dòng caption ở dưới mà người xem phải tự đoán nó đang nói về hàng nào.
 */

const STEP_MS = 1300
/** Mỗi ô hiện lệch nhau một nhịp, để thấy mảng chảy qua từng phần tử. */
const STAGGER_MS = 90

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Chạy tới bước cuối rồi DỪNG, không lặp vô tận: hoạt hình lặp mãi ở bảng kết quả là
 * thứ nhấp nháy trong tầm mắt suốt lúc người ta đang đọc điểm.
 */
function useSteps(total: number) {
  const [step, setStep] = useState(0)
  const [runId, setRunId] = useState(0)

  useEffect(() => {
    // Người bật "giảm chuyển động" thì nhảy thẳng tới kết quả cuối, không chạy từng bước.
    if (prefersReducedMotion()) {
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

/**
 * Số chạy dần tới giá trị mới thay vì nhảy cóc. Ở `reduce` thì đây LÀ nội dung cần
 * hiểu: thấy 12 bò lên 17 mới thấy được "cộng dồn", còn 12 biến thành 17 trong một
 * khung hình thì không khác gì đọc bảng số.
 */
function useCountUp(target: number, ms = 450) {
  const [shown, setShown] = useState(target)
  const fromRef = useRef(target)

  useEffect(() => {
    const from = fromRef.current
    if (from === target) return

    if (prefersReducedMotion()) {
      fromRef.current = target
      setShown(target)
      return
    }

    const start = performance.now()
    let raf = 0

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / ms)
      const eased = 1 - (1 - progress) * (1 - progress)
      setShown(Math.round(from + (target - from) * eased))

      if (progress < 1) raf = requestAnimationFrame(tick)
      else fromRef.current = target
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, ms])

  return shown
}

type Tone = 'idle' | 'keep' | 'drop' | 'used' | 'result'

const TONE: Record<Tone, string> = {
  idle: 'border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-300',
  keep: 'border-orange-500 text-orange-600 dark:text-orange-400',
  drop: 'border-zinc-300 dark:border-zinc-700 text-zinc-400 dark:text-zinc-600 line-through',
  // Đã dùng rồi nhưng KHÔNG bị loại — gạch ngang ở đây sẽ đọc thành "bị bỏ", trong khi
  // ý là "đã cộng vào sum".
  used: 'border-zinc-300 dark:border-zinc-700 text-zinc-400 dark:text-zinc-500',
  result:
    'border-orange-500 bg-orange-500/15 text-orange-600 dark:text-orange-400 font-bold shadow-[0_0_0_3px_rgba(249,115,22,0.12)]',
}

interface BoxProps {
  children: ReactNode
  tone?: Tone
  /** Chưa tới lượt thì ô đã có trong DOM nhưng mờ và lệch lên, để lúc hiện là TRƯỢT xuống. */
  shown?: boolean
  delayMs?: number
  wide?: boolean
}

function Box({ children, tone = 'idle', shown = true, delayMs = 0, wide }: BoxProps) {
  return (
    <span
      style={{ transitionDelay: `${delayMs}ms` }}
      className={`inline-flex items-center justify-center h-8 ${wide ? 'px-2' : 'w-10'} rounded border font-mono text-sm
        transition-all duration-500 ease-out ${TONE[tone]}
        ${shown ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-3 scale-90'}
        ${tone === 'drop' ? 'opacity-35' : ''} ${tone === 'used' ? 'opacity-45' : ''}`}
    >
      {children}
    </span>
  )
}

/** Một hàng: nhãn trái cố định + các ô xếp theo cột đều nhau. */
function Lane({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-16 shrink-0 text-right font-mono text-xs text-zinc-400 dark:text-zinc-500">
        {label}
      </span>
      <div className="flex items-center gap-1.5">{children}</div>
    </div>
  )
}

/** Ô trống giữ cột: số bị lọc bỏ để lại đúng khoảng trống của nó. */
function Gap({ wide }: { wide?: boolean }) {
  return <span className={`${wide ? 'w-24' : 'w-10'} h-8`} />
}

/** Mũi tên + tên phép toán, sáng lên đúng bước nó đang chạy. */
function Flow({ code, active }: { code: string; active: boolean }) {
  return (
    <div className="flex items-center gap-2 h-6">
      <span className="w-16 shrink-0" />
      <ArrowDown
        className={`w-3.5 h-3.5 shrink-0 transition-colors duration-300 ${
          active ? 'text-orange-500' : 'text-zinc-300 dark:text-zinc-700'
        }`}
      />
      <span
        className={`font-mono text-xs transition-colors duration-300 ${
          active
            ? 'text-orange-600 dark:text-orange-400'
            : 'text-zinc-400 dark:text-zinc-600'
        }`}
      >
        {code}
      </span>
    </div>
  )
}

const NUMS = [1, 2, 3, 4, 5, 6]

function FilterMapFrame({ step }: { step: number }) {
  return (
    <div className="flex flex-col gap-1 w-fit mx-auto">
      <Lane label="numbers">
        {NUMS.map((n, i) => (
          <Box key={n} tone={step === 0 ? 'idle' : n % 2 === 0 ? 'keep' : 'drop'} delayMs={i * STAGGER_MS}>
            {n}
          </Box>
        ))}
      </Lane>

      <Flow code=".filter((n) => n % 2 === 0)" active={step === 1 || step === 2} />

      {/* Số lẻ để lại ô trống đúng cột của nó: thấy được "cái gì đã bị bỏ", chứ không chỉ
          thấy ba số còn lại xuất hiện từ đâu không rõ. */}
      <Lane label="filtered">
        {NUMS.map((n, i) =>
          n % 2 === 0 ? (
            <Box key={n} tone="keep" shown={step >= 2} delayMs={(i / 2) * STAGGER_MS * 2}>
              {n}
            </Box>
          ) : (
            <Gap key={n} />
          ),
        )}
      </Lane>

      <Flow code=".map((n) => n * 2)" active={step === 3} />

      <Lane label="evens">
        {NUMS.map((n, i) =>
          n % 2 === 0 ? (
            <Box key={n} tone="result" shown={step >= 3} delayMs={(i / 2) * STAGGER_MS * 2}>
              {n * 2}
            </Box>
          ) : (
            <Gap key={n} />
          ),
        )}
      </Lane>
    </div>
  )
}

const PRICES = [12, 5, 8]

function ReduceFrame({ step }: { step: number }) {
  // Bước 0 là trạng thái đầu (sum = 0), mỗi bước sau ăn thêm một item.
  const eaten = step
  const target = PRICES.slice(0, eaten).reduce((a, b) => a + b, 0)
  const sum = useCountUp(target)
  const done = eaten === PRICES.length

  return (
    <div className="flex flex-col gap-1 w-fit mx-auto">
      {/* Item đã cộng thì mờ đi TẠI CHỖ, không biến mất: hết hoạt hình vẫn đọc được
          12, 5, 8 nên thấy ngay 25 ở đâu ra. Bản trước cho nó rơi xuống rồi tan, kết
          quả là hàng items trống trơn và con số 25 thành vô nghĩa. */}
      <Lane label="items">
        {PRICES.map((p, i) => (
          <Box key={i} tone={i < eaten ? 'used' : i === eaten && !done ? 'keep' : 'idle'}>
            {p}
          </Box>
        ))}
      </Lane>

      <Flow
        code={done ? '// hết mảng, trả về sum' : `sum + ${PRICES[eaten]}`}
        active={eaten > 0}
      />

      <Lane label="sum">
        <Box tone={done ? 'result' : 'keep'}>{sum}</Box>
      </Lane>
    </div>
  )
}

function Field({ k, v }: { k: string; v: string }) {
  return (
    <>
      <span className="opacity-60">{k}:</span>&nbsp;{v}
    </>
  )
}

/** Ô của `merged` cột size: 12 trượt lên biến mất đúng lúc 16 trượt vào. */
function OverwriteCell({ step }: { step: number }) {
  const overwritten = step >= 2

  // Ba trạng thái của giá trị cũ: chưa vào (lệch lên, mờ) → đang là giá trị của merged
  // → bị đè (trượt tiếp lên rồi mất).
  const oldValue = !step
    ? 'opacity-0 -translate-y-3'
    : overwritten
      ? 'opacity-0 -translate-y-4'
      : 'opacity-100 translate-y-0'

  const layer = 'absolute inset-0 flex items-center justify-center transition-all duration-500 ease-out'

  return (
    <span className="relative inline-flex w-24 h-8 items-center justify-center">
      <span className={`${layer} ${oldValue}`}>
        <Box tone="keep" wide>
          <Field k="size" v="12" />
        </Box>
      </span>

      {/* Giá trị mới đi LÊN từ hàng options ở trên... đúng ra là từ dưới, vì trượt vào
          từ hướng ngược với hướng cái cũ đi ra mới thấy được là "thay thế". */}
      <span className={`${layer} ${overwritten ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <Box tone={step >= 3 ? 'result' : 'keep'} wide>
          <Field k="size" v="16" />
        </Box>
      </span>
    </span>
  )
}

function SpreadFrame({ step }: { step: number }) {
  return (
    <div className="flex flex-col gap-1 w-fit mx-auto">
      <Lane label="defaults">
        <Box tone={step >= 1 ? 'used' : 'idle'} wide>
          <Field k="theme" v="'dark'" />
        </Box>
        <Box tone={step >= 1 ? 'used' : 'idle'} wide>
          <Field k="size" v="12" />
        </Box>
      </Lane>

      {/* Nguồn chỉ mờ đi, KHÔNG gạch ngang: chuyện "12 bị loại" kể ở trong ô merged, gạch
          cả hàng nguồn thì trông như cả defaults bị bỏ. */}
      <Lane label="options">
        <Gap wide />
        <Box tone={step >= 2 ? 'used' : 'idle'} wide>
          <Field k="size" v="16" />
        </Box>
      </Lane>

      <Flow
        code={step >= 2 ? '...options  // ghi đè size' : '...defaults'}
        active={step >= 1}
      />

      {/* Cột `size` thẳng hàng qua cả ba hàng: mới thấy được 16 của options ĐÈ LÊN đúng
          chỗ 12 của defaults, chứ không phải thêm một khoá mới. */}
      <Lane label="merged">
        <Box tone={step >= 3 ? 'result' : 'keep'} shown={step >= 1} wide>
          <Field k="theme" v="'dark'" />
        </Box>
        <OverwriteCell step={step} />
      </Lane>
    </div>
  )
}

interface Demo {
  steps: number
  Frame: (props: { step: number }) => ReactNode
}

const DEMOS: Record<DemoId, Demo> = {
  'filter-map': { steps: 4, Frame: FilterMapFrame },
  reduce: { steps: 4, Frame: ReduceFrame },
  spread: { steps: 4, Frame: SpreadFrame },
}

interface SnippetDemoProps {
  demo: DemoId
  label: string
  replayLabel: string
}

export function SnippetDemo({ demo, label, replayLabel }: SnippetDemoProps) {
  const { steps, Frame } = DEMOS[demo]
  const { step, replay } = useSteps(steps)

  return (
    <div className="w-full pt-3 border-t border-zinc-300 dark:border-zinc-700">
      <div className="flex items-center justify-center gap-2 mb-3">
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

      {/* Chấm bước: cho biết hoạt hình có mấy nhịp và đang ở đâu, không thì người xem
          không biết nó đã chạy xong hay còn đang đứng chờ. */}
      <div className="flex items-center justify-center gap-1.5 mt-3">
        {Array.from({ length: steps }, (_, i) => (
          <span
            key={i}
            className={`h-1 rounded-full transition-all duration-300 ${
              i === step
                ? 'w-4 bg-orange-500'
                : i < step
                  ? 'w-1.5 bg-orange-500/40'
                  : 'w-1.5 bg-zinc-300 dark:bg-zinc-700'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
