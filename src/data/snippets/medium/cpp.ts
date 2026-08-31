import { defineSnippets } from '../define'

/** Bài TRUNG BÌNH cho mốc 30s — xem chú thích trong `medium/javascript.ts`. */
export const cppMedium = defineSnippets('cpp', 'cpp-med', [
  `std::vector<int> nums = {5, 3, 8, 1};
std::sort(nums.begin(), nums.end());
int total = std::accumulate(nums.begin(), nums.end(), 0);`,
  `for (const auto& [key, value] : counts) {
    std::cout << key << ": " << value << "\\n";
}`,
  `struct Panel {
    std::string mark;
    double weight = 0.0;

    bool heavy() const { return weight > 5000.0; }
};`,
  `std::ifstream file(path);
std::string line;
while (std::getline(file, line)) {
    rows.push_back(line);
}`,
  `template <typename T>
T clamp(const T& value, const T& lo, const T& hi) {
    return value < lo ? lo : (value > hi ? hi : value);
}`,
  `auto it = std::find_if(panels.begin(), panels.end(),
    [](const Panel& p) { return p.weight > 5000; });`,
  `int *buf = (int *)calloc(n, sizeof(int));
if (buf == NULL) {
    fprintf(stderr, "out of memory\\n");
    return EXIT_FAILURE;
}`,
  `class Timer {
public:
    Timer() : start_(std::chrono::steady_clock::now()) {}
    ~Timer() { report(); }

private:
    std::chrono::steady_clock::time_point start_;
};`,
  `std::unordered_map<std::string, int> freq;
for (const auto& word : words) {
    ++freq[word];
}`,
  `void swap(int *a, int *b) {
    int tmp = *a;
    *a = *b;
    *b = tmp;
}`,
  `std::vector<Score> scores = load();

std::sort(scores.begin(), scores.end(),
    [](const Score& a, const Score& b) { return a.wpm > b.wpm; });`,
  `auto total = std::accumulate(
    values.begin(), values.end(), 0.0);

std::cout << total / values.size() << "\\n";`,
  `std::vector<std::string> marks;
marks.reserve(panels.size());

std::transform(panels.begin(), panels.end(),
    std::back_inserter(marks),
    [](const Panel& p) { return p.mark; });`,
  `panels.erase(
    std::remove_if(panels.begin(), panels.end(),
        [](const Panel& p) { return p.weight < 1000.0; }),
    panels.end());`,
  `auto count = std::count_if(scores.begin(), scores.end(),
    [](const Score& s) { return s.wpm >= 60; });

std::cout << count << " fast runs\\n";`,
  `auto [low, high] = std::minmax_element(
    values.begin(), values.end());

std::cout << *low << " to " << *high << "\\n";`,
  `std::unordered_set<std::string> seen;

for (const auto& row : rows) {
    if (seen.insert(row).second) {
        std::cout << row << "\\n";
    }
}`,
  `auto shape = std::make_unique<Square>(2.5);

std::cout << shape->area() << "\\n";
std::cout << (shape ? "alive" : "moved") << "\\n";`,
  `auto node = std::make_shared<Node>();
auto alias = node;

std::cout << node.use_count() << "\\n";`,
  `std::optional<int> parse(const std::string& raw) {
    try {
        return std::stoi(raw);
    } catch (...) {
        return std::nullopt;
    }
}`,
  `std::variant<int, std::string> cell = 42;

if (std::holds_alternative<int>(cell)) {
    std::cout << std::get<int>(cell) << "\\n";
}`,
  `struct Vec2 {
    double x{}, y{};

    Vec2 operator+(const Vec2& o) const {
        return {x + o.x, y + o.y};
    }
};`,
  `class Buffer {
public:
    explicit Buffer(std::size_t n) : data_(n) {}

private:
    std::vector<char> data_;
};`,
  `constexpr double kDensity = 2400.0;

constexpr double weight(double volume) {
    return volume * kDensity;
}

static_assert(weight(1.0) == 2400.0);`,
  `template <typename T>
    requires std::integral<T>
T twice(T value) {
    return value * 2;
}`,
  `template <typename... Args>
void log(const Args&... parts) {
    ((std::cout << parts << " "), ...);
    std::cout << "\\n";
}`,
  `std::function<int(int)> doubler = [](int n) { return n * 2; };

std::cout << doubler(21) << "\\n";`,
  `int total = 0;

std::for_each(values.begin(), values.end(),
    [&total](int value) { total += value; });`,
  `std::mutex m;
int counter = 0;

{
    std::lock_guard<std::mutex> lock(m);
    ++counter;
}`,
  `auto task = std::async(std::launch::async, countWords, path);

std::cout << task.get() << " words\\n";`,
  `std::atomic<int> hits{0};

hits.fetch_add(1, std::memory_order_relaxed);
std::cout << hits.load() << "\\n";`,
  `auto start = std::chrono::steady_clock::now();
work();

std::chrono::duration<double> took =
    std::chrono::steady_clock::now() - start;`,
  `std::ofstream out("report.csv");

for (const auto& s : scores) {
    out << s.user << ',' << s.wpm << '\\n';
}`,
  `std::istringstream stream(line);
std::string cell;

while (std::getline(stream, cell, ',')) {
    cells.push_back(cell);
}`,
  `bool startsWith(std::string_view text, std::string_view prefix) {
    return text.substr(0, prefix.size()) == prefix;
}`,
  `std::array<int, 5> values{5, 3, 8, 1, 9};

std::ranges::sort(values);
std::cout << values.front() << " " << values.back() << "\\n";`,
  `auto fast = scores
    | std::views::filter([](const Score& s) { return s.wpm > 60; })
    | std::views::take(3);`,
  `std::deque<int> queue{1, 2, 3};

queue.push_front(0);
queue.pop_back();

std::cout << queue.size() << "\\n";`,
  `std::priority_queue<int> heap;

for (int value : values) {
    heap.push(value);
}

std::cout << heap.top() << "\\n";`,
  `std::vector<std::vector<int>> grid(3, std::vector<int>(3, 0));

grid[1][1] = 5;
std::cout << grid.size() << "x" << grid[0].size() << "\\n";`,
  `class SubmitError : public std::runtime_error {
public:
    explicit SubmitError(int status)
        : std::runtime_error("failed: " + std::to_string(status)) {}
};`,
  `enum class Level { Debug, Info, Warn, Error };

std::string_view name(Level level) {
    return level == Level::Error ? "error" : "other";
}`,
  `namespace typre::units {

inline double toKn(double kg) {
    return kg * 0.00981;
}

}  // namespace typre::units`,
  `std::cout << std::left << std::setw(14) << user
          << std::right << std::setw(5) << wpm
          << std::fixed << std::setprecision(1) << accuracy << "\\n";`,

  `auto fast = scores
    | std::views::filter([](const Score& s) { return s.wpm >= 60; })
    | std::views::transform(&Score::user);`,
  `std::span<const int> window(values.data() + start, length);

for (int value : window) {
    total += value;
}`,
  `template <typename T>
concept Numeric = std::integral<T> || std::floating_point<T>;

template <Numeric T>
T mean(const std::vector<T>& values);`,
  `std::vector<int> out;
out.reserve(values.size());

std::ranges::copy_if(values, std::back_inserter(out), [](int n) {
    return n % 2 == 0;
});`,
  `auto [it, inserted] = seen.emplace(mark);

if (!inserted) {
    std::cerr << "duplicate mark: " << mark << '\\n';
}`,
  `struct Score {
    std::string user;
    int wpm{};

    auto operator<=>(const Score&) const = default;
};`,
  `std::jthread worker([&stop = flag](std::stop_token token) {
    while (!token.stop_requested()) {
        step();
    }
});`,
  `if (auto pos = line.find(','); pos != std::string::npos) {
    key = line.substr(0, pos);
    value = line.substr(pos + 1);
}`,
  `std::error_code ec;
auto size = std::filesystem::file_size(path, ec);

if (ec) {
    return std::unexpected(ec.message());
}`,
  `std::ranges::for_each(panels, [total = 0.0](const Panel& p) mutable {
    total += p.weight;
});`,
])
