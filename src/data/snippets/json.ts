import type { Snippet } from '../types'

// JSON là nơi dấu {} [] ": , xuất hiện dày nhất — đúng mục đích luyện ký tự đặc biệt.
export const jsonSnippets: Snippet[] = [
  {
    id: 'json-package',
    language: 'json',
    title: 'package.json',
    code: `{\n  "name": "typra",\n  "version": "1.0.0",\n  "private": true\n}`,
  },
  {
    id: 'json-scripts',
    language: 'json',
    title: 'Scripts',
    code: `{\n  "scripts": {\n    "dev": "vite",\n    "build": "tsc -b && vite build"\n  }\n}`,
  },
  {
    id: 'json-array',
    language: 'json',
    title: 'Array of objects',
    code: `[\n  { "id": 1, "wpm": 78 },\n  { "id": 2, "wpm": 91 }\n]`,
  },
  {
    id: 'json-nested',
    language: 'json',
    title: 'Nested config',
    code: `{\n  "compilerOptions": {\n    "strict": true,\n    "target": "ES2022"\n  }\n}`,
  },
  {
    id: 'json-api-response',
    language: 'json',
    title: 'API response',
    code: `{\n  "error": {\n    "code": 401,\n    "message": "Invalid login credentials"\n  }\n}`,
  },
  {
    id: 'json-mixed-types',
    language: 'json',
    title: 'Mixed types',
    code: `{\n  "enabled": false,\n  "retries": 3,\n  "ratio": 0.75,\n  "tags": ["code", "typing"]\n}`,
  },
  {
    id: 'json-escapes',
    language: 'json',
    title: 'Escaped strings',
    code: `{\n  "path": "C:\\\\Users\\\\nhat",\n  "quote": "he said \\"ok\\""\n}`,
  },
  {
    id: 'json-numbers',
    language: 'json',
    title: 'Numbers',
    code: `{\n  "ratio": 0.75,\n  "delta": -12,\n  "big": 1.6e-19\n}`,
  },
  {
    id: 'json-null-bool',
    language: 'json',
    title: 'Null + boolean',
    code: `{\n  "avatar": null,\n  "verified": true,\n  "banned": false\n}`,
  },
  {
    id: 'json-url',
    language: 'json',
    title: 'URL + query',
    code: `{\n  "endpoint": "https://api.site.dev/v1/users?limit=50&sort=-wpm"\n}`,
  },
  {
    id: 'json-matrix',
    language: 'json',
    title: 'Nested arrays',
    code: `{\n  "grid": [[1, 0, 1], [0, 1, 0], [1, 1, 1]]\n}`,
  },
  {
    id: 'json-unicode',
    language: 'json',
    title: 'Unicode escape',
    code: `{\n  "check": "\\u2713",\n  "arrow": "\\u21d2"\n}`,
  },
]
