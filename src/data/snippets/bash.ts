import type { Snippet } from '../types'

export const bashSnippets: Snippet[] = [
  {
    id: 'bash-git',
    language: 'bash',
    title: 'Git commands',
    code: `git checkout -b feature/login\ngit add .\ngit commit -m "add login form"`,
  },
  {
    id: 'bash-grep-pipe',
    language: 'bash',
    title: 'Grep + pipe',
    code: `cat app.log | grep -i "error" | wc -l`,
  },
  {
    id: 'bash-if',
    language: 'bash',
    title: 'If statement',
    code: `if [ -f "$FILE" ]; then\n  echo "found"\nfi`,
  },
  {
    id: 'bash-for-loop',
    language: 'bash',
    title: 'For loop',
    code: `for file in *.txt; do\n  mv "$file" "backup/$file"\ndone`,
  },
  {
    id: 'bash-npm',
    language: 'bash',
    title: 'npm / docker',
    code: `npm install --save-dev vitest\ndocker run -p 3000:3000 -d my-app`,
  },
  {
    id: 'bash-find-exec',
    language: 'bash',
    title: 'Find + exec',
    code: `find . -name "*.tmp" -type f -delete`,
  },
  {
    id: 'bash-env-export',
    language: 'bash',
    title: 'Env + chain',
    code: `export NODE_ENV=production && npm run build`,
  },
  {
    id: 'bash-function',
    language: 'bash',
    title: 'Function',
    code: `deploy() {\n  local env="$1"\n  echo "deploying to $env..."\n}`,
  },
  {
    id: 'bash-curl',
    language: 'bash',
    title: 'curl + jq',
    code: `curl -s -H "Authorization: Bearer $TOKEN" \\\n  https://api.example.com/users | jq '.[].name'`,
  },
  {
    id: 'bash-case',
    language: 'bash',
    title: 'Case statement',
    code: `case "$1" in\n  start) run_server ;;\n  stop)  kill_server ;;\n  *)     echo "usage: $0 {start|stop}" ;;\nesac`,
  },
  {
    id: 'bash-ssh-rsync',
    language: 'bash',
    title: 'ssh + rsync',
    code: `rsync -avz --delete ./dist/ user@host:/var/www/app/`,
  },
  {
    id: 'bash-while-read',
    language: 'bash',
    title: 'While read',
    code: `while IFS= read -r line; do\n  echo "> $line"\ndone < input.txt`,
  },
]
