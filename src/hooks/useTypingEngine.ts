import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CharStatus, EngineStatus, TypingStats } from '../types/typing';
import { useSoundStore } from '../store/useSoundStore';
import { playCorrect, playWrong, playFinish } from '../lib/sound';

interface KeyLike {
  key: string;
  code?: string;
  ctrlKey: boolean;
  shiftKey?: boolean;
  metaKey: boolean;
  altKey: boolean;
  preventDefault: () => void;
}

// Physical-key fallback for keyboard layouts / IMEs that report e.key as
// 'Dead' or 'Unidentified' for punctuation (observed with some Vietnamese layouts).
const CODE_FALLBACK: Record<string, [string, string]> = {
  Slash: ['/', '?'],
  Period: ['.', '>'],
  Comma: [',', '<'],
  Semicolon: [';', ':'],
  Quote: ["'", '"'],
  BracketLeft: ['[', '{'],
  BracketRight: [']', '}'],
  Backslash: ['\\', '|'],
  Minus: ['-', '_'],
  Equal: ['=', '+'],
  Backquote: ['`', '~'],
  Digit1: ['1', '!'],
  Digit2: ['2', '@'],
  Digit3: ['3', '#'],
  Digit4: ['4', '$'],
  Digit5: ['5', '%'],
  Digit6: ['6', '^'],
  Digit7: ['7', '&'],
  Digit8: ['8', '*'],
  Digit9: ['9', '('],
  Digit0: ['0', ')'],
};

function buildInitialStatuses(target: string): CharStatus[] {
  return Array(target.length).fill('pending');
}

/**
 * Độ đều tay từ tốc độ của từng giây: 100% = tốc độ y nhau suốt bài.
 * Dùng hệ số biến thiên (độ lệch chuẩn / trung bình) như Monkeytype.
 * Cần ≥ 2 mẫu mới có ý nghĩa; ít hơn thì trả 100 (chưa đủ dữ liệu để nói là không đều).
 */
function computeConsistency(samples: number[]): number {
  if (samples.length < 2) return 100;

  const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
  if (mean <= 0) return 0;

  const variance = samples.reduce((sum, v) => sum + (v - mean) ** 2, 0) / samples.length;
  const cv = Math.sqrt(variance) / mean;

  return Math.max(0, Math.min(100, (1 - cv) * 100));
}

/**
 * Một lượt gõ = ĐÚNG MỘT bài. Gõ hết bài là chốt lượt và hiện kết quả ngay, không tự
 * nối bài kế tiếp; muốn gõ nữa thì người dùng tự bấm "next snippet".
 */
