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
  `{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 90
}`,
  `{
  "editor.formatOnSave": true,
  "editor.tabSize": 2,
  "files.eol": "\\n"
}`,
  `{
  "name": "typre",
  "engines": { "node": ">=20" },
  "type": "module",
  "private": true
}`,
  `{
  "compilerOptions": {
    "strict": true,
    "noEmit": true,
    "moduleResolution": "bundler"
  }
}`,
  `{
  "paths": {
    "@/*": ["src/*"],
    "@lib/*": ["src/lib/*"]
  }
}`,
  `{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "required": ["user", "wpm"]
}`,
  `{
  "wpm": { "type": "integer", "minimum": 1, "maximum": 300 },
  "accuracy": { "type": "number", "minimum": 0 }
}`,
  `{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  }
}`,
  `{
  "error": {
    "code": "score_rejected",
    "status": 422,
    "message": "wpm outside the valid range"
  }
}`,
  `{
  "meta": {
    "page": 1,
    "perPage": 10,
    "total": 137,
    "hasMore": true
  }
}`,
  `{
  "sub": "9f2c4a71-8d3e-4b21-9c77-0a5b6e1f2d43",
  "aud": "authenticated",
  "exp": 1786503600
}`,
  `{
  "access_token": "ya29.a0ARrdaM-EXAMPLE",
  "token_type": "Bearer",
  "expires_in": 3599
}`,
  `{
  "name": "Typre",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#f97316"
}`,
  `{
  "icons": [
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}`,
  `{
  "forwardPorts": [5180, 5432],
  "postCreateCommand": "npm ci",
  "image": "devcontainers/typescript-node:20"
}`,
  `{
  "test": {
    "environment": "jsdom",
    "globals": true,
    "include": ["src/**/*.test.ts"]
  }
}`,
  `{
  "coverage": {
    "provider": "v8",
    "thresholds": { "lines": 80, "functions": 75 }
  }
}`,
  `{
  "watch": ["src"],
  "ext": "ts,tsx",
  "ignore": ["dist"],
  "delay": 400
}`,
  `{
  "extends": ["config:recommended"],
  "schedule": ["before 6am on monday"],
  "prConcurrentLimit": 3
}`,
  `{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    }
  }
}`,
  `{
  "cleanUrls": true,
  "redirects": [
    { "source": "/old", "destination": "/leaderboard" }
  ]
}`,
  `{
  "Version": "2012-10-17",
  "Statement": [
    { "Effect": "Allow", "Action": ["s3:GetObject"] }
  ]
}`,
  `{
  "matrix": {
    "os": ["ubuntu-latest", "windows-latest"],
    "node": [20, 22]
  }
}`,
  `{
  "flags": {
    "leaderboard": { "enabled": true, "rollout": 100 },
    "friends": { "enabled": false, "rollout": 0 }
  }
}`,
  `{
  "color": {
    "brand": { "value": "#f97316" },
    "bg": { "value": "#18181b" }
  }
}`,
  `{
  "keybindings": [
    { "key": "escape", "command": "run.restart" },
    { "key": "enter", "command": "run.next" }
  ]
}`,
  `{
  "language": "rust",
  "timeLimit": 60,
  "theme": "dracula",
  "sound": true
}`,
  `{
  "event": "run_finished",
  "properties": {
    "language": "rust",
    "wpm": 84,
    "accuracy": 96.4
  }
}`,
  `{
  "ref": "refs/heads/main",
  "after": "0ed741da92",
  "pusher": { "name": "TypraVN" }
}`,
  `{
  "level": "warn",
  "logger": "typre.submit",
  "msg": "score rejected",
  "code": "23514"
}`,
  `{
  "sku": "NT-CRANE-01",
  "price": 149,
  "currency": "USD",
  "tags": ["revit", "precast"]
}`,
  `{
  "invoiceNumber": "INV-2026-0142",
  "issuedAt": "2026-08-01",
  "total": 1650
}`,
  `{
  "lines": [
    { "description": "Support, 3 months", "qty": 3, "unit": 150 }
  ]
}`,
  `{
  "name": "Nhat Tran",
  "emails": ["nhat@ntools.dev"],
  "address": { "city": "Ho Chi Minh City", "country": "VN" }
}`,
  `{
  "prompt": "What does the satisfies operator do?",
  "choices": ["Casts", "Checks without widening"],
  "answer": 1
}`,
  `[
  { "id": 1, "typed": 0, "expectWpm": 0 },
  { "id": 2, "typed": 250, "expectWpm": 50 }
]`,
  `{
  "status": "degraded",
  "checks": [
    { "name": "database", "status": "ok", "latencyMs": 12 }
  ]
}`,
  `{
  "Config": {
    "Image": "typre:0ed741d",
    "Env": ["NODE_ENV=production", "PORT=80"]
  }
}`,
  `{
  "imports": {
    "react": "https://esm.sh/react@19",
    "zustand": "https://esm.sh/zustand@5"
  }
}`,
  `{
  "theme": {
    "extend": {
      "colors": { "brand": "#f97316" }
    }
  }
}`,
  `{
  "routes": [
    { "path": "/", "component": "Home" },
    { "path": "*", "component": "NotFound", "status": 404 }
  ]
}`,
])
