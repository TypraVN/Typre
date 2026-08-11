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
])
