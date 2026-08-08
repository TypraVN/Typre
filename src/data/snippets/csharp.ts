import type { Snippet } from '../types'

export const csharpSnippets: Snippet[] = [
  {
    id: 'cs-method',
    language: 'csharp',
    title: 'Simple method',
    code: `public int Add(int a, int b)\n{\n    return a + b;\n}`,
  },
  {
    id: 'cs-property',
    language: 'csharp',
    title: 'Auto property',
    code: `public class Point\n{\n    public double X { get; set; }\n}`,
  },
  {
    id: 'cs-foreach',
    language: 'csharp',
    title: 'Foreach loop',
    code: `foreach (var item in items)\n{\n    Console.WriteLine(item);\n}`,
  },
  {
    id: 'cs-linq',
    language: 'csharp',
    title: 'LINQ query',
    code: `var result = list\n    .Where(x => x.IsActive)\n    .ToList();`,
  },
  {
    id: 'cs-null-check',
    language: 'csharp',
    title: 'Null-conditional',
    code: `string? name = user?.Profile?.Name;\nname ??= "Unknown";`,
  },
  {
    id: 'cs-try-catch',
    language: 'csharp',
    title: 'Try/catch',
    code: `try\n{\n    Process(file);\n}\ncatch (IOException ex)\n{\n    Log(ex.Message);\n}`,
  },
  {
    id: 'cs-interface',
    language: 'csharp',
    title: 'Interface implementation',
    code: `public interface IShape\n{\n    double GetArea();\n}`,
  },
  {
    id: 'cs-async',
    language: 'csharp',
    title: 'Async method',
    code: `public async Task<User> GetUserAsync(int id)\n{\n    return await _db.Users.FindAsync(id);\n}`,
  },
  {
    id: 'cs-switch',
    language: 'csharp',
    title: 'Switch expression',
    code: `string label = status switch\n{\n    1 => "Active",\n    _ => "Unknown",\n};`,
  },
  {
    id: 'cs-list-init',
    language: 'csharp',
    title: 'Collection initializer',
    code: `var names = new List<string> { "Alice", "Bob" };\nnames.Add("Carol");`,
  },
]
