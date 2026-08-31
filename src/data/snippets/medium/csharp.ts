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
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("Default")));`,
  `public string Label(int wpm) => wpm switch
{
    < 30 => "warming up",
    < 60 => "solid",
    _ => "fast",
};`,
  `var names = scores
    .Select(s => new { s.User, Best = s.Wpm })
    .OrderByDescending(x => x.Best)
    .Take(5)
    .ToList();`,
  `var counts = scores
    .GroupBy(s => s.Language)
    .ToDictionary(g => g.Key, g => g.Count());`,
  `bool anyFast = scores.Any(s => s.Wpm >= 100);
bool allValid = scores.All(s => s.Wpm is > 0 and <= 300);

Console.WriteLine($"{anyFast} {allValid}");`,
  `var first = scores.FirstOrDefault(s => s.Language == "rust")
    ?? new Score("nobody", 0);

Console.WriteLine(first.User);`,
  `int total = scores.Sum(s => s.Wpm);
int best = scores.Max(s => s.Wpm);
double mean = scores.Average(s => s.Wpm);

Console.WriteLine($"{total} {best} {mean:F1}");`,
  `var languages = scores
    .Select(s => s.Language)
    .Distinct()
    .OrderBy(name => name)
    .ToHashSet();`,
  `var pairs = names.Zip(speeds, (name, wpm) => (name, wpm));

foreach (var (name, wpm) in pairs)
{
    Console.WriteLine($"{name,-14}{wpm,5}");
}`,
  `var marks = jobs
    .SelectMany(job => job.Panels)
    .Where(panel => panel.Weight > 3000)
    .Select(panel => panel.Mark);`,
  `_cache ??= new Dictionary<string, int>();
_logger?.LogInformation("cache ready");

int hits = _cache.GetValueOrDefault("hits", 0);`,
  `if (payload is { Wpm: > 60, Accuracy: >= 95 } fast)
{
    Console.WriteLine($"clean run: {fast.Wpm}");
}`,
  `string describe(object value) => value switch
{
    int n when n > 100 => "big number",
    int n => n.ToString(),
    string s => s.Trim(),
    _ => "unknown",
};`,
  `static (int Best, double Mean) Stats(IReadOnlyList<int> values)
{
    return (values.Max(), values.Average());
}

var (best, mean) = Stats(new[] { 40, 60, 80 });`,
  `public int Score(string text)
{
    int Weight(char c) => char.IsLetter(c) ? 2 : 1;

    return text.Sum(Weight);
}`,
  `public string Mark { get; init; } = "PC-01";
public double Weight { get; set; }

public bool IsHeavy => Weight > 5000;
public override string ToString() => $"{Mark} ({Weight:F1})";`,
  `public readonly record struct Size(double W, double H);

var small = new Size(1.2, 2.4);
var wide = small with { W = 3.6 };

Console.WriteLine(wide);`,
  `List<int> limits = [15, 30, 60];
int[] doubled = [.. limits.Select(n => n * 2)];

Console.WriteLine(string.Join(", ", doubled));`,
  `public class ScoreService(IScoreRepository repository)
{
    public Task<List<Score>> TopAsync(string language) =>
        repository.ListAsync(language);
}`,
  `Console.WriteLine($"{"player",-14}{"wpm",5}{"acc",7}");

foreach (var s in scores)
{
    Console.WriteLine($"{s.User,-14}{s.Wpm,5}{s.Accuracy,6:P0}");
}`,
  `const string query = """
    select language, max(wpm)
    from scores
    group by language
    """;`,
  `ReadOnlySpan<char> line = raw.AsSpan();
var name = line[..line.IndexOf(',')];
var rest = line[(line.IndexOf(',') + 1)..];

Console.WriteLine(name.Trim().ToString());`,
  `var builder = new StringBuilder("user,wpm");

foreach (var s in scores)
{
    builder.AppendLine().Append(s.User).Append(',').Append(s.Wpm);
}`,
  `var added = after.Except(before).ToList();
var removed = before.Except(after).ToList();
var kept = before.Intersect(after).Count();

Console.WriteLine($"{added.Count} {removed.Count} {kept}");`,
  `int dropped = scores.RemoveAll(s => s.Accuracy < 50);
scores.Sort((a, b) => b.Wpm.CompareTo(a.Wpm));

Console.WriteLine($"dropped {dropped}, kept {scores.Count}");`,
  `var results = await Task.WhenAll(
    urls.Select(url => _http.GetStringAsync(url)));

