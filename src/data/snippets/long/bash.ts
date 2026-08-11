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
  `#!/usr/bin/env bash
set -euo pipefail

verbose=0
output="out.txt"

while getopts ":vo:h" opt; do
    case "$opt" in
        v) verbose=1 ;;
        o) output="$OPTARG" ;;
        h) echo "usage: $0 [-v] [-o file]"; exit 0 ;;
        \\?) echo "unknown option: -$OPTARG" >&2; exit 1 ;;
    esac
done

shift $((OPTIND - 1))
echo "verbose=$verbose output=$output"`,
  `require_file() {
    local path="$1"

    if [ ! -f "$path" ]; then
        echo "missing file: $path" >&2
        return 1
    fi

    return 0
}

if require_file ".env"; then
    echo "config found"
else
    echo "using defaults"
fi`,
  `languages=(javascript typescript python csharp rust go)

echo "count: \${#languages[@]}"

for lang in "\${languages[@]}"; do
    printf '%-12s %s\\n' "$lang" "\${#lang}"
done

echo "first: \${languages[0]}"
echo "slice: \${languages[@]:1:3}"`,
  `declare -A limits=(
    [15]="short"
    [30]="medium"
    [60]="long"
)

for key in "\${!limits[@]}"; do
    echo "$key => \${limits[$key]}"
done

if [[ -v limits[30] ]]; then
    echo "30s bucket is \${limits[30]}"
fi`,
  `path="/var/log/typre/app.2026-08-11.log"

echo "base: \${path##*/}"
echo "dir:  \${path%/*}"
echo "no extension: \${path%.log}"
echo "upper: \${path^^}"

name="\${path##*/}"
stamp="\${name#app.}"
echo "date part: \${stamp%.log}"`,
  `deploy_to="\${DEPLOY_HOST:-staging.typre.app}"
retries="\${RETRIES:=3}"
branch="\${1:?branch name is required}"

echo "deploying $branch to $deploy_to"
echo "retries: $retries"

: "\${LOG_DIR:=/tmp/typre}"
mkdir -p "$LOG_DIR"`,
  `#!/usr/bin/env bash
set -euo pipefail

workdir=$(mktemp -d)

cleanup() {
    local code=$?
    rm -rf "$workdir"
    echo "cleaned up, exit $code"
}

trap cleanup EXIT
trap 'echo interrupted >&2; exit 130' INT TERM

echo "working in $workdir"`,
  `count=0

while IFS=',' read -r name wpm accuracy; do
    [ "$name" = "name" ] && continue

    if [ "$wpm" -ge 60 ]; then
        printf '%-14s %4s %5s\\n' "$name" "$wpm" "$accuracy"
        count=$((count + 1))
    fi
done < scores.csv

echo "$count fast runs"`,
  `cat <<'SQL' > migration.sql
alter table scores
    add column if not exists raw_wpm int;
SQL

psql "$DATABASE_URL" <<EOF
\\set ON_ERROR_STOP on
\\i migration.sql
select count(*) from scores;
EOF

rm -f migration.sql`,
  `fetch() {
    local url="$1"
    local out="$2"

    curl --fail --silent --show-error \\
        --retry 3 --retry-delay 2 \\
        --max-time 30 \\
        -H "accept: application/json" \\
        -o "$out" "$url"
}

fetch "https://api.example.com/scores" scores.json
jq '.data | length' scores.json`,
  `curl -s "$API/leaderboard?language=rust" \\
    | jq -r '.[] | [.display_name, .wpm] | @tsv' \\
    | sort -k2 -nr \\
    | head -10 \\
    | awk '{ printf "%-14s %4s\\n", $1, $2 }'

total=$(jq 'length' scores.json)
average=$(jq '[.[] | .wpm] | add / length' scores.json)

echo "$total rows, average $average"`,
  `current_branch() {
    git rev-parse --abbrev-ref HEAD
}

if [ -n "$(git status --porcelain)" ]; then
    echo "working tree dirty, commit first" >&2
    exit 1
fi

git fetch --prune origin
git log --oneline --graph --decorate -10
git diff --stat "origin/$(current_branch)"`,
  `find src -type f -name '*.ts' -not -path '*/node_modules/*' \\
    -print0 \\
    | xargs -0 grep -ln 'TODO' \\
    | sort

find . -type d -name node_modules -prune -o -name '*.log' -print \\
    | wc -l`,
  `rsync -avz --delete \\
    --exclude 'node_modules/' \\
    --exclude '.env' \\
    --exclude 'dist/' \\
    --log-file="/tmp/sync-$(date +%F).log" \\
    ./ "$BACKUP_HOST:/srv/backups/typre/"

echo "exit code: $?"`,
  `STAMP=$(date +%Y%m%d)
ARCHIVE="/tmp/typre-$STAMP.tar.gz"

tar --create --gzip \\
    --file "$ARCHIVE" \\
    --exclude-vcs \\
    --exclude='node_modules' \\
    src supabase package.json

ls -lh "$ARCHIVE"
tar --list --file "$ARCHIVE" | head -5`,
  `service="typre.service"

if systemctl is-active --quiet "$service"; then
    echo "$service is running"
    systemctl status "$service" --no-pager --lines 5
else
    echo "$service is down, restarting" >&2
    sudo systemctl restart "$service"
    sleep 2
    systemctl is-active "$service"
fi`,
  `IMAGE="typre:$(git rev-parse --short HEAD)"

docker build --tag "$IMAGE" --build-arg NODE_ENV=production .

docker run --rm \\
    --env-file .env \\
    --publish 8080:80 \\
    --name typre-test \\
    --detach "$IMAGE"

docker logs --follow --tail 50 typre-test`,
  `docker ps --filter "status=exited" --quiet | xargs -r docker rm

docker images --filter "dangling=true" --quiet \\
    | xargs -r docker rmi

docker system df
docker volume ls --filter "dangling=true"`,
  `awk -F',' '
NR == 1 { next }
{
    total[$1] += $2
    runs[$1] += 1
}
END {
    for (name in total) {
        printf "%-14s %6.1f\\n", name, total[name] / runs[name]
    }
}
' scores.csv | sort -k2 -nr`,
  `cp .env .env.bak

sed -i.bak \\
    -e '/^#/d' \\
    -e '/^$/d' \\
    -e 's/[[:space:]]*$//' \\
    .env

diff .env.bak .env || true
wc -l .env .env.bak`,
  `grep -rn --include='*.ts' -E 'console\\.(log|debug)' src \\
    | grep -v '__tests__' \\
    | tee /tmp/console-calls.txt

count=$(wc -l < /tmp/console-calls.txt)
echo "found $count console calls"

[ "$count" -eq 0 ] || exit 1`,
  `#!/usr/bin/env bash
set -euo pipefail

INTERVAL="\${INTERVAL:-300}"

while true; do
    if ! curl -sf "$HEALTH_URL" >/dev/null; then
        echo "$(date +%T) health check failed" >&2
    fi

    sleep "$INTERVAL"
done`,
  `xargs -P 8 -I {} \\
    curl -s -o /dev/null -w '%{http_code} {}\\n' {} \\
    < urls.txt \\
    | sort \\
    | uniq -c

wait
echo "all checks finished"`,
  `diff <(sort before.txt) <(sort after.txt)

while read -r line; do
    echo "changed: $line"
done < <(git diff --name-only HEAD~1)

comm -13 <(sort a.txt) <(sort b.txt)`,
  `runs=42
correct=1980
typed=2050

accuracy=$(( 100 * correct / typed ))
wpm=$(( correct / 5 ))

echo "accuracy \${accuracy}% wpm $wpm over $runs runs"

if (( accuracy >= 95 && wpm > 60 )); then
    echo "clean and fast"
fi`,
  `file="report.csv"

if [[ -f "$file" && -r "$file" && -s "$file" ]]; then
    echo "$file is readable and not empty"
fi

if [[ "$file" == *.csv ]]; then
    echo "looks like csv"
fi

if [[ "$USER" =~ ^(root|admin)$ ]]; then
    echo "privileged user"
fi`,
  `PS3="choose an action: "

select action in build test deploy quit; do
    case "$action" in
        build) npm run build ;;
        test) npm test ;;
        deploy) ./deploy.sh ;;
        quit) break ;;
        *) echo "invalid choice" ;;
    esac
done`,
  `LOG_LEVEL="\${LOG_LEVEL:-info}"

log() {
    local level="$1"
    shift

    local stamp
    stamp=$(date +'%Y-%m-%d %H:%M:%S')

    printf '%s [%s] %s\\n' "$stamp" "\${level^^}" "$*" >&2
}

log info "starting deploy"
log warn "no .env found, using defaults"`,
  `LOCK="/tmp/typre-deploy.lock"

if ! mkdir "$LOCK" 2>/dev/null; then
    echo "another deploy is running" >&2
    exit 1
fi

trap 'rmdir "$LOCK"' EXIT

echo "lock acquired, deploying"
sleep 2`,
  `ssh -o BatchMode=yes -o ConnectTimeout=10 "$DEPLOY_HOST" bash <<'EOS'
set -euo pipefail

cd /var/www/typre
git pull --ff-only
npm ci --omit=dev
sudo systemctl restart typre
EOS

echo "remote deploy finished"`,
  `for file in dist/assets/*.js; do
    hash=$(sha256sum "$file" | cut -d' ' -f1)
    printf '%s  %s\\n' "\${hash:0:12}" "\${file##*/}"
done

sha256sum dist/assets/*.js > dist/SHASUMS256.txt
sha256sum --check dist/SHASUMS256.txt`,
  `du -sh ./* 2>/dev/null | sort -h | tail -10

df -h / /var | awk 'NR > 1 { print $6, $5 }'

used=$(df --output=pcent / | tr -dc '0-9')

if [ "$used" -gt 85 ]; then
    echo "disk almost full: \${used}%" >&2
fi`,
  `ps -eo pid,ppid,pcpu,pmem,comm --sort=-pcpu | head -8

pid=$(pgrep -f 'node.*vite' | head -1)

if [ -n "$pid" ]; then
    echo "vite running as $pid"
    kill -TERM "$pid"
else
    echo "vite is not running"
fi`,
  `load_env() {
    local file="\${1:-.env}"
    [ -f "$file" ] || return 0

    set -a
    # shellcheck disable=SC1090
    source "$file"
    set +a
}

load_env .env
echo "\${VITE_SUPABASE_URL:-not set}"`,
  `retry() {
    local attempts="$1"
    shift
    local delay=1

    for i in $(seq 1 "$attempts"); do
        if "$@"; then
            return 0
        fi

        echo "attempt $i failed, waiting \${delay}s" >&2
        sleep "$delay"
        delay=$((delay * 2))
    done

    return 1
}

retry 4 curl -sf "$API/health"`,
  `#!/usr/bin/env bash
set -euo pipefail

npm ci
npm run lint
npm run build

if [ ! -d dist ]; then
    echo "build produced no dist folder" >&2
    exit 1
fi

du -sh dist
find dist -name '*.js' | wc -l`,
  `psql "$DATABASE_URL" \\
    --tuples-only --no-align --field-separator=',' \\
    --command "select language, max(wpm) from scores group by 1" \\
    > /tmp/best.csv

wc -l /tmp/best.csv
column -s',' -t /tmp/best.csv`,
  `today=$(date +%F)
week_ago=$(date -d '7 days ago' +%F)
month_start=$(date +%Y-%m-01)

echo "range: $week_ago .. $today (month from $month_start)"

stamp=$(date -u +'%Y-%m-%dT%H:%M:%SZ')
echo "utc now: $stamp"

epoch=$(date +%s)
echo "minutes since midnight: $(( (epoch % 86400) / 60 ))"`,
  `mapfile -t lines < scores.csv

echo "read \${#lines[@]} lines"

for line in "\${lines[@]:1:5}"; do
    IFS=',' read -r name wpm _ <<< "$line"
    printf '%-14s %s\\n' "$name" "$wpm"
done`,
  `set -o pipefail

if grep -q 'ERROR' /var/log/typre/app.log; then
    echo "errors found"
    grep -c 'ERROR' /var/log/typre/app.log
else
    echo "log is clean"
fi

status=\${PIPESTATUS[0]}
echo "first command exited with $status"`,
  `if [ -t 1 ]; then
    bold=$(tput bold)
    red=$(tput setaf 1)
    green=$(tput setaf 2)
    reset=$(tput sgr0)
fi

printf '%s%sPASS%s 42 tests\\n' "\${bold:-}" "\${green:-}" "\${reset:-}"
printf '%sFAIL%s 3 tests\\n' "\${red:-}" "\${reset:-}"`,
  `#!/usr/bin/env bash
set -euo pipefail

errors=0

for script in scripts/*.sh; do
    if ! bash -n "$script"; then
        echo "syntax error in $script" >&2
        errors=$((errors + 1))
    fi
done

[ "$errors" -eq 0 ] || exit 1
echo "all scripts parse cleanly"`,
  `tr -cs '[:alnum:]' '\\n' < README.md \\
    | tr '[:upper:]' '[:lower:]' \\
    | grep -v '^$' \\
    | sort \\
    | uniq -c \\
    | sort -rn \\
    | head -15`,
  `tail -Fn0 /var/log/typre/app.log \\
    | while read -r line; do
        case "$line" in
            *ERROR*) echo "!! $line" >&2 ;;
            *WARN*) echo "?  $line" ;;
        esac
    done

journalctl -u typre -f --since '10 min ago' --no-pager`,
])
