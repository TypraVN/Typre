/**
 * Nội dung 14 trang giới thiệu từng ngôn ngữ.
 *
 * Vì sao mỗi trang phải viết riêng: Google bỏ qua (có khi phạt) những trang mỏng chỉ
 * khác nhau đúng một chữ — "doorway pages". Nếu 14 trang chỉ đổi tên ngôn ngữ trong cùng
 * một câu thì thà làm một trang.
 *
 * Nên mỗi ngôn ngữ nói đúng thứ riêng của nó: KÝ TỰ nào thật sự làm chậm tay khi gõ, và
 * bài lấy từ đâu. Đây là thứ người tìm "python typing practice" muốn biết, và cũng là
 * thứ không ngôn ngữ nào giống ngôn ngữ nào.
 *
 * `slug` nằm trong URL nên coi như đã công khai: đổi slug là mất thứ hạng đã có và làm
 * chết link cũ. Chỉ thêm, đừng đổi.
 */
export const LANGUAGE_PAGES = [
  {
    id: 'javascript',
    slug: 'javascript',
    label: 'JavaScript',
    keyword: 'JavaScript typing practice',
    hard: 'Arrow functions turn `=>` into muscle memory, and destructuring buries `{ }` inside `( )` inside `=>`. Template literals put backticks and `${ }` in the middle of a word, which almost nothing else does.',
    covers:
      'Array methods, async/await and fetch, promise chains, destructuring, spread, classes with private fields, event listeners, and the small utilities that show up in every codebase — debounce, deep clone, query string parsing.',
  },
  {
    id: 'typescript',
    slug: 'typescript',
    label: 'TypeScript',
    keyword: 'TypeScript typing practice',
    hard: 'Angle brackets are the whole game: `<T>`, `Record<string, number>`, `Array<Partial<User>>`. Nesting them means reaching for shift constantly, and the closing `>>` is where most people stumble.',
    covers:
      'Interfaces and type aliases, generics with constraints, union and intersection types, mapped and conditional types, `as const`, discriminated unions, and typed React props.',
  },
  {
    id: 'csharp',
    slug: 'csharp',
    label: 'C#',
    keyword: 'C# typing practice',
    hard: 'Allman braces put `{` on its own line, so you type far more newlines than in JavaScript. Nullable types add `?` in places you would not expect, and `=>` shows up in expression-bodied members without a lambda in sight.',
    covers:
      'Properties and records, LINQ query and method syntax, async Task methods, pattern matching with `switch` expressions, dependency injection setup, and attributes on classes and members.',
  },
  {
    id: 'python',
    slug: 'python',
    label: 'Python',
    keyword: 'Python typing practice',
    hard: 'No braces means indentation is load-bearing — a wrong space count is a real bug, not a style nit. Colons end almost every block header, and f-strings mix quotes with `{ }` inside a single token.',
    covers:
      'Comprehensions, decorators, dataclasses, context managers, f-strings, type hints, `async def` with `await`, and the standard-library calls that appear in every script — `pathlib`, `json`, `collections`.',
  },
  {
    id: 'java',
    slug: 'java',
    label: 'Java',
    keyword: 'Java typing practice',
    hard: 'Names are long and repeated: you write the type twice in older code, and generics stack up as `Map<String, List<Integer>>`. Method chains in streams push lines past the point where your hands stay still.',
    covers:
      'Classes and interfaces, the Stream API with collectors, records, try-with-resources, enhanced `switch`, generics with bounded types, and annotations.',
  },
  {
    id: 'go',
    slug: 'go',
    label: 'Go',
    keyword: 'Go typing practice',
    hard: 'The `:=` operator sits under your right hand in an awkward spot, and error handling means typing `if err != nil {` over and over — good news for practice, since that is exactly the pattern you will type most at work.',
    covers:
      'Structs with tags, methods with receivers, goroutines and channels, `defer`, interfaces, `range` loops, error wrapping with `fmt.Errorf`, and table-driven tests.',
  },
  {
    id: 'sql',
    slug: 'sql',
    label: 'SQL',
    keyword: 'SQL typing practice',
    hard: 'Keywords are long and often uppercase, so shift is held for whole words at a time. Nested parentheses in subqueries and window functions stack deeper than in most code, and commas separate nearly everything.',
    covers:
      'Joins, aggregates with `group by` and `having`, window functions, CTEs, upserts with `on conflict`, indexes, and the DDL you write when setting up a schema.',
  },
  {
    id: 'bash',
    slug: 'bash',
    label: 'Bash',
    keyword: 'Bash and shell typing practice',
    hard: 'Dense punctuation with almost no letters between it: `|`, `>`, `&&`, `$(`, `"$@"`, `2>&1`. Flags mean single characters after a dash, so accuracy matters more than speed — one wrong character is a different command.',
    covers:
      'git commands you actually run, docker and docker compose, npm and pnpm, `find` with `-exec`, `grep`/`sed`/`awk` pipelines, tar and rsync, systemctl, and shell scripts with conditionals and loops.',
  },
  {
    id: 'cpp',
    slug: 'cpp',
    label: 'C and C++',
    keyword: 'C and C++ typing practice',
    hard: 'The `::` scope operator and stream `<<` chains are unlike anything in other languages, and `->` appears constantly with pointers. Angle brackets in templates collide with the less-than operator in your muscle memory.',
    covers:
      'STL containers and algorithms, smart pointers, classes with constructors and operator overloads, templates, range-based `for`, structs and enums, and the C-style memory and string handling you still meet in embedded code.',
  },
  {
    id: 'rust',
    slug: 'rust',
    label: 'Rust',
    keyword: 'Rust typing practice',
    // Nháy đơn trong `<'a>` là cú pháp lifetime của Rust — phải dùng chuỗi nháy kép ở
    // đây, không thì vỡ file ngay lúc build.
    hard: "Ampersands and lifetimes: `&mut`, `&str`, `<'a>`. The `?` operator ends lines, turbofish `::<>` appears mid-expression, and macro calls end in `!` — all characters your fingers do not reach for in other languages.",
    covers:
      'Structs and enums with `impl` blocks, `match` on `Option` and `Result`, iterators and closures, traits and generics, borrowing, `async` with `.await`, and `Cargo.toml` style declarations.',
  },
  {
    id: 'html',
    slug: 'html',
    label: 'HTML',
    keyword: 'HTML typing practice',
    hard: 'Every tag is typed twice, and the closing one adds `/`. Attributes mean quote pairs inside angle brackets, so you are constantly opening and closing two different kinds of bracket at once.',
    covers:
      'Semantic layout elements, forms with labels and inputs, tables, meta and Open Graph tags, images with `srcset`, video with sources and captions, and accessibility attributes.',
  },
  {
    id: 'css',
    slug: 'css',
    label: 'CSS',
    keyword: 'CSS typing practice',
    hard: 'Semicolons end every line and colons split every one, so your right hand never leaves that key pair. Hex colours are six random characters — the closest thing to a real random-string drill in normal code.',
    covers:
      'Flexbox and grid, custom properties, media and container queries, transitions and keyframes, pseudo-classes and pseudo-elements, `clamp()` and `calc()`, and dark-mode overrides.',
  },
  {
    id: 'json',
    slug: 'json',
    label: 'JSON',
    keyword: 'JSON typing practice',
    hard: 'Pure structure with no keywords to break it up: quotes, colons, commas and nested brackets, over and over. Nothing punishes a missing comma or a stray trailing one faster, which makes it a strict accuracy drill.',
    covers:
      'package.json and tsconfig.json, API responses, GitHub Actions style configuration, ESLint and Prettier configs, and deeply nested objects with arrays of objects.',
  },
  {
    id: 'text',
    slug: 'special-characters',
    label: 'special characters',
    keyword: 'Special character typing practice',
    // Khuôn chung ghép ra "type real special characters code" — vô nghĩa. Rổ này không
    // phải một ngôn ngữ nên cả tiêu đề và đoạn mở đầu đều phải viết riêng.
    titleTail: 'drill the symbols that code is made of',
    intro:
      'Typre is a free typing trainer for programmers. This drill is pure punctuation — the bracket, operator and escape sequences that prose never contains — and it measures WPM, accuracy, raw speed and consistency on every run.',
    hard: 'This is the drill for the keys programming lives on and prose never touches: `{}`, `[]`, `<>`, `|`, `~`, `^`, `&`, `\\`, backticks, and the operator clusters like `&&`, `=>`, `!==`, `?.`, `??`, `<=>`.',
    covers:
      'Bracket and operator runs, escape sequences, regular expressions, shell-style punctuation, and mixed symbol lines built to hit every awkward reach on the keyboard.',
  },
]

