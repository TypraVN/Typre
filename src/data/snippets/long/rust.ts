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
])
