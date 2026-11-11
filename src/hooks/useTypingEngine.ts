import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { EngineStatus, TypingStats } from '../types/typing';
import { useSoundStore } from '../store/useSoundStore';
import { playCorrect, playWrong, playFinish } from '../lib/sound';
import { isShortcutCombo } from '../lib/shortcutCombo';
import {
  KEY_BACKSPACE,
  KEY_ENTER,
  KEY_TAB,
  applyKey,
  initialCore,
  isComplete,
  statsOf,
  type CoreState,
  type RunAction,
} from '../../supabase/functions/_shared/typingCore.ts';

interface KeyLike {
  key: string;
  code?: string;
  ctrlKey: boolean;
  shiftKey?: boolean;
  metaKey: boolean;
  altKey: boolean;
  getModifierState?: (key: 'AltGraph') => boolean;
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

/** `e.key` của phím bổ trợ nhấn riêng — không phải một lần gõ ký tự. */
const MODIFIER_KEYS = new Set(['Shift', 'Control', 'Alt', 'Meta', 'AltGraph', 'CapsLock']);

interface EngineOptions {
  /**
   * Strict mode: gõ sai thì con trỏ ĐỨNG YÊN, ký tự đó tô đỏ cho tới khi gõ đúng. Mỗi lần
   * gõ sai vẫn bị tính vào accuracy — không thì bấm bừa cho tới khi trúng cũng được 100%.
   */
  strict?: boolean;
  /** Mốc thời gian. Phím tới sau mốc không tính — đúng như server chạy lại bản ghi. */
  timeLimitMs?: number;
}

/**
 * Một lượt gõ = ĐÚNG MỘT bài. Gõ hết bài là chốt lượt và hiện kết quả ngay, không tự
 * nối bài kế tiếp; muốn gõ nữa thì người dùng tự bấm "next snippet".
 *
 * Luật gõ (đúng/sai, Enter tự thụt lề, Tab, Backspace, Strict) nằm ở `typingCore.ts`, dùng
 * chung với Edge Function `submit-score`. Hook này chỉ lo phần trình duyệt: đọc phím, ghi
 * bản ghi phím kèm thời điểm, âm thanh, đồng hồ. Điểm hiện ở màn kết quả vì vậy đúng bằng
 * điểm server tự tính lại từ bản ghi.
 */
export function useTypingEngine(
  target: string,
  { strict = false, timeLimitMs = Number.POSITIVE_INFINITY }: EngineOptions = {},
) {
  const [core, setCore] = useState<CoreState>(() => initialCore(target));
  const [status, setStatus] = useState<EngineStatus>('idle');
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [finishedAt, setFinishedAt] = useState<number | null>(null);
  const [mistakeCounts, setMistakeCounts] = useState<Record<string, number>>({});
  const [now, setNow] = useState(() => Date.now());
  const soundEnabled = useSoundStore((s) => s.enabled);

  /**
   * Trạng thái THẬT, cập nhật đồng bộ ở mỗi phím. State React chỉ là bản để vẽ: hai phím
   * tới trước khi React kịp vẽ lại (gõ rất nhanh, hay bàn phím điện thoại đẩy nhiều ký tự
   * một lần) mà đọc từ state thì phím sau áp lên trạng thái cũ và mất phím trước.
   */
  const coreRef = useRef(core);
  const startRef = useRef<number | null>(null);
  const finishedRef = useRef(false);
  /** Bản ghi phím của lượt này — server chạy lại đúng bản ghi này để chấm điểm. */
  const actionsRef = useRef<RunAction[]>([]);
  /**
   * Ký tự vừa gõ từ một phím chết (`Dead`) theo vị trí phím, chờ xem lần nhấn kế tiếp có
   * phải ký tự GHÉP của chính nó không — xem nhánh `Dead` trong `handleKeyDown`.
   */
  const deadTypedRef = useRef<string | null>(null);

  const playFeedback = useCallback(
    (correct: boolean) => {
      if (!soundEnabled) return;
      if (correct) playCorrect();
      else playWrong();
    },
    [soundEnabled],
  );

  const reset = useCallback(() => {
    const fresh = initialCore(target);
    coreRef.current = fresh;
    setCore(fresh);
    setStatus('idle');
    setStartedAt(null);
    setFinishedAt(null);
    setMistakeCounts({});
    startRef.current = null;
    finishedRef.current = false;
    actionsRef.current = [];
    deadTypedRef.current = null;
  }, [target]);

  useEffect(() => {
    reset();
  }, [target, reset]);

  // Nhịp đồng hồ: chỉ để vẽ lại số giây và wpm đang chạy. Điểm KHÔNG phụ thuộc nhịp này.
  useEffect(() => {
    if (status !== 'typing') return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [status]);

  /**
   * Áp MỘT phím: ghi vào bản ghi, cập nhật trạng thái, phát âm, chốt lượt khi hết bài.
   * Mọi đường vào (bàn phím, ô nhập trên điện thoại) đều đi qua đây — bản ghi mới đủ.
   */
  const press = useCallback(
    (key: string) => {
      if (finishedRef.current) return;

      const at = Date.now();
      if (startRef.current === null) {
        // Backspace khi chưa gõ gì không phải là bắt đầu lượt.
        if (key === KEY_BACKSPACE) return;
        startRef.current = at;
        setStartedAt(at);
        setNow(at);
        setStatus('typing');
      }

      const t = at - startRef.current;
      if (t > timeLimitMs) return;

      const step = applyKey(coreRef.current, key, target, strict);
      actionsRef.current.push([t, key]);
      coreRef.current = step.state;
      setCore(step.state);

      if (step.outcome === 'wrong' && step.expected !== undefined) {
        const expected = step.expected;
        setMistakeCounts((prev) => ({ ...prev, [expected]: (prev[expected] ?? 0) + 1 }));
      }
      if (step.outcome !== 'none') playFeedback(step.outcome === 'correct');

      if (isComplete(step.state, target)) {
        finishedRef.current = true;
        setStatus('finished');
        setFinishedAt(at);
        if (soundEnabled) playFinish();
      }
    },
    [target, strict, timeLimitMs, playFeedback, soundEnabled],
  );

  const typeChar = useCallback((char: string) => press(char), [press]);
  const typeEnter = useCallback(() => press(KEY_ENTER), [press]);
  const backspace = useCallback(() => press(KEY_BACKSPACE), [press]);

  /** Bản sao bản ghi phím của lượt vừa gõ, để gửi lên server chấm lại. */
  const getActions = useCallback((): RunAction[] => [...actionsRef.current], []);

  const handleKeyDown = useCallback(
    (e: KeyLike) => {
      // KHÔNG chặn thẳng theo ctrlKey/altKey: AltGr trên bàn phím châu Âu báo thành
      // Ctrl+Alt, chặn vậy là mất hết dấu ngoặc — xem `isShortcutCombo`.
      if (isShortcutCombo(e)) return;

      // Phím bổ trợ nhấn riêng không phải một lần gõ: không được xoá dấu phím chết bên
      // dưới — `` ` `` trên bàn phím Đức là Shift + phím chết, Shift có thể tới giữa chừng.
      if (MODIFIER_KEYS.has(e.key)) return;

      const deadTyped = deadTypedRef.current;
      deadTypedRef.current = null;

      if (e.key === 'Tab') {
        e.preventDefault();
        press(KEY_TAB);
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        press(KEY_ENTER);
        return;
      }
      if (e.key === 'Backspace') {
        e.preventDefault();
        press(KEY_BACKSPACE);
        return;
      }
      if (e.key.length === 1) {
        e.preventDefault();
        // Ký tự ghép của phím chết vừa gõ ở dưới (US-International: `'` rồi phím cách
        // ra `'`): đã tính rồi, gõ nữa là thành hai. CHỈ khi tới bằng phím cách — bàn
        // phím tiếng Việt gõ `//` báo `Dead` rồi `/`, nuốt cái thứ hai là mất một lần gõ.
        if (deadTyped !== null && e.code === 'Space' && e.key === deadTyped) return;
        press(e.key);
        return;
      }

      if (e.code && CODE_FALLBACK[e.code]) {
        e.preventDefault();
        const [plain, shifted] = CODE_FALLBACK[e.code];
        const byPosition = e.shiftKey ? shifted : plain;

        /*
          Phím chết. Hai loại bàn phím báo `Dead` với nghĩa NGƯỢC nhau:

            - Tiếng Việt: `Dead` là sự kiện DUY NHẤT của dấu câu đó — phải gõ ngay theo
              vị trí phím (lý do CODE_FALLBACK tồn tại).
            - Đức, Pháp, US-International: `Dead` chỉ là nửa đầu, ký tự thật tới ở lần
              nhấn SAU (`^` + phím cách → `^`). Gõ ngay theo vị trí là ra ký tự sai:
              Đức bấm `` ` `` ra `+`, bấm `^` ra `` ` ``.

          Phân biệt bằng ký tự đang chờ gõ: theo vị trí phím mà ĐÚNG ký tự đó thì gõ ngay
          (tiếng Việt gõ đúng — y như trước giờ). Không đúng thì CHƯA gõ gì, để ký tự ghép
          ở lần nhấn sau tự đi qua nhánh `e.key.length === 1` phía trên.

          Cái giá: người dùng tiếng Việt gõ SAI một dấu câu thì lần gõ sai đó không hiện
          ra. Không mất gì thật — con trỏ vẫn đứng đó, lần gõ kế tiếp vẫn bị chấm.
        */
        if (e.key === 'Dead') {
          if (byPosition !== target[coreRef.current.cursor]) return;
          press(byPosition);
          deadTypedRef.current = byPosition;
          return;
        }

        press(byPosition);
      }
    },
    [press, target],
  );

  const stats: TypingStats = useMemo(() => {
    // Hết giờ thì thời gian đã gõ dừng ĐÚNG ở mốc, không trôi theo nhịp đồng hồ — cùng
    // cách server tính, nên điểm chốt ở màn kết quả khớp điểm trên bảng xếp hạng.
    const endTime = status === 'finished' ? finishedAt : now;
    const elapsedMs = startedAt && endTime ? Math.min(endTime - startedAt, timeLimitMs) : 0;
    const s = statsOf(core, elapsedMs, strict, actionsRef.current, target);

    return {
      wpm: s.wpm,
      cpm: s.cpm,
      rawWpm: s.rawWpm,
      accuracy: s.accuracy,
      consistency: s.consistency,
      elapsedSeconds: Math.round(elapsedMs / 1000),
      elapsedMs,
    };
  }, [core, startedAt, finishedAt, now, status, strict, target, timeLimitMs]);

  return {
    target,
    charStatuses: core.statuses,
    cursor: core.cursor,
    status,
    stats,
    mistakeCounts,
    handleKeyDown,
    reset,
    getActions,
    // Cho ô nhập ẩn trên điện thoại: bàn phím ảo không gửi keydown dùng được, phải đổi
    // nội dung ô nhập thành từng thao tác — xem `TouchTypingInput` trong CodeEditorDisplay.
    typeChar,
    typeEnter,
    backspace,
  };
}
