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
  `public static Map<String, Integer> wordCount(Path path)
        throws IOException {
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
        var value = Double.parseDouble(parts[1]);
        totals.merge(parts[0], value, Double::sum);
    }

    totals.forEach((key, value) ->
        System.out.printf("%-12s %8.2f%n", key, value));
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
  `public record Score(String user, int wpm, double accuracy) {
    public Score {
        if (wpm < 0 || wpm > 300) {
            throw new IllegalArgumentException("wpm: " + wpm);
        }
    }

    public boolean isValid() {
        return accuracy >= 50.0;
    }
}`,
  `public sealed interface Shape permits Circle, Square, Rect {
}

public static double area(Shape shape) {
    return switch (shape) {
        case Circle c -> Math.PI * c.radius() * c.radius();
        case Square s -> s.side() * s.side();
        case Rect r -> r.width() * r.height();
    };
}`,
  `public static String displayName(User user) {
    return Optional.ofNullable(user)
        .map(User::profile)
        .map(Profile::fullName)
        .filter(name -> !name.isBlank())
        .map(String::trim)
        .orElse("anonymous");
}

public static Optional<Score> best(List<Score> scores) {
    return scores.stream()
        .max(Comparator.comparingInt(Score::wpm));
}`,
  `public static Map<String, List<Score>> byLanguage(
        List<Score> scores) {
    return scores.stream()
        .filter(Score::isValid)
        .collect(Collectors.groupingBy(
            Score::language,
            TreeMap::new,
            Collectors.toList()));
}`,
  `public static void report(List<Score> scores) {
    var stats = scores.stream()
        .collect(Collectors.summarizingInt(Score::wpm));

    var split = scores.stream()
        .collect(Collectors.partitioningBy(s -> s.wpm() >= 60));

    System.out.printf("avg %.1f max %d%n",
        stats.getAverage(), stats.getMax());

    System.out.println("fast: " + split.get(true).size());
}`,
  `public static CompletableFuture<List<String>> loadAll(
        List<String> urls) {
    var futures = urls.stream()
        .map(url -> CompletableFuture.supplyAsync(() -> fetch(url)))
        .toList();

    return CompletableFuture
        .allOf(futures.toArray(CompletableFuture[]::new))
        .thenApply(ignored -> futures.stream()
            .map(CompletableFuture::join)
            .toList());
}`,
  `public static void runAll(List<Runnable> jobs) throws Exception {
    try (var pool = Executors.newFixedThreadPool(4)) {
        for (var job : jobs) {
            pool.submit(job);
        }
    }
}

public static ExecutorService virtualPool() {
    return Executors.newVirtualThreadPerTaskExecutor();
}`,
  `public List<Score> topScores(int limit) throws SQLException {
    var sql = "select user_name, wpm from scores order by wpm desc";
    var rows = new ArrayList<Score>();

    try (var statement = connection.prepareStatement(sql)) {
        statement.setMaxRows(limit);

        try (var result = statement.executeQuery()) {
            while (result.next()) {
                rows.add(new Score(
                    result.getString(1),
                    result.getInt(2)));
            }
        }
    }

    return rows;
}`,
  `public static String get(String url) throws Exception {
    var client = HttpClient.newHttpClient();

    var request = HttpRequest.newBuilder()
        .uri(URI.create(url))
        .header("accept", "application/json")
        .timeout(Duration.ofSeconds(10))
        .GET()
        .build();

    var response = client.send(request, BodyHandlers.ofString());
    return response.body();
}`,
  `private static final ObjectMapper MAPPER = new ObjectMapper()
    .registerModule(new JavaTimeModule())
    .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

public static String toJson(Object value) throws IOException {
    return MAPPER.writerWithDefaultPrettyPrinter()
        .writeValueAsString(value);
}

public static <T> T fromJson(String json, Class<T> type)
        throws IOException {
    return MAPPER.readValue(json, type);
}`,
  `@RestController
@RequestMapping("/api/scores")
public class ScoreController {
    private final ScoreService service;

