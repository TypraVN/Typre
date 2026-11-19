import features from './features.json'

/**
 * Công tắc bật/tắt tính năng. Đặt trong `features.json` chứ không viết thẳng ở đây vì
 * script sinh trang SEO (`scripts/generate-seo-pages.mjs`, chạy bằng Node thuần) cũng
 * phải đọc cùng công tắc — tắt trong app mà trang giới thiệu vẫn còn thì Google dẫn
 * người vào một chế độ không tồn tại.
 *
 * `chess`: chế độ cờ đang CẤT ĐI, không xoá — code, bảng Supabase, test giữ nguyên.
 * Đổi thành `true` là tab Chess, `?chess=1` và trang `/practice/chess/` cùng quay lại.
 * Nhớ bỏ luôn redirect `/practice/chess/` trong `vercel.json`.
 */
export const CHESS_ENABLED: boolean = features.chess
