import { defineSnippets } from '../define'

/** Bài DÀI cho mốc 60s — xem chú thích trong `long/javascript.ts`. */
export const cppLong = defineSnippets('cpp', 'cpp-long', [
  `#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::vector<int> nums = {5, 3, 8, 1, 9, 2};

    std::sort(nums.begin(), nums.end());

    for (int n : nums) {
        std::cout << n << " ";
    }

    std::cout << "\\n";
    return 0;
}`,
  `class Panel {
public:
    Panel(std::string mark, double volume)
        : mark_(std::move(mark)), volume_(volume) {}

    double weight() const {
        return volume_ * 2400.0;
    }

    bool heavy() const {
        return weight() > 5000.0;
    }

private:
    std::string mark_;
    double volume_;
};`,
  `std::unordered_map<std::string, int> countWords(
    const std::string& text) {
    std::unordered_map<std::string, int> counts;
    std::istringstream stream(text);
    std::string word;

    while (stream >> word) {
        std::transform(word.begin(), word.end(),
            word.begin(), ::tolower);
        ++counts[word];
    }

    return counts;
}`,
  `typedef struct Node {
    int value;
    struct Node *next;
} Node;

Node *push(Node *head, int value) {
    Node *node = (Node *)malloc(sizeof(Node));
    if (node == NULL) {
        return head;
    }

    node->value = value;
    node->next = head;
    return node;
}`,
  `template <typename T>
class Stack {
public:
    void push(const T& value) {
        items_.push_back(value);
    }

    bool pop(T& out) {
        if (items_.empty()) {
            return false;
        }
        out = items_.back();
        items_.pop_back();
        return true;
    }

private:
    std::vector<T> items_;
};`,
  `int binarySearch(const std::vector<int>& nums, int target) {
    int left = 0;
    int right = static_cast<int>(nums.size()) - 1;

    while (left <= right) {
        int mid = left + (right - left) / 2;

        if (nums[mid] == target) {
            return mid;
        }

        if (nums[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    return -1;
}`,
  `struct Score {
    std::string user;
    int wpm;
    double accuracy;
};

void rank(std::vector<Score>& scores) {
    std::sort(scores.begin(), scores.end(),
        [](const Score& a, const Score& b) {
            if (a.wpm != b.wpm) {
                return a.wpm > b.wpm;
            }
            return a.user < b.user;
        });
}`,
  `void printTotals(const std::map<std::string, double>& totals) {
    for (const auto& [name, value] : totals) {
        std::cout << std::left << std::setw(12) << name
                  << std::fixed << std::setprecision(2)
                  << value << "\\n";
    }
}

double sumAll(const std::map<std::string, double>& totals) {
    double sum = 0.0;

    for (const auto& entry : totals) {
        sum += entry.second;
    }

    return sum;
}`,
  `std::vector<std::string> unique(
    const std::vector<std::string>& rows) {
    std::unordered_set<std::string> seen;
    std::vector<std::string> out;
    out.reserve(rows.size());

    for (const auto& row : rows) {
        if (seen.insert(row).second) {
            out.push_back(row);
        }
    }

    return out;
}`,
  `class Shape {
public:
    virtual ~Shape() = default;
    virtual double area() const = 0;
};

class Square : public Shape {
public:
    explicit Square(double side) : side_(side) {}

    double area() const override {
        return side_ * side_;
    }

private:
    double side_;
};

std::unique_ptr<Shape> makeSquare(double side) {
    return std::make_unique<Square>(side);
}`,
  `struct Node {
    int value;
    std::shared_ptr<Node> next;
    std::weak_ptr<Node> parent;
};

std::shared_ptr<Node> build(const std::vector<int>& values) {
    std::shared_ptr<Node> head;

    for (auto it = values.rbegin(); it != values.rend(); ++it) {
        auto node = std::make_shared<Node>();
        node->value = *it;
        node->next = head;
        head = node;
    }

    return head;
}`,
  `class File {
public:
    explicit File(const std::string& path)
        : handle_(std::fopen(path.c_str(), "rb")) {}

    ~File() {
        if (handle_ != nullptr) {
            std::fclose(handle_);
        }
    }

    File(const File&) = delete;
    File& operator=(const File&) = delete;

private:
    std::FILE* handle_;
};`,
  `class Buffer {
public:
    explicit Buffer(std::size_t size) : data_(new char[size]) {}

    ~Buffer() {
        delete[] data_;
    }

    Buffer(Buffer&& other) noexcept : data_(other.data_) {
        other.data_ = nullptr;
    }

    Buffer& operator=(Buffer&& other) noexcept {
        std::swap(data_, other.data_);
        return *this;
    }

private:
    char* data_;
};`,
  `struct Vec2 {
    double x = 0.0;
    double y = 0.0;

    Vec2 operator+(const Vec2& other) const {
        return {x + other.x, y + other.y};
    }

    Vec2 operator*(double factor) const {
        return {x * factor, y * factor};
    }

    double length() const {
        return std::hypot(x, y);
    }
};`,
  `std::optional<int> parseInt(const std::string& text) {
    try {
        return std::stoi(text);
    } catch (const std::exception&) {
        return std::nullopt;
    }
}

int main() {
    if (auto value = parseInt("42"); value.has_value()) {
        std::cout << *value << "\\n";
    }

    std::cout << parseInt("abc").value_or(-1) << "\\n";
}`,
  `using Cell = std::variant<int, double, std::string>;

struct Renderer {
    std::string operator()(int value) const {
        return std::to_string(value);
    }

    std::string operator()(double value) const {
        return std::to_string(value);
    }

    std::string operator()(const std::string& value) const {
        return value;
    }
};

std::string render(const Cell& cell) {
    return std::visit(Renderer{}, cell);
}`,
  `std::pair<int, int> minMax(const std::vector<int>& values) {
    auto [minIt, maxIt] =
        std::minmax_element(values.begin(), values.end());

    return {*minIt, *maxIt};
}

int main() {
    auto [low, high] = minMax({4, 8, 15, 16, 23, 42});
    std::cout << low << " to " << high << "\\n";
}`,
  `double average(const std::vector<double>& values) {
    if (values.empty()) {
        return 0.0;
    }

    const double sum =
        std::accumulate(values.begin(), values.end(), 0.0);

    return sum / static_cast<double>(values.size());
}

int countHeavy(const std::vector<Panel>& panels) {
    return static_cast<int>(std::count_if(
        panels.begin(), panels.end(),
        [](const Panel& p) { return p.heavy(); }));
}`,
  `std::vector<std::string> marks(const std::vector<Panel>& panels) {
    std::vector<std::string> out;
    out.reserve(panels.size());

    std::transform(panels.begin(), panels.end(),
        std::back_inserter(out),
        [](const Panel& panel) { return panel.mark(); });

    return out;
}`,
  `void dropLight(std::vector<Panel>& panels, double minimum) {
    panels.erase(
        std::remove_if(panels.begin(), panels.end(),
            [minimum](const Panel& panel) {
                return panel.weight() < minimum;
            }),
        panels.end());
}`,
  `void printFast(const std::vector<Score>& scores) {
    auto fast = scores
        | std::views::filter([](const Score& s) {
              return s.wpm >= 60;
          })
        | std::views::take(10);

    for (const auto& score : fast) {
        std::cout << score.user << " " << score.wpm << "\\n";
    }
}`,
  `constexpr int factorial(int n) {
    return n <= 1 ? 1 : n * factorial(n - 1);
}

constexpr double toKilonewton(double kilograms) {
    return kilograms * 0.00981;
}

int main() {
    static_assert(factorial(5) == 120, "bad factorial");

    constexpr double load = toKilonewton(5000.0);
    std::cout << load << " kN\\n";
}`,
  `template <typename T>
concept Numeric = std::integral<T> || std::floating_point<T>;

template <Numeric T>
T sum(const std::vector<T>& values) {
    T total{};

    for (const T& value : values) {
        total += value;
    }

    return total;
}`,
  `template <typename... Args>
std::string join(const Args&... parts) {
    std::ostringstream stream;
    ((stream << parts), ...);
    return stream.str();
}

template <typename T, typename... Rest>
T maxOf(T first, Rest... rest) {
    T best = first;
    ((best = std::max(best, rest)), ...);
    return best;
}`,
  `using Handler = std::function<void(const std::string&)>;

class Dispatcher {
public:
    void on(const std::string& event, Handler handler) {
        handlers_[event].push_back(std::move(handler));
    }

    void emit(const std::string& event,
              const std::string& payload) {
        for (const auto& handler : handlers_[event]) {
            handler(payload);
        }
    }

private:
    std::map<std::string, std::vector<Handler>> handlers_;
};`,
  `int main() {
    int total = 0;
    std::vector<int> values = {1, 2, 3, 4, 5};

    std::for_each(values.begin(), values.end(),
        [&total](int value) { total += value; });

    auto scaled = [factor = 2](int value) {
        return value * factor;
    };

    std::cout << total << " " << scaled(total) << "\\n";
}`,
  `std::mutex mutex;
int counter = 0;

void increment(int times) {
    for (int i = 0; i < times; ++i) {
        std::lock_guard<std::mutex> lock(mutex);
        ++counter;
    }
}

int main() {
    std::thread a(increment, 1000);
    std::thread b(increment, 1000);

    a.join();
    b.join();

    std::cout << counter << "\\n";
}`,
  `int countWordsIn(const std::string& path);

int main() {
    std::vector<std::future<int>> tasks;

    for (const auto& path : {"a.txt", "b.txt", "c.txt"}) {
        tasks.push_back(
            std::async(std::launch::async, countWordsIn, path));
    }

    int total = 0;
    for (auto& task : tasks) {
        total += task.get();
    }

    std::cout << total << "\\n";
}`,
  `std::atomic<int> hits{0};

void record() {
    hits.fetch_add(1, std::memory_order_relaxed);
}

int main() {
    std::vector<std::thread> pool;

    for (int i = 0; i < 8; ++i) {
        pool.emplace_back(record);
    }

    for (auto& thread : pool) {
        thread.join();
    }

    std::cout << hits.load() << "\\n";
}`,
  `std::queue<int> jobs;
std::mutex mutex;
std::condition_variable ready;

void consume() {
    std::unique_lock<std::mutex> lock(mutex);
    ready.wait(lock, [] { return !jobs.empty(); });

    const int job = jobs.front();
    jobs.pop();
    lock.unlock();

    std::cout << "handling " << job << "\\n";
}`,
  `template <typename Fn>
double timeIt(Fn fn) {
    const auto start = std::chrono::steady_clock::now();
    fn();
    const auto end = std::chrono::steady_clock::now();

    const std::chrono::duration<double> elapsed = end - start;
    return elapsed.count();
}

int main() {
    std::cout << timeIt([] { heavyWork(); }) << "s\\n";
}`,
  `std::vector<std::string> readLines(const std::string& path) {
    std::ifstream file(path);
    if (!file) {
        throw std::runtime_error("cannot open " + path);
    }

    std::vector<std::string> lines;
    std::string line;

    while (std::getline(file, line)) {
        lines.push_back(line);
    }

    return lines;
}`,
  `std::vector<std::string> split(const std::string& line, char sep) {
    std::vector<std::string> cells;
    std::istringstream stream(line);
    std::string cell;

    while (std::getline(stream, cell, sep)) {
        cells.push_back(cell);
    }

    return cells;
}`,
  `bool startsWith(std::string_view text, std::string_view prefix) {
    return text.size() >= prefix.size() &&
           text.substr(0, prefix.size()) == prefix;
}

std::string_view trim(std::string_view text) {
    while (!text.empty() && std::isspace(text.front())) {
        text.remove_prefix(1);
    }

    while (!text.empty() && std::isspace(text.back())) {
        text.remove_suffix(1);
    }

    return text;
}`,
  `int main() {
    std::array<int, 6> values = {5, 3, 8, 1, 9, 2};

    std::ranges::sort(values);

    const auto found = std::ranges::find(values, 8);
    if (found != values.end()) {
        std::cout << "index " << (found - values.begin()) << "\\n";
    }

    for (int value : values) {
        std::cout << value << " ";
    }
}`,
  `std::vector<int> breadthFirst(
    const std::vector<std::vector<int>>& graph,
    int start) {
    std::vector<bool> seen(graph.size(), false);
    std::deque<int> queue{start};
    std::vector<int> order;

    while (!queue.empty()) {
        const int node = queue.front();
        queue.pop_front();

        if (seen[node]) {
            continue;
        }

        seen[node] = true;
        order.push_back(node);

        for (int next : graph[node]) {
            queue.push_back(next);
        }
    }

    return order;
}`,
  `std::vector<int> smallest(const std::vector<int>& values, int n) {
    std::priority_queue<int> heap;

    for (int value : values) {
        heap.push(value);

        if (static_cast<int>(heap.size()) > n) {
            heap.pop();
        }
    }

    std::vector<int> out;
    while (!heap.empty()) {
        out.push_back(heap.top());
        heap.pop();
    }

    return out;
}`,
  `using Matrix = std::vector<std::vector<int>>;

Matrix multiply(const Matrix& a, const Matrix& b) {
    const std::size_t rows = a.size();
    const std::size_t cols = b[0].size();
    const std::size_t shared = b.size();

    Matrix out(rows, std::vector<int>(cols, 0));

    for (std::size_t i = 0; i < rows; ++i) {
        for (std::size_t j = 0; j < cols; ++j) {
            for (std::size_t k = 0; k < shared; ++k) {
                out[i][j] += a[i][k] * b[k][j];
            }
        }
    }

    return out;
}`,
  `void quickSort(std::vector<int>& values, int low, int high) {
    if (low >= high) {
        return;
    }

    const int pivot = values[high];
    int index = low;

    for (int i = low; i < high; ++i) {
        if (values[i] < pivot) {
            std::swap(values[i], values[index]);
            ++index;
        }
    }

    std::swap(values[index], values[high]);

    quickSort(values, low, index - 1);
    quickSort(values, index + 1, high);
}`,
  `std::vector<int> mergeSorted(
    const std::vector<int>& a,
    const std::vector<int>& b) {
    std::vector<int> out;
    out.reserve(a.size() + b.size());

    std::merge(a.begin(), a.end(), b.begin(), b.end(),
        std::back_inserter(out));

    return out;
}`,
  `std::vector<int> primesUpTo(int limit) {
    std::vector<bool> sieve(limit + 1, true);
    sieve[0] = false;
    sieve[1] = false;

    for (int n = 2; n * n <= limit; ++n) {
        if (!sieve[n]) {
            continue;
        }

        for (int m = n * n; m <= limit; m += n) {
            sieve[m] = false;
        }
    }

    std::vector<int> out;
    for (int n = 2; n <= limit; ++n) {
        if (sieve[n]) {
            out.push_back(n);
        }
    }

    return out;
}`,
  `constexpr int gcd(int a, int b) {
    while (b != 0) {
        const int rest = a % b;
        a = b;
        b = rest;
    }

    return a < 0 ? -a : a;
}

constexpr int lcm(int a, int b) {
    return (a == 0 || b == 0) ? 0 : a / gcd(a, b) * b;
}`,
  `long long fib(int n, std::vector<long long>& memo) {
    if (n < 2) {
        return n;
    }

    if (memo[n] >= 0) {
        return memo[n];
    }

    memo[n] = fib(n - 1, memo) + fib(n - 2, memo);
    return memo[n];
}

long long fib(int n) {
    std::vector<long long> memo(std::max(n + 1, 2), -1);
    return fib(n, memo);
}`,
  `class SubmitError : public std::runtime_error {
public:
    SubmitError(int status, const std::string& url)
        : std::runtime_error("submit failed: " + url),
          status_(status) {}

    int status() const {
        return status_;
    }

    bool retryable() const {
        return status_ >= 500 || status_ == 429;
    }

private:
    int status_;
};`,
  `enum class Level {
    Debug,
    Info,
    Warn,
    Error,
};

std::string_view name(Level level) {
    switch (level) {
        case Level::Debug: return "debug";
        case Level::Info:  return "info";
        case Level::Warn:  return "warn";
        case Level::Error: return "error";
    }

    return "unknown";
}`,
  `namespace typre::units {

inline double toKilonewton(double kilograms) {
    return kilograms * 0.00981;
}

inline double toKilogram(double kilonewton) {
    return kilonewton / 0.00981;
}

}  // namespace typre::units

int main() {
    std::cout << typre::units::toKilonewton(5000.0) << "\\n";
}`,
  `using Command = std::function<int(const std::vector<std::string>&)>;

int run(const std::string& name,
        const std::vector<std::string>& args) {
    static const std::map<std::string, Command> commands = {
        {"build", buildCommand},
        {"clean", cleanCommand},
        {"test", testCommand},
    };

    const auto found = commands.find(name);
    if (found == commands.end()) {
        std::cerr << "unknown command: " << name << "\\n";
        return 1;
    }

    return found->second(args);
}`,
  `class Counter {
public:
    explicit Counter(int value) : value_(value) {}

    int operator*() const {
        return value_;
    }

    Counter& operator++() {
        ++value_;
        return *this;
    }

    bool operator!=(const Counter& other) const {
        return value_ != other.value_;
    }

private:
    int value_;
};`,
  `class Exporter {
public:
    virtual ~Exporter() = default;

    virtual std::string dump(
        const std::vector<Score>& rows) const = 0;

    void save(const std::string& path,
              const std::vector<Score>& rows) const {
        std::ofstream out(path);
        out << dump(rows);
    }
};

class CsvExporter : public Exporter {
public:
    std::string dump(
        const std::vector<Score>& rows) const override;
};`,
  `void printTable(const std::vector<Score>& scores) {
    std::cout << std::left << std::setw(14) << "player"
              << std::right << std::setw(5) << "wpm"
              << std::setw(8) << "acc" << "\\n";

    for (const auto& score : scores) {
        std::cout << std::left << std::setw(14) << score.user
                  << std::right << std::setw(5) << score.wpm
                  << std::setw(7) << std::fixed
                  << std::setprecision(1) << score.accuracy
                  << "%\\n";
    }
}`,
])
