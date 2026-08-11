import { defineSnippets } from '../define'

/** Bài DÀI cho mốc 60s — xem chú thích trong `long/javascript.ts`. */
export const jsonLong = defineSnippets('json', 'json-long', [
  `{
  "name": "typre",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "oxlint .",
    "preview": "vite preview"
  },
  "engines": {
    "node": ">=20"
  }
}`,
  `{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noEmit": true
  },
  "include": ["src"],
  "exclude": ["dist", "node_modules"]
}`,
  `{
  "data": {
    "user": {
      "id": "9f2c",
      "displayName": "nhat",
      "username": "nhat_dep_trai",
      "createdAt": "2026-08-04T10:00:00Z"
    },
    "scores": [
      { "language": "rust", "timeLimit": 60, "wpm": 92 },
      { "language": "csharp", "timeLimit": 30, "wpm": 88 }
    ]
  },
  "error": null
}`,
  `{
  "version": "0.0.1",
  "configurations": [
    {
      "name": "codetyping",
      "runtimeExecutable": "node",
      "runtimeArgs": ["node_modules/vite/bin/vite.js", "--port", "5180"],
      "port": 5180
    }
  ]
}`,
  `{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "zustand": "^5.0.0",
    "shiki": "^4.0.0",
    "lucide-react": "^0.500.0",
    "@supabase/supabase-js": "^2.45.0"
  },
  "devDependencies": {
    "typescript": "^5.6.0",
    "vite": "^8.0.0",
    "oxlint": "^1.0.0"
  }
}`,
  `{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    },
    {
      "source": "/index.html",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=0, must-revalidate" }
      ]
    }
  ]
}`,
])
