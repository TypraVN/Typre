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
])
