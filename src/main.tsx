import { lazy, StrictMode, Suspense, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { translations } from './i18n/translations'

// Trang profile công khai là màn duy nhất cần có địa chỉ riêng để chia sẻ. Dùng hash
// (`#/u/<username>`) thay vì thêm router: không cần cấu hình rewrite trên hosting
// tĩnh, và cả app vẫn chỉ có một file index.html.
const PublicProfileView = lazy(() =>
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

  if (username) {
    return (
      <Suspense fallback={null}>
        <PublicProfileView
          username={username}
          onBack={() => {
            window.location.hash = ''
          }}
          t={translations}
        />
      </Suspense>
    )
  }

  return <App />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
