<div align="center">

# Typre

**Typing practice for programmers.** You type real code, not prose.

[**typre.dev**](https://www.typre.dev) · free · no account needed · works offline

![Typre](public/og.png)

</div>

---

Most typing trainers feed you English prose. But the keys that actually slow you down while
programming are `{}`, `[]`, `=>`, `&&`, `::`, `?.` — and prose never contains them.

Typre only serves real code: 2,170 hand-picked snippets across 14 languages, in 15, 30 and
60 second runs.

## What makes it different

- **No repeated snippets.** Snippets come from a shuffle bag — you never see the same one
  twice until you have been through the whole pool, and that survives a page reload.
- **Separate pool per run length.** A 15 second run is one short idiom, not the first three
  lines of something longer. Each language has its own short/medium/long pools.
- **Works offline.** Every snippet ships in the bundle. Install it and keep practising on a
  plane.
- **A drill for punctuation alone** — `{} [] <> | ~ ^ && => !== ?. ?? <=>` — plus a separate
  trainer for VS Code and Vim shortcuts.

## Features

| | |
|---|---|
| **Languages** | JavaScript, TypeScript, C#, Python, Java, Go, Rust, C/C++, SQL, Bash, HTML, CSS, JSON, special characters |
| **Metrics** | WPM, CPM, raw WPM, accuracy, consistency, and the characters you mistyped most |
| **Progress** | XP, levels, achievements, daily streak |
| **Leaderboard** | per language × run length, all-time / this week / today, everyone or just friends |
| **Multiplayer** | real-time races on the same snippet, and challenge links to beat a score |
| **Your own code** | paste a snippet from your codebase and type that instead |
| **Accounts** | Google, GitHub, email + password, or a magic link |

Shortcuts: `Esc` restart · after a run, `Tab` retry and `Enter` next snippet.

## Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:5180

| Command | What it does |
|---|---|
| `npm run dev` | Dev server — **does not typecheck** |
| `npm run build` | Typecheck, build, then generate the static language pages |
| `npm run preview` | Serve the production build |
| `npm run lint` | oxlint |
| `npm run indexnow` | Submit sitemap URLs to Bing/Yandex (run *after* deploying) |

> Run `npm run build` regularly. The dev server uses esbuild, which strips types without
> checking them — code with type errors runs fine in dev and then breaks the deploy.

## Architecture notes

Things that are load-bearing and not obvious from the file names:

- **Shiki is loaded fine-grained.** `createHighlighterCore` plus a dynamic import per
  language, instead of the full bundle. That took the highlighter from 11 MB across 309
  files down to 1.3 MB across 12.
- **Lazy chunks self-heal.** Static hosting only keeps the newest deploy's files, so a tab
  opened before a deploy has dead chunk URLs. `lib/lazyChunk.ts` reloads the page once when
  an import fails, then shows a message rather than silently doing nothing.
- **The service worker refuses HTML under `/assets/`.** SPA hosting answers a deleted file
  with `index.html` and a 200, so a naive cache-first worker will store that HTML under a
  `.js` URL forever.
- **Snippet ids come from array position.** Challenge links are `#/c/<lang>/<time>/<id>/<wpm>`,
  so inserting a snippet in the middle of a list silently repoints everyone's saved links.
  Append to the end.
- **The 14 `/practice/<language>/` pages are static files**, generated after `vite build` by
  `scripts/generate-seo-pages.mjs`. Counts and sample snippets are read from the real data,
  never hardcoded.

## Backend (optional)

The app **runs fine without a backend** — you only lose the leaderboard and accounts, and
both hide themselves rather than erroring.

To enable it, see [supabase/README.md](supabase/README.md). Run the SQL in this order on a
fresh project:

1. `schema.sql` — `scores` table + RLS
2. `leaderboard-view.sql` — one row per player
3. `add-raw-consistency.sql` — raw and consistency columns
4. `migration-add-languages.sql` — allow the newer languages
5. `migration-account-features.sql` — `profiles` + `friendships`
6. `add-leaderboard-periods.sql` — weekly and daily views
7. `add-xp-sync.sql` — XP column and the capped increment function

Then set two environment variables:

```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

## Deploying

Vercel detects Vite and needs no configuration. `vercel.json` does one thing: cache
`/assets/*` forever (the filenames are content-hashed) while keeping `index.html` and
`sw.js` uncached — cache those and users get stuck on an old build.

After you have a real domain, update **Supabase → Authentication → URL Configuration**
(*Site URL* and *Redirect URLs*) and your **GitHub OAuth App** homepage URL. The **Google**
redirect URI points at Supabase, not at the app, so it stays as it is. Forgetting this is
the usual reason sign-in works locally and fails in production.

## Security

- `VITE_SUPABASE_ANON_KEY` is **public by design** — it ships in the JavaScript bundle. What
  protects the data is Row Level Security, not hiding the key.
- Supabase service keys and OAuth client secrets go in the Supabase dashboard only, never in
  `.env` or frontend code.
- **Known limitation: WPM is measured client-side.** Someone with DevTools can submit a fake
  score *for their own account*. The database rejects impossible values (`wpm > 300`,
  `accuracy < 50%`) and RLS prevents writing as someone else, but there is no server-side
  verification of a run. Treat the leaderboard as a bit of fun.

## Stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · Zustand · Shiki · Supabase