export function useTypingEngine(target: string) {
  const [charStatuses, setCharStatuses] = useState<CharStatus[]>(() => buildInitialStatuses(target));
  const [cursor, setCursor] = useState(0);
  const [status, setStatus] = useState<EngineStatus>('idle');
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [finishedAt, setFinishedAt] = useState<number | null>(null);
  const [mistakeCounts, setMistakeCounts] = useState<Record<string, number>>({});
  const [now, setNow] = useState(() => Date.now());
  const soundEnabled = useSoundStore((s) => s.enabled);

  /**
   * Tổng ký tự đã gõ kể cả sai — dùng cho rawWpm. Không suy ra được từ charStatuses
   * vì backspace xoá dấu vết: gõ sai rồi sửa vẫn phải tính là đã gõ.
   */
  const typedTotalRef = useRef(0);
  /** Tốc độ (ký tự/giây) của từng giây, để tính độ đều tay. */
  const perSecondRef = useRef<number[]>([]);
  const lastTickRef = useRef({ at: 0, typed: 0 });
  const [samples, setSamples] = useState<number[]>([]);

  const playFeedback = useCallback(
    (correct: boolean) => {
      if (!soundEnabled) return;
      if (correct) playCorrect();
      else playWrong();
    },
    [soundEnabled],
  );

  const reset = useCallback(() => {
    setCharStatuses(buildInitialStatuses(target));
    setCursor(0);
    setStatus('idle');
    setStartedAt(null);
    setFinishedAt(null);
    setMistakeCounts({});
    typedTotalRef.current = 0;
    perSecondRef.current = [];
    lastTickRef.current = { at: 0, typed: 0 };
    setSamples([]);
  }, [target]);

  useEffect(() => {
    reset();
  }, [target, reset]);


  useEffect(() => {
    if (status !== 'typing') return;

    const id = window.setInterval(() => {
      const t = Date.now();
      setNow(t);

      // Mỗi ~1 giây chốt 1 mẫu: số ký tự gõ được trong giây đó.
      const last = lastTickRef.current;
      if (last.at === 0) {
        lastTickRef.current = { at: t, typed: typedTotalRef.current };
        return;
      }
      const dt = (t - last.at) / 1000;
      if (dt >= 1) {
        const charsThisWindow = typedTotalRef.current - last.typed;
        perSecondRef.current = [...perSecondRef.current, charsThisWindow / dt];
        setSamples(perSecondRef.current);
        lastTickRef.current = { at: t, typed: typedTotalRef.current };
      }
    }, 250);

    return () => window.clearInterval(id);
  }, [status]);

  const finishIfDone = useCallback(
    (nextCursor: number) => {
      if (nextCursor < target.length) return;

      // Gõ hết bài là CHỐT LƯỢT ngay, kể cả khi đồng hồ còn thời gian. Muốn gõ bài
      // nữa thì người dùng tự bấm "next snippet".
      setStatus('finished');
      setFinishedAt(Date.now());
      if (soundEnabled) playFinish();
    },
    [target.length, soundEnabled],
  );

  const beginIfIdle = useCallback(() => {
    setStatus((prev) => {
      if (prev !== 'idle') return prev;
      const start = Date.now();
      setStartedAt(start);
      setNow(start);
      return 'typing';
    });
  }, []);

  const registerMistake = useCallback((expected: string) => {
    setMistakeCounts((prev) => ({ ...prev, [expected]: (prev[expected] ?? 0) + 1 }));
  }, []);

  const typeChar = useCallback(
    (char: string) => {
      if (status === 'finished' || cursor >= target.length) return;
      beginIfIdle();

      const expected = target[cursor];
      const correct = char === expected;
      const nextCursor = cursor + 1;

      setCharStatuses((prev) => {
        const next = [...prev];
        next[cursor] = correct ? 'correct' : 'incorrect';
        return next;
      });
      if (!correct) registerMistake(expected);
      playFeedback(correct);
      typedTotalRef.current += 1;

      setCursor(nextCursor);
      finishIfDone(nextCursor);
    },
    [status, cursor, target, beginIfIdle, finishIfDone, registerMistake, playFeedback],
  );

  const typeEnter = useCallback(() => {
    if (status === 'finished' || cursor >= target.length) return;
    beginIfIdle();

    const expected = target[cursor];
    const correct = expected === '\n';

    const updates: Array<{ index: number; value: CharStatus }> = [
      { index: cursor, value: correct ? 'correct' : 'incorrect' },
    ];

    let nextCursor = cursor + 1;
    if (correct) {
      while (nextCursor < target.length && target[nextCursor] === ' ') {
        updates.push({ index: nextCursor, value: 'auto' });
        nextCursor += 1;
      }
    }

    setCharStatuses((prev) => {
      const next = [...prev];
      for (const u of updates) next[u.index] = u.value;
      return next;
    });
    if (!correct) registerMistake(expected);
    playFeedback(correct);
    typedTotalRef.current += 1;

    setCursor(nextCursor);
    finishIfDone(nextCursor);
  }, [status, cursor, target, beginIfIdle, finishIfDone, registerMistake, playFeedback]);

  const typeTab = useCallback(() => {
    if (status === 'finished' || cursor >= target.length) return;
    beginIfIdle();

    let runEnd = cursor;
    while (runEnd < target.length && target[runEnd] === ' ') runEnd += 1;

    if (runEnd > cursor) {
      setCharStatuses((prev) => {
        const next = [...prev];
        for (let i = cursor; i < runEnd; i += 1) next[i] = 'correct';
        return next;
      });
      playFeedback(true);
      // Tab nhảy qua cả dải thụt lề: tính đúng số ký tự đã vượt, không phải 1.
      typedTotalRef.current += runEnd - cursor;
      setCursor(runEnd);
      finishIfDone(runEnd);
      return;
    }

    const expected = target[cursor];
    setCharStatuses((prev) => {
      const next = [...prev];
      next[cursor] = 'incorrect';
      return next;
    });
    registerMistake(expected);
    playFeedback(false);
    typedTotalRef.current += 1;

    const nextCursor = cursor + 1;
    setCursor(nextCursor);
    finishIfDone(nextCursor);
  }, [status, cursor, target, beginIfIdle, finishIfDone, registerMistake, playFeedback]);

  const backspace = useCallback(() => {
    if (status === 'finished' || cursor === 0) return;
    const prevCursor = cursor - 1;
    setCharStatuses((prev) => {
      const next = [...prev];
      next[prevCursor] = 'pending';
      return next;
    });
    setCursor(prevCursor);
  }, [status, cursor]);

  const handleKeyDown = useCallback(
    (e: KeyLike) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (e.key === 'Tab') {
        e.preventDefault();
        typeTab();
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        typeEnter();
        return;
      }
      if (e.key === 'Backspace') {
        e.preventDefault();
        backspace();
        return;
      }
      if (e.key.length === 1) {
        e.preventDefault();
        typeChar(e.key);
        return;
      }

      if (e.code && CODE_FALLBACK[e.code]) {
        e.preventDefault();
        const [plain, shifted] = CODE_FALLBACK[e.code];
        typeChar(e.shiftKey ? shifted : plain);
      }
    },
    [typeTab, typeEnter, backspace, typeChar],
  );

  const stats: TypingStats = useMemo(() => {
    // Một lượt = một bài, nên `charStatuses` đã bao trọn cả lượt: không cần bộ đếm cộng dồn.
    const correctCount = charStatuses.filter((s) => s === 'correct').length;
    const incorrectCount = charStatuses.filter((s) => s === 'incorrect').length;
    const attempted = correctCount + incorrectCount;

    const endTime = status === 'finished' ? finishedAt : now;
    const elapsedMs = startedAt && endTime ? endTime - startedAt : 0;
    const elapsedMinutes = elapsedMs / 60000;

    const cpm = elapsedMinutes > 0 ? correctCount / elapsedMinutes : 0;
    const wpm = cpm / 5;
    const accuracy = attempted > 0 ? (correctCount / attempted) * 100 : 100;

    // raw = tính trên MỌI ký tự đã gõ (kể cả sai), nên luôn ≥ wpm.
    const rawWpm = elapsedMinutes > 0 ? typedTotalRef.current / elapsedMinutes / 5 : 0;

    return {
      wpm: Math.round(wpm),
      cpm: Math.round(cpm),
      rawWpm: Math.round(rawWpm),
      accuracy: Math.round(accuracy),
      consistency: Math.round(computeConsistency(samples)),
      elapsedSeconds: Math.round(elapsedMs / 1000),
    };
  }, [charStatuses, startedAt, finishedAt, now, status, samples]);

  return {
    target,
    charStatuses,
    cursor,
    status,
    stats,
    mistakeCounts,
    handleKeyDown,
    reset,
  };
}
