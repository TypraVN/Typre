import type { Snippet } from '../types'

// Trộn cả C++ và C thuần trong cùng một nhóm: grammar `cpp` của Shiki đọc đúng cả hai,
// và người gõ nhúng/giải thuật thường dùng lẫn lộn hai kiểu này.
export const cppSnippets: Snippet[] = [
  {
    id: 'cpp-vector-loop',
    language: 'cpp',
    title: 'Vector + range for',
    code: `std::vector<int> nums = {3, 1, 4};\nfor (int n : nums) {\n    std::cout << n << "\\n";\n}`,
  },
  {
    id: 'cpp-class',
    language: 'cpp',
    title: 'Class + constructor',
    code: `class Point {\npublic:\n    Point(int x, int y) : x_(x), y_(y) {}\nprivate:\n    int x_, y_;\n};`,
  },
  {
    id: 'cpp-template',
    language: 'cpp',
    title: 'Template function',
    code: `template <typename T>\nT maxOf(const T& a, const T& b) {\n    return a > b ? a : b;\n}`,
  },
  {
    id: 'cpp-smart-pointer',
    language: 'cpp',
    title: 'Smart pointer',
    code: `auto node = std::make_unique<Node>(42);\nnode->next = nullptr;`,
  },
  {
    id: 'cpp-map',
    language: 'cpp',
    title: 'Map iterate',
    code: `std::map<std::string, int> ages;\nages["nhat"] = 28;\nfor (const auto& [name, age] : ages) {\n    total += age;\n}`,
  },
  {
    id: 'c-printf-malloc',
    language: 'cpp',
    title: 'C: malloc + printf',
    code: `int *buf = (int *)malloc(n * sizeof(int));\nif (buf == NULL) {\n    printf("out of memory\\n");\n    return -1;\n}`,
  },
  {
    id: 'c-struct-typedef',
    language: 'cpp',
    title: 'C: struct + typedef',
    code: `typedef struct {\n    uint8_t id;\n    float value;\n} Sensor;`,
  },
  {
    id: 'c-pointer-swap',
    language: 'cpp',
    title: 'C: swap by pointer',
    code: `void swap(int *a, int *b) {\n    int tmp = *a;\n    *a = *b;\n    *b = tmp;\n}`,
  },
  {
    id: 'c-bitwise',
    language: 'cpp',
    title: 'C: bit mask',
    code: `flags |= (1 << 3);\nflags &= ~(1 << 2);\nif (flags & 0x0F) return 1;`,
  },
]
