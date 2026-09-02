import type { Snippet } from '../types'

export const typescriptSnippets: Snippet[] = [
  {
    id: 'ts-interface',
    language: 'typescript',
    title: 'Interface',
    code: `interface User {\n  id: number;\n  name: string;\n}`,
  },
  {
    id: 'ts-generic-function',
    language: 'typescript',
    title: 'Generic function',
    code: `function first<T>(items: T[]): T | undefined {\n  return items[0];\n}`,
  },
  {
    id: 'ts-type-union',
    language: 'typescript',
    title: 'Union type',
    code: `type Status = 'idle' | 'loading' | 'error';\nlet current: Status = 'idle';`,
  },
  {
    id: 'ts-enum',
    language: 'typescript',
    title: 'Enum',
    code: `enum Role {\n  Admin,\n  Viewer,\n}`,
  },
  {
    id: 'ts-class-generic',
    language: 'typescript',
    title: 'Generic class',
    code: `class Box<T> {\n  constructor(private value: T) {}\n}`,
  },
  {
    id: 'ts-as-const',
    language: 'typescript',
    title: 'as const',
    code: `const config = {\n  retries: 3,\n  timeout: 5000,\n} as const;`,
  },
  {
    id: 'ts-utility-type',
    language: 'typescript',
    title: 'Utility type',
    code: `type PartialUser = Partial<Pick<User, 'name' | 'id'>>;`,
  },
  {
    id: 'ts-react-hook',
    language: 'typescript',
    title: 'React useState',
    code: `const [items, setItems] = useState<string[]>([]);\nuseEffect(() => setItems(data), [data]);`,
  },
  {
    id: 'ts-async-generic',
    language: 'typescript',
    title: 'Async + generic',
    code: `async function getJson<T>(url: string): Promise<T> {\n  const res = await fetch(url);\n  return res.json() as Promise<T>;\n}`,
  },
  {
    id: 'ts-record-type',
    language: 'typescript',
    title: 'Record type',
    code: `const labels: Record<Status, string> = {\n  idle: 'Waiting',\n  done: 'Done',\n};`,
  },
  {
    id: 'ts-optional-chain',
    language: 'typescript',
    title: 'Optional chaining',
    code: `const city = user?.address?.city ?? 'unknown';`,
  },
  {
    id: 'ts-type-guard',
    language: 'typescript',
    title: 'Type guard',
    code: `function isUser(x: unknown): x is User {\n  return typeof x === 'object' && x !== null && 'id' in x;\n}`,
  },
]
