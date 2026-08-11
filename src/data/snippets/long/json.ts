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
      "runtimeArgs": [
        "node_modules/vite/bin/vite.js",
        "--port",
        "5180"
      ],
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
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/index.html",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    }
  ]
}`,
  `{
  "root": true,
  "env": { "browser": true, "es2022": true },
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "rules": {
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "eqeqeq": ["error", "always"],
    "@typescript-eslint/no-unused-vars": "error"
  }
}`,
  `{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 90,
  "tabWidth": 2,
  "arrowParens": "always",
  "bracketSpacing": true,
  "endOfLine": "lf",
  "overrides": [
    {
      "files": "*.md",
      "options": { "proseWrap": "always" }
    }
  ]
}`,
  `{
  "editor.formatOnSave": true,
  "editor.tabSize": 2,
  "editor.rulers": [72, 100],
  "editor.codeActionsOnSave": {
    "source.fixAll": "explicit"
  },
  "files.eol": "\\n",
  "files.trimTrailingWhitespace": true,
  "typescript.tsdk": "node_modules/typescript/lib",
  "search.exclude": {
    "**/dist": true,
    "**/node_modules": true
  }
}`,
  `{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "build",
      "type": "shell",
      "command": "npm run build",
      "options": { "cwd": "\${workspaceFolder}" },
      "group": { "kind": "build", "isDefault": true },
      "problemMatcher": ["$tsc"]
    }
  ]
}`,
  `{
  "openapi": "3.1.0",
  "paths": {
    "/api/scores": {
      "get": {
        "summary": "List top scores",
        "parameters": [
          {
            "name": "language",
            "in": "query",
            "required": false,
            "schema": { "type": "string" }
          }
        ],
        "responses": {
          "200": { "description": "A page of scores" }
        }
      }
    }
  }
}`,
  `{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "Score",
  "type": "object",
  "required": ["user", "wpm", "language"],
  "properties": {
    "user": { "type": "string", "minLength": 1, "maxLength": 32 },
    "wpm": { "type": "integer", "minimum": 1, "maximum": 300 },
    "accuracy": { "type": "number", "minimum": 0, "maximum": 100 },
    "language": { "enum": ["javascript", "rust", "sql"] }
  },
  "additionalProperties": false
}`,
  `{
  "name": "@typre/engine",
  "version": "0.3.1",
  "sideEffects": false,
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./sounds": "./dist/sounds.js"
  },
  "files": ["dist", "README.md"]
}`,
  `{
  "presets": [
    ["@babel/preset-env", { "targets": { "node": "20" } }],
    ["@babel/preset-react", { "runtime": "automatic" }],
    "@babel/preset-typescript"
  ],
  "plugins": ["@babel/plugin-transform-runtime"],
  "env": {
    "test": {
      "plugins": ["babel-plugin-transform-import-meta"]
    }
  }
}`,
  `{
  "common": {
    "signIn": "Sign in",
    "signOut": "Sign out",
    "cancel": "Cancel"
  },
  "leaderboard": {
    "empty": "No entries yet",
    "loading": "Loading...",
    "players": "{count} players",
    "yourRank": "Your rank: #{rank}"
  },
  "errors": {
    "network": "Network is unreachable",
    "auth": "Sign in to submit your score"
  }
}`,
  `{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [106.6297, 10.8231]
      },
      "properties": {
        "name": "Ho Chi Minh City",
        "population": 9000000
      }
    }
  ]
}`,
  `{
  "labels": [1, 2, 3, 4, 5, 6],
  "datasets": [
    {
      "label": "wpm",
      "data": [48, 62, 71, 68, 74, 80],
      "borderColor": "#f97316",
      "tension": 0.35,
      "fill": false
    },
    {
      "label": "raw",
      "data": [52, 68, 79, 75, 81, 88],
      "borderDash": [4, 4]
    }
  ]
}`,
  `{
  "error": {
    "code": "score_rejected",
    "message": "wpm outside the valid range",
    "status": 422,
    "details": [
      { "field": "wpm", "issue": "must be 1 to 300" },
      { "field": "accuracy", "issue": "must be at least 50" }
    ],
    "requestId": "req_9f2c4a71"
  },
  "data": null
}`,
  `{
  "data": [
    { "rank": 1, "user": "nhat97", "wpm": 112 },
    { "rank": 2, "user": "typravn", "wpm": 104 },
    { "rank": 3, "user": "anon-42", "wpm": 98 }
  ],
  "meta": {
    "page": 1,
    "perPage": 10,
    "total": 137,
    "hasMore": true,
    "nextCursor": "eyJ3cG0iOjk4fQ"
  }
}`,
  `{
  "iss": "https://abcdefgh.supabase.co/auth/v1",
  "sub": "9f2c4a71-8d3e-4b21-9c77-0a5b6e1f2d43",
  "aud": "authenticated",
  "role": "authenticated",
  "email": "player@example.com",
  "iat": 1786500000,
  "exp": 1786503600,
  "app_metadata": { "provider": "google" }
}`,
  `{
  "access_token": "ya29.a0ARrdaM-EXAMPLE",
  "token_type": "Bearer",
  "expires_in": 3599,
  "refresh_token": "1//09EXAMPLEREFRESH",
  "scope": "openid email profile",
  "id_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjEyMyJ9"
}`,
  `{
  "name": "Typre",
  "short_name": "Typre",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#18181b",
  "theme_color": "#f97316",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}`,
  `{
  "name": "typre-dev",
  "image": "mcr.microsoft.com/devcontainers/typescript-node:20",
  "forwardPorts": [5180, 5432],
  "postCreateCommand": "npm ci",
  "customizations": {
    "vscode": {
      "extensions": [
        "dbaeumer.vscode-eslint",
        "bradlc.vscode-tailwindcss"
      ]
    }
  }
}`,
  `{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@lib/*": ["src/lib/*"],
      "@data/*": ["src/data/*"]
    },
    "verbatimModuleSyntax": true,
    "skipLibCheck": true
  },
  "references": [{ "path": "./tsconfig.node.json" }]
}`,
  `{
  "test": {
    "environment": "jsdom",
    "globals": true,
    "setupFiles": ["./src/test/setup.ts"],
    "include": ["src/**/*.test.{ts,tsx}"],
    "coverage": {
      "provider": "v8",
      "reporter": ["text", "html"],
      "thresholds": { "lines": 80, "functions": 75 }
    }
  }
}`,
  `{
  "watch": ["src", "supabase"],
  "ext": "ts,tsx,sql",
  "ignore": ["src/**/*.test.ts", "dist"],
  "exec": "node --import tsx src/server.ts",
  "delay": 400,
  "env": {
    "NODE_ENV": "development",
    "PORT": "5180"
  }
}`,
  `{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": ["config:recommended"],
  "timezone": "Asia/Ho_Chi_Minh",
  "schedule": ["before 6am on monday"],
  "packageRules": [
    {
      "matchUpdateTypes": ["minor", "patch"],
      "automerge": true
    }
  ],
  "prConcurrentLimit": 3
}`,
  `{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "lint": { "dependsOn": ["^build"] },
    "test": {
      "dependsOn": ["build"],
      "cache": false
    }
  }
}`,
  `{
  "cleanUrls": true,
  "trailingSlash": false,
  "redirects": [
    { "source": "/old-board", "destination": "/leaderboard" }
  ],
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/index" }
  ],
  "regions": ["sin1"]
}`,
  `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ReadBackups",
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:ListBucket"],
      "Resource": [
        "arn:aws:s3:::typre-backups",
        "arn:aws:s3:::typre-backups/*"
      ]
    }
  ]
}`,
  `{
  "strategy": {
    "fail-fast": false,
    "matrix": {
      "os": ["ubuntu-latest", "windows-latest"],
      "node": [20, 22],
      "exclude": [
        { "os": "windows-latest", "node": 20 }
      ]
    }
  },
  "timeout-minutes": 15
}`,
  `{
  "flags": {
    "leaderboard": { "enabled": true, "rollout": 100 },
    "friends": { "enabled": false, "rollout": 0 },
    "soundPacks": {
      "enabled": true,
      "rollout": 25,
      "allowlist": ["nhat97", "typravn"]
    }
  },
  "updatedAt": "2026-08-11T10:12:00Z"
}`,
  `{
  "color": {
    "brand": { "value": "#f97316" },
    "bg": { "value": "#18181b" },
    "fg": { "value": "#fafafa" },
    "danger": { "value": "#f87171" }
  },
  "space": {
    "xs": { "value": "0.25rem" },
    "sm": { "value": "0.5rem" },
    "md": { "value": "1rem" }
  },
  "radius": { "card": { "value": "12px" } }
}`,
  `{
  "keybindings": [
    { "key": "escape", "command": "run.restart" },
    { "key": "tab", "command": "run.restart", "when": "over" },
    { "key": "enter", "command": "run.next", "when": "over" },
    { "key": "ctrl+k", "command": "palette.open" },
    { "key": "ctrl+shift+l", "command": "leaderboard.open" }
  ]
}`,
  `{
  "typre-preferences": {
    "language": "rust",
    "timeLimit": 60,
    "theme": "dracula",
    "uiMode": "dark",
    "sound": true,
    "smoothCaret": true,
    "showKeyboardHints": false
  },
  "version": 1
}`,
  `{
  "event": "run_finished",
  "timestamp": "2026-08-11T17:04:22.418Z",
  "sessionId": "s_7d21a9",
  "properties": {
    "language": "rust",
    "timeLimit": 60,
    "wpm": 84,
    "rawWpm": 91,
    "accuracy": 96.4,
    "consistency": 78,
    "finishedEarly": false
  }
}`,
  `{
  "ref": "refs/heads/main",
  "before": "843e7bf0c1",
  "after": "0ed741da92",
  "repository": {
    "full_name": "TypraVN/Typre",
    "private": false,
    "default_branch": "main"
  },
  "pusher": { "name": "TypraVN" },
  "commits": [
    { "id": "0ed741da92", "message": "Add long snippets" }
  ]
}`,
  `{
  "level": "warn",
  "time": "2026-08-11T17:05:01.220Z",
  "logger": "typre.submit",
  "msg": "score rejected by database",
  "userId": "9f2c4a71",
  "language": "css",
  "err": {
    "type": "PostgrestError",
    "code": "23514",
    "constraint": "scores_language_check"
  }
}`,
  `{
  "products": [
    {
      "sku": "NT-CRANE-01",
      "name": "Crane Capacity Auditor",
      "price": 149,
      "currency": "USD",
      "tags": ["revit", "precast", "safety"],
      "inStock": true
    }
  ],
  "total": 1
}`,
  `{
  "invoiceNumber": "INV-2026-0142",
  "issuedAt": "2026-08-01",
  "dueAt": "2026-08-15",
  "customer": { "name": "NTools", "taxId": "0312345678" },
  "lines": [
    { "description": "Shopdrawing add-in", "qty": 1, "unit": 1200 },
    { "description": "Support, 3 months", "qty": 3, "unit": 150 }
  ],
  "total": 1650,
  "currency": "USD"
}`,
  `{
  "contacts": [
    {
      "name": "Nhat Tran",
      "role": "Precast BIM engineer",
      "emails": ["nhat@ntools.dev"],
      "phones": [{ "type": "mobile", "number": "+84901234567" }],
      "address": {
        "city": "Ho Chi Minh City",
        "country": "VN"
      }
    }
  ]
}`,
  `{
  "quiz": {
    "title": "TypeScript basics",
    "questions": [
      {
        "id": "q1",
        "prompt": "What does the satisfies operator do?",
        "choices": ["Casts", "Checks without widening", "Nothing"],
        "answer": 1,
        "points": 10
      }
    ]
  }
}`,
  `[
  { "id": 1, "name": "empty run", "typed": 0, "expectWpm": 0 },
  { "id": 2, "name": "clean run", "typed": 250, "expectWpm": 50 },
  { "id": 3, "name": "messy run", "typed": 250, "expectWpm": 41 },
  {
    "id": 4,
    "name": "abandoned run",
    "typed": 12,
    "expectWpm": 2,
    "skip": true
  }
]`,
  `{
  "status": "degraded",
  "uptimeSeconds": 184213,
  "version": "1.4.2",
  "checks": [
    { "name": "database", "status": "ok", "latencyMs": 12 },
    { "name": "auth", "status": "ok", "latencyMs": 41 },
    {
      "name": "storage",
      "status": "fail",
      "error": "connection timed out"
    }
  ]
}`,
  `{
  "Id": "sha256:1f2e3d4c5b6a",
  "Created": "2026-08-11T09:41:12.884Z",
  "Config": {
    "Image": "typre:0ed741d",
    "Env": ["NODE_ENV=production", "PORT=80"],
    "ExposedPorts": { "80/tcp": {} }
  },
  "State": { "Status": "running", "Restarts": 0 }
}`,
  `{
  "imports": {
    "react": "https://esm.sh/react@19",
    "react-dom/client": "https://esm.sh/react-dom@19/client",
    "zustand": "https://esm.sh/zustand@5"
  },
  "scopes": {
    "https://esm.sh/": {
      "scheduler": "https://esm.sh/scheduler@0.25"
    }
  }
}`,
  `[
  {
    "path": "/*",
    "timings": [
      { "metric": "interactive", "budget": 3000 },
      { "metric": "first-contentful-paint", "budget": 1500 }
    ],
    "resourceSizes": [
      { "resourceType": "script", "budget": 180 },
      { "resourceType": "total", "budget": 500 }
    ]
  }
]`,
  `{
  "theme": {
    "extend": {
      "colors": {
        "brand": { "DEFAULT": "#f97316", "dark": "#ea580c" }
      },
      "fontFamily": {
        "mono": ["JetBrains Mono", "monospace"],
        "heading": ["Space Grotesk", "sans-serif"]
      },
      "borderRadius": { "card": "12px" }
    }
  }
}`,
  `{
  "$schema": "https://unpkg.com/@changesets/config/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "access": "restricted",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": ["@typre/docs"]
}`,
  `{
  "routes": [
    { "path": "/", "component": "Home", "prerender": true },
    { "path": "/practice/:language", "component": "Practice" },
    { "path": "/leaderboard", "component": "Leaderboard" },
    { "path": "/u/:username", "component": "PublicProfile" },
    { "path": "*", "component": "NotFound", "status": 404 }
  ],
  "fallback": "/index.html"
}`,
])
