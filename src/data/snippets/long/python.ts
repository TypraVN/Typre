import { defineSnippets } from '../define'

/** Bài DÀI cho mốc 60s — xem chú thích trong `long/javascript.ts`. */
export const pythonLong = defineSnippets('python', 'py-long', [
  `def group_by(items, key):
    result = {}
    for item in items:
        bucket = result.setdefault(key(item), [])
        bucket.append(item)
    return result


def top_n(counts, n=5):
    return sorted(counts.items(), key=lambda kv: -kv[1])[:n]`,
  `class Panel:
    def __init__(self, mark, weight):
        self.mark = mark
        self.weight = weight

    @property
    def is_heavy(self):
        return self.weight > 5000

    def __repr__(self):
        return f"Panel({self.mark!r}, {self.weight})"`,
  `def read_config(path):
    if not Path(path).exists():
        raise FileNotFoundError(f"missing config: {path}")

    with open(path, encoding="utf-8") as f:
        data = json.load(f)

    data.setdefault("retries", 3)
    data.setdefault("timeout", 30)
    return data`,
  `def chunks(seq, size):
    for i in range(0, len(seq), size):
        yield seq[i : i + size]


def flatten(rows):
    return [value for row in rows for value in row]


def dedupe(items):
    seen = set()
    return [x for x in items if not (x in seen or seen.add(x))]`,
  `async def fetch_all(urls):
    async with aiohttp.ClientSession() as session:
        tasks = [fetch_one(session, url) for url in urls]
        results = await asyncio.gather(*tasks, return_exceptions=True)

    return [r for r in results if not isinstance(r, Exception)]


async def fetch_one(session, url):
    async with session.get(url) as res:
        return await res.json()`,
  `@dataclass
class Score:
    user: str
    wpm: int
    accuracy: float = 100.0

    def is_valid(self) -> bool:
        return 0 < self.wpm <= 300 and self.accuracy >= 50


def best_of(scores: list[Score]) -> Score | None:
    valid = [s for s in scores if s.is_valid()]
    return max(valid, key=lambda s: s.wpm, default=None)`,
  `def main():
    parser = argparse.ArgumentParser(description="count words")
    parser.add_argument("path")
    parser.add_argument("--top", type=int, default=10)
    args = parser.parse_args()

    text = Path(args.path).read_text(encoding="utf-8")
    counts = Counter(re.findall(r"[a-z']+", text.lower()))

    for word, n in counts.most_common(args.top):
        print(f"{n:>6}  {word}")`,
  `def retry(times=3, delay=0.2):
    def wrapper(fn):
        @functools.wraps(fn)
        def inner(*args, **kwargs):
            for attempt in range(1, times + 1):
                try:
                    return fn(*args, **kwargs)
                except Exception:
                    if attempt == times:
                        raise
                    time.sleep(delay * attempt)
        return inner
    return wrapper`,
  `class Timer:
    def __enter__(self):
        self.start = time.perf_counter()
        return self

    def __exit__(self, exc_type, exc, tb):
        self.elapsed = time.perf_counter() - self.start
        print(f"took {self.elapsed:.3f}s")
        return False


with Timer() as t:
    heavy_work()`,
  `@contextlib.contextmanager
def temp_dir(prefix="build"):
    path = Path(tempfile.mkdtemp(prefix=prefix))
    try:
        yield path
    finally:
        shutil.rmtree(path, ignore_errors=True)


with temp_dir() as folder:
    (folder / "out.txt").write_text("done", encoding="utf-8")`,
  `def read_rows(path):
    with open(path, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def write_rows(path, rows):
    if not rows:
        return

    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)`,
  `def find_files(root, suffix=".py", skip=("venv", "__pycache__")):
    root = Path(root)

    for path in root.rglob("*" + suffix):
        if any(part in skip for part in path.parts):
            continue
        yield path.relative_to(root)


for name in sorted(find_files(".")):
    print(name)`,
  `def top_scores(db_path, limit=10):
    with sqlite3.connect(db_path) as conn:
        conn.row_factory = sqlite3.Row
        rows = conn.execute(
            "select name, wpm from scores order by wpm desc limit ?",
            (limit,),
        ).fetchall()

    return [dict(row) for row in rows]`,
  `def get_json(url, timeout=10):
    headers = {"accept": "application/json"}
    response = requests.get(url, headers=headers, timeout=timeout)
    response.raise_for_status()
    return response.json()


def post_score(url, payload):
    response = requests.post(url, json=payload, timeout=10)
    if response.status_code >= 400:
        raise RuntimeError(f"submit failed: {response.status_code}")
    return response.json()`,
  `def setup_logging(level=logging.INFO):
    logger = logging.getLogger("typre")
    logger.setLevel(level)

    handler = logging.StreamHandler()
    handler.setFormatter(
        logging.Formatter("%(asctime)s %(levelname)s %(message)s")
    )

    logger.addHandler(handler)
    return logger`,
  `def group_sorted(rows, key):
    rows = sorted(rows, key=key)
    grouped = itertools.groupby(rows, key=key)
    return {k: list(group) for k, group in grouped}


def pairwise(items):
    a, b = itertools.tee(items)
    next(b, None)
    return zip(a, b)`,
  `@functools.lru_cache(maxsize=None)
def fib(n):
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)


@functools.lru_cache(maxsize=128)
def load_template(name):
    return Path("templates", name).read_text(encoding="utf-8")


print([fib(n) for n in range(10)])`,
  `def read_lines(path):
    with open(path, encoding="utf-8") as f:
        yield from (line.rstrip("\\n") for line in f)


def only_errors(lines):
    for line in lines:
        if "ERROR" in line:
            yield line


for entry in only_errors(read_lines("app.log")):
    print(entry)`,
  `Point = collections.namedtuple("Point", "x y")


def distance(a, b):
    return math.hypot(a.x - b.x, a.y - b.y)


def centroid(points):
    total_x = sum(p.x for p in points)
    total_y = sum(p.y for p in points)
    count = len(points) or 1
    return Point(total_x / count, total_y / count)`,
  `class Status(enum.Enum):
    IDLE = "idle"
    TYPING = "typing"
    FINISHED = "finished"

    @property
    def is_active(self):
        return self is Status.TYPING


def label(status):
    return status.value.replace("_", " ").title()`,
  `class ScoreRow(TypedDict):
    name: str
    wpm: int
    accuracy: float


def summarise(rows: list[ScoreRow]) -> ScoreRow:
    best = max(rows, key=lambda row: row["wpm"])
    return {
        "name": best["name"],
        "wpm": best["wpm"],
        "accuracy": round(best["accuracy"], 1),
    }`,
  `class Renderer(Protocol):
    def render(self, text: str) -> str: ...


class Upper:
    def render(self, text: str) -> str:
        return text.upper()


def show(renderer: Renderer, text: str) -> None:
    print(renderer.render(text))


show(Upper(), "hello world")`,
  `class Exporter(abc.ABC):
    @abc.abstractmethod
    def dump(self, rows):
        raise NotImplementedError

    def save(self, path, rows):
        Path(path).write_text(self.dump(rows), encoding="utf-8")


class JsonExporter(Exporter):
    def dump(self, rows):
        return json.dumps(rows, indent=2, ensure_ascii=False)`,
  `class Ticker:
    def __init__(self, start):
        self.start = start

    def __iter__(self):
        self.current = self.start
        return self

    def __next__(self):
        if self.current <= 0:
            raise StopIteration
        self.current -= 1
        return self.current + 1


print(list(Ticker(5)))`,
  `@dataclass(frozen=True, order=True)
class Version:
    major: int
    minor: int
    patch: int = 0

    def __str__(self):
        return f"{self.major}.{self.minor}.{self.patch}"

    def next_minor(self):
        return Version(self.major, self.minor + 1, 0)


print(sorted({Version(1, 2), Version(1, 10)}))`,
  `class Particle:
    __slots__ = ("x", "y", "vx", "vy")

    def __init__(self, x, y, vx=0.0, vy=0.0):
        self.x = x
        self.y = y
        self.vx = vx
        self.vy = vy

    def step(self, dt):
        self.x += self.vx * dt
        self.y += self.vy * dt`,
  `class Attempt:
    def __init__(self, wpm=0):
        self._wpm = 0
        self.wpm = wpm

    @property
    def wpm(self):
        return self._wpm

    @wpm.setter
    def wpm(self, value):
        if not 0 <= value <= 300:
            raise ValueError(f"wpm out of range: {value}")
        self._wpm = int(value)`,
  `class Settings:
    def __init__(self, host, port, debug=False):
        self.host = host
        self.port = port
        self.debug = debug

    @classmethod
    def from_env(cls):
        return cls(
            host=os.environ.get("HOST", "127.0.0.1"),
            port=int(os.environ.get("PORT", "8000")),
            debug=os.environ.get("DEBUG") == "1",
        )`,
  `class Vector:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __add__(self, other):
        return Vector(self.x + other.x, self.y + other.y)

    def __mul__(self, factor):
        return Vector(self.x * factor, self.y * factor)

    def __abs__(self):
        return math.hypot(self.x, self.y)`,
  `def multiply(a, b):
    rows = len(a)
    cols = len(b[0])
    shared = len(b)

    out = [[0] * cols for _ in range(rows)]

    for i in range(rows):
        for j in range(cols):
            out[i][j] = sum(a[i][k] * b[k][j] for k in range(shared))

    return out`,
  `def insert_sorted(values, item):
    position = bisect.bisect_left(values, item)
    values.insert(position, item)
    return position


def grade(score, breakpoints=(60, 70, 80, 90)):
    letters = "FDCBA"
    return letters[bisect.bisect(breakpoints, score)]


print([grade(n) for n in (55, 65, 85, 95)])`,
  `def rank(rows):
    return sorted(
        rows,
        key=operator.itemgetter("wpm", "accuracy"),
        reverse=True,
    )


def names_only(rows, limit=5):
    return [row["name"] for row in rank(rows)[:limit]]`,
  `def invert(mapping):
    return {value: key for key, value in mapping.items()}


def count_chars(text):
    counts = {}
    for char in text:
        counts[char] = counts.get(char, 0) + 1

    return dict(sorted(counts.items(), key=lambda kv: -kv[1]))


print(count_chars("mississippi"))`,
  `def compare(before, after):
    added = after - before
    removed = before - after
    kept = before & after

    return {
        "added": sorted(added),
        "removed": sorted(removed),
        "kept": sorted(kept),
    }


print(compare({"a", "b"}, {"b", "c"}))`,
  `LOG = re.compile(
    r"(?P<time>\\d{2}:\\d{2}:\\d{2}) (?P<level>\\w+) (?P<message>.+)"
)


def parse_line(line):
    match = LOG.match(line)
    if match is None:
        return None
    return match.groupdict()


print(parse_line("12:30:01 ERROR disk full"))`,
  `def week_range(today=None):
    today = today or datetime.date.today()
    monday = today - datetime.timedelta(days=today.weekday())
    return monday, monday + datetime.timedelta(days=6)


def parse_date(text):
    for pattern in ("%Y-%m-%d", "%d/%m/%Y"):
        try:
            return datetime.datetime.strptime(text, pattern).date()
        except ValueError:
            continue

    raise ValueError(f"bad date: {text}")`,
  `def to_json(data, path=None):
    text = json.dumps(
        data,
        indent=2,
        ensure_ascii=False,
        default=str,
        sort_keys=True,
    )

    if path is not None:
        Path(path).write_text(text, encoding="utf-8")

    return text`,
  `def env_int(name, default):
    raw = os.environ.get(name)
    if raw is None or not raw.strip():
        return default

    try:
        return int(raw)
    except ValueError:
        return default


TIMEOUT = env_int("TIMEOUT", 30)
RETRIES = env_int("RETRIES", 3)`,
  `class SafeCounter:
    def __init__(self):
        self.value = 0
        self.lock = threading.Lock()

    def increment(self, by=1):
        with self.lock:
            self.value += by


counter = SafeCounter()
worker = counter.increment
threads = [threading.Thread(target=worker) for _ in range(20)]

for thread in threads:
    thread.start()`,
  `def word_count(path):
    text = Path(path).read_text(encoding="utf-8")
    return path, len(text.split())


def count_all(paths, workers=4):
    with multiprocessing.Pool(workers) as pool:
        results = pool.map(word_count, paths)

    return dict(results)`,
  `async def producer(queue, items):
    for item in items:
        await queue.put(item)

    await queue.put(None)


async def consumer(queue):
    while True:
        item = await queue.get()
        if item is None:
            break

        print("handling", item)
        queue.task_done()`,
  `class TestSlugify(unittest.TestCase):
    def test_lowercases(self):
        self.assertEqual(slugify("Hello World"), "hello-world")

    def test_strips_symbols(self):
        self.assertEqual(slugify("a!!b??c"), "a-b-c")

    def test_empty(self):
        self.assertEqual(slugify(""), "")


if __name__ == "__main__":
    unittest.main()`,
  `@pytest.fixture
def sample_rows():
    return [
        {"name": "ann", "wpm": 80},
        {"name": "bob", "wpm": 65},
    ]


def test_best(sample_rows):
    assert best_of(sample_rows)["name"] == "ann"


@pytest.mark.parametrize("value", [-1, 301, 999])
def test_rejects_bad_wpm(value):
    with pytest.raises(ValueError):
        Attempt(value)`,
  `def timed(fn):
    @functools.wraps(fn)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        try:
            return fn(*args, **kwargs)
        finally:
            elapsed = time.perf_counter() - start
            print(f"{fn.__name__} took {elapsed:.3f}s")

    return wrapper`,
  `class TypreError(Exception):
    """Base error for the app."""


class ConfigError(TypreError):
    def __init__(self, key):
        super().__init__(f"missing config key: {key}")
        self.key = key


class SubmitError(TypreError):
    def __init__(self, status):
        super().__init__(f"submit rejected with {status}")
        self.status = status`,
  `def read_chunks(stream, size=4096):
    while chunk := stream.read(size):
        yield chunk


def first_match(lines, pattern):
    for line in lines:
        if (found := re.search(pattern, line)) is not None:
            return found.group(0)

    return None`,
  `def describe(payload):
    match payload:
        case {"type": "score", "wpm": int(wpm)} if wpm > 100:
            return f"fast run: {wpm}"
        case {"type": "score", "wpm": wpm}:
            return f"run: {wpm}"
        case {"type": "ping"}:
            return "ping"
        case [first, *rest]:
            return f"list of {len(rest) + 1}"
        case _:
            return "unknown payload"`,
  `def transpose(matrix):
    return [list(row) for row in zip(*matrix)]


def flatten_filter(rows, minimum=0):
    return [
        value
        for row in rows
        for value in row
        if value > minimum
    ]


print(transpose([[1, 2], [3, 4]]))`,
  `def paginate(fetch, per_page=50):
    page = 1

    while True:
        rows = fetch(page=page, per_page=per_page)
        if not rows:
            return

        yield from rows
        if len(rows) < per_page:
            return

        page += 1`,
  `def binary_search(sorted_values, target):
    low, high = 0, len(sorted_values) - 1

    while low <= high:
        mid = (low + high) // 2
        current = sorted_values[mid]

        if current == target:
            return mid
        if current < target:
            low = mid + 1
        else:
            high = mid - 1

    return -1`,

  `def breadth_first(graph, start):
    seen = {start}
    queue = collections.deque([start])
    order = []

    while queue:
        node = queue.popleft()
        order.append(node)

        for neighbour in graph.get(node, ()):
            if neighbour not in seen:
                seen.add(neighbour)
                queue.append(neighbour)

    return order`,
  `def merge_intervals(intervals):
    if not intervals:
        return []

    ordered = sorted(intervals)
    merged = [list(ordered[0])]

    for start, end in ordered[1:]:
        if start <= merged[-1][1]:
            merged[-1][1] = max(merged[-1][1], end)
        else:
            merged.append([start, end])

    return [tuple(pair) for pair in merged]`,
  `def flatten(source, parent="", sep="."):
    flat = {}

    for key, value in source.items():
        path = f"{parent}{sep}{key}" if parent else key

        if isinstance(value, dict):
            flat.update(flatten(value, path, sep))
        else:
            flat[path] = value

    return flat`,
  `def encode(text):
    if not text:
        return ""

    parts = []
    for char, group in itertools.groupby(text):
        length = len(list(group))
        parts.append(char if length == 1 else f"{char}{length}")

    return "".join(parts)`,
  `def moving_average(values, window=3):
    if window < 1:
        raise ValueError("window must be positive")

    buffer = collections.deque(maxlen=window)
    averages = []

    for value in values:
        buffer.append(value)
        averages.append(sum(buffer) / len(buffer))

    return averages`,
  `def parse_duration(text):
    units = {"h": 3600, "m": 60, "s": 1}
    total = 0

    for amount, unit in re.findall(r"(\\d+)([hms])", text):
        total += int(amount) * units[unit]

    if total == 0:
        raise ValueError(f"cannot parse duration: {text!r}")

    return total`,
  `def fetch_all(urls, workers=8):
    results = {}

    with concurrent.futures.ThreadPoolExecutor(workers) as pool:
        futures = {pool.submit(requests.get, url): url for url in urls}

        for future in concurrent.futures.as_completed(futures):
            url = futures[future]
            try:
                results[url] = future.result().status_code
            except Exception as error:
                results[url] = repr(error)

    return results`,
  `@dataclass
class Score:
    language: str
    wpm: int
    accuracy: float

    def __post_init__(self):
        if not 0 < self.wpm <= 300:
            raise ValueError(f"wpm out of range: {self.wpm}")

        if not 0 <= self.accuracy <= 100:
            raise ValueError(f"bad accuracy: {self.accuracy}")`,
  `class LruCache:
    def __init__(self, capacity=128):
        self.capacity = capacity
        self.items = collections.OrderedDict()

    def get(self, key, default=None):
        if key not in self.items:
            return default

        self.items.move_to_end(key)
        return self.items[key]

    def put(self, key, value):
        self.items[key] = value
        self.items.move_to_end(key)

        if len(self.items) > self.capacity:
            self.items.popitem(last=False)`,
  `def diff_rows(before, after, key="id"):
    old = {row[key]: row for row in before}
    new = {row[key]: row for row in after}

    added = [new[k] for k in new.keys() - old.keys()]
    removed = [old[k] for k in old.keys() - new.keys()]
    changed = [
        (old[k], new[k])
        for k in old.keys() & new.keys()
        if old[k] != new[k]
    ]

    return {"added": added, "removed": removed, "changed": changed}`,
])
