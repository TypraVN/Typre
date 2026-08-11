import { defineSnippets } from '../define'

/** Bài DÀI cho mốc 60s — xem chú thích trong `long/javascript.ts`. */
export const htmlLong = defineSnippets('html', 'html-long', [
  `<!doctype html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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
        <input id="password" name="password" type="password" minlength="8" />

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
])
