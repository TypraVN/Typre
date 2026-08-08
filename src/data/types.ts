export type SnippetLanguage =
  | 'javascript'
  | 'typescript'
  | 'csharp'
  | 'python'
  | 'java'
  | 'go'
  | 'sql'
  | 'bash'
  | 'cpp'
  | 'rust'
  | 'html'
  | 'css'
  | 'json'
  | 'text'

export interface Snippet {
  id: string
  language: SnippetLanguage
  title: string
  code: string
}
