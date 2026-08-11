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
])