/**
 * Nội dung 2 trang giới thiệu bộ luyện phím tắt (xem `src/data/shortcuts.ts`).
 *
 * Cùng lý do tách khỏi LANGUAGE_PAGES: hình dạng trang khác hẳn — không có "snippet",
 * mà là danh sách phím tắt thật, lấy trực tiếp từ `src/data/shortcuts.ts` lúc build
 * (xem `loadShortcuts` trong generate-seo-pages.mjs) chứ không hardcode ở đây, để không
 * bao giờ lệch với bộ phím tắt thật trong app.
 *
 * `param` là giá trị `?shortcuts=` mở đúng bộ đó trong app — đọc ở `src/lib/toolParam.ts`.
 */
export const SHORTCUT_PAGES = [
  {
    id: 'vscode',
    slug: 'vscode-shortcuts',
    label: 'VS Code',
    param: 'vscode',
    keyword: 'VS Code keyboard shortcuts practice',
    intro:
      'A timed drill for VS Code keyboard shortcuts on Windows and Linux — the same shortcuts, practised until your hands do them without thinking, instead of a list you read once and forget.',
  },
  {
    id: 'vim',
    slug: 'vim-shortcuts',
    label: 'Vim',
    param: 'vim',
    keyword: 'Vim keyboard shortcuts practice',
    intro:
      'A timed drill for Vim motions and commands — the same keys, practised until your hands do them without thinking, instead of a cheat sheet you read once and forget.',
  },
]
