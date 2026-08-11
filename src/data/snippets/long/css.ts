import { defineSnippets } from '../define'

/** Bài DÀI cho mốc 60s — xem chú thích trong `long/javascript.ts`. */
export const cssLong = defineSnippets('css', 'css-long', [
  `:root {
    --brand: #f97316;
    --bg: #1f1f1f;
    --fg: #e4e4e7;
    --radius: 12px;
    --gap: 1rem;
}

body {
    margin: 0;
    background: var(--bg);
    color: var(--fg);
    font-family: "JetBrains Mono", monospace;
    line-height: 1.6;
}`,
  `.card {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1.25rem 1.5rem;
    border: 1px solid rgb(255 255 255 / 8%);
    border-radius: var(--radius);
    box-shadow: 0 4px 16px rgb(0 0 0 / 35%);
}

.card:hover {
    border-color: var(--brand);
}`,
  `.btn {
    padding: 0.5rem 1rem;
    border: 1px solid transparent;
    border-radius: 8px;
    background: var(--brand);
    color: #fff;
    cursor: pointer;
    transition: background-color 150ms ease, transform 120ms ease;
}

.btn:hover {
    background: #ea580c;
    transform: translateY(-1px);
}

.btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}`,
  `.layout {
    display: grid;
    grid-template-columns: 240px 1fr;
    grid-template-rows: auto 1fr auto;
    min-height: 100vh;
}

@media (max-width: 768px) {
    .layout {
        grid-template-columns: 1fr;
    }

    .sidebar {
        display: none;
    }
}`,
  `@keyframes fade-in-up {
    from {
        opacity: 0;
        transform: translateY(6px);
    }
    to {
        opacity: 1;
        transform: none;
    }
}

.panel {
    animation: fade-in-up 240ms ease-out both;
}

@media (prefers-reduced-motion: reduce) {
    .panel {
        animation: none;
    }
}`,
  `.code {
    font-family: "JetBrains Mono", monospace;
    font-size: 1.125rem;
    line-height: 28px;
    white-space: pre-wrap;
    font-variant-ligatures: none;
    padding: 1rem;
    border-radius: var(--radius);
}

.code .pending {
    opacity: 0.4;
}

.code .incorrect {
    color: #f87171;
    background: rgb(239 68 68 / 40%);
}`,
])
