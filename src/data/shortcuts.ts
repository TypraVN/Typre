export interface ShortcutItem {
  id: string
  description: string
  keys: string[]
}

/**
 * Phím tắt VS Code — bộ mặc định trên WINDOWS/LINUX.
 *
 * Cố ý không trộn phím Mac (`Cmd`) vào cùng danh sách: người dùng Mac gõ `Ctrl` sẽ sai
 * hết, mà hiện chưa có chỗ nào cho họ chọn bàn phím. Thà nhất quán một hệ còn hơn sai
 * một nửa cho tất cả.
 *
 * Chỉ thêm phím tắt mình đã dùng thật. Một phím tắt SAI trong bộ luyện còn tệ hơn thiếu:
 * người ta luyện thành phản xạ rồi mang vào editor thật và nó không chạy.
 */
export const vscodeShortcuts: ShortcutItem[] = [
  {
    id: 'multi-cursor',
    description: 'Select all occurrences',
    keys: ['Ctrl', 'Shift', 'L'],
  },
  {
    id: 'move-line-up',
    description: 'Move line up',
    keys: ['Alt', 'Up'],
  },
  {
    id: 'move-line-down',
    description: 'Move line down',
    keys: ['Alt', 'Down'],
  },
  {
    id: 'command-palette',
    description: 'Command palette',
    keys: ['Ctrl', 'Shift', 'P'],
  },
  {
    id: 'quick-open',
    description: 'Quick open file',
    keys: ['Ctrl', 'P'],
  },
  {
    id: 'rename-symbol',
    description: 'Rename symbol',
    keys: ['F2'],
  },
  {
    id: 'duplicate-line',
    description: 'Copy line down',
    keys: ['Shift', 'Alt', 'Down'],
  },
  {
    id: 'comment-line',
    description: 'Toggle line comment',
    keys: ['Ctrl', '/'],
  },
  {
    id: 'go-to-def',
    description: 'Go to definition',
    keys: ['F12'],
  },
  {
    id: 'format-doc',
    description: 'Format document',
    keys: ['Shift', 'Alt', 'F'],
  },
  {
    id: 'find-in-files',
    description: 'Search across files',
    keys: ['Ctrl', 'Shift', 'F'],
  },
  {
    id: 'find',
    description: 'Find in file',
    keys: ['Ctrl', 'F'],
  },
  {
    id: 'toggle-terminal',
    description: 'Toggle terminal',
    keys: ['Ctrl', '`'],
  },
  {
    id: 'toggle-sidebar',
    description: 'Toggle sidebar',
    keys: ['Ctrl', 'B'],
  },
  {
    id: 'split-editor',
    description: 'Split editor',
    keys: ['Ctrl', '\\'],
  },
  {
    id: 'go-to-line',
    description: 'Go to line',
    keys: ['Ctrl', 'G'],
  },
  {
    id: 'go-to-symbol',
    description: 'Go to symbol in file',
    keys: ['Ctrl', 'Shift', 'O'],
  },
  {
    id: 'peek-definition',
    description: 'Peek definition',
    keys: ['Alt', 'F12'],
  },
  {
    id: 'find-references',
    description: 'Find all references',
    keys: ['Shift', 'F12'],
  },
  {
    id: 'quick-fix',
    description: 'Quick fix',
    keys: ['Ctrl', '.'],
  },
  {
    id: 'add-cursor-below',
    description: 'Add cursor below',
    keys: ['Ctrl', 'Alt', 'Down'],
  },
  {
    id: 'select-next-match',
    description: 'Add selection to next match',
    keys: ['Ctrl', 'D'],
  },
  {
    id: 'expand-selection',
    description: 'Expand selection',
    keys: ['Shift', 'Alt', 'Right'],
  },
  {
    id: 'block-comment',
    description: 'Toggle block comment',
    keys: ['Shift', 'Alt', 'A'],
  },
  {
    id: 'indent-line',
    description: 'Indent line',
    keys: ['Ctrl', ']'],
  },
  {
    id: 'trigger-suggest',
    description: 'Trigger suggestion',
    keys: ['Ctrl', 'Space'],
  },
  {
    id: 'signature-help',
    description: 'Show parameter hints',
    keys: ['Ctrl', 'Shift', 'Space'],
  },
  {
    id: 'navigate-back',
    description: 'Go back',
    keys: ['Alt', 'Left'],
  },
]

