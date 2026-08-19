import { StrictMode, Suspense, useEffect, useState } from 'react'
import { lazyChunk } from './lib/lazyChunk'
import { createRoot } from 'react-dom/client'
import './index.css'
import App, { LANGUAGES } from './App.tsx'
import { translations } from './i18n/translations'
import { Analytics } from '@vercel/analytics/react'
import { clearLanguageParam, readLanguageParam } from './lib/langParam'
import { usePreferencesStore } from './store/usePreferencesStore'

// Trang profile công khai là màn duy nhất cần có địa chỉ riêng để chia sẻ. Dùng hash
// (`#/u/<username>`) thay vì thêm router: không cần cấu hình rewrite trên hosting
// tĩnh, và cả app vẫn chỉ có một file index.html.
const PublicProfileView = lazyChunk('PublicProfileView', () =>
  import('./components/PublicProfileView').then((m) => ({ default: m.PublicProfileView })),
)

// Khớp đúng bộ ký tự cho phép của `profiles.username` trong database.
function readProfileRoute(): string | null {
  const match = window.location.hash.match(/^#\/u\/([a-z0-9_]{3,20})$/)
  return match ? match[1] : null
}

function Root() {
  const [username, setUsername] = useState(readProfileRoute)

  useEffect(() => {
    const onHashChange = () => setUsername(readProfileRoute())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return (
    <>
      {username ? (
        <Suspense fallback={null}>
          <PublicProfileView
            username={username}
            onBack={() => {
              window.location.hash = ''
            }}
            t={translations}
          />
        </Suspense>
      ) : (
        <App />
      )}

      {/*
        Đo lượt xem để biết đăng bài ở đâu thì ra người thật — hiện không có số liệu nào
        nên mọi quyết định kéo người đều là đoán.

        Không cookie, không định danh cá nhân, nên không cần banner đồng ý. Chỉ chạy trên
        Vercel: ở máy nó tự im, và phải bật Web Analytics trong dashboard mới có dữ liệu.

        Đặt NGOÀI nhánh điều kiện để đếm được cả trang hồ sơ công khai.
      */}
      <Analytics />
    </>
  )
}

/**
 * Áp dụng `?lang=` TRƯỚC khi render.
 *
 * Phải làm ở đây chứ không phải trong một effect của App: App rút bài đầu tiên ngay trong
 * `useState`, nên nếu ngôn ngữ tới sau thì người dùng thấy nháy một bài JavaScript rồi
 * mới đổi sang bài Python — đúng thứ trông như lỗi. Store của zustand đọc localStorage
 * đồng bộ nên gọi được ngay ở tầng module này.
 */
const fromLandingPage = readLanguageParam(LANGUAGES)
if (fromLandingPage) {
  usePreferencesStore.getState().setLanguage(fromLandingPage)
  clearLanguageParam()
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)

/**
 * Service worker để gõ được khi mất mạng. Toàn bộ bài nằm trong bundle nên chỉ cần cache
 * file tĩnh là app chạy trọn vẹn offline.
 *
 * Đăng ký SAU khi render, không chặn lần tải đầu. Chỉ chạy ở bản build: dev server đổi
 * module liên tục, có service worker chen vào giữa là gặp đủ loại lỗi "sao code không
 * cập nhật" mà nguyên nhân nằm ở cache.
 */
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    // Lỗi đăng ký không được làm app chết: mất offline thì vẫn dùng bình thường khi có
    // mạng, nên chỉ ghi log.
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.warn('[Typre] service worker không đăng ký được:', error)
    })
  })
}
