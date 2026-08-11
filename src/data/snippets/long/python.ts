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
])
