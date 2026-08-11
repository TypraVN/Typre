import { defineSnippets } from '../define'

/** Bài DÀI cho mốc 60s — xem chú thích trong `long/javascript.ts`. */
export const htmlLong = defineSnippets('html', 'html-long', [
  `<!doctype html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta
            name="viewport"
            content="width=device-width, initial-scale=1"
        />
        <title>Typre</title>
    </head>
    <body>
        <div id="root"></div>
        <script type="module" src="/src/main.tsx"></script>
    </body>
</html>`,
  `<form class="signin" action="/api/login" method="post">
    <fieldset>
        <legend>Sign in</legend>

        <label for="email">Email</label>
        <input id="email" name="email" type="email" required />

        <label for="password">Password</label>
        <input
            id="password"
            name="password"
            type="password"
            minlength="8"
        />

        <button type="submit">Continue</button>
    </fieldset>
</form>`,
  `<table class="leaderboard">
    <caption>Top scores this week</caption>
    <thead>
        <tr>
            <th scope="col">rank</th>
            <th scope="col">name</th>
            <th scope="col">wpm</th>
            <th scope="col">accuracy</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>1</td>
            <td>nhat</td>
            <td>92</td>
            <td>97%</td>
        </tr>
    </tbody>
</table>`,
  `<header class="site-header">
    <a class="logo" href="/">Typre</a>

    <nav aria-label="main">
        <a href="/practice">practice</a>
        <a href="/leaderboard">leaderboard</a>
        <a href="/shortcuts">shortcuts</a>
    </nav>

    <button type="button" aria-expanded="false" aria-controls="menu">
        Account
    </button>
</header>`,
  `<article class="card">
    <h2>Result</h2>

    <dl class="stats">
        <dt>wpm</dt>
        <dd>92</dd>

        <dt>accuracy</dt>
        <dd>97%</dd>

        <dt>consistency</dt>
        <dd>88%</dd>
    </dl>

    <footer>
        <button type="button">reset</button>
        <button type="button">next snippet</button>
    </footer>
</article>`,
  `<section id="languages">
    <h2>Practice in 14 languages</h2>

    <ul>
        <li><a href="/practice/javascript">JavaScript</a></li>
        <li><a href="/practice/typescript">TypeScript</a></li>
        <li><a href="/practice/csharp">C#</a></li>
        <li><a href="/practice/rust">Rust</a></li>
        <li><a href="/practice/go">Go</a></li>
    </ul>
</section>`,
  `<body>
    <a class="skip" href="#main">Skip to content</a>

    <header role="banner">
        <h1>Typre</h1>
    </header>

    <main id="main">
        <h2>Practice</h2>
        <p>Type real code, not random words.</p>
    </main>

    <aside aria-label="tips">
        <p>Press Esc to restart.</p>
    </aside>

    <footer role="contentinfo">
        <small>&copy; 2026 Typre</small>
    </footer>
</body>`,
  `<picture>
    <source
        media="(min-width: 900px)"
        srcset="/img/hero-wide.avif"
        type="image/avif"
    />
    <source
        media="(min-width: 900px)"
        srcset="/img/hero-wide.webp"
        type="image/webp"
    />
    <img
        src="/img/hero.jpg"
        alt="A developer typing code"
        width="1200"
        height="600"
        loading="lazy"
        decoding="async"
    />
</picture>`,
  `<video
    controls
    preload="metadata"
    poster="/img/demo-poster.jpg"
    width="640"
>
    <source src="/media/demo.webm" type="video/webm" />
    <source src="/media/demo.mp4" type="video/mp4" />

    <track
        kind="captions"
        src="/media/demo.en.vtt"
        srclang="en"
        label="English"
        default
    />

    Your browser cannot play this video.
</video>`,
  `<figure class="keystroke-sample">
    <figcaption>Keyboard sound sample</figcaption>

    <audio controls loop preload="none">
        <source src="/media/click.ogg" type="audio/ogg" />
        <source src="/media/click.mp3" type="audio/mpeg" />

        <a href="/media/click.mp3" download>Download the clip</a>
    </audio>
</figure>`,
  `<section class="embed">
    <h2>Live preview</h2>

    <iframe
        src="/preview/index.html"
        title="Snippet preview"
        width="640"
        height="360"
        loading="lazy"
        sandbox="allow-scripts allow-same-origin"
        referrerpolicy="no-referrer"
    ></iframe>
</section>`,
  `<section class="faq">
    <h2>Questions</h2>

    <details open>
        <summary>Do I need an account?</summary>
        <p>No. Sign in only to appear on the leaderboard.</p>
    </details>

    <details>
        <summary>Which languages are supported?</summary>
        <p>Fourteen, from JavaScript to SQL.</p>
    </details>
</section>`,
  `<dialog id="signin" aria-labelledby="signin-title">
    <form method="dialog">
        <h2 id="signin-title">Sign in</h2>

        <label for="mail">Email</label>
        <input id="mail" name="mail" type="email" required />

        <menu>
            <button value="cancel">Cancel</button>
            <button value="ok" autofocus>Continue</button>
        </menu>
    </form>
</dialog>`,
  `<section class="run-stats">
    <label for="done">Progress</label>
    <progress id="done" max="100" value="72">72%</progress>

    <label for="acc">Accuracy</label>
    <meter
        id="acc"
        min="0"
        max="100"
        low="80"
        high="95"
        optimum="100"
        value="97"
    >97%</meter>
</section>`,
  `<label for="lang">Language</label>

<select id="lang" name="language" required>
    <optgroup label="Web">
        <option value="javascript" selected>JavaScript</option>
        <option value="typescript">TypeScript</option>
        <option value="css">CSS</option>
    </optgroup>

    <optgroup label="Systems">
        <option value="rust">Rust</option>
        <option value="cpp" disabled>C++</option>
    </optgroup>
</select>`,
  `<label for="search">Find a player</label>

<input
    id="search"
    name="player"
    list="players"
    type="search"
    placeholder="start typing a name"
    autocomplete="off"
/>

<datalist id="players">
    <option value="nhat97"></option>
    <option value="typravn"></option>
    <option value="anon-42"></option>
</datalist>`,
  `<form class="settings">
    <label for="when">Session date</label>
    <input id="when" type="date" name="when" />

    <label for="goal">Target wpm</label>
    <input id="goal" type="number" min="10" max="300" step="5" />

    <label for="theme">Accent colour</label>
    <input id="theme" type="color" value="#f97316" />

    <label for="site">Profile link</label>
    <input id="site" type="url" placeholder="https://" />
</form>`,
  `<fieldset>
    <legend>Time limit</legend>

    <label for="t15">
        <input id="t15" type="radio" name="limit" value="15" />
        15 seconds
    </label>

    <label for="t30">
        <input id="t30" type="radio" name="limit" value="30" checked />
        30 seconds
    </label>

    <label for="t60">
        <input id="t60" type="radio" name="limit" value="60" />
        60 seconds
    </label>
</fieldset>`,
  `<div class="field">
    <label for="notes">Session notes</label>

    <textarea
        id="notes"
        name="notes"
        rows="5"
        cols="40"
        maxlength="500"
        placeholder="What went wrong this run?"
        spellcheck="true"
    ></textarea>

    <p class="hint">Up to 500 characters.</p>
</div>`,
  `<form action="/api/import" method="post"
      enctype="multipart/form-data">
    <label for="csv">Import scores</label>

    <input
        id="csv"
        name="file"
        type="file"
        accept=".csv,text/csv"
        required
    />

    <button type="submit">Upload</button>
</form>`,
  `<form class="tuning">
    <label for="speed">Target speed</label>

    <input
        id="speed"
        type="range"
        name="speed"
        min="20"
        max="200"
        step="5"
        value="60"
    />

    <output for="speed" name="shown">60 wpm</output>
</form>`,
  `<div class="actions">
    <button type="submit" form="signin">Sign in</button>
    <button type="reset">Clear</button>

    <button type="button" disabled aria-disabled="true">
        Submit to leaderboard
    </button>

    <button type="button" aria-pressed="false" class="toggle">
        Sound off
    </button>
</div>`,
  `<p>
    The record was set on
    <time datetime="2026-08-11T17:04">11 August at 17:04</time>
    by <strong>nhat97</strong>, who reached
    <mark>112 wpm</mark> on a
    <abbr title="sixty second">60s</abbr> run.
</p>

<address>
    Questions? <a href="mailto:hi@typre.app">hi@typre.app</a>
</address>`,
  `<figure class="quote">
    <blockquote cite="https://example.com/interview">
        <p>Speed only matters once accuracy stops moving.</p>
    </blockquote>

    <figcaption>
        &mdash; <cite>An unreasonably calm developer</cite>
    </figcaption>
</figure>`,
  `<section class="shortcuts">
    <h2>Keyboard</h2>

    <p>Press <kbd>Esc</kbd> to restart, <kbd>Tab</kbd> for a run.</p>

    <pre><code>npm run dev
npm run build</code></pre>

    <p>Output was <samp>built in 421ms</samp>.</p>
    <p>Set <var>timeLimit</var> to 60 for long snippets.</p>
</section>`,
  `<table class="totals">
    <colgroup>
        <col span="1" class="name-col" />
        <col span="2" class="number-col" />
    </colgroup>

    <thead>
        <tr>
            <th scope="col">language</th>
            <th scope="col">runs</th>
            <th scope="col">best</th>
        </tr>
    </thead>

    <tbody>
        <tr>
            <th scope="row">rust</th>
            <td>18</td>
            <td>84</td>
        </tr>
    </tbody>

    <tfoot>
        <tr>
            <td colspan="2">total</td>
            <td>84</td>
        </tr>
    </tfoot>
</table>`,
  `<ol start="3" reversed>
    <li>
        Set up the database
        <ul>
            <li>Run <code>schema.sql</code></li>
            <li>Create the leaderboard view</li>
        </ul>
    </li>
    <li>Enable OAuth providers</li>
    <li>Add environment variables</li>
</ol>`,
  `<button type="button" class="icon-button" aria-label="Mute sound">
    <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        aria-hidden="true"
    >
        <path d="M11 5 6 9H2v6h4l5 4V5Z" />
        <line x1="23" y1="9" x2="17" y2="15" />
    </svg>
</button>`,
  `<section class="chart">
    <h2>WPM over time</h2>

    <canvas
        id="wpm-chart"
        width="640"
        height="240"
        role="img"
        aria-label="Speed for each second of the run"
    >
        <table>
            <tr><th>second</th><th>wpm</th></tr>
            <tr><td>1</td><td>48</td></tr>
        </table>
    </canvas>
</section>`,
  `<template id="row-template">
    <tr class="score-row">
        <td class="rank"></td>
        <td class="name"></td>
        <td class="wpm"></td>
    </tr>
</template>

<score-card wpm="92" accuracy="97">
    <span slot="player">nhat97</span>
    <span slot="note">personal best</span>
</score-card>`,
  `<head>
    <meta charset="utf-8" />
    <meta name="description" content="Practice typing real code." />
    <meta name="theme-color" content="#f97316" />

    <meta property="og:title" content="Typre" />
    <meta property="og:type" content="website" />
    <meta property="og:image" content="/og-card.png" />

    <meta name="twitter:card" content="summary_large_image" />
</head>`,
  `<head>
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="manifest" href="/manifest.webmanifest" />
    <link rel="canonical" href="https://typre.app/practice" />

    <link
        rel="preload"
        href="/fonts/jetbrains-mono.woff2"
        as="font"
        type="font/woff2"
        crossorigin
    />

    <link rel="preconnect" href="https://fonts.gstatic.com" />
</head>`,
  `<body>
    <div id="root"></div>

    <script type="module" src="/src/main.tsx"></script>
    <script nomodule src="/legacy/bundle.js" defer></script>

    <script type="application/json" id="bootstrap">
        { "language": "rust", "timeLimit": 60 }
    </script>

    <noscript>
        <p>Typre needs JavaScript to measure your typing.</p>
    </noscript>
</body>`,
  `<form action="/leaderboard" method="get" autocomplete="off">
    <input type="hidden" name="page" value="1" />

    <label for="q">Player</label>
    <input id="q" name="q" type="search" autocomplete="username" />

    <label for="filter-lang">Language</label>
    <select id="filter-lang" name="language">
        <option value="">all</option>
        <option value="go">Go</option>
    </select>

    <button type="submit">Filter</button>
</form>`,
  `<div class="run-status">
    <p id="timer" aria-live="off">0:30</p>

    <p id="announce" role="status" aria-live="polite">
        Ready when you are.
    </p>

    <p id="errors" role="alert" aria-live="assertive" hidden>
        Submit failed. Try again.
    </p>
</div>`,
  `<div class="tabs">
    <div role="tablist" aria-label="Practice modes">
        <button
            role="tab"
            id="tab-code"
            aria-selected="true"
            aria-controls="panel-code"
        >Type code</button>

        <button
            role="tab"
            id="tab-keys"
            aria-selected="false"
            aria-controls="panel-keys"
        >Shortcuts</button>
    </div>

    <div role="tabpanel" id="panel-code" aria-labelledby="tab-code">
        <p>Fourteen languages, three time limits.</p>
    </div>
</div>`,
  `<nav aria-label="Breadcrumb">
    <ol class="breadcrumb">
        <li><a href="/">Home</a></li>
        <li><a href="/practice">Practice</a></li>
        <li>
            <a href="/practice/rust" aria-current="page">Rust</a>
        </li>
    </ol>
</nav>`,
  `<nav aria-label="Leaderboard pages" class="pagination">
    <a href="?page=2" rel="prev" aria-label="Previous page">
        &larr;
    </a>

    <ol>
        <li><a href="?page=1">1</a></li>
        <li><a href="?page=2">2</a></li>
        <li><a href="?page=3" aria-current="page">3</a></li>
    </ol>

    <a href="?page=4" rel="next" aria-label="Next page">
        &rarr;
    </a>
</nav>`,
  `<section class="cards">
    <h2>Recent runs</h2>

    <div class="grid">
        <article class="card">
            <h3>Rust &middot; 60s</h3>
            <p class="big">84 <span>wpm</span></p>
            <p class="muted">96% accuracy &middot; 2 hours ago</p>
        </article>

        <article class="card">
            <h3>SQL &middot; 30s</h3>
            <p class="big">71 <span>wpm</span></p>
            <p class="muted">99% accuracy &middot; yesterday</p>
        </article>
    </div>
</section>`,
  `<footer class="site-footer">
    <nav aria-label="Elsewhere">
        <a
            href="https://github.com/TypraVN/Typre"
            rel="noopener noreferrer external"
            target="_blank"
        >GitHub</a>

        <a href="/privacy" rel="nofollow">Privacy</a>
    </nav>

    <p><small>Built with Vite. Hosted for free.</small></p>
</footer>`,
  `<main class="error-page">
    <h1>404</h1>
    <p>That page does not exist &mdash; or it moved.</p>

    <ul>
        <li><a href="/">Start a run</a></li>
        <li><a href="/leaderboard">See the leaderboard</a></li>
    </ul>

    <p class="muted">
        Broken link? Email
        <a href="mailto:hi@typre.app">hi@typre.app</a>
    </p>
</main>`,
  `<ul class="skeleton" aria-busy="true" aria-live="polite">
    <li>
        <span class="bar bar-rank"></span>
        <span class="bar bar-name"></span>
        <span class="bar bar-wpm"></span>
    </li>
    <li>
        <span class="bar bar-rank"></span>
        <span class="bar bar-name"></span>
        <span class="bar bar-wpm"></span>
    </li>
</ul>`,
  `<ul id="score-list">
    <li data-id="9f2" data-language="rust" data-wpm="84">
        <span class="name">nhat97</span>
        <button type="button" data-action="edit">edit</button>
        <button type="button" data-action="remove">remove</button>
    </li>

    <li data-id="a71" data-language="sql" data-wpm="71">
        <span class="name">typravn</span>
        <button type="button" data-action="edit">edit</button>
    </li>
</ul>`,
  `<section lang="vi">
    <h2>Luyen go code</h2>
    <p>Go code that, khong phai chu ngau nhien.</p>
</section>

<section lang="fr">
    <h2>Entrainement au clavier</h2>
    <p>Tapez du vrai code.</p>
</section>

<p>The word <span lang="fr">bibliotheque</span> means library.</p>`,
  `<div itemscope itemtype="https://schema.org/Person">
    <h2 itemprop="name">Nhat Tran</h2>

    <p>
        <span itemprop="jobTitle">Precast BIM engineer</span> at
        <span itemprop="worksFor">NTools</span>
    </p>

    <a itemprop="url" href="https://typre.app/u/nhat97">Profile</a>
    <meta itemprop="knowsLanguage" content="vi, en" />
</div>`,
  `<img
    src="/img/keyboard.png"
    alt="Keyboard layout"
    width="800"
    height="300"
    usemap="#keys"
/>

<map name="keys">
    <area shape="rect" coords="0,0,60,40" href="#esc" alt="Esc" />
    <area shape="rect" coords="61,0,120,40" href="#tab" alt="Tab" />
</map>`,
  `<form role="search" action="/search" method="get">
    <label for="site-search" class="visually-hidden">
        Search Typre
    </label>

    <input
        id="site-search"
        name="q"
        type="search"
        required
        aria-describedby="search-hint"
    />

    <p id="search-hint">Search snippets, players, languages.</p>
    <button type="submit">Search</button>
</form>`,
  `<article class="post">
    <header>
        <h2>Why ligatures break a typing trainer</h2>
        <p class="byline">
            by <a href="/u/nhat97" rel="author">nhat97</a> on
            <time datetime="2026-08-08">8 August 2026</time>
        </p>
    </header>

    <p>JetBrains Mono merges two characters into one glyph.</p>

    <footer>
        <p>Tagged: <a href="/tags/fonts" rel="tag">fonts</a></p>
    </footer>
</article>`,
  `<picture class="art">
    <source
        media="(orientation: portrait)"
        srcset="/img/card-tall.webp"
    />
    <source
        media="(min-width: 1200px)"
        srcset="/img/card-ultra.webp"
    />
    <img
        src="/img/card.webp"
        alt="Leaderboard screenshot"
        loading="eager"
        fetchpriority="high"
    />
</picture>`,
  `<form novalidate class="signup">
    <label for="user">Username</label>
    <input
        id="user"
        name="username"
        type="text"
        pattern="[a-z0-9_]{3,20}"
        required
        aria-describedby="user-rule"
    />
    <p id="user-rule">3&ndash;20 chars: a&ndash;z, 0&ndash;9, _</p>

    <label for="pass">Password</label>
    <input id="pass" name="password" type="password" minlength="8" />

    <button type="submit">Create account</button>
</form>`,
])
