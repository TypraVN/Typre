import { useState } from 'react'
import { Check, Link as LinkIcon } from 'lucide-react'
import type { Translation } from '../i18n/translations'

interface CopyLinkButtonProps {
  url: string
  t: Translation
  className?: string
}

/**
 * Nút copy một đường link. `navigator.clipboard` chỉ chạy trên https hoặc localhost;
 * chỗ khác thì mở `prompt` cho copy tay chứ KHÔNG im lặng — im lặng thì người dùng
 * tưởng đã copy được rồi dán ra trống trơn.
 */
export function CopyLinkButton({ url, t, className = '' }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2500)
    } catch {
      window.prompt(t.challengeCopyFailed, url)
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      title={url}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded border text-sm cursor-pointer transition-colors duration-150 ${
        copied
          ? 'border-green-600/50 text-green-700 dark:text-green-400'
          : 'border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-300 hover:border-orange-500 dark:hover:border-orange-400'
      } ${className}`}
    >
      {copied ? <Check className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
      {copied ? t.challengeCopied : t.copyLink}
    </button>
  )
}