Console.WriteLine(results.Sum(body => body.Length));`,
  `public async Task<Score[]> LoadAsync(CancellationToken token)
{
    token.ThrowIfCancellationRequested();
    return await _db.Scores.ToArrayAsync(token);
}`,
  `await using var connection = new NpgsqlConnection(_url);
await connection.OpenAsync();

var count = await connection.ExecuteScalarAsync<int>(Sql);`,
  `try
{
    await SubmitAsync(score);
}
catch (HttpRequestException ex) when (ex.StatusCode == 429)
{
    await Task.Delay(2000);
}`,
  `public Score Validate(Score? score) =>
    score ?? throw new ArgumentNullException(nameof(score));

ArgumentNullException.ThrowIfNull(config);
ArgumentOutOfRangeException.ThrowIfNegative(wpm);`,
  `public static IEnumerable<int> WpmRange(int from, int to)
{
    for (var value = from; value <= to; value += 5)
    {
        yield return value;
    }
}`,
  `var picked = Random.Shared.GetItems(Languages, 3);
int roll = Random.Shared.Next(1, 7);

Console.WriteLine(string.Join(",", picked) + " " + roll);`,
  `var today = DateOnly.FromDateTime(DateTime.UtcNow);
var monday = today.AddDays(-(int)today.DayOfWeek + 1);

Console.WriteLine($"{monday:yyyy-MM-dd} .. {today:yyyy-MM-dd}");`,
  `var elapsed = TimeSpan.FromSeconds(3725);

Console.WriteLine(elapsed.ToString(@"hh\\:mm\\:ss"));
Console.WriteLine($"{elapsed.TotalMinutes:F1} minutes");`,
  `int clamped = Math.Clamp(wpm, 1, 300);
double rounded = Math.Round(accuracy, 1, MidpointRounding.AwayFromZero);

Console.WriteLine($"{clamped} {rounded}");`,
  `if (!int.TryParse(raw, out var wpm) || wpm <= 0)
{
    Console.Error.WriteLine($"bad wpm: {raw}");
    return;
}`,
  `var rights = Permission.Read | Permission.Write;

if (rights.HasFlag(Permission.Write))
{
    Console.WriteLine("can write");
}`,
  `private int _hits;

public int Record() => Interlocked.Increment(ref _hits);

public void Reset() => Interlocked.Exchange(ref _hits, 0);`,
  `private readonly Lock _gate = new();

public void Append(string line)
{
    lock (_gate)
    {
        _buffer.Add(line);
    }
}`,
  `public static class ScoreExtensions
{
    public static bool IsClean(this Score score) =>
        score.Accuracy >= 98 && score.Wpm > 0;
}`,
  `_logger.LogInformation(
    "submitted {Wpm} wpm for {Language} in {Elapsed}ms",
    score.Wpm,
    score.Language,
    elapsed.TotalMilliseconds);`,

  `var lookup = scores
    .GroupBy(s => s.Language)
    .ToDictionary(g => g.Key, g => g.Max(s => s.Wpm));`,
  `public static string Truncate(this string value, int max) =>
    value.Length <= max ? value : value[..(max - 1)] + "\u2026";`,
  `await foreach (var line in ReadLinesAsync(path, token))
{
    if (line.Length > 0) rows.Add(line);
}`,
  `var window = scores
    .Chunk(10)
    .Select(chunk => chunk.Average(s => s.Wpm))
    .ToList();`,
  `if (payload is not { Wpm: > 0, Language.Length: > 0 })
{
    throw new ArgumentException("invalid payload", nameof(payload));
}`,
  `public sealed class Counter
{
    private int _value;

    public int Next() => Interlocked.Increment(ref _value);
}`,
  `var options = new ParallelOptions { MaxDegreeOfParallelism = 4 };

await Parallel.ForEachAsync(urls, options, async (url, token) =>
{
    await DownloadAsync(url, token);
});`,
  `static string Format(TimeSpan span) => span switch
{
    { TotalHours: >= 1 } => $"{span:h\hm\m}",
    { TotalMinutes: >= 1 } => $"{span:m\ms\s}",
    _ => $"{span.Seconds}s",
};`,
  `var json = JsonSerializer.Serialize(score, JsonOptions);
await File.WriteAllTextAsync(path, json, token);`,
  `public int Compare(Score? left, Score? right) =>
    (right?.Wpm ?? 0).CompareTo(left?.Wpm ?? 0);`,
])
