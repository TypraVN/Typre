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
  `.card-list {
    container-type: inline-size;
    container-name: list;
}

@container list (min-width: 480px) {
    .card {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 1rem;
    }
}

@container list (max-width: 320px) {
    .card .muted {
        display: none;
    }
}`,
  `.field:has(input:invalid) label {
    color: #f87171;
}

.card:has(> img) {
    padding-top: 0;
}

form:has(button[type="submit"]:disabled) .hint {
    opacity: 0.5;
}

.row:has(+ .row:hover) {
    border-bottom-color: var(--brand);
}`,
  `.leaderboard {
    width: 100%;
    border-collapse: collapse;

    & th {
        text-align: left;
        font-weight: 400;
        opacity: 0.6;
    }

    & tbody tr {
        &:hover {
            background: rgb(255 255 255 / 4%);
        }

        &.mine {
            background: rgb(249 115 22 / 12%);
        }
    }
}`,
  `@property --shine {
    syntax: "<percentage>";
    inherits: false;
    initial-value: 0%;
}

.progress {
    background: linear-gradient(
        90deg,
        var(--brand) var(--shine),
        transparent 0
    );
    transition: --shine 400ms ease-out;
}

.progress:hover {
    --shine: 100%;
}`,
  `.page {
    display: grid;
    gap: 1rem;
    grid-template-areas:
        "header header"
        "sidebar main"
        "footer footer";
    grid-template-columns: 220px minmax(0, 1fr);
}

.page > header {
    grid-area: header;
}

.page > main {
    grid-area: main;
}`,
  `.rows {
    display: grid;
    grid-template-columns: 3rem 1fr 4rem 5rem;
    gap: 0.5rem;
}

.rows > .row {
    display: grid;
    grid-column: 1 / -1;
    grid-template-columns: subgrid;
    align-items: center;
}`,
  `.gallery {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    align-items: stretch;
}

.gallery > figure {
    flex: 1 1 clamp(160px, 20vw, 260px);
    margin: 0;
    min-width: 0;
}

.gallery > figure:first-child {
    flex-basis: 100%;
}`,
  `.thumb {
    aspect-ratio: 16 / 9;
    width: 100%;
    overflow: hidden;
    border-radius: 8px;
}

.thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center top;
}

.avatar {
    aspect-ratio: 1;
    object-fit: contain;
}`,
  `h1 {
    font-size: clamp(1.75rem, 1.2rem + 2.5vw, 3.5rem);
    line-height: 1.1;
    text-wrap: balance;
}

p {
    font-size: clamp(0.95rem, 0.9rem + 0.3vw, 1.125rem);
    max-width: 68ch;
    text-wrap: pretty;
}`,
  `.container {
    width: min(100% - 2rem, 1100px);
    margin-inline: auto;
    padding-block: max(2rem, 4vh);
}

.sidebar {
    width: clamp(180px, 22%, 320px);
    height: calc(100vh - var(--header-height, 64px));
    position: sticky;
    top: var(--header-height, 64px);
}`,
  `.notice {
    padding-inline: 1rem;
    padding-block: 0.75rem;
    margin-inline-start: auto;
    border-inline-start: 3px solid var(--brand);
    border-start-start-radius: 8px;
    text-align: start;
}

[dir="rtl"] .notice {
    font-family: "Noto Sans Arabic", sans-serif;
}`,
  `.carousel {
    display: flex;
    gap: 1rem;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scroll-padding-inline: 1rem;
    overscroll-behavior-x: contain;
}

.carousel > * {
    flex: 0 0 80%;
    scroll-snap-align: center;
    scroll-snap-stop: always;
}`,
  `.site-header {
    position: sticky;
    top: 0;
    z-index: 20;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1.25rem;
    background: rgb(24 24 27 / 80%);
    backdrop-filter: blur(8px) saturate(140%);
    border-bottom: 1px solid rgb(255 255 255 / 6%);
}`,
  `.overlay {
    position: fixed;
    inset: 0;
    z-index: 50;
    display: grid;
    place-items: center;
    padding: 1rem;
    background: rgb(0 0 0 / 60%);
}

dialog::backdrop {
    background: rgb(0 0 0 / 55%);
    backdrop-filter: blur(2px);
}`,
  `.steps {
    counter-reset: step;
    list-style: none;
    padding-inline-start: 0;
}

.steps > li {
    counter-increment: step;
    position: relative;
    padding-inline-start: 2.5rem;
}

.steps > li::before {
    content: counter(step);
    position: absolute;
    inset-inline-start: 0;
    color: var(--brand);
    font-variant-numeric: tabular-nums;
}`,
  `.quote::before {
    content: open-quote;
    font-size: 2.5rem;
    line-height: 0;
    opacity: 0.4;
}

.external::after {
    content: " \\2197";
    font-size: 0.85em;
}

.required label::after {
    content: "*";
    color: #f87171;
    margin-inline-start: 0.15rem;
}`,
  `.excerpt {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.one-line {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 22ch;
}`,
  `.snippet-path {
    overflow-wrap: anywhere;
    word-break: break-word;
    hyphens: auto;
    font-variant-ligatures: none;
    tab-size: 4;
}

.no-wrap {
    white-space: pre;
    tab-size: 2;
}`,
  `.changelog {
    columns: 2 18rem;
    column-gap: 2.5rem;
    column-rule: 1px solid rgb(255 255 255 / 8%);
}

.changelog h3 {
    break-after: avoid;
    margin-block-start: 0;
}

.changelog li {
    break-inside: avoid;
}`,
  `.hero {
    background-image:
        linear-gradient(180deg, rgb(0 0 0 / 60%), transparent),
        radial-gradient(circle at 30% 20%, #f97316, transparent 60%),
        conic-gradient(from 210deg, #18181b, #27272a);
    background-blend-mode: screen;
}

.divider {
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
        0 4px 12px rgb(0 0 0 / 25%),
        inset 0 1px 0 rgb(255 255 255 / 6%);
}

.pressed {
    box-shadow: inset 0 2px 6px rgb(0 0 0 / 45%);
    transform: translateY(1px);
}`,
  `:focus-visible {
    outline: 2px solid var(--brand);
    outline-offset: 2px;
    border-radius: 4px;
}

button:focus:not(:focus-visible) {
    outline: none;
}

.input:focus-within {
    border-color: var(--brand);
    box-shadow: 0 0 0 3px rgb(249 115 22 / 25%);
}`,
  `.row {
    transition:
        background-color 160ms ease,
        color 160ms ease,
        transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
}

.row:hover {
    transform: translateX(2px);
}

@media (prefers-reduced-motion: reduce) {
    .row {
        transition-duration: 1ms;
    }
}`,
  `.flip {
    perspective: 800px;
    transform-style: preserve-3d;
}

.flip > .face {
    backface-visibility: hidden;
    transition: transform 420ms ease;
    transform-origin: center;
}

.flip:hover > .front {
    transform: rotateY(180deg) translateZ(1px);
}`,
  `@keyframes blink {
    0%,
    49% {
        opacity: 1;
    }
    50%,
    100% {
        opacity: 0;
    }
}

.caret {
    display: inline-block;
    width: 2px;
    background: var(--brand);
    animation: blink 1s steps(1, end) infinite;
}`,
  `:root {
    color-scheme: dark light;
    --bg: #18181b;
    --fg: #fafafa;
}

@media (prefers-color-scheme: light) {
    :root {
        --bg: #ffffff;
        --fg: #18181b;
    }
}

@media (prefers-contrast: more) {
    :root {
        --fg: #000000;
    }
}`,
  `@media print {
    .site-header,
    .site-footer,
    .no-print {
        display: none !important;
    }

    body {
        background: #fff;
        color: #000;
        font-size: 11pt;
    }

    a[href]::after {
        content: " (" attr(href) ")";
    }
}`,
  `@supports (container-type: inline-size) {
    .card-list {
        container-type: inline-size;
    }
}

@supports not (aspect-ratio: 1) {
    .thumb {
        padding-top: 56.25%;
    }
}

@supports selector(:has(*)) {
    .field:has(:invalid) {
        border-color: #f87171;
    }
}`,
  `:where(h1, h2, h3, h4) {
    margin-block: 0 0.5em;
    text-wrap: balance;
}

:is(.card, .panel, .dialog) :is(p, li) {
    color: rgb(228 228 231 / 78%);
}

:is(button, [role="button"]):not(:disabled) {
    cursor: pointer;
}`,
  `a[href^="https://"]:not([href*="typre.app"]) {
    text-decoration-style: dotted;
}

input[type="checkbox"]:checked + label {
    text-decoration: line-through;
    opacity: 0.6;
}

button[data-action="remove"] {
    color: #f87171;
}

[hidden] {
    display: none !important;
}`,
  `tbody tr:nth-child(odd) {
    background: rgb(255 255 255 / 3%);
}

tbody tr:nth-child(-n + 3) .rank {
    font-weight: 700;
}

.grid > *:nth-child(3n) {
    grid-column: span 2;
}

li:last-child {
    border-bottom: 0;
}`,
  `input:user-invalid {
    border-color: #f87171;
}

input:placeholder-shown + .float-label {
    transform: translateY(0.6rem);
    opacity: 0.6;
}

input:disabled,
select:disabled {
    cursor: not-allowed;
    opacity: 0.45;
}

input:required + label::after {
    content: " (required)";
}`,
  `:root {
    accent-color: var(--brand);
    caret-color: var(--brand);
}

::selection {
    background: rgb(249 115 22 / 35%);
    color: #fff;
}

::placeholder {
    color: rgb(228 228 231 / 40%);
    font-style: italic;
}`,
  `.scroll-area {
    scrollbar-width: thin;
    scrollbar-color: #52525b transparent;
    scrollbar-gutter: stable;
}

.scroll-area::-webkit-scrollbar {
    width: 8px;
}

.scroll-area::-webkit-scrollbar-thumb {
    background: #52525b;
    border-radius: 4px;
}

.no-scrollbar::-webkit-scrollbar {
    display: none;
}`,
  `@font-face {
    font-family: "JetBrains Mono";
    src:
        url("/fonts/jetbrains-mono.woff2") format("woff2"),
        url("/fonts/jetbrains-mono.woff") format("woff");
    font-weight: 400 700;
    font-style: normal;
    font-display: swap;
    unicode-range: U+0000-00FF, U+0131, U+2000-206F;
}`,
  `.thumb.muted {
    filter: grayscale(1) brightness(0.8) contrast(1.1);
    transition: filter 200ms ease;
}

.thumb.muted:hover {
    filter: none;
}

.overlay-text {
    mix-blend-mode: difference;
    isolation: isolate;
}`,
  `.badge {
    clip-path: polygon(0 0, 100% 0, 92% 100%, 0 100%);
}

.fade-bottom {
    mask-image: linear-gradient(180deg, #000 70%, transparent);
}

.reveal {
    clip-path: inset(0 100% 0 0);
    transition: clip-path 380ms ease-out;
}

.reveal.shown {
    clip-path: inset(0 0 0 0);
}`,
  `:root[data-theme="dark"] {
    --bg: #18181b;
    --fg: #fafafa;
    --muted: #a1a1aa;
}

:root[data-theme="light"] {
    --bg: #ffffff;
    --fg: #18181b;
    --muted: #52525b;
}

body {
    background: var(--bg);
    color: var(--fg);
    transition: background-color 200ms ease;
}`,
  `@layer reset, base, components, utilities;

@layer reset {
    *,
    *::before,
    *::after {
        box-sizing: border-box;
    }
}

@layer components {
    .btn {
        border-radius: 8px;
    }
}

@layer utilities {
    .mt-0 {
        margin-top: 0;
    }
}`,
  `:target {
    scroll-margin-block-start: 5rem;
    animation: highlight 1.2s ease-out;
}

@keyframes highlight {
    from {
        background: rgb(249 115 22 / 25%);
    }
}

::view-transition-old(root),
::view-transition-new(root) {
    animation-duration: 220ms;
}`,
  `.code-box {
    cursor: text;
    user-select: none;
    caret-color: transparent;
}

.drag-handle {
    cursor: grab;
    touch-action: none;
}

.drag-handle:active {
    cursor: grabbing;
}

.pill {
    pointer-events: none;
    user-select: all;
}`,
  `.visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
    border: 0;
}

.skip:focus {
    position: static;
    width: auto;
    height: auto;
}`,
  `.stat-value {
    font-variant-numeric: tabular-nums lining-nums;
    font-feature-settings: "tnum" 1, "zero" 1;
    letter-spacing: -0.02em;
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--brand);
}

.stat-label {
    text-transform: lowercase;
    letter-spacing: 0.08em;
    opacity: 0.55;
}`,
  `.list > li {
    opacity: 0;
    animation: fade-in 260ms ease-out forwards;
}

.list > li:nth-child(1) {
    animation-delay: 40ms;
}

.list > li:nth-child(2) {
    animation-delay: 80ms;
}

.list > li:nth-child(3) {
    animation-delay: 120ms;
}`,

  `:root {
    --accent: #f97316;
    --surface: #18181b;
    --text: #fafafa;
    --muted: color-mix(in srgb, var(--text) 55%, transparent);
    --radius: 12px;
    --shadow: 0 8px 24px rgb(0 0 0 / 0.35);
}

:root[data-theme="light"] {
    --surface: #ffffff;
    --text: #18181b;
    --shadow: 0 8px 24px rgb(0 0 0 / 0.08);
}

body {
    background: var(--surface);
    color: var(--text);
}`,
  `.leaderboard {
    display: grid;
    grid-template-columns: 3ch 1fr repeat(4, minmax(4ch, auto));
    align-items: center;
    gap: 0.25rem 1rem;
    font-variant-numeric: tabular-nums;
}

.leaderboard > .rank {
    justify-self: end;
    color: var(--muted);
}

.leaderboard > .me {
    background: color-mix(in srgb, var(--accent) 12%, transparent);
    border-radius: var(--radius);
}`,
  `@keyframes level-pop {
    0% {
        scale: 0.6;
        opacity: 0;
    }

    60% {
        scale: 1.08;
        opacity: 1;
    }

    100% {
        scale: 1;
        opacity: 1;
    }
}

.level-badge {
    animation: level-pop 420ms cubic-bezier(0.22, 1, 0.36, 1);
}

@media (prefers-reduced-motion: reduce) {
    .level-badge {
        animation: none;
    }
}`,
  `.chart {
    --track: color-mix(in srgb, var(--text) 12%, transparent);

    display: grid;
    grid-template-rows: 1fr auto;
    gap: 0.5rem;
    block-size: 10rem;
}

.chart .line {
    fill: none;
    stroke: var(--accent);
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
}

.chart .grid-line {
    stroke: var(--track);
    stroke-width: 1;
}`,
  `.snippet {
    font-family: "JetBrains Mono", ui-monospace, monospace;
    font-variant-ligatures: none;
    font-feature-settings: "liga" 0, "calt" 0;
    line-height: 1.6;
    tab-size: 4;
    white-space: pre;
}

.snippet .typed {
    color: var(--text);
}

.snippet .pending {
    color: var(--muted);
}

.snippet .wrong {
    color: #f87171;
    text-decoration: underline wavy;
}`,
  `@layer reset, tokens, base, components, utilities;

@layer reset {
    *,
    *::before,
    *::after {
        box-sizing: border-box;
        margin: 0;
    }

    img,
    svg,
    video {
        display: block;
        max-inline-size: 100%;
    }
}

@layer base {
    body {
        min-block-size: 100dvh;
        font-family: system-ui, sans-serif;
    }
}`,
  `.dialog {
    border: 1px solid color-mix(in srgb, var(--text) 15%, transparent);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    padding: 1.5rem;
    max-inline-size: min(32rem, 90vw);
}

.dialog::backdrop {
    background: rgb(0 0 0 / 0.55);
    backdrop-filter: blur(2px);
}

@starting-style {
    .dialog[open] {
        opacity: 0;
        translate: 0 8px;
    }
}`,
  `.filters {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    inline-size: 12rem;
}

.filters .group + .group {
    border-block-start: 1px solid
        color-mix(in srgb, var(--text) 10%, transparent);
    padding-block-start: 1rem;
}

.filters .languages {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.125rem 0.25rem;
}`,
  `@media print {
    nav,
    .filters,
    .report-button {
        display: none;
    }

    body {
        color: #000;
        background: #fff;
    }

    a[href^="http"]::after {
        content: " (" attr(href) ")";
        font-size: 0.8em;
    }

    .leaderboard {
        break-inside: avoid;
    }
}`,
  `.progress {
    --value: 0;

    position: relative;
    block-size: 0.5rem;
    border-radius: 999px;
    background: color-mix(in srgb, var(--text) 12%, transparent);
    overflow: hidden;
}

.progress::after {
    content: "";
    position: absolute;
    inset-block: 0;
    inset-inline-start: 0;
    inline-size: calc(var(--value) * 1%);
    background: linear-gradient(90deg, var(--accent), #fdba74);
    transition: inline-size 300ms ease-out;
}`,
])
