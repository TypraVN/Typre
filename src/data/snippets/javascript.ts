import type { Snippet } from '../types'

export const javascriptSnippets: Snippet[] = [
  {
    id: 'js-arrow-sum',
    language: 'javascript',
    title: 'Arrow function',
    code: `const sum = (a, b) => {\n  return a + b;\n};`,
  },
  {
    id: 'js-array-filter',
    language: 'javascript',
    title: 'Array filter + map',
    code: `const evens = numbers\n  .filter((n) => n % 2 === 0)\n  .map((n) => n * 2);`,
  },
  {
    id: 'js-fetch',
    language: 'javascript',
    title: 'Fetch API',
    code: `async function getUser(id) {\n  const res = await fetch('/api/users/' + id);\n  return res.json();\n}`,
  },
  {
    id: 'js-class',
    language: 'javascript',
    title: 'Class definition',
    code: `class Stack {\n  #items = [];\n}`,
  },
  {
    id: 'js-destructure',
    language: 'javascript',
    title: 'Destructuring',
    code: `const { name, age } = user;\nconsole.log(name, age);`,
  },
  {
    id: 'js-promise',
    language: 'javascript',
    title: 'Promise chain',
    code: `fetchData()\n  .then((res) => res.json())\n  .catch((err) => console.error(err));`,
  },
  {
    id: 'js-ternary',
    language: 'javascript',
    title: 'Ternary + default param',
    code: `function greet(name = 'guest') {\n  return name ? 'Hi ' + name : 'Hi there';\n}`,
  },
  {
    id: 'js-reduce',
    language: 'javascript',
    title: 'Array reduce',
    code: `const total = items.reduce((sum, item) => {\n  return sum + item.price;\n}, 0);`,
  },
  {
    id: 'js-spread',
    language: 'javascript',
    title: 'Spread operator',
    code: `const merged = { ...defaults, ...options };\nconst copy = [...items, newItem];`,
  },
  {
    id: 'js-event-listener',
    language: 'javascript',
    title: 'Event listener',
    code: `button.addEventListener('click', () => {\n  console.log('clicked!');\n});`,
  },
  {
    id: 'js-try-catch',
    language: 'javascript',
    title: 'Try/catch',
    code: `try {\n  JSON.parse(input);\n} catch { warn('invalid json'); }`,
  },
]
