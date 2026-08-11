import { defineSnippets } from '../define'

/** Bài TRUNG BÌNH cho mốc 30s — xem chú thích trong `medium/javascript.ts`. */
export const csharpMedium = defineSnippets('csharp', 'cs-med', [
  `var heavy = panels
    .Where(p => p.Weight > 5000)
    .OrderByDescending(p => p.Weight)
    .ToList();`,
  `public async Task<Panel?> FindAsync(Guid id)
{
    return await _db.Panels
        .AsNoTracking()
        .FirstOrDefaultAsync(p => p.Id == id);
}`,
  `if (!map.TryGetValue(key, out var found))
{
    found = new List<Panel>();
    map[key] = found;
}
found.Add(panel);`,
  `public record Score(string User, int Wpm)
{
    public bool IsValid => Wpm is > 0 and <= 300;
}`,
  `using var reader = new StreamReader(path);
while (await reader.ReadLineAsync() is { } line)
{
    rows.Add(line.Split(','));
}`,
  `var summary = string.Join(
    ", ",
    panels.Select(p => $"{p.Mark}:{p.Weight:F0}kg")
);`,
  `public static double Average(IReadOnlyList<int> values)
{
    if (values.Count == 0) return 0;
    return Math.Round(values.Average(), 2);
}`,
  `foreach (var (mark, weight) in totals)
{
    Console.WriteLine($"{mark,-10} {weight,8:F1} kg");
}`,
  `services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Default")));`,
  `public string Label(int wpm) => wpm switch
{
    < 30 => "warming up",
    < 60 => "solid",
    _ => "fast",
};`,
])
