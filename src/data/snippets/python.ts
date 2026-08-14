import type { Snippet } from '../types'

export const pythonSnippets: Snippet[] = [
  {
    id: 'py-function',
    language: 'python',
    title: 'Function def',
    code: `def add(a, b):\n    return a + b`,
  },
  {
    id: 'py-list-comp',
    language: 'python',
    title: 'List comprehension',
    code: `evens = [n for n in numbers if n % 2 == 0]`,
  },
  {
    id: 'py-class',
    language: 'python',
    title: 'Class definition',
    code: `class Point:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y`,
  },
  {
    id: 'py-dict',
    language: 'python',
    title: 'Dict iteration',
    code: `for key, value in data.items():\n    print(key, value)`,
    demo: 'for-loop',
  },
  {
    id: 'py-try',
    language: 'python',
    title: 'Try/except',
    code: `try:\n    value = int(text)\nexcept ValueError:\n    value = 0`,
    demo: 'try-catch',
  },
  {
    id: 'py-lambda',
    language: 'python',
    title: 'Lambda + sorted',
    code: `people.sort(key=lambda p: p.age, reverse=True)`,
    demo: 'sort',
  },
  {
    id: 'py-decorator',
    language: 'python',
    title: 'Decorator',
    code: `@staticmethod\ndef from_json(data):\n    return Point(data["x"], data["y"])`,
  },
  {
    id: 'py-with',
    language: 'python',
    title: 'Context manager',
    code: `with open("data.txt") as f:\n    lines = f.readlines()`,
  },
  {
    id: 'py-fstring',
    language: 'python',
    title: 'f-string',
    code: `name = "Alice"\nage = 30\nprint(f"{name} is {age} years old")`,
  },
  {
    id: 'py-dataclass',
    language: 'python',
    title: 'Dataclass',
    code: `@dataclass\nclass User:\n    name: str\n    age: int = 0`,
  },
]
