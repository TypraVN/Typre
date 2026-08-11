import { defineSnippets } from '../define'

/** Bài DÀI cho mốc 60s — xem chú thích trong `long/javascript.ts`. */
export const javaLong = defineSnippets('java', 'java-long', [
  `public class Panel implements Comparable<Panel> {
    private final String mark;
    private final double weight;

    public Panel(String mark, double weight) {
        this.mark = mark;
        this.weight = weight;
    }

    public boolean isHeavy() {
        return weight > 5000;
    }

    @Override
    public int compareTo(Panel other) {
        return Double.compare(other.weight, weight);
    }
}`,
  `public static Map<String, Integer> wordCount(Path path) throws IOException {
    var counts = new HashMap<String, Integer>();

    try (var lines = Files.lines(path)) {
        lines.flatMap(line -> Arrays.stream(line.split("\\\\W+")))
            .filter(word -> !word.isBlank())
            .map(String::toLowerCase)
            .forEach(word -> counts.merge(word, 1, Integer::sum));
    }

    return counts;
}`,
  `public class Cache<K, V> {
    private final Map<K, V> entries = new HashMap<>();
    private final int capacity;

    public Cache(int capacity) {
        this.capacity = capacity;
    }

    public V getOrCompute(K key, Function<K, V> loader) {
        return entries.computeIfAbsent(key, k -> {
            if (entries.size() >= capacity) {
                entries.clear();
            }
            return loader.apply(k);
        });
    }
}`,
  `public static void main(String[] args) {
    var scanner = new Scanner(System.in);
    var totals = new TreeMap<String, Double>();

    while (scanner.hasNextLine()) {
        var parts = scanner.nextLine().split(",");
        if (parts.length < 2) continue;
        totals.merge(parts[0], Double.parseDouble(parts[1]), Double::sum);
    }

    totals.forEach((key, value) -> System.out.printf("%-12s %8.2f%n", key, value));
}`,
  `@Service
public class ScoreService {
    private final ScoreRepository repository;

    public ScoreService(ScoreRepository repository) {
        this.repository = repository;
    }

    public List<Score> topScores(String language, int limit) {
        return repository.findByLanguage(language).stream()
            .filter(Score::isValid)
            .sorted(Comparator.comparingInt(Score::wpm).reversed())
            .limit(limit)
            .toList();
    }
}`,
  `public static String formatDuration(long seconds) {
    long hours = seconds / 3600;
    long minutes = (seconds % 3600) / 60;
    long rest = seconds % 60;

    if (hours > 0) {
        return String.format("%d:%02d:%02d", hours, minutes, rest);
    }

    return String.format("%d:%02d", minutes, rest);
}`,
])
