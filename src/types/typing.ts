export type CharStatus = 'pending' | 'correct' | 'incorrect' | 'auto';

export type EngineStatus = 'idle' | 'typing' | 'finished';

export interface TypingStats {
  /** Tốc độ tính trên ký tự gõ ĐÚNG (chuẩn 5 ký tự = 1 từ). */
  wpm: number;
  cpm: number;
  /** Tốc độ tính trên MỌI ký tự đã gõ, kể cả gõ sai — luôn ≥ wpm. */
  rawWpm: number;
  accuracy: number;
  /**
   * Độ đều tay: 100% = giữ tốc độ như nhau suốt bài, càng thấp càng
   * gõ giật cục (lúc nhanh lúc chậm). Tính từ độ lệch chuẩn của tốc độ từng giây.
   */
  consistency: number;
  elapsedSeconds: number;
}
