import { defineSnippets } from '../define'

/** Bài TRUNG BÌNH cho mốc 30s — xem chú thích trong `medium/javascript.ts`. */
export const bashMedium = defineSnippets('bash', 'sh-med', [
  `for file in *.log; do
    gzip -9 "$file"
    echo "compressed $file"
done`,
  `if [ ! -f .env ]; then
    cp .env.example .env
    echo "created .env from example"
fi`,
  `docker compose down --remove-orphans
docker compose up -d --build
docker compose logs -f api --tail 50`,
  `git checkout -b feature/leaderboard
git add -A
git commit -m "add leaderboard filters"
git push -u origin HEAD`,
  `find . -type f -name "*.tmp" -mtime +7 -print -delete`,
  `curl -s -X POST "$API_URL/scores" \\
    -H "Content-Type: application/json" \\
    -d '{"wpm":80,"accuracy":97}'`,
  `while read -r line; do
    echo "\${line%%,*}"
done < data.csv`,
  `rsync -avz --delete ./dist/ user@server:/var/www/typre/`,
  `export NODE_ENV=production
npm ci --omit=dev
npm run build`,
  `ps aux | grep -v grep | grep node | awk '{ print $2 }' | xargs -r kill`,
])
