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
])