    public ScoreController(ScoreService service) {
        this.service = service;
    }

    @GetMapping("/{language}")
    public List<Score> top(
            @PathVariable String language,
            @RequestParam(defaultValue = "10") int limit) {
        return service.topScores(language, limit);
    }
}`,
  `@Entity
@Table(name = "scores")
public class ScoreEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 32)
    private String displayName;

    @Column(nullable = false)
    private int wpm;

    @CreationTimestamp
    private Instant createdAt;
}`,
  `class SlugifyTest {
    @ParameterizedTest
    @CsvSource({
        "Hello World, hello-world",
        "a!!b??c, a-b-c",
    })
    void normalises(String input, String expected) {
        assertEquals(expected, Slugify.run(input));
    }

    @Test
    void rejectsNull() {
        assertThrows(
            NullPointerException.class,
            () -> Slugify.run(null));
    }
}`,
  `public class Report {
    private final String title;
    private final List<String> rows;

    private Report(Builder builder) {
        this.title = builder.title;
        this.rows = List.copyOf(builder.rows);
    }

    public static class Builder {
        private String title = "report";
        private final List<String> rows = new ArrayList<>();

        public Builder row(String value) {
            rows.add(value);
            return this;
        }

        public Report build() {
            return new Report(this);
        }
    }
}`,
  `public enum Level {
    DEBUG(10, "gray"),
    INFO(20, "blue"),
    WARN(30, "orange"),
    ERROR(40, "red");

    private final int weight;
    private final String color;

    Level(int weight, String color) {
        this.weight = weight;
        this.color = color;
    }

    public boolean atLeast(Level other) {
        return weight >= other.weight;
    }
}`,
  `public interface Exporter {
    String dump(List<Score> rows);

    default void save(Path path, List<Score> rows)
            throws IOException {
        Files.writeString(path, dump(rows), StandardCharsets.UTF_8);
    }

    static Exporter csv() {
        return rows -> rows.stream()
            .map(row -> row.user() + "," + row.wpm())
            .collect(Collectors.joining("\\n"));
    }
}`,
  `public abstract class Shape {
    public abstract double area();

    public String describe() {
        return getClass().getSimpleName() + " " + round(area());
    }

    protected static double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}`,
  `public static <T extends Comparable<T>> T maxOf(List<T> items) {
    if (items.isEmpty()) {
        throw new NoSuchElementException("empty list");
    }

    var best = items.get(0);

    for (var item : items) {
        if (item.compareTo(best) > 0) {
            best = item;
        }
    }

    return best;
}`,
  `public static String join(String separator, Object... parts) {
    var builder = new StringBuilder();

    for (var i = 0; i < parts.length; i++) {
        if (i > 0) {
            builder.append(separator);
        }
        builder.append(parts[i]);
    }

    return builder.toString();
}`,
  `public class Range implements Iterable<Integer> {
    private final int from;
    private final int to;

    public Range(int from, int to) {
        this.from = from;
        this.to = to;
    }

    @Override
    public Iterator<Integer> iterator() {
        return IntStream.range(from, to).iterator();
    }
}`,
  `public static List<Score> ranked(List<Score> scores) {
    var order = Comparator
        .comparingInt(Score::wpm).reversed()
        .thenComparing(Score::accuracy, Comparator.reverseOrder())
        .thenComparing(Score::user);

    return scores.stream().sorted(order).toList();
}`,
  `public final class Mark {
    private final String code;
    private final int revision;

    @Override
    public boolean equals(Object other) {
        if (this == other) {
            return true;
        }
        if (!(other instanceof Mark mark)) {
            return false;
        }
        return revision == mark.revision && code.equals(mark.code);
    }

    @Override
    public int hashCode() {
        return Objects.hash(code, revision);
    }
}`,
  `private static final String QUERY = """
        select language, time_limit, max(wpm) as best
        from scores
        where accuracy >= 50
        group by language, time_limit
        order by best desc
        """;

