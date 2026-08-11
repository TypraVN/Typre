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
])
