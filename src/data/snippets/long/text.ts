import { defineSnippets } from '../define'

/** Bài DÀI cho mốc 60s, nhóm "text" — xem chú thích trong `medium/text.ts`. */
export const textLong = defineSnippets('text', 'txt-long', [
  `{ } [ ] ( ) < >
! @ # $ % ^ & * ( )
- _ = + | \\ / ?
; : ' " , . \` ~
&& || ! == != === !==
< <= > >= <> <=>
+= -= *= /= %= **=
?? ?. ?: ??= => -> |>`,
  `^[a-z0-9_]{3,20}$
\\d{4}-\\d{2}-\\d{2}
(\\w+)@(\\w+)\\.(com|net|org)
[^\\s@]+@[^\\s@]+\\.[^\\s@]+
.*?\\s+(\\d+)\\s*$
s/old/new/g
\\b(?:GET|POST|PUT|DELETE)\\b
[\\u0300-\\u036f]`,
  `$HOME/.config/app.json
C:\\Users\\nhat\\Documents\\code
../../src/lib/index.ts
./dist/assets/index-a1b2c3.js
/var/log/nginx/access.log
~/projects/typre/.env.local
%APPDATA%\\npm\\node_modules
file:///D:/nhat.tran/CodeTyping/`,
  `https://api.site.com/v1/users?id=42&sort=-wpm#top
git@github.com:TypraVN/Typre.git
postgres://user:pass@localhost:5432/app?sslmode=require
mailto:hello@typre.dev?subject=Hi%20there
ws://127.0.0.1:5180/socket
data:image/svg+xml;base64,PHN2Zz4=`,
  `map["key"] = &value;
*ptr++ = --count;
arr[i][j] = matrix[j][i];
obj?.deep?.[key] ?? fallback;
list.filter((x) => x > 0).map((x) => x * 2);
if (!ok) { return -1; }
while (a != b) { a += 1; }
for (let i = 0; i < n; i++) { sum += i; }`,
  `0x1F 0b1010 0o755 1e-9
3.14159 -273.15 6.022e23
9007199254740991 0.1 + 0.2
| pipe > out >> append 2>&1
cmd1 && cmd2 || cmd3 ; cmd4 &
"double" 'single' \`backtick\`
\\n \\t \\r \\\\ \\" \\'
\${value} #{value} %s %d %.2f`,
  `# Heading 1
## Heading 2
**bold** _italic_ ~~strike~~
- [ ] todo item
- [x] done item
> blockquote line
[label](https://example.com)
![alt](/img/pic.png "title")
| col | col |
| --- | --: |`,
  `git switch -c feature/leaderboard
git add -p src/lib/auth.ts
git commit -m "fix: escape template literals"
git rebase -i HEAD~3
git push --force-with-lease origin main
git log --oneline --graph --decorate -20
git stash push -m "wip caret"
git bisect start HEAD v1.2.0`,
  `docker build -t typre:latest --no-cache .
docker run --rm -it -p 8080:80 --env-file .env typre
docker exec -it typre-web sh -lc "npm ls --depth 0"
docker compose up -d --scale worker=3
docker image prune --all --filter "until=168h"
docker logs -f --since 10m --tail 100 typre-web`,
  `SELECT DISTINCT ON (user_id) *
INNER JOIN LEFT JOIN FULL OUTER JOIN
GROUP BY HAVING ORDER BY LIMIT OFFSET
INSERT INTO t ... ON CONFLICT DO UPDATE
CREATE INDEX CONCURRENTLY IF NOT EXISTS
ALTER TABLE t DROP CONSTRAINT c
WITH RECURSIVE cte AS ( ... )
COALESCE NULLIF GREATEST LEAST`,
  `Content-Type: application/json; charset=utf-8
Cache-Control: public, max-age=31536000, immutable
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9
Accept-Encoding: gzip, deflate, br
Access-Control-Allow-Origin: *
Content-Security-Policy: default-src 'self'
X-Request-Id: req_9f2c4a71
Retry-After: 120`,
  `HTTP/1.1 200 OK
HTTP/1.1 201 Created
HTTP/2 204 No Content
HTTP/1.1 301 Moved Permanently
HTTP/1.1 400 Bad Request
HTTP/1.1 401 Unauthorized
HTTP/1.1 422 Unprocessable Entity
HTTP/1.1 429 Too Many Requests
HTTP/1.1 503 Service Unavailable`,
  `^19.0.0 ~5.6.2 >=20 <21
1.4.2-beta.3+build.77
* latest next canary
npm:@scope/pkg@^2.1.0
>=1.2.7 <1.3.0 || >2.0.0
workspace:^ file:../engine
git+https://github.com/u/r.git#v1.0.0`,
  `0 6 * * 1
*/15 * * * *
30 2 1 * *
0 0 * * 0
15 14 1 * *
0 */4 * * 1-5
@daily @hourly @reboot
5 4 * * sun`,
  `NODE_ENV=production
VITE_SUPABASE_URL=https://abc.supabase.co
DATABASE_URL=postgres://u:p@host:5432/db
LOG_LEVEL=debug
PORT=5180
RETRIES=3
TZ=Asia/Ho_Chi_Minh
FEATURE_FLAGS=leaderboard,friends`,
  `SPDX-License-Identifier: MIT
Copyright (c) 2026 NTools
Licensed under the Apache License, Version 2.0
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY
Permission is hereby granted, free of charge
See LICENSE for the full text.`,
  `9f2c4a71-8d3e-4b21-9c77-0a5b6e1f2d43
sha256:1f2e3d4c5b6a7089badc0ffee1234567
0ed741da92c3b5f7e8a91c4d2b6f0837a5e1c9d4
d41d8cd98f00b204e9800998ecf8427e
crc32: 0x4a17b156`,
  `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
data:image/svg+xml;base64,PHN2ZyB4bWxucz0i
c2JfcHVibGlzaGFibGVfa2V5X2V4YW1wbGU=
QUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVo=
MTIzNDU2Nzg5MCEjJCVeJiooKQ==`,
  `\\033[0m \\033[1m \\033[4m
\\033[31m red \\033[32m green
\\033[38;5;208m orange 256
\\033[2K\\r clear line
\\e[?25l hide cursor
\\e[?25h show cursor`,
  `Ctrl+Shift+P
Cmd+Option+I
Alt+F4
Ctrl+K Ctrl+S
gg dd yy p :wq
<leader>ff
Shift+Tab
Ctrl+Alt+Del`,
  `\\u00e9 \\u00fc \\u00f1
\\u2192 \\u21d2 \\u2261
\\u2713 \\u2717 \\u26a0
\\U0001F600 \\U0001F680
&#x2764; &#128512;
U+0300 U+036F`,
  `f(x) = ax^2 + bx + c
sigma = sqrt(sum((x - mean)^2) / n)
cv = sigma / mean
wpm = (correct / 5) / (elapsed / 60)
a^2 + b^2 = c^2
lim n->inf (1 + 1/n)^n = e
0 <= accuracy <= 100`,
  `2400 kg/m3
5.5 kN 12.75 kNm
1.2 m x 3.6 m x 0.2 m
250 mm c/c
28 MPa 400 MPa
72 dpi 1920x1080 px
16.7 ms/frame 60 fps
1.3 MB 140 kB gzip`,
  `$1,650.00 USD
24.500.000 VND
EUR 1.234,56
-0.75% +12.3%
1e6 1_000_000
0.1 + 0.2 = 0.30000000000000004
round(94.55, 1) = 94.6`,
  `2026-08-11T17:04:22.418Z
11/08/2026 17:04
Tue, 11 Aug 2026 17:04:22 GMT
%Y-%m-%d %H:%M:%S
yyyy-MM-dd'T'HH:mm:ssXXX
+07:00 UTC-05:00
P3DT4H30M
1786500000 epoch`,
  `+84 90 123 45 67
(028) 3822 1234
+1 (415) 555-0132
70000 Ho Chi Minh City
SW1A 1AA London
90210-1234`,
  `192.168.1.1/24
10.0.0.0/8
172.16.31.255
127.0.0.1:5180
::1 fe80::1%eth0
2001:0db8:85a3::8a2e:0370:7334
00:1A:2B:3C:4D:5E
0.0.0.0/0`,
  `http 80 https 443
postgres 5432 redis 6379
ssh 22 sftp 22 ftp 21
smtp 587 imap 993
ws 80 wss 443
mongodb 27017
vite 5173 5180 5181`,
  `&amp; &lt; &gt; &quot; &apos;
&nbsp; &ndash; &mdash; &hellip;
&copy; &reg; &trade;
&larr; &rarr; &uarr; &darr;
&times; &divide; &plusmn;
&#8594; &#x2192;`,
  `1rem 1.5em 100vh 50vw 12px
calc(100% - 2rem) min() max() clamp()
rgb(249 115 22 / 35%) #f97316
:hover :focus-visible ::before ::after
> + ~ * [attr^="v"]
!important
--brand: var(--fallback, #000);`,
  `$.data.scores[0].wpm
$..user[?(@.wpm > 60)]
$.store.book[*].author
/data/scores/0/wpm
/definitions/Score/properties/wpm
$[?(@.language == 'rust')]`,
  `//div[@class='leaderboard']
//tr[position() <= 3]/td[2]
//a[contains(@href, 'practice')]
//input[@type='email']/@name
count(//li) > 5
ancestor::section[1]`,
  `src/**/*.{ts,tsx}
!**/node_modules/**
dist/assets/index-*.js
*.log
**/.env.*
src/data/snippets/{long,medium}/*.ts
?(a|b)*.md`,
  `diff --git a/src/App.tsx b/src/App.tsx
index 843e7bf..0ed741d 100644
--- a/src/App.tsx
+++ b/src/App.tsx
@@ -178,7 +178,7 @@
-  const over = status === 'finished'
+  const over = status === 'finished' || left === 0`,
  `feat(engine): finish run when snippet completes
fix(auth): drop facebook provider
perf(shiki): load languages on demand
refactor(board): split filter sidebar
docs(readme): add SQL run order
chore(deps): bump vite to 8.2.0
test(engine): cover tab indent skipping
BREAKING CHANGE: scores.nickname removed`,
  `// TODO: move bag into localStorage
// FIXME: caret drifts on wrapped lines
// HACK: relies on Vite dev transform
// NOTE: anon key is public by design
// XXX: do not ship this branch
// @deprecated use getHighlighterFor()
/* eslint-disable no-console */
// shellcheck disable=SC1090`,
  `TypeError: Cannot read properties of null
    at typeChar (useTypingEngine.ts:171:22)
    at handleKeyDown (useTypingEngine.ts:288:9)
    at HTMLDivElement.callCallback (react-dom.js:4164)
Caused by: PostgrestError: 23514`,
  `error TS2345: Argument of type 'string' is not
    assignable to parameter of type 'CodeLanguage'.
error[E0502]: cannot borrow values as mutable
CS0246: The type or namespace 'Panel' was not found
./src/App.tsx:178:9 - warning: unused variable
ERROR 42P01: relation "profiles" does not exist`,
  `nhat@desktop:~/projects/typre$ npm run build
PS D:\\nhat.tran\\CodeTyping> git status
root@a1b2c3:/app# ls -la
$ export PATH="/c/Program Files/nodejs:$PATH"
> vite build --mode production`,
  `import { useState } from "react";
const fs = require("node:fs");
from pathlib import Path
using System.Collections.Generic;
#include <vector>
use std::collections::HashMap;
package main; import "net/http"
@import url("./tokens.css");`,
  `camelCase snake_case kebab-case
PascalCase SCREAMING_SNAKE_CASE
_privateField __dunder__ $dollar
isValid hasNext canSubmit shouldRetry
getUserById findAllByLanguage
MAX_WPM MIN_ACCURACY DEFAULT_TIME_LIMIT
useTypingEngine useLocalStorage`,
  `API CLI SDK REST GraphQL
JSON YAML TOML CSV XML
HTTP HTTPS TCP UDP DNS
CRUD ACID CAP RLS JWT OAuth
CI CD PR MR LGTM WIP
BIM IFC DWG RVT NWD`,
  `a & b | c ^ d ~e
x << 2 y >> 3 z >>> 1
flags |= READ flags &= ~WRITE
1 << 10 == 1024
0xFF & 0x0F == 0x0F
n & (n - 1) == 0
(low + high) >>> 1`,
  `a ? b : c
x > 0 ? "pos" : x < 0 ? "neg" : "zero"
value ?? fallback ?? "none"
obj?.a?.b ?? 0
cond && doThing()
cond || fallback()
flag ? (a ? 1 : 2) : 3`,
  `(x) => x * 2
x -> x * 2
lambda x: x * 2
|x| x * 2
[](int x) { return x * 2; }
func(x int) int { return x * 2 }
{ $0 * 2 }
fn(x) do x * 2 end`,
  `const n: number = 42;
let items: Array<string> = [];
def f(x: int) -> str: ...
Map<String, List<Integer>> m;
std::vector<std::pair<int, double>> v;
Option<Result<T, E>>
func f(a int) (string, error)
value as unknown as Score`,
  `{ a: [ { b: ( c + d ) } ] }
f(g(h(i(j(k)))))
((a + b) * (c - d)) / ((e % f) + 1)
arr[i][j][k]
obj["a"]["b"]["c"]
<div><ul><li><a></a></li></ul></div>
if (a) { if (b) { if (c) { } } }`,
  `"double \\"inside\\" quotes"
'single \\'inside\\' quotes'
\\\`template \\\${value} literal\\\`
"C:\\\\Users\\\\nhat\\\\file.txt"
r"raw\\dstring"
'''triple quoted'''
"""docstring"""`,
  `// line comment
/* block comment */
/** jsdoc comment */
# hash comment
-- sql comment
<!-- html comment -->
""" python docstring """
%% matlab comment
; ini comment`,
  `asdf jkl; asdf jkl;
;;; ::: ''' """
[[[ ]]] {{{ }}}
<<< >>> ||| &&&
+++ --- *** ///
=== !== >== <==
()()() {}{}{} [][][]`,
  `\\b(?:GET|POST|PUT|PATCH)\\b
(?<year>\\d{4})-(?<month>\\d{2})
[[:alpha:]]+ [[:digit:]]{2,4}
(?i)case-insensitive
(?:non|capturing)+ group
lookahead(?=yes) lookbehind(?<=no)
a{2,5}? lazy quantifier
^\\s*$ blank line`,

  `{ } [ ] ( ) < > | \\ / ~ \`
! @ # $ % ^ & * - _ = +
; : ' " , . ? \\ / | ~
&& || ?? ?. ?: => -> <- |>
== != === !== <= >= <=> =~
+= -= *= /= %= **= ??= ||= &&=
<< >> >>> & | ^ ~ ! %`,
  `^(?<scheme>https?)://(?<host>[^/:]+)(?::(?<port>\\d+))?
(?<path>/[^?#]*)?(?:\\?(?<query>[^#]*))?(?:#(?<hash>.*))?$

^\\s*(?<key>[A-Za-z_][A-Za-z0-9_]*)\\s*=\\s*(?<value>.*?)\\s*$
^(?!#)(?<flag>--[a-z][a-z-]*)(?:=(?<arg>.+))?$
(?<=\\b)(?<num>-?\\d+(?:\\.\\d+)?(?:[eE][-+]?\\d+)?)(?=\\b)`,
  `git switch -c fix/leaderboard-filter-order
git add -p src/components/Leaderboard.tsx
git commit -m "move time filter above the language list"
git rebase -i origin/main
git push --force-with-lease origin fix/leaderboard-filter-order
gh pr create --fill --base main
git tag -a v1.2.0 -m "progress chart"
git push origin --tags`,
  `HTTP/2 200
content-type: application/json; charset=utf-8
cache-control: public, max-age=31536000, immutable
content-encoding: br
etag: W/"1f2e3d4c"
x-vercel-cache: HIT
strict-transport-security: max-age=63072000; includeSubDomains
content-security-policy: default-src 'self'; img-src 'self' data:`,
  `D:\\nhat.tran\\CodeTyping\\src\\data\\snippets\\bulk\\rust.ts
/usr/local/share/typre/dist/assets/index-BAo6nlUo.js
~/.config/typre/settings.json
../../../scripts/generate-seo-pages.mjs
file:///C:/Users/nhat/AppData/Local/Temp/build.log
\\\\?\\UNC\\server\\share\\folder\\file.txt
s3://typre-backups/db-20260830-104204.sql.gz`,
  `#!/usr/bin/env bash
set -euo pipefail
IFS=$'\\n\\t'

: "\${API_URL:?missing}" "\${TOKEN:?missing}"

curl -sf -X POST "$API_URL/scores" \\
    -H "Authorization: Bearer $TOKEN" \\
    -H 'Content-Type: application/json' \\
    -d '{"wpm":96,"accuracy":97.4}' \\
    | jq -r '.id // empty' \\
    || { echo "submit failed" >&2; exit 1; }`,
  `\\u0000 \\u001b[0m \\u00a0 \\u2028 \\u2029
\\uFEFF (BOM)  \\u200B (zero width)  \\u00AD (soft hyphen)
\\U0001F680 \\U0001F4A9 \\U0001F1FB\\U0001F1F3
&amp; &lt; &gt; &quot; &#39; &#x2764;
%20 %2F %3A %3F %23 %5B %5D
\\x41\\x42\\x43 = ABC
\\r\\n vs \\n vs \\r`,
  `SELECT DISTINCT ON (s.user_id) s.*
FROM public.scores AS s
WHERE s.created_at >= now() - INTERVAL '7 days'
    AND s.wpm BETWEEN 1 AND 300
    AND s.language = ANY($1::text[])
ORDER BY s.user_id, s.wpm DESC, s.created_at ASC
LIMIT $2 OFFSET $3;`,
  `Ctrl+Shift+P    Cmd+Shift+P     command palette
Ctrl+\`          Cmd+\`           toggle terminal
Alt+Up          Option+Up       move line up
Ctrl+D          Cmd+D           add next occurrence
Ctrl+Shift+K    Cmd+Shift+K     delete line
F2                              rename symbol
dd  gg  G  :wq  ciw  ci"  %  *  n  .`,
  `--- a/src/components/Leaderboard.tsx
+++ b/src/components/Leaderboard.tsx
@@ -223,7 +223,7 @@ export function Leaderboard({
-        <div className="flex flex-col gap-1 pt-4 border-t">
+        <div className="grid grid-cols-2 gap-x-1 gap-y-0.5">
             {languages.map((lang) => (
                 <button key={lang} type="button">
-                    {lang}
+                    {lang}
                 </button>
             ))}`,
])
