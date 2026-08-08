export interface ShortcutItem {
  id: string
  description: string
  keys: string[]
}

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
]

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
]
