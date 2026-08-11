import { defineSnippets } from '../define'

/** Bài DÀI cho mốc 60s — xem chú thích trong `long/javascript.ts`. */
export const goLong = defineSnippets('go', 'go-long', [
  `func LoadConfig(path string) (*Config, error) {
    data, err := os.ReadFile(path)
    if err != nil {
        return nil, fmt.Errorf("read config: %w", err)
    }

    var cfg Config
    if err := json.Unmarshal(data, &cfg); err != nil {
        return nil, fmt.Errorf("parse config: %w", err)
    }

    if cfg.Timeout == 0 {
        cfg.Timeout = 30 * time.Second
    }

    return &cfg, nil
}`,
  `func worker(id int, jobs <-chan Job, results chan<- Result) {
    for job := range jobs {
        start := time.Now()
        out, err := process(job)

        results <- Result{
            Worker:  id,
            Job:     job.ID,
            Err:     err,
            Elapsed: time.Since(start),
        }

        if err != nil {
            log.Printf("worker %d: %v", id, err)
        }
    }
}`,
  `type Store struct {
    mu    sync.RWMutex
    items map[string]*Panel
}

func NewStore() *Store {
    return &Store{items: make(map[string]*Panel)}
}

func (s *Store) Add(panel *Panel) {
    s.mu.Lock()
    defer s.mu.Unlock()
    s.items[panel.Mark] = panel
}

func (s *Store) Len() int {
    s.mu.RLock()
    defer s.mu.RUnlock()
    return len(s.items)
}`,
  `func handleScores(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodGet {
        http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
        return
    }

    language := r.URL.Query().Get("language")
    scores, err := store.ByLanguage(r.Context(), language)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(scores)
}`,
  `func fanIn(ctx context.Context, sources ...<-chan int) <-chan int {
    out := make(chan int)
    var wg sync.WaitGroup

    for _, src := range sources {
        wg.Add(1)
        go func(ch <-chan int) {
            defer wg.Done()
            for value := range ch {
                select {
                case out <- value:
                case <-ctx.Done():
                    return
                }
            }
        }(src)
    }

    go func() {
        wg.Wait()
        close(out)
    }()

    return out
}`,
  `func TestSum(t *testing.T) {
    cases := []struct {
        name string
        in   []int
        want int
    }{
        {"empty", nil, 0},
        {"one", []int{5}, 5},
        {"many", []int{1, 2, 3}, 6},
    }

    for _, tc := range cases {
        t.Run(tc.name, func(t *testing.T) {
            if got := Sum(tc.in); got != tc.want {
                t.Errorf("Sum(%v) = %d, want %d", tc.in, got, tc.want)
            }
        })
    }
}`,
  `func fetchJSON(ctx context.Context, url string, out any) error {
    ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
    defer cancel()

    req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
    if err != nil {
        return err
    }

    res, err := http.DefaultClient.Do(req)
    if err != nil {
        return err
    }
    defer res.Body.Close()

    return json.NewDecoder(res.Body).Decode(out)
}`,
  `var ErrNotFound = errors.New("not found")

func find(id string) (*Panel, error) {
    panel, ok := store[id]
    if !ok {
        return nil, fmt.Errorf("panel %q: %w", id, ErrNotFound)
    }

    return panel, nil
}

func main() {
    if _, err := find("PC-01"); errors.Is(err, ErrNotFound) {
        log.Println("missing panel, using default")
    }
}`,
  `type SubmitError struct {
    Status int
    URL    string
    err    error
}

func (e *SubmitError) Error() string {
    return fmt.Sprintf("submit %s: status %d", e.URL, e.Status)
}

func (e *SubmitError) Unwrap() error {
    return e.err
}

func (e *SubmitError) Retryable() bool {
    return e.Status >= 500 || e.Status == 429
}`,
  `type Shape interface {
    Area() float64
    String() string
}

type Circle struct {
    Radius float64
}

func (c Circle) Area() float64 {
    return math.Pi * c.Radius * c.Radius
}

func (c Circle) String() string {
    return fmt.Sprintf("circle r=%.1f", c.Radius)
}`,
  `func Map[T, U any](items []T, fn func(T) U) []U {
    out := make([]U, 0, len(items))
    for _, item := range items {
        out = append(out, fn(item))
    }
    return out
}

func Filter[T any](items []T, keep func(T) bool) []T {
    out := make([]T, 0, len(items))
    for _, item := range items {
        if keep(item) {
            out = append(out, item)
        }
    }
    return out
}`,
  `type Number interface {
    ~int | ~int64 | ~float64
}

func Sum[T Number](values []T) T {
    var total T
    for _, value := range values {
        total += value
    }
    return total
}

func Max[T cmp.Ordered](values []T) (T, bool) {
    if len(values) == 0 {
        var zero T
        return zero, false
    }
    return slices.Max(values), true
}`,
  `func rank(scores []Score) []Score {
    out := slices.Clone(scores)

    slices.SortFunc(out, func(a, b Score) int {
        if a.WPM != b.WPM {
            return b.WPM - a.WPM
        }
        return strings.Compare(a.User, b.User)
    })

    return out
}`,
  `func sortedKeys(counts map[string]int) []string {
    keys := make([]string, 0, len(counts))
    for key := range counts {
        keys = append(keys, key)
    }

    slices.SortFunc(keys, func(a, b string) int {
        return counts[b] - counts[a]
    })

    return keys
}`,
  `func safeRun(job func()) (err error) {
    defer func() {
        if r := recover(); r != nil {
            err = fmt.Errorf("job panicked: %v", r)
        }
    }()

    job()
    return nil
}`,
  `func loadAll(ctx context.Context, urls []string) ([]string, error) {
    group, ctx := errgroup.WithContext(ctx)
    bodies := make([]string, len(urls))

    for i, url := range urls {
        i, url := i, url

        group.Go(func() error {
            body, err := fetch(ctx, url)
            bodies[i] = body
            return err
        })
    }

    return bodies, group.Wait()
}`,
  `func drain(ch <-chan Result, limit int) []Result {
    out := make([]Result, 0, limit)

    for len(out) < limit {
        select {
        case r, ok := <-ch:
            if !ok {
                return out
            }
            out = append(out, r)
        case <-time.After(time.Second):
            return out
        }
    }

    return out
}`,
  `func poll(ctx context.Context, every time.Duration, check func()) {
    ticker := time.NewTicker(every)
    defer ticker.Stop()

    for {
        select {
        case <-ticker.C:
            check()
        case <-ctx.Done():
            log.Println("stopping poller:", ctx.Err())
            return
        }
    }
}`,
  `var (
    once   sync.Once
    client *http.Client
)

func Client() *http.Client {
    once.Do(func() {
        client = &http.Client{
            Timeout: 15 * time.Second,
        }
    })

    return client
}`,
  `type Counter struct {
    hits atomic.Int64
}

func (c *Counter) Record() int64 {
    return c.hits.Add(1)
}

func (c *Counter) Value() int64 {
    return c.hits.Load()
}

func (c *Counter) Reset() {
    c.hits.Store(0)
}`,
  `func mapLimit(urls []string, limit int) []string {
    sem := make(chan struct{}, limit)
    out := make([]string, len(urls))
    var wg sync.WaitGroup

    for i, url := range urls {
        wg.Add(1)

        go func(i int, url string) {
            defer wg.Done()
            sem <- struct{}{}
            defer func() { <-sem }()
            out[i] = fetchOne(url)
        }(i, url)
    }

    wg.Wait()
    return out
}`,
  `func topScores(ctx context.Context, db *sql.DB) ([]Score, error) {
    const query = "select user_name, wpm from scores limit 10"

    rows, err := db.QueryContext(ctx, query)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    var out []Score
    for rows.Next() {
        var s Score
        if err := rows.Scan(&s.User, &s.WPM); err != nil {
            return nil, err
        }
        out = append(out, s)
    }

    return out, rows.Err()
}`,
  `func routes(store *Store) http.Handler {
    mux := http.NewServeMux()

    mux.HandleFunc("GET /api/scores", listScores(store))
    mux.HandleFunc("POST /api/scores", createScore(store))
    mux.HandleFunc("GET /api/scores/{id}", getScore(store))

    return logging(mux)
}`,
  `func logging(next http.Handler) http.Handler {
    return http.HandlerFunc(func(
        w http.ResponseWriter,
        r *http.Request,
    ) {
        start := time.Now()
        next.ServeHTTP(w, r)

        log.Printf("%s %s took %s",
            r.Method, r.URL.Path, time.Since(start))
    })
}`,
  `type Score struct {
    ID        string    \`json:"id"\`
    User      string    \`json:"user"\`
    WPM       int       \`json:"wpm"\`
    Accuracy  float64   \`json:"accuracy"\`
    CreatedAt time.Time \`json:"created_at"\`
    Internal  string    \`json:"-"\`
}

func (s Score) Valid() bool {
    return s.WPM > 0 && s.WPM <= 300 && s.Accuracy >= 50
}`,
  `func envInt(name string, fallback int) int {
    raw := os.Getenv(name)
    if raw == "" {
        return fallback
    }

    value, err := strconv.Atoi(raw)
    if err != nil {
        log.Printf("bad %s=%q, using %d", name, raw, fallback)
        return fallback
    }

    return value
}`,
  `func main() {
    path := flag.String("path", ".", "folder to scan")
    top := flag.Int("top", 10, "how many rows to print")
    verbose := flag.Bool("v", false, "verbose output")
    flag.Parse()

    if *verbose {
        log.Printf("scanning %s", *path)
    }

    for _, row := range scan(*path, *top) {
        fmt.Println(row)
    }
}`,
  `func main() {
    scanner := bufio.NewScanner(os.Stdin)
    totals := make(map[string]float64)

    for scanner.Scan() {
        parts := strings.SplitN(scanner.Text(), ",", 2)
        if len(parts) < 2 {
            continue
        }

        value, err := strconv.ParseFloat(parts[1], 64)
        if err == nil {
            totals[parts[0]] += value
        }
    }
}`,
  `func findGo(root string) ([]string, error) {
    var found []string

    err := filepath.WalkDir(root, func(
        path string,
        d fs.DirEntry,
        err error,
    ) error {
        if err != nil {
            return err
        }
        if !d.IsDir() && strings.HasSuffix(path, ".go") {
            found = append(found, path)
        }
        return nil
    })

    return found, err
}`,
  `func buildCSV(scores []Score) string {
    var b strings.Builder
    b.WriteString("user,wpm\\n")

    for _, s := range scores {
        b.WriteString(s.User)
        b.WriteByte(',')
        b.WriteString(strconv.Itoa(s.WPM))
        b.WriteByte('\\n')
    }

    return b.String()
}`,
  `func parseRow(line string) (Score, error) {
    parts := strings.Split(line, ",")
    if len(parts) != 3 {
        return Score{}, fmt.Errorf("want 3 fields, got %d", len(parts))
    }

    wpm, err := strconv.Atoi(strings.TrimSpace(parts[1]))
    if err != nil {
        return Score{}, fmt.Errorf("bad wpm: %w", err)
    }

    acc, err := strconv.ParseFloat(parts[2], 64)
    return Score{User: parts[0], WPM: wpm, Accuracy: acc}, err
}`,
  `func groupByLanguage(scores []Score) map[string][]Score {
    out := make(map[string][]Score)

    for _, s := range scores {
        out[s.Language] = append(out[s.Language], s)
    }

    for _, list := range out {
        slices.SortFunc(list, func(a, b Score) int {
            return b.WPM - a.WPM
        })
    }

    return out
}`,
  `type Base struct {
    ID        string
    CreatedAt time.Time
}

func (b Base) Age() time.Duration {
    return time.Since(b.CreatedAt)
}

type Panel struct {
    Base
    Mark   string
    Weight float64
}

func newPanel(mark string) Panel {
    return Panel{
        Base: Base{ID: mark, CreatedAt: time.Now()},
        Mark: mark,
    }
}`,
  `type Cart struct {
    items []string
}

func (c *Cart) Add(item string) {
    c.items = append(c.items, item)
}

func (c Cart) Count() int {
    return len(c.items)
}

func (c *Cart) Clear() {
    c.items = c.items[:0]
}`,
  `func primesUpTo(limit int) []int {
    sieve := make([]bool, limit+1)
    for i := 2; i <= limit; i++ {
        sieve[i] = true
    }

    for n := 2; n*n <= limit; n++ {
        if !sieve[n] {
            continue
        }
        for m := n * n; m <= limit; m += n {
            sieve[m] = false
        }
    }

    var out []int
    for n, isPrime := range sieve {
        if isPrime {
            out = append(out, n)
        }
    }

    return out
}`,
  `func multiply(a, b [][]int) [][]int {
    rows, cols, shared := len(a), len(b[0]), len(b)
    out := make([][]int, rows)

    for i := range out {
        out[i] = make([]int, cols)

        for j := 0; j < cols; j++ {
            sum := 0
            for k := 0; k < shared; k++ {
                sum += a[i][k] * b[k][j]
            }
            out[i][j] = sum
        }
    }

    return out
}`,
  `func quickSort(values []int) []int {
    if len(values) <= 1 {
        return values
    }

    pivot := values[len(values)/2]
    var left, middle, right []int

    for _, v := range values {
        switch {
        case v < pivot:
            left = append(left, v)
        case v > pivot:
            right = append(right, v)
        default:
            middle = append(middle, v)
        }
    }

    left = quickSort(left)
    right = quickSort(right)
    return append(append(left, middle...), right...)
}`,
  `func gcd(a, b int) int {
    for b != 0 {
        a, b = b, a%b
    }

    if a < 0 {
        return -a
    }
    return a
}

func lcm(a, b int) int {
    if a == 0 || b == 0 {
        return 0
    }
    return a / gcd(a, b) * b
}`,
  `func reverse(text string) string {
    runes := []rune(text)

    for i, j := 0, len(runes)-1; i < j; i, j = i+1, j-1 {
        runes[i], runes[j] = runes[j], runes[i]
    }

    return string(runes)
}

func isPalindrome(text string) bool {
    clean := strings.ToLower(text)
    return clean == reverse(clean)
}`,
  `func wordCount(text string) map[string]int {
    counts := make(map[string]int)

    for _, word := range strings.Fields(strings.ToLower(text)) {
        word = strings.Trim(word, ".,!?;:")
        if word != "" {
            counts[word]++
        }
    }

    return counts
}`,
  `func readCSV(path string) ([][]string, error) {
    file, err := os.Open(path)
    if err != nil {
        return nil, err
    }
    defer file.Close()

    reader := csv.NewReader(file)
    reader.TrimLeadingSpace = true

    return reader.ReadAll()
}`,
  `func weekRange(day time.Time) (time.Time, time.Time) {
    offset := (int(day.Weekday()) + 6) % 7
    monday := day.AddDate(0, 0, -offset)

    return monday, monday.AddDate(0, 0, 6)
}

func parseDate(text string) (time.Time, error) {
    layouts := []string{"2006-01-02", "02/01/2006"}

    for _, layout := range layouts {
        if t, err := time.Parse(layout, text); err == nil {
            return t, nil
        }
    }

    return time.Time{}, fmt.Errorf("bad date: %q", text)
}`,
  `var logLine = regexp.MustCompile(
    \`(?P<time>\\d{2}:\\d{2}:\\d{2}) (?P<level>\\w+) (?P<msg>.+)\`,
)

func parseLine(line string) map[string]string {
    match := logLine.FindStringSubmatch(line)
    if match == nil {
        return nil
    }

    out := make(map[string]string)
    for i, name := range logLine.SubexpNames() {
        if i > 0 && name != "" {
            out[name] = match[i]
        }
    }

    return out
}`,
  `const tmpl = "{{range .}}{{.User}} {{.WPM}}\\n{{end}}"

func render(scores []Score) (string, error) {
    t, err := template.New("scores").Parse(tmpl)
    if err != nil {
        return "", err
    }

    var buf bytes.Buffer
    if err := t.Execute(&buf, scores); err != nil {
        return "", err
    }

    return buf.String(), nil
}`,
  `func BenchmarkSlugify(b *testing.B) {
    input := "Hello World From Typre"
    b.ReportAllocs()
    b.ResetTimer()

    for i := 0; i < b.N; i++ {
        if got := Slugify(input); got == "" {
            b.Fatal("empty result")
        }
    }
}`,
  `func main() {
    server := &http.Server{Addr: ":8080", Handler: routes()}

    go func() {
        if err := server.ListenAndServe(); err != nil {
            log.Println("server stopped:", err)
        }
    }()

    stop := make(chan os.Signal, 1)
    signal.Notify(stop, os.Interrupt, syscall.SIGTERM)
    <-stop

    ctx, cancel := context.WithTimeout(
        context.Background(), 10*time.Second)
    defer cancel()

    server.Shutdown(ctx)
}`,
  `func indexOf(sorted []int, target int) int {
    i, found := slices.BinarySearch(sorted, target)
    if !found {
        return -1
    }
    return i
}

func insertSorted(sorted []int, value int) []int {
    i, _ := slices.BinarySearch(sorted, value)
    return slices.Insert(sorted, i, value)
}`,
  `func fib(n int) int {
    memo := map[int]int{0: 0, 1: 1}

    var walk func(int) int
    walk = func(k int) int {
        if value, ok := memo[k]; ok {
            return value
        }

        memo[k] = walk(k-1) + walk(k-2)
        return memo[k]
    }

    return walk(n)
}`,
  `type Set map[string]struct{}

func (s Set) Add(value string) {
    s[value] = struct{}{}
}

func (s Set) Has(value string) bool {
    _, ok := s[value]
    return ok
}

func (s Set) Sorted() []string {
    out := make([]string, 0, len(s))
    for value := range s {
        out = append(out, value)
    }

    slices.Sort(out)
    return out
}`,
  `func gzipFile(src, dst string) error {
    in, err := os.Open(src)
    if err != nil {
        return err
    }
    defer in.Close()

    out, err := os.Create(dst)
    if err != nil {
        return err
    }
    defer out.Close()

    writer := gzip.NewWriter(out)
    defer writer.Close()

    _, err = io.Copy(writer, in)
    return err
}`,
])
