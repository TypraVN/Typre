import type { Snippet } from '../types'

// Tách khỏi nhóm html: ở đây là CSS thuần, không bọc trong <style> nên grammar `css`
// highlight đúng từ dòng đầu.
export const cssSnippets: Snippet[] = [
  {
    id: 'css-flex-center',
    language: 'css',
    title: 'Flex center',
    code: `.card {\n    display: flex;\n    align-items: center;\n    justify-content: center;\n}`,
  },
  {
    id: 'css-grid',
    language: 'css',
    title: 'Grid template',
    code: `.layout {\n    display: grid;\n    grid-template-columns: repeat(3, minmax(0, 1fr));\n    gap: 1rem;\n}`,
  },
  {
    id: 'css-variables',
    language: 'css',
    title: 'Custom properties',
    code: `:root {\n    --brand: #f97316;\n}\n.btn {\n    background: var(--brand);\n}`,
  },
  {
    id: 'css-media-query',
    language: 'css',
    title: 'Media query',
    code: `@media (max-width: 640px) {\n    .sidebar {\n        display: none;\n    }\n}`,
  },
  {
    id: 'css-transition',
    language: 'css',
    title: 'Transition + hover',
    code: `.btn {\n    transition: background-color 150ms;\n}\n.btn:hover {\n    background-color: #ea580c;\n}`,
  },
  {
    id: 'css-pseudo',
    language: 'css',
    title: 'Pseudo element',
    code: `.quote::before {\n    content: "\\201C";\n    color: rgba(249, 115, 22, 0.6);\n}`,
  },
  {
    id: 'css-keyframes',
    language: 'css',
    title: 'Keyframes',
    code: `@keyframes blink {\n    0%, 100% { opacity: 1; }\n    50% { opacity: 0; }\n}`,
  },
  {
    id: 'css-nth-child',
    language: 'css',
    title: 'nth-child',
    code: `tbody tr:nth-child(2n) {\n    background: #18181b;\n}`,
  },
]
