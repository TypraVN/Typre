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

public static double ToKilogram(double kn) => kn / 0.00981;`,
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
  `var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration["Db"]));

builder.Services.AddScoped<IRepository<Panel>, PanelRepository>();
builder.Services.AddControllers();

var app = builder.Build();

app.MapControllers();
app.Run();`,
  `app.MapGet("/api/panels/{jobId:int}", async (
    int jobId,
    IRepository<Panel> repository) =>
{
    var panels = await repository.ListAsync();

    return panels.Count == 0
        ? Results.NotFound()
        : Results.Ok(panels);
});

app.MapPost("/api/panels", async (Panel panel, AppDbContext db) =>
{
    db.Panels.Add(panel);
    await db.SaveChangesAsync();
    return Results.Created($"/api/panels/{panel.Id}", panel);
});`,
  `[ApiController]
[Route("api/[controller]")]
public class ScoresController : ControllerBase
{
    private readonly IScoreService _service;

    public ScoresController(IScoreService service)
    {
        _service = service;
    }

    [HttpGet("{language}")]
    public async Task<ActionResult<IEnumerable<Score>>> Top(
        string language,
        int limit = 10)
    {
        return Ok(await _service.TopAsync(language, limit));
    }
}`,
  `public async IAsyncEnumerable<string> ReadLinesAsync(
    string path,
    [EnumeratorCancellation] CancellationToken token = default)
{
    using var reader = new StreamReader(path);

    while (!reader.EndOfStream)
    {
        token.ThrowIfCancellationRequested();
        var line = await reader.ReadLineAsync();

        if (line is not null)
        {
            yield return line;
        }
    }
}`,
  `public async Task<string> FetchAsync(
    string url,
    CancellationToken token)
{
    using var timeout = CancellationTokenSource
        .CreateLinkedTokenSource(token);

    timeout.CancelAfter(TimeSpan.FromSeconds(10));

    using var response = await _http.GetAsync(url, timeout.Token);
    response.EnsureSuccessStatusCode();

    return await response.Content.ReadAsStringAsync(timeout.Token);
}`,
  `private readonly SemaphoreSlim _gate = new(4);

public async Task<List<T>> RunLimitedAsync<T>(
    IEnumerable<Func<Task<T>>> tasks)
{
    var results = new List<T>();

    foreach (var task in tasks)
    {
        await _gate.WaitAsync();

        try
        {
            results.Add(await task());
        }
        finally
        {
            _gate.Release();
        }
    }

    return results;
}`,
  `public async Task<Dictionary<string, int>> CountAllAsync(
    IReadOnlyList<string> paths)
{
    var tasks = paths.Select(CountWordsAsync).ToArray();
    var counts = await Task.WhenAll(tasks);

    return paths
        .Zip(counts, (path, count) => (path, count))
        .ToDictionary(pair => pair.path, pair => pair.count);
}`,
  `public sealed class Session : IAsyncDisposable
{
    private readonly NpgsqlConnection _connection;

    public Session(string connectionString)
    {
        _connection = new NpgsqlConnection(connectionString);
    }

    public async ValueTask DisposeAsync()
    {
        await _connection.CloseAsync();
        await _connection.DisposeAsync();
    }
}`,
  `public readonly record struct Size(double Width, double Height)
{
    public double Area => Width * Height;

    public Size Scaled(double factor) =>
        new(Width * factor, Height * factor);
}

var panel = new Size(2.4, 3.6);
var (width, height) = panel;

Console.WriteLine($"{width} x {height} = {panel.Area:F2}");`,
  `public static string Describe(object shape) => shape switch
{
    Circle c => $"circle r={c.Radius}",
    Rectangle { Width: var w, Height: var h } => $"rect {w}x{h}",
    IEnumerable<object> list => $"list of {list.Count()}",
    null => "nothing",
    _ => shape.GetType().Name,
};`,
  `public static decimal Discount(Order order) => order switch
{
    { Total: > 1000, Customer.IsMember: true } => 0.15m,
    { Total: > 1000 } => 0.10m,
    { Items.Count: 0 } => 0m,
    _ => 0.05m,
};

public static bool NeedsReview(Order order) =>
    order is { Total: > 5000 } or { Customer.IsNew: true };`,
  `public static (int Min, int Max, double Average) Stats(
    IReadOnlyList<int> values)
{
    if (values.Count == 0)
    {
        return (0, 0, 0);
    }

    return (values.Min(), values.Max(), values.Average());
}

var (min, max, average) = Stats(new[] { 4, 8, 15, 16, 23 });`,
  `var report = from score in scores
             join user in users on score.UserId equals user.Id
             where score.Wpm > 50
             orderby score.Wpm descending
             select new
             {
                 user.Name,
                 score.Wpm,
                 score.Language,
             };

