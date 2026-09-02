import { defineSnippets } from '../define'

/**
 * Bài TRUNG BÌNH cho mốc 30s, nhóm "text" — vẫn là luyện ký tự đặc biệt, chỉ dài hơn:
 * nhiều dòng toàn dấu ngoặc, toán tử và ký hiệu regex/shell.
 */
export const textMedium = defineSnippets('text', 'txt-med', [
  `{ } [ ] ( ) < >
! @ # $ % ^ & * ~
- _ = + | \\ / ?`,
  `&& || ! == != === !==
< <= > >= <> <=>
+= -= *= /= %= **=`,
  `^[a-z0-9_]{3,20}$
\\d{4}-\\d{2}-\\d{2}
(\\w+)@(\\w+)\\.(com|net|org)`,
  `/* block */ // line # hash
<!-- markup --> -- sql
""" python """ \`\`\` fence`,
  `$HOME/.config/app.json
C:\\Users\\nhat\\Documents\\code
../../src/lib/index.ts`,
  `https://api.site.com/v1/users?id=42&sort=-wpm#top
git@github.com:TypraVN/Typre.git`,
  `map["key"] = &value;
*ptr++ = --count;
arr[i][j] = matrix[j][i];`,
  `if (!ok) { return -1; }
while (a != b) { a += 1; }
for (;;) { break; }`,
  `0x1F 0b1010 0o755 1e-9
3.14159 -273.15 6.022e23`,
  `| pipe > out >> append 2>&1
cmd1 && cmd2 || cmd3 ; cmd4 &`,
  `# Heading 1
**bold** _italic_ ~~strike~~
- [ ] todo
[label](https://example.com)`,
  `git switch -c feature/leaderboard
git commit -m "fix: escape literals"
git push --force-with-lease`,
  `docker build -t typre:latest .
docker run --rm -p 8080:80 typre
docker image prune --all`,
  `SELECT DISTINCT ON (user_id) *
GROUP BY HAVING ORDER BY LIMIT
ON CONFLICT DO UPDATE`,
  `Content-Type: application/json
Cache-Control: no-store, max-age=0
Authorization: Bearer eyJhbGci`,
  `HTTP/1.1 200 OK
HTTP/1.1 401 Unauthorized
HTTP/1.1 429 Too Many Requests`,
  `^19.0.0 ~5.6.2 >=20 <21
1.4.2-beta.3+build.77
workspace:^ file:../engine`,
  `0 6 * * 1
*/15 * * * *
@daily @hourly @reboot`,
  `NODE_ENV=production
PORT=5180
TZ=Asia/Ho_Chi_Minh`,
  `SPDX-License-Identifier: MIT
Copyright (c) 2026 NTools
Licensed under Apache License 2.0`,
  `9f2c4a71-8d3e-4b21-9c77-0a5b6e1f2d43
sha256:1f2e3d4c5b6a7089badc0ffee
d41d8cd98f00b204e9800998ecf8427e`,
  `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
QUJDREVGR0hJSktMTU5PUFFSUw==`,
  `\\033[0m \\033[1m \\033[31m
\\033[2K\\r \\e[?25l`,
  `Ctrl+Shift+P
Cmd+Option+I
Ctrl+K Ctrl+S
gg dd yy p :wq`,
  `\\u00e9 \\u2192 \\u2713
\\U0001F680 &#x2764;
U+0300 U+036F`,
  `sigma = sqrt(sum((x - mean)^2) / n)
wpm = (correct / 5) / (elapsed / 60)
0 <= accuracy <= 100`,
  `2400 kg/m3 5.5 kN 28 MPa
250 mm c/c 1.2 m x 3.6 m
16.7 ms/frame 60 fps`,
  `$1,650.00 USD
24.500.000 VND
-0.75% +12.3% 1e6`,
  `2026-08-11T17:04:22.418Z
%Y-%m-%d %H:%M:%S
+07:00 P3DT4H30M`,
  `+84 90 123 45 67
+1 (415) 555-0132
SW1A 1AA 90210-1234`,
  `192.168.1.1/24
127.0.0.1:5180
2001:0db8:85a3::8a2e:0370:7334`,
  `http 80 https 443
postgres 5432 redis 6379
ws 80 wss 443`,
  `&amp; &lt; &gt; &quot;
&nbsp; &mdash; &hellip;
&larr; &rarr; &times;`,
  `1rem 1.5em 100vh 50vw
calc(100% - 2rem) clamp()
:hover ::before [attr^="v"]`,
  `$.data.scores[0].wpm
$..user[?(@.wpm > 60)]
/definitions/Score/properties`,
  `//div[@class='leaderboard']
//tr[position() <= 3]/td[2]
count(//li) > 5`,
  `src/**/*.{ts,tsx}
!**/node_modules/**
dist/assets/index-*.js`,
  `--- a/src/App.tsx
+++ b/src/App.tsx
@@ -178,7 +178,7 @@`,
  `feat(engine): finish run on completion
fix(auth): drop facebook provider
chore(deps): bump vite to 8.2.0`,
  `// TODO: move bag into localStorage
// FIXME: caret drifts on wrap
/* eslint-disable no-console */`,
  `TypeError: Cannot read properties of null
    at typeChar (useTypingEngine.ts:171:22)`,
  `error TS2345: Argument of type 'string'
error[E0502]: cannot borrow as mutable
ERROR 42P01: relation does not exist`,
  `nhat@desktop:~/projects$ npm run build
PS D:\\nhat.tran> git status
root@a1b2c3:/app# ls -la`,
  `import { useState } from "react";
from pathlib import Path
use std::collections::HashMap;`,
  `camelCase snake_case kebab-case
PascalCase SCREAMING_SNAKE_CASE
_private __dunder__ $dollar`,
  `API CLI SDK REST GraphQL
JSON YAML TOML CSV XML
CRUD ACID RLS JWT OAuth`,
  `a & b | c ^ d ~e
x << 2 y >> 3 z >>> 1
n & (n - 1) == 0`,
  `x > 0 ? "pos" : x < 0 ? "neg" : "zero"
value ?? fallback ?? "none"
obj?.a?.b ?? 0`,
  `(x) => x * 2
lambda x: x * 2
|x| x * 2
{ $0 * 2 }`,
  `const n: number = 42;
def f(x: int) -> str: ...
Option<Result<T, E>>`,
  `f(g(h(i(j(k)))))
((a + b) * (c - d)) / (e % f)
<div><ul><li></li></ul></div>`,
  `"double \\"inside\\" quotes"
\\\`template \\\${value}\\\`
"C:\\\\Users\\\\nhat"`,
  `asdf jkl; asdf jkl;
[[[ ]]] {{{ }}}
+++ --- *** ///`,
  `\\b(?:GET|POST|PUT)\\b
(?<year>\\d{4})-(?<month>\\d{2})
lookahead(?=yes) ^\\s*$`,

  `(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})
(?:https?://)?(?<host>[^/]+)/(?<path>.*)
^\\s*(?!#)(?<key>[A-Z_]+)=(?<value>.*)$`,
  `git rebase --onto main feature~3 feature
git cherry-pick -x 4b83e49
git log --graph --oneline --decorate --all`,
  `npm pkg set scripts.check="tsc --noEmit"
npx vite build --mode staging --emptyOutDir
pnpm dlx @vercel/ncc build src/index.ts`,
  `select * from t where a <> b and c !~ '^x';
update t set n = n + 1 where id = any($1::int[]);
insert into t values (default) on conflict do nothing;`,
  `Content-Security-Policy: default-src 'self'
Strict-Transport-Security: max-age=63072000
Permissions-Policy: camera=(), microphone=()`,
  `const re = /(?<=\\$)\\d+(?:\\.\\d{2})?/gu;
const ok = /^[\\p{L}\\p{N}_-]{3,20}$/u.test(name);
const parts = path.split(/[\\\\/]+/);`,
  `x |> f |> g |> h
compose(f, g, h)(x)
pipe(x, f, g, h)`,
  `+--+ +==+ |##|
|  | |  | +--+
+--+ +==+ |##|`,
  `0.1 + 0.2 !== 0.3
Number.EPSILON = 2.220446049250313e-16
Number.MAX_SAFE_INTEGER = 9007199254740991`,
  `--dry-run --force --no-verify
-vvv -q --quiet=false
--exclude='*.map' --include='*.js'`,
])
