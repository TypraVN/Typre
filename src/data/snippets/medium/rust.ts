import { defineSnippets } from '../define'

/** Bài TRUNG BÌNH cho mốc 30s — xem chú thích trong `medium/javascript.ts`. */
export const rustMedium = defineSnippets('rust', 'rs-med', [
  `fn read_config(path: &str) -> Result<Config, Box<dyn Error>> {
    let text = std::fs::read_to_string(path)?;
    let config = serde_json::from_str(&text)?;
    Ok(config)
}`,
  `let evens: Vec<i32> = nums
    .iter()
    .copied()
    .filter(|n| n % 2 == 0)
    .collect();`,
  `#[derive(Debug, Clone, PartialEq)]
struct Panel {
    mark: String,
    weight: f64,
}`,
  `impl Panel {
    fn is_heavy(&self) -> bool {
        self.weight > 5000.0
    }
}`,
  `match result {
    Ok(value) => println!("got {value}"),
    Err(e) if e.is_timeout() => retry(),
    Err(e) => eprintln!("failed: {e}"),
}`,
  `let mut counts: HashMap<String, u32> = HashMap::new();
for word in text.split_whitespace() {
    *counts.entry(word.to_lowercase()).or_default() += 1;
}`,
  `fn main() {
    let args: Vec<String> = std::env::args().collect();
    if args.len() < 2 {
        eprintln!("usage: app <path>");
        std::process::exit(1);
    }
}`,
  `let shared = Arc::new(Mutex::new(0));
let handle = thread::spawn(move || {
    *shared.lock().unwrap() += 1;
});`,
  `trait Shape {
    fn area(&self) -> f64;

    fn describe(&self) -> String {
        format!("area = {:.2}", self.area())
    }
}`,
  `let text = std::fs::read_to_string("in.txt")?;
let lines: Vec<&str> = text.lines().filter(|l| !l.is_empty()).collect();`,
  `let fast: Vec<&Score> = scores
    .iter()
    .filter(|s| s.wpm >= 60)
    .take(10)
    .collect();`,
  `let total: u32 = scores.iter().map(|s| s.wpm).sum();
let best = scores.iter().map(|s| s.wpm).max().unwrap_or(0);

println!("{total} {best}");`,
  `let mut names: Vec<&str> = panels.iter().map(|p| p.mark()).collect();

names.sort_unstable();
names.dedup();`,
  `scores.sort_by_key(|s| std::cmp::Reverse(s.wpm));
scores.truncate(10);

println!("{:?}", scores.first());`,
  `let name = user
    .as_ref()
    .map(|u| u.display_name.trim())
    .filter(|n| !n.is_empty())
    .unwrap_or("anonymous");`,
  `let wpm: u16 = raw.trim().parse().unwrap_or(0);

if !(1..=300).contains(&wpm) {
    return Err("wpm out of range".into());
}`,
  `let grade = match score {
    0..=59 => "F",
    60..=79 => "C",
    _ => "A",
};`,
  `match point {
    (0, 0) => println!("origin"),
    (x, _) if x < 0 => println!("left"),
    _ => println!("elsewhere"),
}`,
  `match values {
    [] => println!("empty"),
    [only] => println!("one: {only}"),
    [first, .., last] => println!("{first}..{last}"),
}`,
  `if let Some(best) = scores.iter().max_by_key(|s| s.wpm) {
    println!("{} at {} wpm", best.user, best.wpm);
}`,
  `while let Some(job) = queue.pop_front() {
    process(job);
}`,
  `let mut groups: HashMap<&str, Vec<u32>> = HashMap::new();

for score in &scores {
    groups.entry(&score.language).or_default().push(score.wpm);
}`,
  `let mut seen = HashSet::new();
let unique: Vec<_> = rows.iter().filter(|r| seen.insert(*r)).collect();

println!("{}", unique.len());`,
  `let mut totals = BTreeMap::new();

for (key, value) in rows {
    *totals.entry(key).or_insert(0.0) += value;
}`,
  `let mut queue = VecDeque::from([start]);

while let Some(node) = queue.pop_front() {
    queue.extend(graph[node].iter().copied());
}`,
  `let pairs: Vec<(u32, u32)> = values
    .windows(2)
    .map(|w| (w[0], w[1]))
    .collect();`,
  `for (index, (name, wpm)) in names.iter().zip(&speeds).enumerate() {
    println!("{:>2}. {name:<14}{wpm:>5}", index + 1);
}`,
  `let slug: String = title
    .chars()
    .map(|c| if c.is_alphanumeric() { c } else { '-' })
    .collect();`,
  `let reversed: String = text.chars().rev().collect();

println!("{}", text.to_lowercase() == reversed.to_lowercase());`,
  `#[derive(Debug, Default, Clone)]
struct Config {
    retries: u8,
    timeout: u64,
}

let config = Config { retries: 3, ..Default::default() };`,
  `impl From<Celsius> for Fahrenheit {
    fn from(value: Celsius) -> Self {
        Fahrenheit(value.0 * 9.0 / 5.0 + 32.0)
    }
}`,
  `impl fmt::Display for Panel {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{} ({:.1} kg)", self.mark, self.weight())
    }
}`,
  `impl Iterator for Countdown {
    type Item = u32;

    fn next(&mut self) -> Option<u32> {
        self.left = self.left.checked_sub(1)?;
        Some(self.left)
    }
}`,
  `fn largest<T: PartialOrd + Copy>(items: &[T]) -> Option<T> {
    items.iter().copied().reduce(|a, b| if a > b { a } else { b })
}`,
  `struct Parser<'a> {
    input: &'a str,
}

impl<'a> Parser<'a> {
    fn rest(&self) -> &'a str {
        self.input.trim_start()
    }
}`,
  `let shapes: Vec<Box<dyn Shape>> = vec![
    Box::new(Circle { radius: 1.0 }),
    Box::new(Square { side: 2.0 }),
];`,
  `let log = Rc::new(RefCell::new(Vec::new()));
let clone = Rc::clone(&log);

clone.borrow_mut().push("started");`,
  `let (tx, rx) = mpsc::channel();

thread::spawn(move || tx.send("done").unwrap());
println!("{}", rx.recv().unwrap());`,
  `let handles: Vec<_> = (0..4)
    .map(|id| thread::spawn(move || id * id))
    .collect();

for handle in handles {
    println!("{}", handle.join().unwrap());
}`,
  `#[tokio::main]
async fn main() {
    let body = reqwest::get(URL).await.unwrap().text().await.unwrap();
    println!("{}", body.len());
}`,
  `#[derive(Serialize, Deserialize)]
struct Score {
    user: String,
    #[serde(default)]
    wpm: u16,
}`,
  `let path = Path::new("reports").join("summary.txt");

fs::create_dir_all(path.parent().unwrap())?;
fs::write(&path, "done\\n")?;`,
  `let file = File::open(path)?;

for line in BufReader::new(file).lines() {
    println!("{}", line?);
}`,
  `let limit: usize = env::var("LIMIT")
    .ok()
    .and_then(|raw| raw.parse().ok())
    .unwrap_or(10);`,

  `let best = scores
    .iter()
    .max_by_key(|s| s.wpm)
    .ok_or("no scores recorded")?;`,
  `let (fast, slow): (Vec<_>, Vec<_>) =
    scores.iter().partition(|s| s.wpm >= 60);`,
  `impl std::error::Error for SubmitError {}

impl fmt::Display for SubmitError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "submit failed: {}", self.reason)
    }
}`,
  `let windows: Vec<f64> = values
    .windows(3)
    .map(|w| w.iter().sum::<f64>() / w.len() as f64)
    .collect();`,
  `let Some(user) = session.user.as_ref() else {
    return Err("not signed in".into());
};`,
  `let counts = text
    .split_whitespace()
    .fold(HashMap::new(), |mut acc, word| {
        *acc.entry(word.to_lowercase()).or_insert(0) += 1;
        acc
    });`,
  `#[derive(Debug, thiserror::Error)]
enum LoadError {
    #[error("io: {0}")]
    Io(#[from] std::io::Error),
    #[error("bad row: {0}")]
    Row(String),
}`,
  `let mut chunks = values.chunks_exact(4);

for chunk in chunks.by_ref() {
    process(chunk);
}

handle_tail(chunks.remainder());`,
  `let json = serde_json::to_string_pretty(&score)?;
tokio::fs::write("score.json", json).await?;`,
  `let sum: u32 = scores
    .iter()
    .filter_map(|s| s.wpm.checked_mul(s.runs))
    .sum();`,
])
