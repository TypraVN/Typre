import { defineSnippets } from '../define'

/** Bài TRUNG BÌNH cho mốc 30s — xem chú thích trong `medium/javascript.ts`. */
export const cssMedium = defineSnippets('css', 'css-med', [
  `.card {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem 1.5rem;
    border-radius: 12px;
}`,
  `.grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1rem;
}`,
  `:root {
    --brand: #f97316;
    --bg: #1f1f1f;
    --radius: 12px;
}`,
  `.btn {
    background: var(--brand);
    color: #fff;
    transition: background-color 150ms ease-in-out;
}

.btn:hover {
    background: #ea580c;
}`,
  `@media (max-width: 640px) {
    .sidebar { display: none; }
    .content { padding-inline: 1rem; }
}`,
  `@keyframes caret-blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
}`,
  `.code {
    font-family: "JetBrains Mono", monospace;
    font-variant-ligatures: none;
    white-space: pre-wrap;
    line-height: 28px;
}`,
  `tbody tr:nth-child(2n) {
    background: rgba(255, 255, 255, 0.03);
}

tbody tr:hover {
    background: rgba(249, 115, 22, 0.08);
}`,
  `.modal {
    position: fixed;
    inset: 0;
    display: grid;
    place-items: center;
    background: rgb(0 0 0 / 60%);
}`,
  `@media (prefers-color-scheme: dark) {
    body {
        background: #1f1f1f;
        color: #e4e4e7;
    }
}`,
])
