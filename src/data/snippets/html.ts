import type { Snippet } from '../types'

// Chỉ HTML thuần. Snippet CSS nằm ở `css.ts` — trước đây file này có mấy bài CSS
// bọc trong <style>, trùng đúng id và nội dung với css.ts.
export const htmlSnippets: Snippet[] = [
  {
    id: 'html-basic-tag',
    language: 'html',
    title: 'Basic tags',
    code: `<div class="card">\n  <h2>Title</h2>\n  <p>Some text</p>\n</div>`,
  },
  {
    id: 'html-form',
    language: 'html',
    title: 'Form input',
    code: `<form action="/login" method="post">\n  <input type="email" name="email" required>\n</form>`,
  },
  {
    id: 'html-list',
    language: 'html',
    title: 'List',
    code: `<ul class="menu">\n  <li><a href="/home">Home</a></li>\n  <li><a href="/about">About</a></li>\n</ul>`,
  },
  {
    id: 'html-anchor-attrs',
    language: 'html',
    title: 'Anchor + attrs',
    code: `<a href="https://example.com" target="_blank" rel="noopener">\n  Visit site\n</a>`,
  },
  {
    id: 'html-img-picture',
    language: 'html',
    title: 'Image + attrs',
    code: `<img src="/logo.png" alt="Typre" width="120" loading="lazy">`,
  },
  {
    id: 'html-table',
    language: 'html',
    title: 'Table',
    code: `<table>\n  <tr>\n    <th>Name</th>\n    <td>Alice</td>\n  </tr>\n</table>`,
  },
  {
    id: 'html-input-types',
    language: 'html',
    title: 'Input types',
    code: `<input type="number" min="0" max="100" step="5">\n<input type="checkbox" checked>`,
  },
  {
    id: 'html-meta',
    language: 'html',
    title: 'Meta tags',
    code: `<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">`,
  },
  {
    id: 'html-select',
    language: 'html',
    title: 'Select + option',
    code: `<select name="lang">\n  <option value="js" selected>JavaScript</option>\n  <option value="go">Go</option>\n</select>`,
  },
  {
    id: 'html-button-data',
    language: 'html',
    title: 'Button + data attrs',
    code: `<button type="submit" data-id="42" aria-label="Save" disabled>\n  Save\n</button>`,
  },
  {
    id: 'html-semantic',
    language: 'html',
    title: 'Semantic layout',
    code: `<main>\n  <section id="hero">\n    <h1>Typre</h1>\n  </section>\n</main>`,
  },
  {
    id: 'html-entities',
    language: 'html',
    title: 'Entities',
    code: `<p>5 &lt; 10 &amp;&amp; 10 &gt; 5 &mdash; &quot;true&quot;</p>`,
  },
]
