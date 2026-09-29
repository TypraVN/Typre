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
/**
 * Trang giới thiệu từng TÍNH NĂNG (đua trực tiếp, gõ code của chính mình).
 *
 * Khác LANGUAGE_PAGES ở chỗ không nhắm từ khoá theo ngôn ngữ — 14 trang kia đang tranh
 * "<ngôn ngữ> typing practice" với typing.io và monkeytype, những trang đã giữ vị trí
 * nhiều năm. Trang ở đây nhắm việc NGƯỜI TA MUỐN LÀM ("đua gõ code với bạn", "luyện gõ
 * code của chính mình"), nơi gần như không có đối thủ vì các trang luyện gõ khác chỉ có
 * văn xuôi.
 *
 * `steps` là phần bắt buộc phải đúng với app thật: đây là trang hướng dẫn, người đọc sẽ
 * làm theo từng bước ngay sau khi bấm nút. Sai một bước là mất người đó luôn.
 */
export const FEATURE_PAGES = [
  {
    slug: 'race',
    keyword: 'Typing race for programmers',
    titleTail: 'race a friend on real code',
    description:
      'Race a friend in real time on the same code snippet. Share one link, watch both lanes move as you type. Free, no account needed.',
    intro:
      'A typing race where everyone types the same real code — brackets, operators and indentation included — and each racer has a lane that moves as they type.',
    /** Không có `?race=1`: tạo phòng là hành động cần cú bấm của người dùng, xem ghi chú ở generate-seo-pages.mjs. */
    ctaHref: '/',
    ctaLabel: 'Open Typre and start a race',
    steps: [
      'Pick a language and a run length — 15, 30 or 60 seconds.',
      'Press <strong>race a friend</strong>. A room is made from the snippet already on your screen, and the link is copied to your clipboard.',
      'Send that link to whoever you want to race. Opening it drops them into the same snippet with the same timer.',
      'Start typing. Each racer gets a lane that fills in as they go, so you can see who is ahead while you type.',
    ],
    sections: [
      {
        heading: 'No account, no setup',
        body: 'Nobody has to sign up. Anyone who opens the link races under a temporary name, and the room disappears when everyone closes the tab. Signing in only matters if you want scores kept on the leaderboard.',
      },
      {
        heading: 'Why race on code instead of prose',
        body: 'Prose races reward familiar words. Code races reward the thing that actually slows programmers down: reaching for `{`, `=>` and `::` without looking, and keeping accuracy while you do it.',
      },
    ],
  },
  {
    slug: 'custom',
    keyword: 'Practice typing your own code',
    titleTail: 'paste a snippet from your codebase',
    description:
      'Paste code from your own project and practise typing that instead. Measures WPM and accuracy on the code you actually write. Free, no account.',
    intro:
      'Practice on the code you actually work with. Paste a snippet from your own project and type that, with the same speed and accuracy tracking as the built-in snippets.',
    ctaHref: '/?custom=1',
    ctaLabel: 'Paste your own code',
    steps: [
      'Press <strong>your code</strong> in the toolbar, or use the button above.',
      'Paste anything from your codebase — up to 3,000 characters.',
      'Smart quotes, tabs and invisible characters are converted as you paste, so every character on screen is one you can actually type.',
      'Type it with WPM, accuracy, raw speed and consistency measured exactly as usual.',
    ],
    sections: [
      {
        heading: 'Your code stays on your machine',
        body: 'Pasted code is never uploaded. Runs on your own code stay local: no leaderboard entry, no personal best, no challenge link — which is also why it is safe to paste from a private repository.',
      },
      {
        heading: 'What it is good for',
        body: 'Drilling the patterns your team writes every day: your framework calls, your naming conventions, the config format you keep mistyping. The built-in snippets cover a language in general; this covers your project specifically.',
      },
    ],
  },
]

/**
 * Trang giới thiệu chế độ cờ vua.
 *
 * Tách khỏi hai nhóm trên vì đây là nhóm MỘT trang và hình dạng nội dung khác hẳn: không
 * có "snippet", không có danh sách phím tắt, mà là cú pháp câu lệnh của 14 ngôn ngữ —
 * lấy trực tiếp từ `src/lib/chess/commandParsers.ts` lúc build (xem `loadChessExamples`
 * trong generate-seo-pages.mjs), không chép tay.
 *
 * Vì sao đáng có một trang riêng: 14 trang ngôn ngữ đang đâm đầu vào từ khoá mà
 * typing.io, speedtyper.dev, monkeytype đã giữ nhiều năm. "Chơi cờ bằng cách gõ lệnh"
 * thì không có đối thủ nào — đây là thứ duy nhất trong app không ai khác có.
 */
export const CHESS_PAGE = {
  slug: 'chess',
  keyword: 'Chess typing practice',
  titleTail: 'play chess by typing code',
  intro:
    'A chess board where you never touch the mouse. To move a piece you type a valid command in the programming language you are practising — so a game of chess doubles as a typing drill on the syntax you actually write.',
  description:
    'Play chess by typing moves as code in 14 languages. Bots, local two-player and online games with ELO ratings. Free, no account needed to play bots.',
  /** Vì sao mỗi ngôn ngữ một cú pháp khác — đây là nội dung không trang nào khác có. */
  syntax:
    'Every language keeps its own rules, so the command is only accepted if it would compile. C# and Java reject `\'e2\'` because single quotes mean a char, not a string. SQL rejects `"e2"` because double quotes mean an identifier. JSON only allows `"`. Go also accepts backticks. Semicolons are required where the language requires them and optional where it does not.',
  rules:
    'Castling is written as the king moving two squares — `e1` to `g1` for kingside — because there is no separate castle command; the engine recognises it and records it as O-O. Promotion takes a third argument naming the piece: `q`, `r`, `b` or `n`.',
  opponents:
    'Play a bot at three strengths, a friend on the same keyboard, or someone online. Online games are rated with standard ELO and need an account; everything else works signed out. Each side gets 15 minutes, or you can turn the clock off.',
}

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
