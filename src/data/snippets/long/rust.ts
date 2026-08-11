import { defineSnippets } from '../define'

/** Bài DÀI cho mốc 60s — xem chú thích trong `long/javascript.ts`. */
export const rustLong = defineSnippets('rust', 'rs-long', [
  `use std::collections::HashMap;

fn word_count(text: &str) -> HashMap<String, usize> {
    let mut counts = HashMap::new();

    for word in text.split_whitespace() {
        let key = word.trim_matches(|c: char| !c.is_alphanumeric());
        if key.is_empty() {
            continue;
        }
        *counts.entry(key.to_lowercase()).or_insert(0) += 1;
    }

    counts
}`,
  `#[derive(Debug, Clone)]
struct Panel {
    mark: String,
    volume: f64,
}

impl Panel {
    fn new(mark: impl Into<String>, volume: f64) -> Self {
        Self { mark: mark.into(), volume }
    }

    fn weight(&self) -> f64 {
        self.volume * 2400.0
    }

    fn is_heavy(&self) -> bool {
        self.weight() > 5000.0
    }
}`,
  `fn load_scores(path: &Path) -> Result<Vec<Score>, Box<dyn Error>> {
    let text = std::fs::read_to_string(path)?;
    let mut scores: Vec<Score> = serde_json::from_str(&text)?;

    scores.retain(|s| s.wpm > 0 && s.accuracy >= 50);
    scores.sort_by(|a, b| b.wpm.cmp(&a.wpm));
    scores.truncate(10);

    Ok(scores)
}`,
  `impl fmt::Display for Panel {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{} ({:.1} kg)", self.mark, self.weight())
    }
}

impl Default for Config {
    fn default() -> Self {
        Self {
            retries: 3,
            timeout: Duration::from_secs(30),
        }
    }
}`,
  `#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    let client = reqwest::Client::new();
    let mut tasks = Vec::new();

    for url in urls {
        let client = client.clone();
        tasks.push(tokio::spawn(async move {
            client.get(&url).send().await?.text().await
        }));
    }

    for task in tasks {
        println!("{}", task.await??.len());
    }

    Ok(())
}`,
  `#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn counts_words() {
        let counts = word_count("one two two three");
        assert_eq!(counts.get("two"), Some(&2));
        assert_eq!(counts.get("one"), Some(&1));
    }

    #[test]
    fn ignores_empty_input() {
        assert!(word_count("").is_empty());
    }
}`,
  `fn find_panel(marks: &[String], target: &str) -> Option<usize> {
    marks.iter().position(|mark| mark == target)
}

fn main() {
    let marks = vec!["PC-01".to_string(), "PC-02".to_string()];

    match find_panel(&marks, "PC-02") {
        Some(index) => println!("found at {index}"),
        None => println!("not in this job"),
    }

    if let Some(first) = marks.first() {
        println!("first mark is {first}");
    }
}`,
  `#[derive(Debug)]
enum ConfigError {
    Missing(String),
    Invalid { key: String, value: String },
}

fn read_port(raw: Option<&str>) -> Result<u16, ConfigError> {
    let value = raw.ok_or_else(|| {
        ConfigError::Missing("PORT".to_string())
    })?;

    value.parse().map_err(|_| ConfigError::Invalid {
        key: "PORT".to_string(),
        value: value.to_string(),
    })
}`,
  `use std::fmt;

#[derive(Debug)]
struct SubmitError {
    status: u16,
    url: String,
}

impl fmt::Display for SubmitError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "submit {} failed: {}", self.url, self.status)
    }
}

impl std::error::Error for SubmitError {}`,
  `trait Shape {
    fn area(&self) -> f64;

    fn describe(&self) -> String {
        format!("area {:.2}", self.area())
    }
}

struct Circle {
    radius: f64,
}

impl Shape for Circle {
    fn area(&self) -> f64 {
        std::f64::consts::PI * self.radius * self.radius
    }
}`,
  `fn largest<T: PartialOrd + Copy>(items: &[T]) -> Option<T> {
    let mut best = *items.first()?;

    for &item in items {
        if item > best {
            best = item;
        }
    }

    Some(best)
}

fn sum_all<T: std::iter::Sum<T> + Copy>(items: &[T]) -> T {
    items.iter().copied().sum()
}`,
  `struct Parser<'a> {
    input: &'a str,
    position: usize,
}

impl<'a> Parser<'a> {
    fn new(input: &'a str) -> Self {
        Self { input, position: 0 }
    }

    fn rest(&self) -> &'a str {
        &self.input[self.position..]
    }

    fn take_word(&mut self) -> Option<&'a str> {
        let rest = self.rest().trim_start();
        rest.split_whitespace().next()
    }
}`,
  `fn make_shape(kind: &str, size: f64) -> Box<dyn Shape> {
    match kind {
        "circle" => Box::new(Circle { radius: size }),
        "square" => Box::new(Square { side: size }),
        _ => Box::new(Circle { radius: 1.0 }),
    }
}

fn total_area(shapes: &[Box<dyn Shape>]) -> f64 {
    shapes.iter().map(|shape| shape.area()).sum()
}`,
  `fn fast_players(scores: &[Score]) -> Vec<String> {
    scores
        .iter()
        .filter(|score| score.wpm >= 60)
        .filter(|score| score.accuracy >= 95.0)
        .map(|score| score.user.clone())
        .take(10)
        .collect()
}`,
  `fn stats(values: &[f64]) -> (f64, f64) {
    let total = values.iter().fold(0.0, |sum, value| sum + value);
    let count = values.len() as f64;

    if count == 0.0 {
        return (0.0, 0.0);
    }

    let mean = total / count;
    let variance = values
        .iter()
        .map(|value| (value - mean).powi(2))
        .sum::<f64>()
        / count;

    (mean, variance.sqrt())
}`,
  `fn print_table(names: &[String], values: &[i32]) {
    let rows = names.iter().zip(values).enumerate();

    for (index, (name, value)) in rows {
        println!("{:>2}. {:<12} {:>4}", index + 1, name, value);
    }
}

fn pairs(values: &[i32]) -> Vec<(i32, i32)> {
    values
        .windows(2)
        .map(|window| (window[0], window[1]))
        .collect()
}`,
  `fn clean(mut rows: Vec<Score>) -> Vec<Score> {
    rows.retain(|score| score.wpm > 0);
    rows.sort_by_key(|score| std::cmp::Reverse(score.wpm));
    rows.dedup_by(|a, b| a.user == b.user);
    rows.truncate(10);
    rows
}

fn marks(panels: &[Panel]) -> Vec<&str> {
    let mut out: Vec<&str> =
        panels.iter().map(|p| p.mark()).collect();

    out.sort_unstable();
    out
}`,
  `use std::collections::HashMap;

fn group_by_language(
    scores: Vec<Score>,
) -> HashMap<String, Vec<Score>> {
    let mut out: HashMap<String, Vec<Score>> = HashMap::new();

    for score in scores {
        out.entry(score.language.clone())
            .or_default()
            .push(score);
    }

    out
}`,
  `use std::collections::HashSet;

fn compare(
    before: &[String],
    after: &[String],
) -> (Vec<String>, Vec<String>) {
    let old: HashSet<&String> = before.iter().collect();
    let new: HashSet<&String> = after.iter().collect();

    let added = new.difference(&old).map(|s| s.to_string()).collect();
    let gone = old.difference(&new).map(|s| s.to_string()).collect();

    (added, gone)
}`,
  `use std::collections::BTreeMap;

fn totals(rows: &[(String, f64)]) -> BTreeMap<String, f64> {
    let mut out = BTreeMap::new();

    for (key, value) in rows {
        *out.entry(key.clone()).or_insert(0.0) += value;
    }

    for (key, value) in &out {
        println!("{key:<12} {value:>8.2}");
    }

    out
}`,
  `use std::collections::{HashSet, VecDeque};

fn breadth_first(graph: &[Vec<usize>], start: usize) -> Vec<usize> {
    let mut seen = HashSet::new();
    let mut queue = VecDeque::from([start]);
    let mut order = Vec::new();

    while let Some(node) = queue.pop_front() {
        if !seen.insert(node) {
            continue;
        }

        order.push(node);
        queue.extend(graph[node].iter().copied());
    }

    order
}`,
  `fn chunk_lines(values: &[i32], size: usize) -> Vec<String> {
    values
        .chunks(size)
        .map(|chunk| {
            chunk
                .iter()
                .map(|n| n.to_string())
                .collect::<Vec<_>>()
                .join(",")
        })
        .collect()
}`,
  `fn slugify(title: &str) -> String {
    let mut out = String::with_capacity(title.len());
    let mut last_dash = true;

    for ch in title.chars() {
        if ch.is_ascii_alphanumeric() {
            out.push(ch.to_ascii_lowercase());
            last_dash = false;
        } else if !last_dash {
            out.push('-');
            last_dash = true;
        }
    }

    out.trim_matches('-').to_string()
}`,
  `fn parse_row(line: &str) -> Option<(String, i32)> {
    let mut parts = line.split(',');
    let name = parts.next()?.trim().to_string();
    let wpm = parts.next()?.trim().parse::<i32>().ok()?;

    if name.is_empty() || !(1..=300).contains(&wpm) {
        return None;
    }

    Some((name, wpm))
}`,
  `enum Command {
    Add { text: String },
    Remove(usize),
    Clear,
}

fn apply(todos: &mut Vec<String>, command: Command) {
    match command {
        Command::Add { text } => todos.push(text),
        Command::Remove(index) if index < todos.len() => {
            todos.remove(index);
        }
        Command::Remove(_) => println!("no such index"),
        Command::Clear => todos.clear(),
    }
}`,
  `fn display_name(user: Option<&User>) -> String {
    user.and_then(|u| u.profile.as_ref())
        .map(|profile| profile.full_name.trim())
        .filter(|name| !name.is_empty())
        .map(str::to_string)
        .unwrap_or_else(|| "anonymous".to_string())
}

fn best(scores: &[Score]) -> Option<&Score> {
    scores.iter().max_by_key(|score| score.wpm)
}`,
  `fn counter() -> impl FnMut() -> u32 {
    let mut count = 0;

    move || {
        count += 1;
        count
    }
}

fn apply_twice<F: Fn(i32) -> i32>(action: F, value: i32) -> i32 {
    action(action(value))
}`,
  `#[derive(Default)]
struct RequestBuilder {
    url: String,
    timeout: u64,
    retries: u8,
}

impl RequestBuilder {
    fn url(mut self, url: &str) -> Self {
        self.url = url.to_string();
        self
    }

    fn retries(mut self, retries: u8) -> Self {
        self.retries = retries;
        self
    }

    fn build(self) -> Request {
        Request::new(self.url, self.timeout, self.retries)
    }
}`,
  `struct Celsius(f64);
struct Fahrenheit(f64);

impl From<Celsius> for Fahrenheit {
    fn from(value: Celsius) -> Self {
        Fahrenheit(value.0 * 9.0 / 5.0 + 32.0)
    }
}

fn main() {
    let boiling: Fahrenheit = Celsius(100.0).into();
    println!("{:.1} F", boiling.0);
}`,
  `use std::convert::TryFrom;

struct Wpm(u16);

impl TryFrom<i32> for Wpm {
    type Error = String;

    fn try_from(value: i32) -> Result<Self, Self::Error> {
        if !(1..=300).contains(&value) {
            return Err(format!("wpm out of range: {value}"));
        }

        Ok(Wpm(value as u16))
    }
}`,
  `use std::ops::Deref;

struct Marks(Vec<String>);

impl Deref for Marks {
    type Target = Vec<String>;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

fn main() {
    let marks = Marks(vec!["PC-01".to_string()]);
    println!("{} marks, first {}", marks.len(), marks[0]);
}`,
  `struct Countdown {
    current: u32,
}

impl Iterator for Countdown {
    type Item = u32;

    fn next(&mut self) -> Option<u32> {
        if self.current == 0 {
            return None;
        }

        self.current -= 1;
        Some(self.current + 1)
    }
}`,
  `use std::cell::RefCell;
use std::rc::Rc;

type Shared = Rc<RefCell<Vec<String>>>;

fn append(log: &Shared, line: &str) {
    log.borrow_mut().push(line.to_string());
}

fn main() {
    let log: Shared = Rc::new(RefCell::new(Vec::new()));
    let clone = Rc::clone(&log);

    append(&clone, "started");

    println!("{} lines", log.borrow().len());
    println!("rc count {}", Rc::strong_count(&log));
}`,
  `use std::sync::{Arc, Mutex};
use std::thread;

fn main() {
    let counter = Arc::new(Mutex::new(0));
    let mut handles = Vec::new();

    for _ in 0..8 {
        let counter = Arc::clone(&counter);

        handles.push(thread::spawn(move || {
            *counter.lock().unwrap() += 1;
        }));
    }

    for handle in handles {
        handle.join().unwrap();
    }

    println!("{}", counter.lock().unwrap());
}`,
  `use std::sync::mpsc;
use std::thread;

fn main() {
    let (sender, receiver) = mpsc::channel();

    for id in 0..4 {
        let sender = sender.clone();

        thread::spawn(move || {
            sender.send(format!("worker {id} done")).unwrap();
        });
    }

    drop(sender);

    for message in receiver {
        println!("{message}");
    }
}`,
  `use tokio::time::{sleep, timeout, Duration};

async fn slow_task() -> u32 {
    sleep(Duration::from_secs(5)).await;
    42
}

#[tokio::main]
async fn main() {
    match timeout(Duration::from_secs(1), slow_task()).await {
        Ok(value) => println!("got {value}"),
        Err(_) => println!("gave up waiting"),
    }
}`,
  `use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
struct Score {
    user: String,
    wpm: u16,
    #[serde(default)]
    accuracy: f32,
    #[serde(rename = "created_at")]
    created: String,
}

fn to_json(score: &Score) -> serde_json::Result<String> {
    serde_json::to_string_pretty(score)
}`,
  `use std::env;

fn main() {
    let args: Vec<String> = env::args().skip(1).collect();

    let path = args.first().map(String::as_str).unwrap_or(".");
    let verbose = args.iter().any(|arg| arg == "-v");

    if verbose {
        println!("scanning {path}");
    }

    let limit: usize = env::var("LIMIT")
        .ok()
        .and_then(|raw| raw.parse().ok())
        .unwrap_or(10);

    println!("limit {limit}");
}`,
  `use std::fs::File;
use std::io::{BufRead, BufReader};

fn error_lines(path: &str) -> std::io::Result<Vec<String>> {
    let file = File::open(path)?;
    let reader = BufReader::new(file);
    let mut out = Vec::new();

    for line in reader.lines() {
        let line = line?;

        if line.contains("ERROR") {
            out.push(line);
        }
    }

    Ok(out)
}`,
  `use std::fs;
use std::io::Write;

fn write_csv(
    path: &str,
    rows: &[(String, u16)],
) -> std::io::Result<()> {
    let mut file = fs::File::create(path)?;
    writeln!(file, "user,wpm")?;

    for (user, wpm) in rows {
        writeln!(file, "{user},{wpm}")?;
    }

    file.flush()
}`,
  `fn binary_search(sorted: &[i32], target: i32) -> Option<usize> {
    let mut low = 0usize;
    let mut high = sorted.len();

    while low < high {
        let mid = low + (high - low) / 2;

        match sorted[mid].cmp(&target) {
            std::cmp::Ordering::Equal => return Some(mid),
            std::cmp::Ordering::Less => low = mid + 1,
            std::cmp::Ordering::Greater => high = mid,
        }
    }

    None
}`,
  `fn quick_sort(values: &mut Vec<i32>) {
    if values.len() <= 1 {
        return;
    }

    let pivot = values.remove(values.len() / 2);
    let mut left: Vec<i32> = Vec::new();
    let mut right: Vec<i32> = Vec::new();

    for value in values.drain(..) {
        if value < pivot {
            left.push(value);
        } else {
            right.push(value);
        }
    }

    quick_sort(&mut left);
    quick_sort(&mut right);

    values.extend(left);
    values.push(pivot);
    values.extend(right);
}`,
  `fn primes_up_to(limit: usize) -> Vec<usize> {
    let mut sieve = vec![true; limit + 1];
    sieve[0] = false;

    if limit >= 1 {
        sieve[1] = false;
    }

    let mut n = 2;
    while n * n <= limit {
        if sieve[n] {
            let mut m = n * n;

            while m <= limit {
                sieve[m] = false;
                m += n;
            }
        }
        n += 1;
    }

    sieve
        .iter()
        .enumerate()
        .filter(|(_, &is_prime)| is_prime)
        .map(|(index, _)| index)
        .collect()
}`,
  `fn multiply(a: &[Vec<i32>], b: &[Vec<i32>]) -> Vec<Vec<i32>> {
    let rows = a.len();
    let cols = b[0].len();
    let shared = b.len();
    let mut out = vec![vec![0; cols]; rows];

    for i in 0..rows {
        for j in 0..cols {
            for k in 0..shared {
                out[i][j] += a[i][k] * b[k][j];
            }
        }
    }

    out
}`,
  `fn fib(n: usize, memo: &mut Vec<Option<u64>>) -> u64 {
    if n < 2 {
        return n as u64;
    }

    if let Some(value) = memo[n] {
        return value;
    }

    let value = fib(n - 1, memo) + fib(n - 2, memo);
    memo[n] = Some(value);
    value
}

fn gcd(a: u64, b: u64) -> u64 {
    if b == 0 { a } else { gcd(b, a % b) }
}`,
  `#[derive(Debug, Clone, Copy, PartialEq)]
enum Level {
    Debug,
    Info,
    Warn,
    Error,
}

impl Level {
    fn weight(self) -> u8 {
        match self {
            Level::Debug => 10,
            Level::Info => 20,
            Level::Warn => 30,
            Level::Error => 40,
        }
    }

    fn at_least(self, other: Level) -> bool {
        self.weight() >= other.weight()
    }
}`,
  `fn grade(score: u32) -> &'static str {
    match score {
        0..=59 => "F",
        60..=69 => "D",
        70..=79 => "C",
        80..=89 => "B",
        _ => "A",
    }
}

fn quadrant(point: (i32, i32)) -> &'static str {
    match point {
        (0, 0) => "origin",
        (x, y) if x > 0 && y > 0 => "first",
        (x, _) if x < 0 => "left half",
        _ => "somewhere else",
    }
}`,
  `#[derive(Debug, PartialEq, Eq, PartialOrd, Ord)]
struct Version {
    major: u32,
    minor: u32,
    patch: u32,
}

fn main() {
    let mut releases = vec![
        Version { major: 1, minor: 10, patch: 0 },
        Version { major: 1, minor: 2, patch: 3 },
    ];

    releases.sort();
    println!("{:?}", releases.first());
}`,
  `fn describe(values: &[i32]) -> String {
    match values {
        [] => "empty".to_string(),
        [single] => format!("one value: {single}"),
        [first, .., last] => format!("{first} up to {last}"),
    }
}

fn sum_first_two(values: &[i32]) -> i32 {
    if let [a, b, ..] = values {
        a + b
    } else {
        0
    }
}`,
  `use std::error::Error;

fn parse_all(lines: &[&str]) -> Result<Vec<u16>, Box<dyn Error>> {
    let mut out = Vec::with_capacity(lines.len());

    for line in lines {
        let value: u16 = line.trim().parse()?;
        out.push(value);
    }

    Ok(out)
}

fn main() -> Result<(), Box<dyn Error>> {
    let values = parse_all(&["10", "20", "30"])?;
    println!("{:?}", values);
    Ok(())
}`,
])
