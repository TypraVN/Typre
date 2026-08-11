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
])
