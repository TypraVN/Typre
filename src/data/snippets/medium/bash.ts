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
  `set -euo pipefail

branch="\${1:-main}"
echo "deploying \${branch} at $(date +%T)"`,
  `languages=(rust go sql bash)

for lang in "\${languages[@]}"; do
    echo "\${lang}: \${#lang} chars"
done`,
  `declare -A ports=([web]=5180 [db]=5432)

for name in "\${!ports[@]}"; do
    echo "$name listens on \${ports[$name]}"
done`,
  `path="/var/log/typre/app.log"

echo "\${path##*/}"
echo "\${path%/*}"
echo "\${path%.log}.gz"`,
  `count=$(grep -c ERROR "$LOG" || true)

if (( count > 0 )); then
    echo "found $count errors" >&2
fi`,
  `workdir=$(mktemp -d)
trap 'rm -rf "$workdir"' EXIT

echo "using $workdir"`,
  `while IFS=',' read -r user wpm; do
    printf '%-14s %4s\\n' "$user" "$wpm"
done < scores.csv`,
  `cat <<'EOF' > .env.example
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
EOF`,
  `curl -sf --retry 3 --max-time 20 \\
    -H "accept: application/json" \\
    "$API/health" | jq -r '.status'`,
  `jq -r '.[] | [.user, .wpm] | @tsv' scores.json \\
    | sort -k2 -nr \\
    | head -5`,
  `git status --porcelain | head
git log --oneline -5
git diff --stat HEAD~1`,
  `if [ -n "$(git status --porcelain)" ]; then
    echo "commit your work first" >&2
    exit 1
fi`,
  `find src -name '*.ts' -newermt '-1 day' -print0 \\
    | xargs -0 wc -l \\
    | tail -1`,
  `tar -czf "backup-$(date +%F).tar.gz" \\
    --exclude=node_modules \\
    src supabase`,
  `docker build -t typre:dev .
docker run --rm -p 8080:80 --env-file .env typre:dev`,
  `docker ps --format '{{.Names}}\\t{{.Status}}'
docker image prune -f --filter 'until=72h'`,
  `awk -F',' 'NR > 1 { total += $2; n++ }
END { printf "avg %.1f\\n", total / n }' scores.csv`,
  `sed -n '1,20p' app.log
sed -i '/^#/d' .env
sed 's/\\r$//' input.txt > output.txt`,
  `grep -rn --include='*.ts' 'TODO' src | wc -l
grep -c ERROR app.log
grep -v '^$' notes.txt | head`,
  `for attempt in 1 2 3; do
    curl -sf "$API/health" && break
    sleep $((attempt * 2))
done`,
  `xargs -P 4 -I {} sh -c 'echo checking {}' < urls.txt
wait
echo "done"`,
  `diff <(sort a.txt) <(sort b.txt) | head
comm -12 <(sort a.txt) <(sort b.txt) | wc -l`,
  `accuracy=$(( 100 * correct / typed ))
wpm=$(( correct / 5 ))

echo "\${accuracy}% at \${wpm} wpm"`,
  `if [[ "$file" == *.csv && -s "$file" ]]; then
    echo "$file looks usable"
fi`,
  `if [[ "$branch" =~ ^(main|release/.+)$ ]]; then
    echo "protected branch"
fi`,
  `log() {
    printf '%s [%s] %s\\n' "$(date +%T)" "$1" "$2" >&2
}

log info "starting"`,
  `lock=/tmp/typre.lock

mkdir "$lock" 2>/dev/null || { echo busy >&2; exit 1; }
trap 'rmdir "$lock"' EXIT`,
  `ssh -o BatchMode=yes "$HOST" 'cd /srv/typre && git pull --ff-only'
echo "remote updated"`,
  `sha256sum dist/assets/*.js > dist/SHASUMS256.txt
sha256sum --check dist/SHASUMS256.txt`,
  `used=$(df --output=pcent / | tr -dc '0-9')

[ "$used" -lt 90 ] || echo "disk at \${used}%" >&2`,
  `pid=$(pgrep -f 'vite' | head -1)

if [ -n "$pid" ]; then
    kill -TERM "$pid"
fi`,
  `set -a
source .env
set +a

echo "\${VITE_SUPABASE_URL:-missing}"`,
  `mapfile -t rows < scores.csv
echo "read \${#rows[@]} rows"

printf '%s\\n' "\${rows[@]:0:3}"`,
  `case "\${1:-help}" in
    build) npm run build ;;
    test) npm test ;;
    *) echo "usage: $0 {build|test}" ;;
esac`,
  `psql "$DATABASE_URL" -Atc \\
    "select count(*) from scores where wpm > 60"`,
  `today=$(date +%F)
week_ago=$(date -d '7 days ago' +%F)

echo "$week_ago .. $today"`,
  `while getopts ":vo:" opt; do
    case "$opt" in
        v) verbose=1 ;;
        o) out="$OPTARG" ;;
    esac
done`,
  `tr -cs '[:alnum:]' '\\n' < README.md \\
    | sort \\
    | uniq -c \\
    | sort -rn \\
    | head -5`,
  `echo "\${PIPESTATUS[@]}"
echo "exit code: $?"
[ "$?" -eq 0 ] || exit 1`,
])
