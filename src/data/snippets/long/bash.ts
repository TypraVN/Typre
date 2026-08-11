import { defineSnippets } from '../define'

/** Bài DÀI cho mốc 60s — xem chú thích trong `long/javascript.ts`. */
export const bashLong = defineSnippets('bash', 'sh-long', [
  `#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="/var/backups/typre"
STAMP=$(date +%Y%m%d-%H%M)

mkdir -p "$BACKUP_DIR"
pg_dump "$DATABASE_URL" | gzip > "$BACKUP_DIR/db-$STAMP.sql.gz"

find "$BACKUP_DIR" -name "db-*.sql.gz" -mtime +14 -delete
echo "backup done: db-$STAMP.sql.gz"`,
  `deploy() {
    local branch="\${1:-main}"

    git fetch origin
    git checkout "$branch"
    git pull --ff-only

    npm ci --omit=dev
    npm run build

    rsync -avz --delete ./dist/ "$DEPLOY_HOST:/var/www/typre/"
    echo "deployed $branch to $DEPLOY_HOST"
}`,
  `for env in dev staging prod; do
    file=".env.$env"

    if [ ! -f "$file" ]; then
        echo "missing $file, skipping"
        continue
    fi

    while IFS='=' read -r key value; do
        [ -z "$key" ] && continue
        case "$key" in \\#*) continue ;; esac
        echo "$env: $key"
    done < "$file"
done`,
  `case "\${1:-help}" in
    start)
        docker compose up -d
        ;;
    stop)
        docker compose down
        ;;
    logs)
        docker compose logs -f --tail 100
        ;;
    *)
        echo "usage: $0 {start|stop|logs}"
        exit 1
        ;;
esac`,
  `#!/usr/bin/env bash
set -euo pipefail

if ! command -v node >/dev/null 2>&1; then
    echo "node is required" >&2
    exit 1
fi

VERSION=$(node --version | tr -d 'v' | cut -d. -f1)

if [ "$VERSION" -lt 20 ]; then
    echo "need node >= 20, found $VERSION" >&2
    exit 1
fi

echo "node $VERSION ok"`,
  `total=0
failed=0

for url in $(cat urls.txt); do
    total=$((total + 1))
    code=$(curl -s -o /dev/null -w "%{http_code}" "$url" || echo 000)

    if [ "$code" != "200" ]; then
        failed=$((failed + 1))
        echo "FAIL $code $url"
    fi
done

echo "checked $total, failed $failed"`,
])
