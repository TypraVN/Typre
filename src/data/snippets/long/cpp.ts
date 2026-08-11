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
  `std::unordered_map<std::string, int> countWords(const std::string& text) {
    std::unordered_map<std::string, int> counts;
    std::istringstream stream(text);
    std::string word;

    while (stream >> word) {
        std::transform(word.begin(), word.end(), word.begin(), ::tolower);
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
])
