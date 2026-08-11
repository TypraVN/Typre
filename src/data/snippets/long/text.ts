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
])
