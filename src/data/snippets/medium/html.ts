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
])
