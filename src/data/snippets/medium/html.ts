import { defineSnippets } from '../define'

/** Bài TRUNG BÌNH cho mốc 30s — xem chú thích trong `medium/javascript.ts`. */
export const htmlMedium = defineSnippets('html', 'html-med', [
  `<form action="/login" method="post">
    <label for="email">Email</label>
    <input id="email" type="email" required />
    <button type="submit">Sign in</button>
</form>`,
  `<nav aria-label="main">
    <a href="/">home</a>
    <a href="/leaderboard">leaderboard</a>
    <a href="/about">about</a>
</nav>`,
  `<table>
    <thead>
        <tr><th>rank</th><th>name</th><th>wpm</th></tr>
    </thead>
    <tbody>
        <tr><td>1</td><td>nhat</td><td>92</td></tr>
    </tbody>
</table>`,
  `<select name="language" id="language">
    <option value="csharp">C#</option>
    <option value="rust">Rust</option>
    <option value="go" selected>Go</option>
</select>`,
  `<section class="card">
    <h2>Result</h2>
    <p><strong>92</strong> wpm &middot; 97% accuracy</p>
</section>`,
  `<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="description" content="Practice typing code." />
<link rel="canonical" href="https://www.typre.dev/" />`,
  `<dialog id="signin" aria-modal="true">
    <h2>Sign in</h2>
    <button autofocus>Continue with GitHub</button>
</dialog>`,
  `<picture>
    <source srcset="/hero.webp" type="image/webp" />
    <img src="/hero.png" alt="Typing screen" width="640" />
</picture>`,
  `<details open>
    <summary>Keyboard shortcuts</summary>
    <p>Press <kbd>Esc</kbd> to restart the run.</p>
</details>`,
  `<ul class="stats">
    <li><span>wpm</span><strong>92</strong></li>
    <li><span>accuracy</span><strong>97%</strong></li>
</ul>`,
  `<main id="main">
    <h1>Typre</h1>
    <p>Type real code, not random words.</p>
</main>`,
  `<a class="skip" href="#main">Skip to content</a>

<header role="banner">
    <a class="logo" href="/">Typre</a>
</header>`,
  `<footer role="contentinfo">
    <p><small>&copy; 2026 Typre</small></p>
    <a href="/privacy" rel="nofollow">Privacy</a>
</footer>`,
  `<label for="notes">Session notes</label>

<textarea id="notes" rows="4" maxlength="500"></textarea>`,
  `<input
    id="csv"
    type="file"
    accept=".csv,text/csv"
    required
/>`,
  `<label for="speed">Target speed</label>

<input id="speed" type="range" min="20" max="200" value="60" />
<output for="speed">60 wpm</output>`,
  `<progress id="done" max="100" value="72">72%</progress>

<meter min="0" max="100" low="80" high="95" value="97">97%</meter>`,
  `<fieldset>
    <legend>Time limit</legend>

    <label><input type="radio" name="limit" value="30" /> 30s</label>
</fieldset>`,
  `<input id="q" list="players" type="search" />

<datalist id="players">
    <option value="nhat97"></option>
</datalist>`,
  `<button type="button" aria-pressed="false" class="toggle">
    Sound off
</button>

<button type="submit" disabled>Submit</button>`,
  `<p>
    Set on <time datetime="2026-08-11">11 August</time> by
    <strong>nhat97</strong> at <mark>112 wpm</mark>.
</p>`,
  `<figure>
    <blockquote cite="https://example.com">
        <p>Accuracy first, speed follows.</p>
    </blockquote>
    <figcaption><cite>A calm developer</cite></figcaption>
</figure>`,
  `<p>Press <kbd>Esc</kbd> to restart.</p>

<pre><code>npm run dev
npm run build</code></pre>`,
  `<table class="totals">
    <tfoot>
        <tr>
            <td colspan="2">total</td>
            <td>84</td>
        </tr>
    </tfoot>
</table>`,
  `<ol start="3" reversed>
    <li>Enable OAuth providers</li>
    <li>Add environment variables</li>
</ol>`,
  `<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M11 5 6 9H2v6h4l5 4V5Z" />
</svg>`,
  `<canvas id="wpm-chart" width="640" height="240" role="img"></canvas>

<noscript>
    <p>Typre needs JavaScript.</p>
</noscript>`,
  `<template id="row-template">
    <tr class="score-row">
        <td class="rank"></td>
        <td class="name"></td>
    </tr>
</template>`,
  `<meta property="og:title" content="Typre" />
<meta property="og:image" content="/og-card.png" />
<meta name="twitter:card" content="summary_large_image" />`,
  `<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
<link rel="manifest" href="/manifest.webmanifest" />
<link rel="canonical" href="https://typre.app/" />`,
  `<script type="module" src="/src/main.tsx"></script>
<script nomodule src="/legacy/bundle.js" defer></script>`,
  `<iframe
    src="/preview/index.html"
    title="Snippet preview"
    loading="lazy"
    sandbox="allow-scripts"
></iframe>`,
  `<video controls preload="metadata" poster="/img/poster.jpg">
    <source src="/media/demo.webm" type="video/webm" />
</video>`,
  `<audio controls loop preload="none">
    <source src="/media/click.mp3" type="audio/mpeg" />
</audio>`,
  `<p id="announce" role="status" aria-live="polite">
    Ready when you are.
</p>

<p role="alert" aria-live="assertive" hidden>Submit failed.</p>`,
  `<div role="tablist" aria-label="Practice modes">
    <button role="tab" aria-selected="true">Type code</button>
    <button role="tab" aria-selected="false">Shortcuts</button>
</div>`,
  `<nav aria-label="Breadcrumb">
    <ol>
        <li><a href="/">Home</a></li>
        <li><a href="/practice" aria-current="page">Practice</a></li>
    </ol>
</nav>`,
  `<nav class="pagination" aria-label="Pages">
    <a href="?page=2" rel="prev">&larr;</a>
    <a href="?page=4" rel="next">&rarr;</a>
</nav>`,
  `<article class="card">
    <h3>Rust &middot; 60s</h3>
    <p class="big">84 <span>wpm</span></p>
    <p class="muted">96% accuracy</p>
</article>`,
  `<a
    href="https://github.com/TypraVN/Typre"
    rel="noopener noreferrer"
    target="_blank"
>GitHub</a>`,
  `<ul class="skeleton" aria-busy="true">
    <li><span class="bar"></span></li>
    <li><span class="bar"></span></li>
</ul>`,
  `<li data-id="9f2" data-language="rust" data-wpm="84">
    <span class="name">nhat97</span>
    <button type="button" data-action="edit">edit</button>
</li>`,
  `<section lang="fr">
    <h2>Entrainement au clavier</h2>
    <p>Tapez du vrai code.</p>
</section>`,
  `<form role="search" action="/search" method="get">
    <label for="s" class="visually-hidden">Search</label>
    <input id="s" name="q" type="search" required />
</form>`,
  `<input
    id="user"
    type="text"
    pattern="[a-z0-9_]{3,20}"
    aria-describedby="user-rule"
/>`,
  `<optgroup label="Systems">
    <option value="rust">Rust</option>
    <option value="cpp" disabled>C++</option>
</optgroup>`,
  `<div itemscope itemtype="https://schema.org/Person">
    <h2 itemprop="name">Nhat Tran</h2>
    <span itemprop="jobTitle">BIM engineer</span>
</div>`,

  `<search>
    <form role="search" action="/players">
        <input type="search" name="q" aria-label="Find a player" />
    </form>
</search>`,
  `<button popovertarget="tips" popovertargetaction="show">
    Shortcuts
</button>

<div id="tips" popover>Press Esc to restart.</div>`,
  `<input
    type="text"
    name="username"
    autocomplete="username"
    spellcheck="false"
    autocapitalize="none"
/>`,
  `<link rel="preload" href="/fonts/jetbrains.woff2" as="font"
    type="font/woff2" crossorigin />`,
  `<img
    src="/screenshot.png"
    srcset="/screenshot.png 1x, /screenshot@2x.png 2x"
    loading="lazy"
    decoding="async"
    alt="Typing a Rust snippet"
/>`,
  `<table>
    <caption>Best run per language</caption>
    <colgroup>
        <col span="1" style="width: 40%" />
    </colgroup>
</table>`,
  `<form method="dialog">
    <button value="cancel">Cancel</button>
    <button value="confirm">Delete history</button>
</form>`,
  `<ul role="list" aria-describedby="hint">
    <li><a href="/practice/rust/">Rust</a></li>
    <li><a href="/practice/go/">Go</a></li>
</ul>`,
  `<script type="application/ld+json">
    { "@context": "https://schema.org", "@type": "WebApplication" }
</script>`,
  `<div class="wrap" inert>
    <button type="button">Cannot be focused</button>
</div>`,
])