foreach (var row in report.Take(10))
{
    Console.WriteLine($"{row.Name,-12}{row.Wpm,5}");
}`,
  `var allMarks = jobs
    .SelectMany(job => job.Panels, (job, panel) => new
    {
        job.Code,
        panel.Mark,
        panel.Weight,
    })
    .Where(row => row.Weight > 3000)
    .OrderBy(row => row.Code)
    .ThenBy(row => row.Mark)
    .ToList();`,
  `public static int Increment(
    Dictionary<string, int> counts,
    string key)
{
    if (counts.TryGetValue(key, out var current))
    {
        counts[key] = current + 1;
        return current + 1;
    }

    counts[key] = 1;
    return 1;
}`,
  `public static (List<string> Added, List<string> Removed) Compare(
    IEnumerable<string> before,
    IEnumerable<string> after)
{
    var oldSet = before.ToHashSet();
    var newSet = after.ToHashSet();

    var added = newSet.Except(oldSet).OrderBy(x => x).ToList();
    var removed = oldSet.Except(newSet).OrderBy(x => x).ToList();

    return (added, removed);
}`,
  `public static string BuildCsv(IReadOnlyList<Score> scores)
{
    var builder = new StringBuilder();
    builder.AppendLine("name,wpm,accuracy");

    foreach (var score in scores)
    {
        builder.Append(score.User).Append(',');
        builder.Append(score.Wpm).Append(',');
        builder.AppendLine(score.Accuracy.ToString("F1"));
    }

    return builder.ToString();
}`,
  `public static void PrintTable(IReadOnlyList<Score> scores)
{
    Console.WriteLine("player          wpm    acc");

    foreach (var score in scores)
    {
        Console.WriteLine(
            $"{score.User,-14}{score.Wpm,5}{score.Accuracy,7:P0}");
    }
}`,
  `public static int SumCsv(ReadOnlySpan<char> line)
{
    var total = 0;

    foreach (var range in line.Split(','))
    {
        var part = line[range].Trim();

        if (int.TryParse(part, out var value))
        {
            total += value;
        }
    }

    return total;
}`,
  `public string DisplayName
{
    get
    {
        _cached ??= _profile?.FullName?.Trim();

        return string.IsNullOrEmpty(_cached)
            ? "anonymous"
            : _cached;
    }
}

public static T OrThrow<T>(T? value, string name) where T : class =>
    value ?? throw new InvalidOperationException(name);`,
  `public static class EnumerableExtensions
{
    public static IEnumerable<List<T>> Chunked<T>(
        this IEnumerable<T> source,
        int size)
    {
        var bucket = new List<T>(size);

        foreach (var item in source)
        {
            bucket.Add(item);

            if (bucket.Count == size)
            {
                yield return bucket;
                bucket = new List<T>(size);
            }
        }
    }
}`,
  `public static TTarget MapTo<TSource, TTarget>(TSource source)
    where TTarget : new()
{
    var target = new TTarget();

    foreach (var property in typeof(TSource).GetProperties())
    {
        var match = typeof(TTarget).GetProperty(property.Name);
        match?.SetValue(target, property.GetValue(source));
    }

    return target;
}`,
  `public static Func<T, TResult> Memoize<T, TResult>(
    Func<T, TResult> fn)
    where T : notnull
{
    var cache = new Dictionary<T, TResult>();

    return input =>
    {
        if (!cache.TryGetValue(input, out var value))
        {
            value = fn(input);
            cache[input] = value;
        }

        return value;
    };
}`,
  `public class Ticker
{
    public event EventHandler<int>? Tick;

    private int _remaining;

    public void Start(int seconds)
    {
        _remaining = seconds;

        while (_remaining > 0)
        {
            _remaining--;
            Tick?.Invoke(this, _remaining);
        }
    }
}`,
  `public class SubmitException : Exception
{
    public SubmitException(int status, string url)
        : base($"submit rejected with {status}")
    {
        Status = status;
        Url = url;
    }

    public int Status { get; }

    public string Url { get; }

    public bool IsRetryable => Status >= 500 || Status == 429;
}`,
  `public readonly struct Outcome<T>
{
    private Outcome(T? value, string? error)
    {
        Value = value;
        Error = error;
    }

    public T? Value { get; }

    public string? Error { get; }

    public bool IsOk => Error is null;

    public static Outcome<T> Ok(T value) => new(value, null);

    public static Outcome<T> Fail(string error) => new(default, error);
}`,
  `[Flags]
public enum Permission
{
    None = 0,
    Read = 1,
    Write = 2,
    Delete = 4,
    All = Read | Write | Delete,
}

public static bool CanWrite(Permission permission) =>
    permission.HasFlag(Permission.Write);

var editor = Permission.Read | Permission.Write;`,
  `public class Release : IComparable<Release>
{
    public int Major { get; init; }

    public int Minor { get; init; }

    public int CompareTo(Release? other)
    {
        if (other is null)
        {
            return 1;
        }

        var byMajor = Major.CompareTo(other.Major);
        return byMajor != 0 ? byMajor : Minor.CompareTo(other.Minor);
    }
}`,
  `public static IEnumerable<DateOnly> WorkDays(
    DateOnly from,
    DateOnly to)
{
    for (var day = from; day <= to; day = day.AddDays(1))
    {
        if (day.DayOfWeek is DayOfWeek.Saturday or DayOfWeek.Sunday)
        {
            continue;
        }

        yield return day;
    }
}`,
  `public class SettingsProvider
{
    private readonly Lazy<Settings> _settings;

    public SettingsProvider(string path)
    {
        _settings = new Lazy<Settings>(() => Load(path));
    }

    public Settings Current => _settings.Value;

    private static Settings Load(string path) =>
        JsonSerializer.Deserialize<Settings>(File.ReadAllText(path))
            ?? new Settings();
}`,
  `private readonly ConcurrentDictionary<string, int> _hits = new();