/**
 * Lệnh Vim — chỉ những lệnh chạy được trên Vim/Neovim gốc, không cần plugin.
 *
 * Phân biệt hoa/thường là CÓ NGHĨA ở đây: `G` và `g` là hai lệnh khác nhau, `A` và `a`
 * cũng vậy. Đừng "chuẩn hoá" chữ hoa thường ở bất kỳ đâu trong luồng này.
 */
export const vimShortcuts: ShortcutItem[] = [
  {
    id: 'delete-line',
    description: 'Delete line',
    keys: ['d', 'd'],
  },
  {
    id: 'yank-line',
    description: 'Yank (copy) line',
    keys: ['y', 'y'],
  },
  {
    id: 'go-to-end',
    description: 'Go to end of file',
    keys: ['G'],
  },
  {
    id: 'go-to-start',
    description: 'Go to start of file',
    keys: ['g', 'g'],
  },
  {
    id: 'undo',
    description: 'Undo',
    keys: ['u'],
  },
  {
    id: 'redo',
    description: 'Redo',
    keys: ['Ctrl', 'r'],
  },
  {
    id: 'insert-mode',
    description: 'Enter insert mode',
    keys: ['i'],
  },
  {
    id: 'save-quit',
    description: 'Save and quit',
    keys: [':', 'w', 'q'],
  },
  {
    id: 'quit-no-save',
    description: 'Quit without saving',
    keys: [':', 'q', '!'],
  },
  {
    id: 'append',
    description: 'Insert after cursor',
    keys: ['a'],
  },
  {
    id: 'append-line-end',
    description: 'Insert at end of line',
    keys: ['A'],
  },
  {
    id: 'open-line-below',
    description: 'Open line below and insert',
    keys: ['o'],
  },
  {
    id: 'open-line-above',
    description: 'Open line above and insert',
    keys: ['O'],
  },
  {
    id: 'paste-after',
    description: 'Paste after cursor',
    keys: ['p'],
  },
  {
    id: 'delete-char',
    description: 'Delete character',
    keys: ['x'],
  },
  {
    id: 'change-word',
    description: 'Change word',
    keys: ['c', 'w'],
  },
  {
    id: 'delete-word',
    description: 'Delete word',
    keys: ['d', 'w'],
  },
  {
    id: 'delete-inside-quotes',
    description: 'Delete inside quotes',
    keys: ['d', 'i', '"'],
  },
  {
    id: 'change-inside-parens',
    description: 'Change inside parentheses',
    keys: ['c', 'i', '('],
  },
  {
    id: 'word-forward',
    description: 'Jump forward one word',
    keys: ['w'],
  },
  {
    id: 'word-back',
    description: 'Jump back one word',
    keys: ['b'],
  },
  {
    id: 'line-start',
    description: 'Go to first non-blank of line',
    keys: ['^'],
  },
  {
    id: 'line-end',
    description: 'Go to end of line',
    keys: ['$'],
  },
  {
    id: 'match-bracket',
    description: 'Jump to matching bracket',
    keys: ['%'],
  },
  {
    id: 'search-forward',
    description: 'Search forward',
    keys: ['/'],
  },
  {
    id: 'next-match',
    description: 'Next search match',
    keys: ['n'],
  },
  {
    id: 'search-word-under-cursor',
    description: 'Search word under cursor',
    keys: ['*'],
  },
  {
    id: 'visual-mode',
    description: 'Enter visual mode',
    keys: ['v'],
  },
  {
    id: 'visual-line',
    description: 'Enter visual line mode',
    keys: ['V'],
  },
  {
    id: 'indent-line',
    description: 'Indent line',
    keys: ['>', '>'],
  },
  {
    id: 'join-lines',
    description: 'Join line below',
    keys: ['J'],
  },
  {
    id: 'repeat',
    description: 'Repeat last change',
    keys: ['.'],
  },
  {
    id: 'replace-all',
    description: 'Replace all in file',
    keys: [':', '%', 's'],
  },
]
