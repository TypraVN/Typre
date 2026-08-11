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
])
