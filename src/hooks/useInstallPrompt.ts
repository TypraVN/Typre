import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISS_KEY = 'codetyping-install-dismissed'

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // Safari/iOS không có `display-mode: standalone` đáng tin — dùng cờ riêng của nó.
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent)
}

/**
 * Gợi ý cài app lên máy — quay lại bằng một icon trên màn hình chính thay vì phải mở
 * trình duyệt rồi tìm lại typre.dev mỗi lần.
 *
 * Chrome/Edge/Android chỉ cho cài NGAY LÚC bắn sự kiện `beforeinstallprompt`, và chỉ bắn
 * một lần — không lắng nghe từ đầu (gắn effect này ở gốc app) là mất luôn khả năng cài
 * qua nút bấm, người dùng phải tự mò menu trình duyệt để tìm nó.
 *
 * Safari/iOS không bắn sự kiện này (không có API cài đặt), nên chỉ đưa ra HƯỚNG DẪN tay
 * (Share → Add to Home Screen) thay vì một nút bấm.
 */
export function useInstallPrompt() {
  const [deferredEvent, setDeferredEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(false)
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(DISMISS_KEY) === '1'
    } catch {
      return false
    }
  })

  useEffect(() => {
    const onBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferredEvent(e as BeforeInstallPromptEvent)
    }
    const onInstalled = () => setInstalled(true)

    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const dismiss = () => {
    setDismissed(true)
    try {
      localStorage.setItem(DISMISS_KEY, '1')
    } catch {
      // Không lưu được thì lần sau lại hiện — không đáng chặn luồng vì việc này.
    }
  }

  const promptInstall = async () => {
    if (!deferredEvent) return
    await deferredEvent.prompt()
    const { outcome } = await deferredEvent.userChoice
    // Sự kiện chỉ dùng được một lần dù người dùng bấm "cài" hay "huỷ" trong hộp thoại
    // của trình duyệt — giữ lại thì nút "Install" vẫn sáng nhưng bấm không còn tác dụng.
    setDeferredEvent(null)
    // Không đợi sự kiện `appinstalled` mới ẩn: nó có thể tới trễ hoặc không tới (một số
    // trình duyệt), còn "accepted" đã đủ để biết người dùng không cần thấy banner nữa.
    if (outcome === 'accepted') setInstalled(true)
  }

  const canPromptInstall = deferredEvent !== null
  const showIosHint = isIos() && !isStandalone()

  return {
    show: !installed && !dismissed && !isStandalone() && (canPromptInstall || showIosHint),
    showIosHint,
    promptInstall,
    dismiss,
  }
}