public static long lineCount() {
    return QUERY.strip().lines().count();
}`,
  `public static int weight(String size) {
    return switch (size) {
        case "small" -> 1;
        case "medium" -> 2;
        case "large" -> {
            var bonus = 1;
            yield 3 + bonus;
        }
        default -> throw new IllegalArgumentException(size);
    };
}`,
  `public static boolean balanced(String text) {
    var stack = new ArrayDeque<Character>();
    var pairs = Map.of(')', '(', ']', '[', '}', '{');

    for (var ch : text.toCharArray()) {
        if (pairs.containsValue(ch)) {
            stack.push(ch);
        } else if (pairs.containsKey(ch)) {
            if (stack.isEmpty() || stack.pop() != pairs.get(ch)) {
                return false;
            }
        }
    }

    return stack.isEmpty();
}`,
  `public static List<String> topWords(
        Map<String, Integer> counts,
        int n) {
    var queue = new PriorityQueue<Map.Entry<String, Integer>>(
        Map.Entry.comparingByValue());

    for (var entry : counts.entrySet()) {
        queue.offer(entry);

        if (queue.size() > n) {
            queue.poll();
        }
    }

    return queue.stream().map(Map.Entry::getKey).toList();
}`,
  `public static List<Integer> primesUpTo(int limit) {
    var sieve = new boolean[limit + 1];
    Arrays.fill(sieve, true);
    sieve[0] = false;
    sieve[1] = false;

    for (var n = 2; (long) n * n <= limit; n++) {
        if (!sieve[n]) {
            continue;
        }

        for (var m = n * n; m <= limit; m += n) {
            sieve[m] = false;
        }
    }

    return IntStream.rangeClosed(0, limit)
        .filter(n -> sieve[n])
        .boxed()
        .toList();
}`,
  `public static BigDecimal total(
        List<BigDecimal> amounts,
        double taxRate) {
    var sum = amounts.stream()
        .reduce(BigDecimal.ZERO, BigDecimal::add);

    var tax = sum.multiply(BigDecimal.valueOf(taxRate));

    return sum.add(tax).setScale(2, RoundingMode.HALF_UP);
}`,
  `public static long workingDays(LocalDate from, LocalDate to) {
    return from.datesUntil(to.plusDays(1))
        .filter(day -> day.getDayOfWeek() != DayOfWeek.SATURDAY)
        .filter(day -> day.getDayOfWeek() != DayOfWeek.SUNDAY)
        .count();
}

public static String age(LocalDate birthday) {
    var period = Period.between(birthday, LocalDate.now());
    return period.getYears() + "y " + period.getMonths() + "m";
}`,
  `private static final DateTimeFormatter FORMAT =
    DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

public static String format(Instant instant) {
    return FORMAT.format(instant.atZone(ZoneId.systemDefault()));
}

public static LocalDate parse(String text) {
    try {
        return LocalDate.parse(text);
    } catch (DateTimeParseException ex) {
        return LocalDate.parse(text, DateTimeFormatter.ISO_DATE);
    }
}`,
  `public static String slugify(String title) {
    var normalised = Normalizer.normalize(
        title.toLowerCase(),
        Normalizer.Form.NFD);

    return normalised
        .replaceAll("\\\\p{M}", "")
        .replaceAll("[^a-z0-9]+", "-")
        .replaceAll("^-|-$", "");
}`,
  `public static boolean isPalindrome(String text) {
    var clean = text.toLowerCase().replaceAll("[^a-z0-9]", "");
    var reversed = new StringBuilder(clean).reverse().toString();
    return clean.equals(reversed);
}

