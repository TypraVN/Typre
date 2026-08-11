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
  `const languages = [...new Set(rows.map((row) => row.language))];

languages.sort((a, b) => a.localeCompare(b));
console.log(languages.join(", "));`,
  `const total = items.reduce((sum, item) => sum + item.price, 0);
const average = items.length > 0 ? total / items.length : 0;

console.log(total.toFixed(2), average.toFixed(2));`,
  `const grouped = Object.groupBy(scores, (score) => score.language);

for (const [language, list] of Object.entries(grouped)) {
    console.log(language, list.length);
}`,
  `rows.sort((a, b) => {
    if (a.wpm !== b.wpm) return b.wpm - a.wpm;
    return a.user.localeCompare(b.user);
});`,
  `function connect({ host = "localhost", port = 5432, ssl = false }) {
    const suffix = ssl ? "?sslmode=require" : "";
    return host + ":" + port + suffix;
}`,
  `const config = { ...defaults, ...userConfig, updatedAt: Date.now() };
const { theme, timeLimit, ...rest } = config;

console.log(theme, timeLimit, Object.keys(rest).length);`,
  `const name = user?.profile?.displayName ?? "anonymous";
const first = user?.scores?.[0]?.wpm ?? 0;

element.textContent = name + " (" + first + " wpm)";`,
  `const rows = Array.from({ length: 5 }, (_, index) => ({
    rank: index + 1,
    wpm: 100 - index * 7,
}));`,
  `const tags = posts.flatMap((post) => post.tags);
const unique = tags.filter((tag, i) => tags.indexOf(tag) === i);

console.log(unique.length, "unique tags");`,
  `const allValid = scores.every((score) => score.wpm > 0);
const anyFast = scores.some((score) => score.wpm >= 100);

console.log({ allValid, anyFast });`,
  `const latest = runs.findLast((run) => run.language === "rust");
const index = runs.findLastIndex((run) => run.accuracy < 90);

console.log(latest?.wpm, index);`,
  `function parseJson(raw, fallback = null) {
    try {
        return JSON.parse(raw);
    } catch {
        return fallback;
    }
}`,
  `function remember(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function recall(key, fallback) {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
}`,
  `const res = await fetch("/api/scores", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
});`,
  `for await (const chunk of stream) {
    buffer += decoder.decode(chunk, { stream: true });
    render(buffer);
}`,
  `const winner = await Promise.race([
    fetch(url).then((res) => res.json()),
    sleep(5000).then(() => ({ error: "timeout" })),
]);`,
  `const sleep = (ms) => new Promise((done) => setTimeout(done, ms));

await sleep(250);
console.log("continued after a quarter second");`,
  `class Attempt {
    static fromRow(row) {
        return new Attempt(row.user, Number(row.wpm));
    }

    constructor(user, wpm) {
        this.user = user;
        this.wpm = wpm;
    }
}`,
  `const range = {
    from: 1,
    to: 5,
    *[Symbol.iterator]() {
        for (let i = this.from; i <= this.to; i++) yield i;
    },
};`,
  `const cache = new WeakMap();

function measure(element) {
    if (!cache.has(element)) {
        cache.set(element, element.getBoundingClientRect());
    }
    return cache.get(element);
}`,
  `const copy = structuredClone(state);
copy.history.push({ wpm: 84, at: new Date() });

console.log(state.history.length, copy.history.length);`,
  `const money = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
});

console.log(money.format(1650));`,
  `const when = new Date("2026-08-11T17:04:00Z");

console.log(
    when.toLocaleString("en-GB", { dateStyle: "medium" }),
);`,
  `const url = new URL("/api/leaderboard", location.origin);
url.searchParams.set("language", "rust");
url.searchParams.set("timeLimit", "60");

console.log(url.toString());`,
  `const masked = text.replace(/\\b\\d{4}\\b/g, (match) => {
    return "*".repeat(match.length);
});

console.log(masked);`,
  `for (const row of rows) {
    const name = row.user.padEnd(14, " ");
    const wpm = String(row.wpm).padStart(4, " ");
    console.log(name + wpm);
}`,
  `document.querySelectorAll("[data-row]").forEach((row) => {
    row.classList.toggle("hidden", row.dataset.language !== active);
    row.setAttribute("aria-hidden", String(row.hidden));
});`,
  `let frame;

function loop(now) {
    draw(now);
    frame = requestAnimationFrame(loop);
}

frame = requestAnimationFrame(loop);`,
])
