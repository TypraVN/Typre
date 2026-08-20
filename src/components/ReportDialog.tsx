import { useState } from 'react'
import { Check, Copy, Send } from 'lucide-react'
import { Modal } from './Modal'
import {
  asPlainText,
  collectContext,
  cooldownLeftMs,
  sendReport,
  MAX_MESSAGE_CHARS,
  MIN_MESSAGE_CHARS,
} from '../lib/report'
import type { Translation } from '../i18n/translations'

interface ReportDialogProps {
  userId: string | null
  onClose: () => void
  t: Translation
}

type State = 'idle' | 'sending' | 'sent' | 'copy' | 'copied'

export function ReportDialog({ userId, onClose, t }: ReportDialogProps) {
  const [message, setMessage] = useState('')
  const [state, setState] = useState<State>('idle')

  // Chụp một lần lúc mở: người dùng gõ mô tả xong bấm gửi thì thứ họ ĐÃ ĐỌC phải đúng là
  // thứ được gửi đi, không phải bản tính lại lúc bấm.
  const [context] = useState(collectContext)

  const tooShort = message.trim().length < MIN_MESSAGE_CHARS

  const send = async () => {
    setState('sending')
    const result = await sendReport(message, userId)

    if (result.ok) {
      setState('sent')
      setTimeout(onClose, 1400)
      return
    }

    // Không gửi được thì KHÔNG bỏ mặc: chuyển sang cho copy để họ còn dán vào chỗ khác.
    // Mất công gõ mô tả rồi mà nhận đúng một dòng "gửi thất bại" là tệ nhất.
    setState('copy')
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(asPlainText(message))
      setState('copied')
    } catch {
      setState('copy')
    }
  }

  const cho = Math.ceil(cooldownLeftMs() / 1000)

  return (
    <Modal label={t.reportTitle} closeLabel={t.close} onClose={onClose} widthClass="max-w-lg">
      <div className="px-6 py-5 flex flex-col gap-4">
        <p className="font-mono text-xs text-zinc-500 dark:text-zinc-400">{t.reportSubtitle}</p>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, MAX_MESSAGE_CHARS))}
          rows={4}
          autoFocus
          placeholder={t.reportPlaceholder}
          aria-label={t.reportPlaceholder}
          className="w-full px-3 py-2 rounded-lg font-mono text-sm bg-zinc-100 dark:bg-zinc-800/70 border border-transparent focus:border-orange-500 dark:focus:border-orange-400 outline-none text-zinc-700 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 resize-none"
        />

        {/*
          Hiện ĐÚNG thứ sẽ được gửi kèm. Thu thập thông tin máy người dùng mà không nói ra
          là chuyện không nên làm — và nói bằng cách cho họ đọc thì rõ hơn mọi câu hứa.
        */}
        <details className="group">
          <summary className="cursor-pointer font-mono text-xs text-zinc-500 dark:text-zinc-400 hover:text-orange-500">
            {t.reportWhatIsSent}
          </summary>

          <div className="mt-2 max-h-40 overflow-auto rounded-lg bg-zinc-100 dark:bg-zinc-950 p-3 font-mono text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
            <div>build: {context.build}</div>
            <div>url: {context.url}</div>
            <div>viewport: {context.viewport}</div>
            <div className="break-all">browser: {context.userAgent}</div>
            {userId && <div>account: {userId}</div>}
            <div className="mt-1">
              errors ({context.recentErrors.length}):
              {context.recentErrors.length === 0 && ' none'}
            </div>
            {context.recentErrors.map((e, i) => (
              <div key={i} className="pl-3 text-red-500 dark:text-red-400 break-all">
                {e.message}
              </div>
            ))}
          </div>
        </details>

        {state === 'sent' ? (
          <div className="flex items-center justify-center gap-2 py-1 font-mono text-sm text-green-600 dark:text-green-400">
            <Check className="w-4 h-4" />
            {t.reportSent}
          </div>
        ) : state === 'copy' || state === 'copied' ? (
          <div className="flex flex-col gap-2">
            <p className="font-mono text-xs text-red-600 dark:text-red-400">{t.reportFailed}</p>
            <button
              type="button"
              onClick={copy}
              className="self-start flex items-center gap-1.5 px-3 py-1 rounded border border-zinc-300 dark:border-zinc-700 font-mono text-sm cursor-pointer hover:border-orange-500 dark:hover:border-orange-400 transition-colors duration-150"
            >
              {state === 'copied' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {state === 'copied' ? t.reportCopied : t.reportCopy}
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-[11px] text-zinc-400 dark:text-zinc-500">
              {cho > 0 ? `${t.reportCooldown} ${cho}s` : `${message.length}/${MAX_MESSAGE_CHARS}`}
            </span>

            <button
              type="button"
              onClick={send}
              disabled={tooShort || state === 'sending' || cho > 0}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-mono text-sm cursor-pointer bg-orange-500 text-zinc-900 font-bold hover:bg-orange-400 disabled:opacity-40 disabled:cursor-default transition-colors duration-150"
            >
              <Send className="w-4 h-4" />
              {state === 'sending' ? t.reportSending : t.reportSend}
            </button>
          </div>
        )}
      </div>
    </Modal>
  )
}
