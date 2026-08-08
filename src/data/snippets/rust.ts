import type { Snippet } from '../types'

export const rustSnippets: Snippet[] = [
  {
    id: 'rust-fn',
    language: 'rust',
    title: 'Function',
    code: `fn add(a: i32, b: i32) -> i32 {\n    a + b\n}`,
  },
  {
    id: 'rust-match-option',
    language: 'rust',
    title: 'Match on Option',
    code: `match config.get("port") {\n    Some(value) => println!("port {}", value),\n    None => println!("no port"),\n}`,
  },
  {
    id: 'rust-struct-impl',
    language: 'rust',
    // Chỉ giữ khối impl: thêm cả `struct` vào là 9 dòng, vượt khung code 260px.
    title: 'impl block',
    code: `impl User {\n    fn greet(&self) -> String {\n        format!("hi {}", self.name)\n    }\n}`,
  },
  {
    id: 'rust-result',
    language: 'rust',
    title: 'Result + ? operator',
    code: `fn read_config(path: &str) -> Result<String, io::Error> {\n    let text = fs::read_to_string(path)?;\n    Ok(text)\n}`,
  },
  {
    id: 'rust-iterator',
    language: 'rust',
    title: 'Iterator chain',
    code: `let evens: Vec<i32> = nums\n    .iter()\n    .filter(|n| *n % 2 == 0)\n    .cloned()\n    .collect();`,
  },
  {
    id: 'rust-trait',
    language: 'rust',
    title: 'Trait',
    code: `trait Shape {\n    fn area(&self) -> f64;\n}`,
  },
  {
    id: 'rust-enum',
    language: 'rust',
    title: 'Enum + variants',
    code: `enum State {\n    Idle,\n    Typing { wpm: u32 },\n    Done(bool),\n}`,
  },
  {
    id: 'rust-mut-borrow',
    language: 'rust',
    title: 'Mutable borrow',
    code: `let mut scores = vec![1, 2, 3];\npush_score(&mut scores, 4);`,
  },
]
