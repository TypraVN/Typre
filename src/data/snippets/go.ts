import type { Snippet } from '../types'

export const goSnippets: Snippet[] = [
  {
    id: 'go-func',
    language: 'go',
    title: 'Function',
    code: `func Add(a, b int) int {\n    return a + b\n}`,
  },
  {
    id: 'go-error-handling',
    language: 'go',
    title: 'Error handling',
    code: `data, err := os.ReadFile("config.json")\nif err != nil {\n    return err\n}`,
  },
  {
    id: 'go-struct',
    language: 'go',
    title: 'Struct + tag',
    code: `type User struct {\n    ID   int    \`json:"id"\`\n    Name string \`json:"name"\`\n}`,
  },
  {
    id: 'go-slice-range',
    language: 'go',
    title: 'Range over slice',
    code: `for i, item := range items {\n    fmt.Printf("%d: %s\\n", i, item)\n}`,
  },
  {
    id: 'go-map',
    language: 'go',
    title: 'Map',
    code: `counts := make(map[string]int)\ncounts["total"]++`,
  },
  {
    id: 'go-goroutine',
    language: 'go',
    title: 'Goroutine + channel',
    code: `ch := make(chan int)\ngo func() {\n    ch <- 42\n}()`,
  },
  {
    id: 'go-method',
    language: 'go',
    title: 'Method on struct',
    code: `func (u *User) FullName() string {\n    return u.First + " " + u.Last\n}`,
  },
  {
    id: 'go-interface',
    language: 'go',
    title: 'Interface',
    code: `type Store interface {\n    Get(id int) (*User, error)\n    Save(u *User) error\n}`,
  },
  {
    id: 'go-defer',
    language: 'go',
    title: 'Defer + close',
    code: `f, err := os.Open(path)\nif err != nil {\n    return err\n}`,
  },
  {
    id: 'go-switch',
    language: 'go',
    title: 'Switch',
    code: `switch v := x.(type) {\ncase string:\n    return v\n}`,
  },
  {
    id: 'go-slice-append',
    language: 'go',
    title: 'Slice append',
    code: `nums := []int{1, 2, 3}\nnums = append(nums, 4, 5)\nfmt.Println(len(nums), cap(nums))`,
  },
  {
    id: 'go-waitgroup',
    language: 'go',
    title: 'WaitGroup',
    code: `go func() {\n    defer wg.Done()\n}()`,
  },
]