public static String reverseWords(String sentence) {
    var words = new ArrayList<>(
        Arrays.asList(sentence.trim().split("\\\\s+")));
    Collections.reverse(words);
    return String.join(" ", words);
}`,
  `public static int binarySearch(int[] sorted, int target) {
    var low = 0;
    var high = sorted.length - 1;

    while (low <= high) {
        var mid = (low + high) >>> 1;

        if (sorted[mid] == target) {
            return mid;
        }
        if (sorted[mid] < target) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }

    return -1;
}`,
  `public static void quickSort(int[] values, int low, int high) {
    if (low >= high) {
        return;
    }

    var pivot = values[high];
    var index = low;

    for (var i = low; i < high; i++) {
        if (values[i] < pivot) {
            var temp = values[i];
            values[i] = values[index];
            values[index++] = temp;
        }
    }

    values[high] = values[index];
    values[index] = pivot;

    quickSort(values, low, index - 1);
    quickSort(values, index + 1, high);
}`,
  `public static int[][] multiply(int[][] a, int[][] b) {
    var rows = a.length;
    var cols = b[0].length;
    var shared = b.length;
    var out = new int[rows][cols];

    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < cols; j++) {
            var sum = 0;

            for (var k = 0; k < shared; k++) {
                sum += a[i][k] * b[k][j];
            }

            out[i][j] = sum;
        }
    }

    return out;
}`,
  `public static long fib(int n) {
    var memo = new long[Math.max(n + 1, 2)];
    Arrays.fill(memo, -1);
    return fib(n, memo);
}

private static long fib(int n, long[] memo) {
    if (n < 2) {
        return n;
    }
    if (memo[n] >= 0) {
        return memo[n];
    }

    memo[n] = fib(n - 1, memo) + fib(n - 2, memo);
    return memo[n];
}`,
  `public static List<String> breadthFirst(
        Map<String, List<String>> graph,
        String start) {
    var visited = new LinkedHashSet<String>();
    var queue = new ArrayDeque<String>();
    queue.add(start);

    while (!queue.isEmpty()) {
        var node = queue.poll();

        if (visited.add(node)) {
            queue.addAll(graph.getOrDefault(node, List.of()));
        }
    }

    return List.copyOf(visited);
}`,
  `public static void depthFirst(
        Map<String, List<String>> graph,
        String node,
        Set<String> seen) {
    if (!seen.add(node)) {
        return;
    }

    System.out.println(node);

    for (var next : graph.getOrDefault(node, List.of())) {
        depthFirst(graph, next, seen);
    }
}`,
  `public class SubmitException extends RuntimeException {
    private final int status;

    public SubmitException(int status, String url) {
        super("submit rejected with " + status + " for " + url);
        this.status = status;
    }

    public boolean isRetryable() {
        return status >= 500 || status == 429;
    }
}`,
  `public class Counter {
    private final AtomicInteger value = new AtomicInteger();

    public int increment() {
        return value.incrementAndGet();
    }

    public int addAndGet(int amount) {
        return value.addAndGet(amount);
    }

    public void reset() {
        value.set(0);
    }
}`,
  `private final ReentrantLock lock = new ReentrantLock();