public int Record(string path)
{
    return _hits.AddOrUpdate(path, 1, (_, current) => current + 1);
}

public IReadOnlyList<KeyValuePair<string, int>> Top(int count) =>
    _hits
        .OrderByDescending(pair => pair.Value)
        .Take(count)
        .ToList();`,
  `public static void ResizeAll(IReadOnlyList<string> files)
{
    var options = new ParallelOptions
    {
        MaxDegreeOfParallelism = Environment.ProcessorCount,
    };

    Parallel.ForEach(files, options, file =>
    {
        using var image = Image.Load(file);
        image.Mutate(x => x.Resize(1024, 0));
        image.Save(Path.ChangeExtension(file, ".webp"));
    });
}`,
  `var channel = Channel.CreateBounded<string>(100);

var producer = Task.Run(async () =>
{
    foreach (var path in paths)
    {
        await channel.Writer.WriteAsync(path);
    }

    channel.Writer.Complete();
});

await foreach (var path in channel.Reader.ReadAllAsync())
{
    Console.WriteLine(path);
}`,
  `private static readonly JsonSerializerOptions Options = new()
{
    PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    WriteIndented = true,
    DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
};

public static string Serialize<T>(T value) =>
    JsonSerializer.Serialize(value, Options);

public static T? Deserialize<T>(string json) =>
    JsonSerializer.Deserialize<T>(json, Options);`,
  `public class ScoreClient
{
    private readonly HttpClient _http;

    public ScoreClient(HttpClient http)
    {
        _http = http;
    }

    public async Task<Score[]> TopAsync(string language)
    {
        var url = $"/api/leaderboard?language={language}";
        var scores = await _http.GetFromJsonAsync<Score[]>(url);

        return scores ?? Array.Empty<Score>();
    }
}`,
  `public class LeaderboardOptions
{
    public const string Section = "Leaderboard";

    public int PageSize { get; set; } = 10;

    public int MaxWpm { get; set; } = 300;
}

builder.Services.Configure<LeaderboardOptions>(
    builder.Configuration.GetSection(LeaderboardOptions.Section));`,
  `public async Task SubmitAsync(Score score)
{
    using var scope = _logger.BeginScope(
        "submit {User} {Language}", score.User, score.Language);

    _logger.LogInformation("sending {Wpm} wpm", score.Wpm);

    try
    {
        await _client.PostAsync(score);
    }
    catch (HttpRequestException ex)
    {
        _logger.LogWarning(ex, "submit failed, will retry");
        throw;
    }
}`,
  `protected override void OnModelCreating(ModelBuilder builder)
{
    builder.Entity<Score>(entity =>
    {
        entity.ToTable("scores");
        entity.HasKey(s => s.Id);

        entity.Property(s => s.DisplayName)
            .HasMaxLength(32)
            .IsRequired();

        entity.HasIndex(s => new { s.Language, s.TimeLimit });
    });
}`,
  `public static ScoreDto ToDto(this Score score) => new()
{
    Id = score.Id,
    Player = score.DisplayName,
    Wpm = score.Wpm,
    Accuracy = Math.Round(score.Accuracy, 1),
    Submitted = score.CreatedAt.ToString("yyyy-MM-dd"),
};`,
  `public class SlugifyTests
{
    [Theory]
    [InlineData("Hello World", "hello-world")]
    [InlineData("a!!b??c", "a-b-c")]
    [InlineData("", "")]
    public void Normalises(string input, string expected)
    {
        Assert.Equal(expected, Slugify.Run(input));
    }

    [Fact]
    public void RejectsNull()
    {
        Assert.Throws<ArgumentNullException>(() => Slugify.Run(null!));
    }
}`,
  `public static IReadOnlyList<string> Validate(Score score)
{
    var errors = new List<string>();

    if (string.IsNullOrWhiteSpace(score.User))
    {
        errors.Add("player name is required");
    }

    if (score.Wpm is <= 0 or > 300)
    {
        errors.Add($"wpm out of range: {score.Wpm}");
    }

    return errors;
}`,
  `public static IList<Element> CollectColumns(Document doc)
{
    var collector = new FilteredElementCollector(doc)
        .OfCategory(BuiltInCategory.OST_StructuralColumns)
        .WhereElementIsNotElementType();

    return collector
        .Cast<FamilyInstance>()
        .Where(x => x.Symbol.FamilyName.StartsWith("PC-"))
        .OrderBy(x => x.Name)
        .Cast<Element>()
        .ToList();
}`,
])
