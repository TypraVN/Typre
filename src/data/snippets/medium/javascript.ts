import { defineSnippets } from '../define'

/**
 * Bài TRUNG BÌNH cho mốc 30s — ~90-180 ký tự (4-6 dòng), tức khoảng nửa phút ở tốc độ
 * 40-60 wpm. Kho bài ngắn có trung vị 45 ký tự nên nếu không có rổ riêng thì mốc 30s
 * toàn ra bài gõ 5 giây là xong.
 */
export const javascriptMedium = defineSnippets('javascript', 'js-med', [
  `const totals = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] ?? 0) + order.amount;
    return acc;
}, {});`,
  `async function saveDraft(draft) {
    const res = await fetch("/api/drafts", {
        method: "POST",
        body: JSON.stringify(draft),
    });
    return res.json();
}`,
  `function formatBytes(bytes) {
    const units = ["B", "KB", "MB", "GB"];
    let i = 0;
    while (bytes >= 1024 && i < units.length - 1) {
        bytes /= 1024;
        i++;
    }
    return \`\${bytes.toFixed(1)} \${units[i]}\`;
}`,
  `export function clamp(value, min, max) {
    if (value < min) return min;
    if (value > max) return max;
    return value;
}`,
  `const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
        entry.target.classList.toggle("visible", entry.isIntersecting);
    }
});`,
  `element.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" || e.shiftKey) return;
    e.preventDefault();
    submitForm();
});`,
  `function* walk(node) {
    yield node;
    for (const child of node.children ?? []) {
        yield* walk(child);
    }
}`,
  `const byLanguage = new Map();
for (const score of scores) {
    const list = byLanguage.get(score.language) ?? [];
    list.push(score.wpm);
    byLanguage.set(score.language, list);
}`,
  `export async function loadAll(ids) {
    const results = await Promise.all(ids.map((id) => load(id)));
    return results.filter(Boolean);
}`,
  `function timeAgo(date) {
    const seconds = Math.floor((Date.now() - date) / 1000);
    if (seconds < 60) return "just now";
    if (seconds < 3600) return \`\${Math.floor(seconds / 60)}m ago\`;
    return \`\${Math.floor(seconds / 3600)}h ago\`;
}`,
])
