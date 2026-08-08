import type { Snippet } from '../types'

export const specialCharSnippets: Snippet[] = [
  {
    id: 'sc-symbols-1',
    language: 'text',
    title: 'Symbols 1',
    code: `~ ! @ # $ % ^ & * _ + - =`,
  },
  {
    id: 'sc-symbols-2',
    language: 'text',
    title: 'Symbols 2',
    code: `{ } [ ] ( ) | \\ : ; " ' < > ? / ,`,
  },
  {
    id: 'sc-regex',
    language: 'text',
    title: 'Regex pattern',
    code: `^[a-zA-Z0-9_]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$`,
  },
  {
    id: 'sc-mixed',
    language: 'text',
    title: 'Mixed symbols',
    code: `const re = /^\\$\\d+(\\.\\d{2})?$/;`,
  },
  {
    id: 'sc-template',
    language: 'text',
    title: 'Template & generics',
    code: `Dictionary<string, List<int>> map = new();`,
  },
  {
    id: 'sc-arrow-chain',
    language: 'text',
    title: 'Arrow chain',
    code: `a?.b?.c ?? d ?? e;`,
  },
  {
    id: 'sc-shell',
    language: 'text',
    title: 'Shell pipe',
    code: `cat file.log | grep "ERROR" | wc -l`,
  },
  {
    id: 'sc-path',
    language: 'text',
    title: 'Path & flags',
    code: `--flag=true -x=1 --path=./src/*.ts`,
  },
]
