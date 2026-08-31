import { defineSnippets } from '../define'

/** Bài TRUNG BÌNH cho mốc 30s — xem chú thích trong `medium/javascript.ts`. */
export const pythonMedium = defineSnippets('python', 'py-med', [
  `def load_scores(path):
    with open(path, encoding="utf-8") as f:
        rows = json.load(f)
    return [r for r in rows if r["wpm"] > 0]`,
  `def word_count(text):
    counts = Counter()
    for word in re.findall(r"[a-z']+", text.lower()):
        counts[word] += 1
    return counts.most_common(10)`,
  `class Timer:
    def __enter__(self):
        self.start = time.perf_counter()
        return self

    def __exit__(self, *args):
        self.elapsed = time.perf_counter() - self.start`,
  `def safe_div(a, b, default=0.0):
    try:
        return a / b
    except ZeroDivisionError:
        return default`,
  `results = {
    name: round(sum(values) / len(values), 1)
    for name, values in grouped.items()
    if values
}`,
  `def walk_files(root, suffix=".py"):
    for path in Path(root).rglob(f"*{suffix}"):
        if path.is_file():
            yield path`,
  `def to_kn(kilograms: float) -> float:
    if kilograms < 0:
        raise ValueError("weight must be positive")
    return round(kilograms * 0.00981, 3)`,
  `with sqlite3.connect("app.db") as conn:
    rows = conn.execute(
        "select mark, weight from panels where job_id = ?", (job_id,)
    ).fetchall()`,
  `def merge(base: dict, override: dict) -> dict:
    merged = dict(base)
    for key, value in override.items():
        if isinstance(value, dict):
            merged[key] = merge(merged.get(key, {}), value)
        else:
            merged[key] = value
    return merged`,
  `parser = argparse.ArgumentParser()
parser.add_argument("path")
parser.add_argument("--verbose", action="store_true")
args = parser.parse_args()`,
  `fast = [s for s in scores if s["wpm"] >= 60]
names = [s["user"].title() for s in fast]

print(len(fast), "fast runs by", ", ".join(names))`,
  `by_id = {row["id"]: row for row in rows}
lengths = {key: len(value) for key, value in groups.items()}

print(len(by_id), max(lengths.values()))`,
  `languages = {row["language"] for row in scores}
missing = languages - set(SUPPORTED)

if missing:
    raise ValueError(f"unsupported: {sorted(missing)}")`,
  `for index, (name, wpm) in enumerate(pairs, start=1):
    print(f"{index:>2}. {name:<14} {wpm:>4}")`,
  `for name, wpm, accuracy in zip(names, speeds, accuracies):
    print(f"{name}: {wpm} wpm at {accuracy:.1f}%")`,
  `ranked = sorted(scores, key=lambda s: (-s["wpm"], s["user"]))
top_three = ranked[:3]

for row in top_three:
    print(row["user"], row["wpm"])`,
  `total = 1650.5
print(f"{total:>12,.2f}")
print(f"{0.9642:.1%}")
print(f"{255:#06x} {255:#b} {255:o}")`,
  `path = Path("reports") / "summary.txt"
path.parent.mkdir(parents=True, exist_ok=True)
path.write_text("done\\n", encoding="utf-8")

print(path.stat().st_size, "bytes")`,
  `data = json.loads(raw_text)
data["updated_at"] = datetime.now(timezone.utc).isoformat()

Path("out.json").write_text(
    json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8"
)`,
  `try:
    value = int(raw)
except (TypeError, ValueError):
    value = 0
else:
    print("parsed cleanly")
finally:
    print("done with", raw)`,
  `squares = (n * n for n in range(1, 1_000_000))

print(next(squares), next(squares))
print(sum(itertools.islice(squares, 100)))`,
  `def batched(items, size):
    batch = []
    for item in items:
        batch.append(item)
        if len(batch) == size:
            yield batch
            batch = []`,
  `doubled = list(map(lambda n: n * 2, values))
positive = list(filter(lambda n: n > 0, values))

print(doubled[:3], positive[:3])`,
  `if all(s["wpm"] > 0 for s in scores):
    print("every run counted")

if any(s["accuracy"] < 50 for s in scores):
    print("some runs are too messy")`,
  `best = max(scores, key=lambda s: s["wpm"])
worst = min(scores, key=lambda s: s["accuracy"])

print(best["user"], worst["user"])`,
  `counts = Counter(word.lower() for word in text.split())

for word, times in counts.most_common(5):
    print(f"{times:>4}  {word}")`,
  `groups = defaultdict(list)

for score in scores:
    groups[score["language"]].append(score["wpm"])

print({k: max(v) for k, v in groups.items()})`,
  `window = deque(maxlen=5)

for value in stream:
    window.append(value)
    print(sum(window) / len(window))`,
  `Point = namedtuple("Point", "x y")

a, b = Point(0, 0), Point(3, 4)
print(math.dist(a, b))`,
  `@dataclass(slots=True)
class Panel:
    mark: str
    volume: float = 0.0

    def weight(self) -> float:
        return self.volume * 2400.0`,
  `class Bucket(enum.StrEnum):
    SHORT = "short"
    MEDIUM = "medium"
    LONG = "long"

print(Bucket("long").name, list(Bucket))`,
  `def summarise(
    rows: list[dict[str, int]],
    limit: int = 10,
) -> dict[str, int]:
    return {row["user"]: row["wpm"] for row in rows[:limit]}`,
  `def find_user(user_id: str) -> User | None:
    for user in USERS:
        if user.id == user_id:
            return user
    return None`,
  `def log(message, *args, level="info", **fields):
    parts = [f"{key}={value}" for key, value in fields.items()]
    print(level.upper(), message % args, " ".join(parts))`,
  `def timed(fn):
    @functools.wraps(fn)
    def inner(*args, **kwargs):
        start = time.perf_counter()
        try:
            return fn(*args, **kwargs)
        finally:
            print(time.perf_counter() - start)
    return inner`,
  `class Run:
    @property
    def wpm(self):
        return round(self.correct / 5 / (self.seconds / 60))

    @property
    def is_valid(self):
        return 0 < self.wpm <= 300`,
  `class Config:
    @classmethod
    def from_dict(cls, raw):
        return cls(**{k: v for k, v in raw.items() if k in FIELDS})

    @staticmethod
    def default_path():
        return Path.home() / ".typre.json"`,
  `title = "  Luyen Go Code  "

print(title.strip().lower().replace(" ", "-"))
print(title.casefold().count("o"))
print("code" in title.lower(), title.strip().startswith("Luyen"))`,
  `values = list(range(10))

print(values[2:7], values[::2], values[::-1])
print(values[-3:], values[:-3])`,
  `first, *middle, last = [10, 20, 30, 40, 50]
head, tail = middle[0], middle[1:]

print(first, middle, last, head, tail)`,
  `while (line := stream.readline()):
    if (found := PATTERN.search(line)) is not None:
        print(found.group("level"), found.group("msg"))`,
  `match command.split():
    case ["submit", score]:
        submit(int(score))
    case ["reset"]:
        reset()
    case _:
        print("unknown command")`,
  `label = "fast" if wpm >= 60 else "steady" if wpm >= 30 else "slow"

whole, rest = divmod(seconds, 60)
print(f"{label} {whole}:{rest:02d}")`,
  `chained = list(itertools.chain(short, medium, long))
paired = list(itertools.product("ab", [1, 2]))

print(len(chained), paired)`,
  `total = functools.reduce(operator.add, amounts, 0)
biggest = functools.reduce(lambda a, b: a if a > b else b, amounts)

print(total, biggest)`,
  `host = os.environ.get("DB_HOST", "127.0.0.1")
port = int(os.environ.get("DB_PORT", "5432"))
debug = os.environ.get("DEBUG", "").lower() in {"1", "true"}

print(host, port, debug)`,
  `result = subprocess.run(
    ["git", "rev-parse", "--short", "HEAD"],
    capture_output=True,
    text=True,
    check=True,
)
print(result.stdout.strip())`,
  `now = datetime.now(timezone.utc)
later = now + timedelta(days=7, hours=3)

print(now.strftime("%Y-%m-%d %H:%M"))
print((later - now).total_seconds())`,
  `random.seed(42)

print(random.choice(LANGUAGES))
print(random.sample(range(100), 5))

deck = list(range(10))
random.shuffle(deck)`,
  `slug = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
numbers = re.findall(r"-?\\d+(?:\\.\\d+)?", text)

print(slug, numbers[:3])`,
  `assert 0 < wpm <= 300, f"wpm out of range: {wpm}"
assert accuracy >= 0, "accuracy cannot be negative"

if not rows:
    raise ValueError("no rows to summarise")`,
  `class SubmitError(RuntimeError):
    def __init__(self, status):
        super().__init__(f"submit rejected with {status}")
        self.status = status

raise SubmitError(429)`,
  `rows.sort(key=operator.itemgetter("wpm"), reverse=True)
rows[:] = [row for row in rows if row["wpm"] > 0]

print(rows[0] if rows else "empty")`,
  `settings.setdefault("retries", 3)
timeout = settings.get("timeout", 30)
theme = settings.pop("theme", "dark")

print(timeout, theme, len(settings))`,

  `with contextlib.suppress(FileNotFoundError):
    Path("cache.json").unlink()`,
  `for language, group in itertools.groupby(rows, key=lambda r: r["language"]):
    print(language, len(list(group)))`,
  `newest = max(
    Path("logs").glob("*.log"),
    key=lambda p: p.stat().st_mtime,
)`,
  `with open("scores.csv", newline="", encoding="utf-8") as f:
    for row in csv.DictReader(f):
        print(row["language"], row["wpm"])`,
  `@dataclass
class Run:
    language: str
    tags: list[str] = field(default_factory=list)`,
  `def running_total(values: Iterable[int]) -> Iterator[int]:
    total = 0
    for value in values:
        total += value
        yield total`,
  `to_wpm = functools.partial(round, ndigits=1)
speeds = [to_wpm(chars / 5 / minutes) for chars in totals]`,
  `match payload:
    case {"type": "run", "wpm": int(wpm)}:
        record(wpm)
    case _:
        raise ValueError("unknown payload")`,
  `started = datetime.now(ZoneInfo("Asia/Ho_Chi_Minh"))
elapsed = (datetime.now(ZoneInfo("UTC")) - started).total_seconds()`,
  `def top_n(rows, n=5):
    return heapq.nlargest(n, rows, key=operator.itemgetter("wpm"))`,
])
