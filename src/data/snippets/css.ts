import type { Snippet } from '../types'

// Tách khỏi nhóm html: ở đây là CSS thuần, không bọc trong <style> nên grammar `css`
// highlight đúng từ dòng đầu.
export const cssSnippets: Snippet[] = [
  {
    id: 'css-flex-center',
    language: 'css',
    title: 'Flex center',
    code: `.card {\n    display: flex;\n    place-items: center;\n}`,
  },
  {
    id: 'css-grid',
    language: 'css',
    title: 'Grid template',
    code: `.layout {\n    display: grid;\n    gap: 1rem;\n}`,
  },
  {
    id: 'css-variables',
    language: 'css',
    title: 'Custom properties',
    code: `:root {\n    --brand: #f97316;\n    --radius: 12px;\n}`,
  },
  {
    id: 'css-media-query',
    language: 'css',
    title: 'Media query',
    code: `@media (max-width: 640px) {\n    .sidebar { display: none; }\n}`,
  },
  {
    id: 'css-transition',
    language: 'css',
    title: 'Transition + hover',
    code: `.btn:hover {\n    background-color: #ea580c;\n    transform: translateY(-1px);\n}`,
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
