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
  `.card-list {
    container-type: inline-size;
}

@container (min-width: 480px) {
    .card {
        grid-template-columns: auto 1fr;
    }
}`,
  `.field:has(input:invalid) label {
    color: #f87171;
}

.card:has(> img) {
    padding-top: 0;
}`,
  `.leaderboard {
    border-collapse: collapse;

    & th {
        text-align: left;
        opacity: 0.6;
    }
}`,
  `.page {
    display: grid;
    grid-template-areas:
        "header header"
        "sidebar main";
    grid-template-columns: 220px minmax(0, 1fr);
}`,
  `.rows > .row {
    display: grid;
    grid-column: 1 / -1;
    grid-template-columns: subgrid;
    align-items: center;
}`,
  `.gallery > figure {
    flex: 1 1 clamp(160px, 20vw, 260px);
    margin: 0;
    min-width: 0;
}`,
  `.thumb {
    aspect-ratio: 16 / 9;
    overflow: hidden;
}

.thumb img {
    width: 100%;
    object-fit: cover;
}`,
  `h1 {
    font-size: clamp(1.75rem, 1.2rem + 2.5vw, 3.5rem);
    line-height: 1.1;
    text-wrap: balance;
}`,
  `.container {
    width: min(100% - 2rem, 1100px);
    margin-inline: auto;
    padding-block: max(2rem, 4vh);
}`,
  `.notice {
    padding-inline: 1rem;
    border-inline-start: 3px solid var(--brand);
    text-align: start;
}`,
  `.carousel {
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
}

.carousel > * {
    scroll-snap-align: center;
}`,
  `.site-header {
    position: sticky;
    top: 0;
    z-index: 20;
    backdrop-filter: blur(8px) saturate(140%);
}`,
  `.overlay {
    position: fixed;
    inset: 0;
    display: grid;
    place-items: center;
    background: rgb(0 0 0 / 60%);
}`,
  `.steps {
    counter-reset: step;
}

.steps > li::before {
    counter-increment: step;
    content: counter(step);
    color: var(--brand);
}`,
  `.external::after {
    content: " \\2197";
    font-size: 0.85em;
}

.required label::after {
    content: "*";
    color: #f87171;
}`,
  `.excerpt {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
}`,
  `.one-line {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 22ch;
}`,
  `.snippet-path {
    overflow-wrap: anywhere;
    font-variant-ligatures: none;
    tab-size: 4;
}`,
  `.changelog {
    columns: 2 18rem;
    column-gap: 2.5rem;
    column-rule: 1px solid rgb(255 255 255 / 8%);
}`,
  `.divider {
    height: 1px;
    background: linear-gradient(
        90deg,
        transparent,
        #52525b,
        transparent
    );
}`,
  `.raised {
    box-shadow:
        0 1px 2px rgb(0 0 0 / 20%),
        0 4px 12px rgb(0 0 0 / 25%);
}`,
  `:focus-visible {
    outline: 2px solid var(--brand);
    outline-offset: 2px;
}

button:focus:not(:focus-visible) {
    outline: none;
}`,
  `.row {
    transition: transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
}

.row:hover {
    transform: translateX(2px);
}`,
  `.flip {
    perspective: 800px;
    transform-style: preserve-3d;
}

.flip:hover > .front {
    transform: rotateY(180deg);
}`,
  `@media (prefers-reduced-motion: reduce) {
    * {
        animation-duration: 1ms !important;
        transition-duration: 1ms !important;
    }
}`,
  `@media print {
    .site-header,
    .no-print {
        display: none !important;
    }

    body {
        background: #fff;
        color: #000;
    }
}`,
  `@supports selector(:has(*)) {
    .field:has(:invalid) {
        border-color: #f87171;
    }
}`,
  `:where(h1, h2, h3) {
    margin-block: 0 0.5em;
    text-wrap: balance;
}

:is(.card, .panel) :is(p, li) {
    opacity: 0.78;
}`,
  `a[href^="https://"]:not([href*="typre.app"]) {
    text-decoration-style: dotted;
}

[hidden] {
    display: none !important;
}`,
  `input[type="checkbox"]:checked + label {
    text-decoration: line-through;
    opacity: 0.6;
}`,
  `input:user-invalid {
    border-color: #f87171;
}

input:disabled {
    cursor: not-allowed;
    opacity: 0.45;
}`,
  `:root {
    accent-color: var(--brand);
    caret-color: var(--brand);
}

::selection {
    background: rgb(249 115 22 / 35%);
}`,
  `.scroll-area {
    scrollbar-width: thin;
    scrollbar-color: #52525b transparent;
}

.no-scrollbar::-webkit-scrollbar {
    display: none;
}`,
  `@font-face {
    font-family: "JetBrains Mono";
    src: url("/fonts/jbmono.woff2") format("woff2");
    font-display: swap;
}`,
  `.thumb.muted {
    filter: grayscale(1) brightness(0.8);
    transition: filter 200ms ease;
}

.thumb.muted:hover {
    filter: none;
}`,
  `.fade-bottom {
    mask-image: linear-gradient(180deg, #000 70%, transparent);
}

.badge {
    clip-path: polygon(0 0, 100% 0, 92% 100%, 0 100%);
}`,
  `:root[data-theme="light"] {
    --bg: #ffffff;
    --fg: #18181b;
}

body {
    background: var(--bg);
    color: var(--fg);
}`,
  `@layer reset, base, components;

@layer reset {
    * {
        box-sizing: border-box;
    }
}`,
  `.stat-value {
    font-variant-numeric: tabular-nums;
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--brand);
}`,
  `.visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
}`,
])