public void append(String line) {
    lock.lock();

    try {
        buffer.add(line);

        if (buffer.size() >= 100) {
            flush();
        }
    } finally {
        lock.unlock();
    }
}`,
  `public static List<Path> findJava(Path root) throws IOException {
    try (var paths = Files.walk(root)) {
        return paths
            .filter(Files::isRegularFile)
            .filter(path -> path.toString().endsWith(".java"))
            .sorted()
            .toList();
    }
}`,
  `public static Properties loadConfig(Path path) throws IOException {
    var config = new Properties();
    config.setProperty("timeout", "30");
    config.setProperty("retries", "3");

    if (Files.exists(path)) {
        try (var reader = Files.newBufferedReader(path)) {
            config.load(reader);
        }
    }

    return config;
}`,
  `public static List<String> allTags(List<Post> posts) {
    return posts.stream()
        .map(Post::tags)
        .flatMap(List::stream)
        .map(String::toLowerCase)
        .distinct()
        .sorted()
        .toList();
}`,

  `public static <T> List<List<T>> chunk(List<T> items, int size) {
    if (size < 1) throw new IllegalArgumentException("size must be positive");

    var chunks = new ArrayList<List<T>>();

    for (var start = 0; start < items.size(); start += size) {
        var end = Math.min(start + size, items.size());
        chunks.add(List.copyOf(items.subList(start, end)));
    }

    return chunks;
}`,
  `public static String encode(String text) {
    if (text.isEmpty()) return "";

    var out = new StringBuilder();
    var run = 1;

    for (var i = 1; i <= text.length(); i++) {
        if (i < text.length() && text.charAt(i) == text.charAt(i - 1)) {
            run++;
            continue;
        }

        out.append(text.charAt(i - 1));
        if (run > 1) out.append(run);
        run = 1;
    }

    return out.toString();
}`,
  `public final class Debouncer implements AutoCloseable {
    private final ScheduledExecutorService pool =
        Executors.newSingleThreadScheduledExecutor();
    private ScheduledFuture<?> pending;

    public synchronized void run(Runnable task, long delayMs) {
        if (pending != null) pending.cancel(false);
        pending = pool.schedule(task, delayMs, TimeUnit.MILLISECONDS);
    }

    @Override
    public void close() {
        pool.shutdownNow();
    }
}`,
  `public static List<int[]> merge(List<int[]> intervals) {
    var sorted = new ArrayList<>(intervals);
    sorted.sort(Comparator.comparingInt(range -> range[0]));

    var merged = new ArrayList<int[]>();

    for (var range : sorted) {
        if (!merged.isEmpty() && range[0] <= merged.getLast()[1]) {
            merged.getLast()[1] = Math.max(merged.getLast()[1], range[1]);
        } else {
            merged.add(new int[] {range[0], range[1]});
        }
    }

    return merged;
}`,
  `public static Map<String, Object> flatten(
    Map<String, Object> source,
    String prefix) {
    var flat = new LinkedHashMap<String, Object>();

    source.forEach((key, value) -> {
        var path = prefix.isEmpty() ? key : prefix + "." + key;

        if (value instanceof Map<?, ?> nested) {
            @SuppressWarnings("unchecked")
            var typed = (Map<String, Object>) nested;
            flat.putAll(flatten(typed, path));
        } else {
            flat.put(path, value);
        }
    });

    return flat;
}`,
  `public static int compareVersions(String left, String right) {
    var a = left.split("\\.");
    var b = right.split("\\.");

    for (var i = 0; i < Math.max(a.length, b.length); i++) {
        var x = i < a.length ? Integer.parseInt(a[i]) : 0;
        var y = i < b.length ? Integer.parseInt(b[i]) : 0;

        if (x != y) return Integer.compare(x, y);
    }

    return 0;
}`,
  `public final class Trie {
    private final Map<Character, Trie> children = new HashMap<>();
    private boolean terminal;

    public void insert(String word) {
        var node = this;

        for (var ch : word.toCharArray()) {
            node = node.children.computeIfAbsent(ch, key -> new Trie());
        }

        node.terminal = true;
    }

    public boolean contains(String word) {
        var node = this;

        for (var ch : word.toCharArray()) {
            node = node.children.get(ch);
            if (node == null) return false;
        }

        return node.terminal;
    }
}`,
  `public static <T> T retry(
    Callable<T> task,
    int attempts) throws Exception {
    Exception last = null;

    for (var attempt = 1; attempt <= attempts; attempt++) {
        try {
            return task.call();
        } catch (Exception error) {
            last = error;
            Thread.sleep(200L * attempt);
        }
    }

    throw last;
}`,
  `public static List<String> topWords(String text, int limit) {
    var counts = new HashMap<String, Integer>();

    for (var word : text.toLowerCase().split("[^a-z]+")) {
        if (word.length() > 2) counts.merge(word, 1, Integer::sum);
    }

    return counts.entrySet().stream()
        .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
        .limit(limit)
        .map(Map.Entry::getKey)
        .toList();
}`,
  `public sealed interface Event
    permits Event.Started, Event.Finished, Event.Failed {

    record Started(Instant at) implements Event {}
    record Finished(int wpm, double accuracy) implements Event {}
    record Failed(String reason) implements Event {}

    static String describe(Event event) {
        return switch (event) {
            case Started started -> "started at " + started.at();
            case Finished done -> done.wpm() + " wpm";
            case Failed failed -> "failed: " + failed.reason();
        };
    }
}`,
])
