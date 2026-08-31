import { defineSnippets } from '../define'

/** Bài TRUNG BÌNH cho mốc 30s — xem chú thích trong `medium/javascript.ts`. */
export const goMedium = defineSnippets('go', 'go-med', [
  `data, err := os.ReadFile(path)
if err != nil {
    return nil, fmt.Errorf("read %s: %w", path, err)
}`,
  `func Sum(values []int) int {
    total := 0
    for _, v := range values {
        total += v
    }
    return total
}`,
  `counts := map[string]int{}
for _, word := range strings.Fields(text) {
    counts[strings.ToLower(word)]++
}`,
  `type Panel struct {
    Mark   string  \`json:"mark"\`
    Weight float64 \`json:"weight"\`
}`,
  `func (s *Store) Find(id string) (*Panel, error) {
    panel, ok := s.items[id]
    if !ok {
        return nil, errNotFound
    }
    return panel, nil
}`,
  `ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
defer cancel()

resp, err := http.NewRequestWithContext(ctx, "GET", url, nil)`,
  `var wg sync.WaitGroup
for _, job := range jobs {
    wg.Add(1)
    go func(j Job) {
        defer wg.Done()
        process(j)
    }(job)
}
wg.Wait()`,
  `sort.Slice(panels, func(i, j int) bool {
    return panels[i].Weight > panels[j].Weight
})`,
  `func handler(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}`,
  `if err := json.Unmarshal(data, &cfg); err != nil {
    log.Fatalf("bad config: %v", err)
}`,
  `slices.SortFunc(scores, func(a, b Score) int {
    return b.WPM - a.WPM
})

fmt.Println(scores[0].User, slices.Max(speeds))`,
  `if slices.Contains(supported, lang) {
    at := slices.Index(supported, lang)
    fmt.Println("found at", at)
}`,
  `keys := make([]string, 0, len(counts))
for key := range counts {
    keys = append(keys, key)
}

slices.Sort(keys)`,
  `out := make([]int, len(values))
copy(out, values)

out = append(out, 0)
fmt.Println(len(out), cap(out))`,
  `func split(rows []string) (head string, rest []string, err error) {
    if len(rows) == 0 {
        return "", nil, errors.New("no rows")
    }
    return rows[0], rows[1:], nil
}`,
  `func work() {
    defer fmt.Println("third")
    defer fmt.Println("second")

    fmt.Println("first")
}`,
  `if err := submit(score); err != nil {
    return fmt.Errorf("submit %s: %w", score.User, err)
}

fmt.Println("submitted")`,
  `var perr *SubmitError

if errors.As(err, &perr) && perr.Retryable() {
    time.Sleep(2 * time.Second)
}`,
  `switch value := payload.(type) {
case string:
    fmt.Println("text", len(value))
case int:
    fmt.Println("number", value*2)
default:
    fmt.Println("something else")
}`,
  `shape, ok := value.(Shape)
if !ok {
    return 0, errors.New("not a shape")
}

return shape.Area(), nil`,
  `func (p Panel) String() string {
    return fmt.Sprintf("%s (%.1f kg)", p.Mark, p.Weight)
}

fmt.Println(Panel{Mark: "PC-01", Weight: 4800})`,
  `func (c Cart) Count() int {
    return len(c.items)
}

func (c *Cart) Add(item string) {
    c.items = append(c.items, item)
}`,
  `type Panel struct {
    Base
    Mark   string
    Weight float64
}

fmt.Println(panel.ID, panel.Mark, panel.Age())`,
  `type Score struct {
    User string \`json:"user"\`
    WPM  int    \`json:"wpm"\`
}

body, _ := json.MarshalIndent(score, "", "  ")`,
  `done := make(chan string)

go func() {
    done <- fetch(url)
}()

fmt.Println(<-done)`,
  `jobs := make(chan int, 10)

for i := range 5 {
    jobs <- i
}

close(jobs)`,
  `select {
case msg := <-updates:
    fmt.Println("got", msg)
default:
    fmt.Println("nothing waiting")
}`,
  `select {
case result := <-work:
    fmt.Println(result)
case <-time.After(3 * time.Second):
    fmt.Println("gave up")
}`,
  `var mu sync.Mutex
total := 0

mu.Lock()
total += value
mu.Unlock()`,
  `var hits atomic.Int64

hits.Add(1)
fmt.Println(hits.Load())`,
  `var once sync.Once

once.Do(func() {
    client = &http.Client{Timeout: 15 * time.Second}
})`,
  `func Map[T, U any](items []T, fn func(T) U) []U {
    out := make([]U, 0, len(items))
    for _, item := range items {
        out = append(out, fn(item))
    }
    return out
}`,
  `func Sum[T int | float64](values []T) T {
    var total T
    for _, value := range values {
        total += value
    }
    return total
}`,
  `var b strings.Builder

for _, score := range scores {
    fmt.Fprintf(&b, "%s,%d\\n", score.User, score.WPM)
}`,
  `parts := strings.Split(line, ",")
name := strings.TrimSpace(parts[0])

if strings.HasPrefix(name, "PC-") {
    fmt.Println(strings.ToUpper(name))
}`,
  `wpm, err := strconv.Atoi(strings.TrimSpace(raw))
if err != nil {
    return 0, err
}

fmt.Println(strconv.Itoa(wpm * 2))`,
  `fmt.Printf("%-14s %5d %6.1f%%\\n", user, wpm, accuracy)
fmt.Printf("%v %+v %#v\\n", score, score, score)
fmt.Printf("%q %T %p\\n", user, score, &score)`,
  `scanner := bufio.NewScanner(os.Stdin)

for scanner.Scan() {
    fmt.Println(strings.ToUpper(scanner.Text()))
}`,
  `port := os.Getenv("PORT")
if port == "" {
    port = "5180"
}

fmt.Println("listening on :" + port)`,
  `path := flag.String("path", ".", "folder to scan")
top := flag.Int("top", 10, "rows to print")
flag.Parse()

fmt.Println(*path, *top)`,
  `full := filepath.Join("src", "data", "snippets", "index.ts")

fmt.Println(filepath.Ext(full))
fmt.Println(filepath.Base(full))
fmt.Println(filepath.Dir(full))`,
  `var slug = regexp.MustCompile(\`[^a-z0-9]+\`)

clean := slug.ReplaceAllString(strings.ToLower(title), "-")
fmt.Println(strings.Trim(clean, "-"))`,
  `now := time.Now().UTC()

fmt.Println(now.Format("2006-01-02 15:04:05"))
fmt.Println(now.Add(-7 * 24 * time.Hour).Format(time.DateOnly))`,
  `func TestSum(t *testing.T) {
    t.Run("empty", func(t *testing.T) {
        if got := Sum(nil); got != 0 {
            t.Errorf("Sum(nil) = %d", got)
        }
    })
}`,
  `res, err := http.Get(url)
if err != nil {
    return err
}
defer res.Body.Close()

body, err := io.ReadAll(res.Body)`,
  `row := db.QueryRowContext(ctx, query, userID)

var wpm int
if err := row.Scan(&wpm); err != nil {
    return 0, err
}`,
  `defer func() {
    if r := recover(); r != nil {
        log.Println("recovered:", r)
    }
}()

process(job)`,
  `for i := range 5 {
    fmt.Println(i, i*i)
}

for range 3 {
    fmt.Println("tick")
}`,

  `maps.Copy(defaults, overrides)

for key, value := range defaults {
    fmt.Println(key, value)
}`,
  `best := slices.MaxFunc(scores, func(a, b Score) int {
    return cmp.Compare(a.WPM, b.WPM)
})`,
  `func chunk[T any](items []T, size int) [][]T {
    var out [][]T

    for size < len(items) {
        items, out = items[size:], append(out, items[0:size:size])
    }

    return append(out, items)
}`,
  `ticker := time.NewTicker(time.Second)
defer ticker.Stop()

for range ticker.C {
    if err := flush(); err != nil {
        return err
    }
}`,
  `group, ctx := errgroup.WithContext(ctx)

for _, url := range urls {
    group.Go(func() error { return fetch(ctx, url) })
}

return group.Wait()`,
  `func (s *Store) Close() error {
    s.once.Do(func() {
        close(s.jobs)
    })

    return s.db.Close()
}`,
  `var buf bytes.Buffer

if err := json.NewEncoder(&buf).Encode(score); err != nil {
    return fmt.Errorf("encode score: %w", err)
}`,
  `func seqOf(values []int) iter.Seq2[int, int] {
    return func(yield func(int, int) bool) {
        for i, value := range values {
            if !yield(i, value) {
                return
            }
        }
    }
}`,
  `req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
if err != nil {
    return nil, fmt.Errorf("build request: %w", err)
}

req.Header.Set("Accept", "application/json")`,
  `stmt, err := db.PrepareContext(ctx, "insert into scores values (?, ?)")
if err != nil {
    return err
}

defer stmt.Close()`,
])
