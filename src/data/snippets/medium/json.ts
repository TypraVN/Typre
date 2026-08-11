import { defineSnippets } from '../define'

/** Bài TRUNG BÌNH cho mốc 30s — xem chú thích trong `medium/javascript.ts`. */
export const jsonMedium = defineSnippets('json', 'json-med', [
  `{
  "name": "typre",
  "version": "1.0.0",
  "private": true,
  "type": "module"
}`,
  `{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  }
}`,
  `{
  "wpm": 92,
  "cpm": 460,
  "accuracy": 97,
  "consistency": 88,
  "language": "rust"
}`,
  `{
  "compilerOptions": {
    "target": "ES2022",
    "strict": true,
    "jsx": "react-jsx"
  }
}`,
  `[
  { "rank": 1, "name": "nhat", "wpm": 92 },
  { "rank": 2, "name": "linh", "wpm": 88 },
  { "rank": 3, "name": "duc", "wpm": 84 }
]`,
  `{
  "error": {
    "code": 401,
    "message": "Invalid login credentials",
    "hint": "check the email and password"
  }
}`,
  `{
  "dependencies": {
    "react": "^19.0.0",
    "zustand": "^5.0.0",
    "shiki": "^4.0.0"
  }
}`,
  `{
  "auth": {
    "provider": "github",
    "verified": true,
    "createdAt": "2026-08-04T10:00:00Z"
  }
}`,
  `{
  "panel": {
    "mark": "W-01",
    "weight": 3250,
    "size": { "width": 1200, "height": 2400 }
  }
}`,
  `{
  "redirectUrls": [
    "https://www.typre.dev/**",
    "http://localhost:5180/**"
  ]
}`,
])
