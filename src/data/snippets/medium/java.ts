import { defineSnippets } from '../define'

/** Bài TRUNG BÌNH cho mốc 30s — xem chú thích trong `medium/javascript.ts`. */
export const javaMedium = defineSnippets('java', 'java-med', [
  `var adults = people.stream()
    .filter(p -> p.age() >= 18)
    .map(Person::name)
    .toList();`,
  `public static int sum(List<Integer> values) {
    int total = 0;
    for (int value : values) {
        total += value;
    }
    return total;
}`,
  `try (var reader = Files.newBufferedReader(path)) {
    String line;
    while ((line = reader.readLine()) != null) {
        rows.add(line.split(","));
    }
}`,
  `Map<String, List<Item>> byType = items.stream()
    .collect(Collectors.groupingBy(Item::type));`,
  `public record Score(String user, int wpm, int accuracy) {
    public boolean isValid() {
        return wpm > 0 && wpm <= 300 && accuracy >= 50;
    }
}`,
  `Optional<User> found = repo.findById(id);
String label = found
    .map(User::name)
    .orElse("guest");`,
  `public void run() {
    var executor = Executors.newFixedThreadPool(4);
    for (var job : jobs) {
        executor.submit(() -> process(job));
    }
    executor.shutdown();
}`,
  `var label = switch (status) {
    case IDLE -> "waiting";
    case RUNNING -> "working";
    default -> "done";
};`,
  `public class Panel implements Comparable<Panel> {
    private final String mark;

    @Override
    public int compareTo(Panel other) {
        return mark.compareTo(other.mark);
    }
}`,
  `StringBuilder sb = new StringBuilder();
for (var panel : panels) {
    sb.append(panel.mark()).append(" = ");
    sb.append(panel.weight()).append(" kg\\n");
}`,
  `var names = scores.stream()
    .map(Score::user)
    .map(String::toUpperCase)
    .toList();`,
  `var ranked = scores.stream()
    .sorted(Comparator.comparingInt(Score::wpm).reversed())
    .limit(10)
    .toList();`,
  `boolean anyFast = scores.stream().anyMatch(s -> s.wpm() >= 100);
boolean allOk = scores.stream().allMatch(s -> s.wpm() > 0);

System.out.println(anyFast + " " + allOk);`,
  `var stats = scores.stream()
    .mapToInt(Score::wpm)
    .summaryStatistics();

System.out.printf("%d %.1f%n", stats.getMax(), stats.getAverage());`,
  `var page = scores.stream()
    .skip(pageIndex * 10L)
    .limit(10)
    .toList();`,
  `var tags = posts.stream()
    .flatMap(post -> post.tags().stream())
    .distinct()
    .sorted()
    .toList();`,
  `String line = scores.stream()
    .map(s -> s.user() + ":" + s.wpm())
    .collect(Collectors.joining(", ", "[", "]"));`,
  `Map<String, Integer> best = scores.stream()
    .collect(Collectors.toMap(
        Score::user, Score::wpm, Integer::max));`,
  `String label = repo.findById(id)
    .map(User::name)
    .filter(name -> !name.isBlank())
    .orElseGet(() -> "anonymous");`,
  `var query = """
    select language, max(wpm) as best
    from scores
    group by language
    """;

System.out.println(query.lines().count());`,
  `if (payload instanceof Score score && score.wpm() > 60) {
    System.out.println("fast run by " + score.user());
}`,
  `double area = switch (shape) {
    case Circle c -> Math.PI * c.radius() * c.radius();
    case Square s -> s.side() * s.side();
    default -> 0.0;
};`,
  `try (var in = Files.newInputStream(source);
     var out = Files.newOutputStream(target)) {
    in.transferTo(out);
}`,
  `var text = Files.readString(path, StandardCharsets.UTF_8);
Files.writeString(target, text.toUpperCase());

System.out.println(Files.size(target) + " bytes");`,
  `try (var lines = Files.lines(path)) {
    long errors = lines.filter(line -> line.contains("ERROR")).count();
    System.out.println(errors + " errors");
}`,
  `var limits = List.of(15, 30, 60);
var labels = Map.of(15, "short", 30, "medium", 60, "long");

limits.forEach(limit -> System.out.println(labels.get(limit)));`,
  `var groups = new HashMap<String, List<Integer>>();

for (var score : scores) {
    groups.computeIfAbsent(score.language(), key -> new ArrayList<>())
        .add(score.wpm());
}`,
  `var totals = new HashMap<String, Integer>();

for (var score : scores) {
    totals.merge(score.language(), score.wpm(), Integer::sum);
}`,
  `int[] values = {9, 4, 7, 1};
Arrays.sort(values);

int at = Arrays.binarySearch(values, 7);
System.out.println(Arrays.toString(values) + " " + at);`,
  `var clean = title.toLowerCase().replaceAll("[^a-z0-9]+", "-");
var reversed = new StringBuilder(clean).reverse().toString();

System.out.println(clean + " / " + reversed);`,
  `var row = "%-14s %5d %6.1f%%".formatted(user, wpm, accuracy);
var joined = String.join(" | ", "rust", "sql", "go");

System.out.println(row);
System.out.println(joined);`,
  `var day = LocalDate.parse("2026-08-11");
var pattern = DateTimeFormatter.ofPattern("dd/MM/yyyy");

System.out.println(day.plusWeeks(2).format(pattern));`,
  `var start = Instant.now();
doWork();

var took = Duration.between(start, Instant.now());
System.out.println(took.toMillis() + "ms");`,
  `var future = CompletableFuture
    .supplyAsync(() -> fetch(url))
    .thenApply(String::trim)
    .exceptionally(error -> "");

System.out.println(future.join().length());`,
  `try (var pool = Executors.newFixedThreadPool(4)) {
    for (var job : jobs) {
        pool.submit(job);
    }
}`,
  `private final AtomicInteger hits = new AtomicInteger();

public int record() {
    return hits.incrementAndGet();
}`,
  `Objects.requireNonNull(config, "config is required");

if (wpm <= 0 || wpm > 300) {
    throw new IllegalArgumentException("wpm: " + wpm);
}`,
  `var queue = new PriorityQueue<Score>(
    Comparator.comparingInt(Score::wpm));

queue.addAll(scores);
System.out.println(queue.peek());`,
  `var stack = new ArrayDeque<Character>();

for (var ch : text.toCharArray()) {
    if (ch == '(') stack.push(ch);
    if (ch == ')' && stack.isEmpty()) return false;
}`,
  `public enum Level {
    INFO(20),
    ERROR(40);

    private final int weight;

    Level(int weight) {
        this.weight = weight;
    }
}`,

  `var top = scores.stream()
    .sorted(Comparator.comparingInt(Score::wpm).reversed())
    .limit(3)
    .toList();`,
  `var summary = scores.stream()
    .collect(Collectors.teeing(
        Collectors.counting(),
        Collectors.averagingInt(Score::wpm),
        (count, mean) -> count + " runs, " + mean + " wpm"));`,
  `var deque = new ArrayDeque<Integer>();

for (var value : values) {
    while (!deque.isEmpty() && deque.peekLast() < value) deque.pollLast();
    deque.addLast(value);
}`,
  `record Pair<A, B>(A first, B second) {
    static <A, B> Pair<A, B> of(A first, B second) {
        return new Pair<>(first, second);
    }
}`,
  `var counts = new TreeMap<String, Integer>();

for (var word : text.split("\\s+")) {
    counts.merge(word.toLowerCase(), 1, Integer::sum);
}`,
  `try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
    var user = scope.fork(() -> loadUser(id));
    var runs = scope.fork(() -> loadRuns(id));

    scope.join().throwIfFailed();
}`,
  `var text = switch (level) {
    case LOW, MEDIUM -> "keep going";
    case HIGH -> "excellent";
};`,
  `var iso = DateTimeFormatter.ISO_LOCAL_DATE.format(day);
var parsed = LocalDate.parse(iso, DateTimeFormatter.ISO_LOCAL_DATE);`,
  `var partitions = scores.stream()
    .collect(Collectors.partitioningBy(score -> score.wpm() >= 60));`,
  `var thread = Thread.ofVirtual().start(() -> {
    process(job);
});

thread.join();`,
])
