import type { Snippet } from '../types'

export const javaSnippets: Snippet[] = [
  {
    id: 'java-main',
    language: 'java',
    title: 'Main method',
    code: `public static void main(String[] args) {\n    System.out.println("Hello");\n}`,
  },
  {
    id: 'java-class',
    language: 'java',
    title: 'Class + constructor',
    code: `public class Point {\n    private final int x;\n\n    public Point(int x) {\n        this.x = x;\n    }\n}`,
  },
  {
    id: 'java-for-each',
    language: 'java',
    title: 'For-each loop',
    code: `for (String item : items) {\n    System.out.println(item);\n}`,
  },
  {
    id: 'java-stream',
    language: 'java',
    title: 'Stream API',
    code: `List<String> names = users.stream()\n    .map(User::getName)\n    .collect(Collectors.toList());`,
  },
  {
    id: 'java-try-catch',
    language: 'java',
    title: 'Try/catch',
    code: `try {\n    int value = Integer.parseInt(text);\n} catch (NumberFormatException e) {\n    e.printStackTrace();\n}`,
  },
  {
    id: 'java-interface',
    language: 'java',
    title: 'Interface',
    code: `public interface Shape {\n    double getArea();\n}`,
  },
  {
    id: 'java-generics',
    language: 'java',
    title: 'Generics',
    code: `Map<String, List<Integer>> data = new HashMap<>();\ndata.put("scores", List.of(1, 2, 3));`,
  },
  {
    id: 'java-record',
    language: 'java',
    title: 'Record',
    code: `public record Point(int x, int y) {\n    double length() {\n        return Math.sqrt(x * x + y * y);\n    }\n}`,
  },
  {
    id: 'java-optional',
    language: 'java',
    title: 'Optional',
    code: `String name = Optional.ofNullable(user)\n    .map(User::getName)\n    .orElse("unknown");`,
  },
  {
    id: 'java-switch-arrow',
    language: 'java',
    title: 'Switch expression',
    code: `String label = switch (status) {\n    case 1 -> "Active";\n    default -> "Unknown";\n};`,
  },
  {
    id: 'java-try-resource',
    language: 'java',
    title: 'Try-with-resources',
    code: `try (var reader = new BufferedReader(new FileReader(path))) {\n    return reader.readLine();\n}`,
  },
  {
    id: 'java-stream-filter',
    language: 'java',
    title: 'Stream filter + sum',
    code: `int total = items.stream()\n    .filter(i -> i.getPrice() > 0)\n    .mapToInt(Item::getPrice)\n    .sum();`,
  },
]
