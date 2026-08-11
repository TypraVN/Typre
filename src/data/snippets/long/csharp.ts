import { defineSnippets } from '../define'

/** Bài DÀI cho mốc 60s — xem chú thích trong `long/javascript.ts`. */
export const csharpLong = defineSnippets('csharp', 'cs-long', [
  `public class Panel
{
    public required string Mark { get; init; }
    public double Weight { get; set; }

    public bool IsHeavy => Weight > 5000;

    public override string ToString()
    {
        return $"{Mark} ({Weight:F1} kg)";
    }
}`,
  `public async Task<List<Panel>> LoadPanelsAsync(int jobId)
{
    var panels = await _db.Panels
        .Where(p => p.JobId == jobId)
        .OrderBy(p => p.Mark)
        .ToListAsync();

    foreach (var panel in panels)
    {
        panel.Weight = Math.Round(panel.Volume * 2400, 1);
    }

    return panels;
}`,
  `public static double ToKilonewton(double kilograms)
{
    if (kilograms < 0)
    {
        throw new ArgumentOutOfRangeException(nameof(kilograms));
    }

    return Math.Round(kilograms * 0.00981, 3);
}

public static double ToKilogram(double kilonewton) => kilonewton / 0.00981;`,
  `try
{
    using var stream = File.OpenRead(path);
    using var reader = new StreamReader(stream);

    while (await reader.ReadLineAsync() is { } line)
    {
        rows.Add(Parse(line));
    }
}
catch (IOException ex)
{
    _logger.LogError(ex, "could not read {Path}", path);
}`,
  `public interface IRepository<T> where T : class
{
    Task<T?> FindAsync(Guid id);
    Task<IReadOnlyList<T>> ListAsync();
    Task AddAsync(T entity);
}

public class PanelRepository : IRepository<Panel>
{
    private readonly AppDbContext _db;

    public PanelRepository(AppDbContext db) => _db = db;
}`,
  `var grouped = panels
    .Where(p => p.Weight > 0)
    .GroupBy(p => p.Type)
    .Select(g => new
    {
        Type = g.Key,
        Count = g.Count(),
        Total = Math.Round(g.Sum(p => p.Weight), 1),
    })
    .OrderByDescending(x => x.Total)
    .ToList();`,
  `public string Describe(int wpm) => wpm switch
{
    < 20 => "just starting",
    < 40 => "getting there",
    < 60 => "solid",
    < 90 => "fast",
    _ => "showing off",
};

public static bool IsEligible(int wpm, int accuracy)
{
    return wpm > 0 && wpm <= 300 && accuracy >= 50;
}`,
  `public record Score(string User, int Wpm, int Accuracy)
{
    public bool IsValid => Wpm is > 0 and <= 300 && Accuracy >= 50;
}

public static Score? BestOf(IEnumerable<Score> scores)
{
    return scores
        .Where(s => s.IsValid)
        .OrderByDescending(s => s.Wpm)
        .FirstOrDefault();
}`,
])
