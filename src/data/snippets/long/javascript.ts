import { defineSnippets } from '../define'

/**
 * Bài DÀI cho mốc 60s — mỗi bài ~10-14 dòng, đủ để gõ gần hết một phút ở tốc độ
 * 40-60 wpm. Dòng vẫn giữ dưới ~70 ký tự để không bị xuống dòng ở màn thường.
 */
export const javascriptLong = defineSnippets('javascript', 'js-long', [
  `function groupBy(items, keyFn) {
    const result = new Map();
    for (const item of items) {
        const key = keyFn(item);
        if (!result.has(key)) {
            result.set(key, []);
        }
        result.get(key).push(item);
    }
    return result;
}`,
  `async function fetchWithRetry(url, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(res.statusText);
            return await res.json();
        } catch (err) {
            if (attempt === retries) throw err;
            await sleep(attempt * 200);
        }
    }
}`,
  `class EventBus {
    #handlers = new Map();

    on(event, handler) {
        const list = this.#handlers.get(event) ?? [];
        list.push(handler);
        this.#handlers.set(event, list);
        return () => this.off(event, handler);
    }

    emit(event, payload) {
        for (const handler of this.#handlers.get(event) ?? []) {
            handler(payload);
        }
    }
}`,
  `function debounce(fn, wait) {
    let timer;
    return function debounced(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => {
            timer = undefined;
            fn.apply(this, args);
        }, wait);
    };
}`,
  `export function createStore(reducer, initialState) {
    let state = initialState;
    const listeners = new Set();

    return {
        getState: () => state,
        dispatch(action) {
            state = reducer(state, action);
            listeners.forEach((fn) => fn(state));
        },
        subscribe(fn) {
            listeners.add(fn);
            return () => listeners.delete(fn);
        },
    };
}`,
  `function paginate(items, page, perPage) {
    const total = items.length;
    const pages = Math.ceil(total / perPage);
    const current = Math.min(Math.max(page, 1), pages || 1);
    const start = (current - 1) * perPage;

    return {
        rows: items.slice(start, start + perPage),
        page: current,
        pages,
        total,
    };
}`,
  `const slugify = (title) =>
    title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\\u0300-\\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

const unique = (rows, key) => {
    const seen = new Set();
    return rows.filter(
        (row) => !seen.has(row[key]) && seen.add(row[key]),
    );
};`,
  `document.querySelector("#search").addEventListener("input", (e) => {
    const term = e.target.value.trim().toLowerCase();
    const rows = document.querySelectorAll("[data-row]");

    for (const row of rows) {
        const text = row.textContent.toLowerCase();
        row.hidden = term.length > 0 && !text.includes(term);
    }

    counter.textContent = \`\${visibleCount(rows)} of \${rows.length}\`;
});`,
  `function throttle(fn, limit) {
    let waiting = false;

    return function throttled(...args) {
        if (waiting) return;
        fn.apply(this, args);
        waiting = true;

        setTimeout(() => {
            waiting = false;
        }, limit);
    };
}`,
  `function memoize(fn) {
    const cache = new Map();

    return function memoized(...args) {
        const key = JSON.stringify(args);
        if (cache.has(key)) {
            return cache.get(key);
        }
        const value = fn.apply(this, args);
        cache.set(key, value);
        return value;
    };
}`,
  `class LruCache {
    constructor(limit = 10) {
        this.limit = limit;
        this.map = new Map();
    }

    get(key) {
        if (!this.map.has(key)) return undefined;
        const value = this.map.get(key);
        this.map.delete(key);
        this.map.set(key, value);
        return value;
    }
}`,
  `function chunk(items, size) {
    const out = [];
    for (let i = 0; i < items.length; i += size) {
        out.push(items.slice(i, i + size));
    }
    return out;
}

function flatten(items) {
    return items.reduce(
        (acc, item) =>
            acc.concat(Array.isArray(item) ? flatten(item) : item),
        [],
    );
}`,
  `async function mapLimit(items, limit, worker) {
    const results = [];
    let index = 0;

    async function run() {
        while (index < items.length) {
            const current = index;
            index += 1;
            results[current] = await worker(items[current]);
        }
    }

    await Promise.all(Array.from({ length: limit }, run));
    return results;
}`,
  `async function fetchJson(url, timeoutMs = 5000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) {
            throw new Error("HTTP " + res.status);
        }
        return await res.json();
    } finally {
        clearTimeout(timer);
    }
}`,
  `const storage = {
    read(key, fallback = null) {
        try {
            const raw = localStorage.getItem(key);
            return raw === null ? fallback : JSON.parse(raw);
        } catch {
            return fallback;
        }
    },
    write(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    },
};`,
  `function binarySearch(sorted, target) {
    let low = 0;
    let high = sorted.length - 1;

    while (low <= high) {
        const mid = (low + high) >> 1;
        if (sorted[mid] === target) return mid;

        if (sorted[mid] < target) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }
    return -1;
}`,
  `function quickSort(items) {
    if (items.length <= 1) return items;

    const [pivot, ...rest] = items;
    const left = rest.filter((n) => n < pivot);
    const right = rest.filter((n) => n >= pivot);

    return [...quickSort(left), pivot, ...quickSort(right)];
}

function mergeSorted(a, b) {
    const out = [];
    while (a.length && b.length) {
        out.push(a[0] <= b[0] ? a.shift() : b.shift());
    }
    return out.concat(a, b);
}`,
  `function deepEqual(a, b) {
    if (a === b) return true;
    if (typeof a !== "object" || typeof b !== "object") return false;
    if (a === null || b === null) return false;

    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;

    return keysA.every((key) => deepEqual(a[key], b[key]));
}`,
  `function deepMerge(target, source) {
    const out = { ...target };

    for (const [key, value] of Object.entries(source)) {
        const isPlain =
            value !== null &&
            typeof value === "object" &&
            !Array.isArray(value);

        if (isPlain && typeof out[key] === "object") {
            out[key] = deepMerge(out[key], value);
        } else {
            out[key] = value;
        }
    }
    return out;
}`,
  `function pick(source, keys) {
    const out = {};
    for (const key of keys) {
        if (key in source) out[key] = source[key];
    }
    return out;
}

function omit(source, keys) {
    const blocked = new Set(keys);
    return Object.fromEntries(
        Object.entries(source).filter(([key]) => !blocked.has(key)),
    );
}`,
  `function flattenObject(source, prefix = "") {
    const out = {};

    for (const [key, value] of Object.entries(source)) {
        const path = prefix ? prefix + "." + key : key;

        if (value !== null && typeof value === "object") {
            Object.assign(out, flattenObject(value, path));
        } else {
            out[path] = value;
        }
    }
    return out;
}`,
  `function parseQuery(search) {
    const params = new URLSearchParams(search);
    const out = {};
    for (const [key, value] of params) {
        out[key] = value;
    }
    return out;
}

function buildQuery(values) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(values)) {
        if (value !== undefined) params.set(key, String(value));
    }
    return params.toString();
}`,
  `function relativeTime(date) {
    const seconds = Math.round((Date.now() - date.getTime()) / 1000);
    const steps = [
        [60, "second", 1],
        [3600, "minute", 60],
        [86400, "hour", 3600],
    ];

    for (const [limit, unit, divisor] of steps) {
        if (seconds < limit) {
            const value = Math.floor(seconds / divisor);
            const suffix = value === 1 ? " ago" : "s ago";
            return value + " " + unit + suffix;
        }
    }
    return date.toLocaleDateString();
}`,
  `function formatBytes(bytes, decimals = 1) {
    if (bytes === 0) return "0 B";

    const units = ["B", "KB", "MB", "GB", "TB"];
    const power = Math.floor(Math.log(bytes) / Math.log(1024));
    const index = Math.min(power, units.length - 1);
    const value = bytes / Math.pow(1024, index);

    const digits = index === 0 ? 0 : decimals;
    return value.toFixed(digits) + " " + units[index];
}`,
  `class Stack {
    #items = [];

    push(item) {
        this.#items.push(item);
        return this;
    }

    pop() {
        return this.#items.pop();
    }

    get size() {
        return this.#items.length;
    }
}`,
  `class LinkedList {
    constructor() {
        this.head = null;
        this.length = 0;
    }

    push(value) {
        const node = { value, next: null };
        if (!this.head) {
            this.head = node;
        } else {
            let current = this.head;
            while (current.next) current = current.next;
            current.next = node;
        }
        this.length += 1;
    }
}`,
  `function depthFirst(node, visit) {
    visit(node);
    for (const child of node.children ?? []) {
        depthFirst(child, visit);
    }
}

function breadthFirst(root, visit) {
    const queue = [root];
    while (queue.length > 0) {
        const node = queue.shift();
        visit(node);
        queue.push(...(node.children ?? []));
    }
}`,
  `function wordFrequency(text) {
    const words = text.toLowerCase().match(/[a-z']+/g) ?? [];
    const counts = new Map();

    for (const word of words) {
        counts.set(word, (counts.get(word) ?? 0) + 1);
    }

    return [...counts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
}`,
  `function countBy(items, keyFn) {
    return items.reduce((acc, item) => {
        const key = keyFn(item);
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
    }, {});
}

function sumBy(items, valueFn) {
    return items.reduce((total, item) => total + valueFn(item), 0);
}

function average(items, valueFn) {
    if (items.length === 0) return 0;
    return sumBy(items, valueFn) / items.length;
}`,
  `function shuffle(list) {
    const out = [...list];
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
}

function sample(list, count = 1) {
    return shuffle(list).slice(0, Math.min(count, list.length));
}`,
  `function romanToInt(roman) {
    const values = {
        I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000,
    };
    let total = 0;

    for (let i = 0; i < roman.length; i++) {
        const current = values[roman[i]];
        const next = values[roman[i + 1]] ?? 0;
        total += current < next ? -current : current;
    }
    return total;
}`,
  `function toRoman(number) {
    const table = [
        [1000, "M"],
        [500, "D"],
        [100, "C"],
        [50, "L"],
        [10, "X"],
        [1, "I"],
    ];

    let out = "";
    for (const [value, letters] of table) {
        while (number >= value) {
            out += letters;
            number -= value;
        }
    }
    return out;
}`,
  `function isPalindrome(text) {
    const clean = text.toLowerCase().replace(/[^a-z0-9]/g, "");
    return clean === [...clean].reverse().join("");
}

function reverseWords(sentence) {
    return sentence
        .trim()
        .split(/\\s+/)
        .reverse()
        .join(" ");
}`,
  `class Countdown {
    constructor(seconds, onTick) {
        this.remaining = seconds;
        this.onTick = onTick;
        this.timer = null;
    }

    start() {
        this.timer = setInterval(() => {
            this.remaining -= 1;
            this.onTick(this.remaining);
            if (this.remaining <= 0) this.stop();
        }, 1000);
    }

    stop() {
        clearInterval(this.timer);
    }
}`,
  `function randomId(length = 8) {
    const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
    let out = "";

    for (let i = 0; i < length; i++) {
        out += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    return out;
}

function uniqueId(prefix = "id") {
    return prefix + "-" + Date.now().toString(36) + randomId(4);
}`,
  `function passwordStrength(password) {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    const labels = ["weak", "fair", "good", "strong", "excellent"];
    return { score, label: labels[Math.max(score - 1, 0)] };
}`,
  `function validateForm(values) {
    const errors = {};

    if (!values.name || values.name.trim().length < 2) {
        errors.name = "Name is too short";
    }
    if (!/^[^@\\s]+@[^@\\s]+\\.[a-z]{2,}$/i.test(values.email ?? "")) {
        errors.email = "Email is not valid";
    }
    if ((values.password ?? "").length < 8) {
        errors.password = "Password needs 8 characters";
    }

    return { errors, valid: Object.keys(errors).length === 0 };
}`,
  `function parseCsv(text) {
    const [headerLine, ...lines] = text.trim().split("\\n");
    const headers = headerLine.split(",").map((h) => h.trim());

    return lines.map((line) => {
        const cells = line.split(",");
        return headers.reduce((row, header, i) => {
            row[header] = (cells[i] ?? "").trim();
            return row;
        }, {});
    });
}`,
  `function toCsv(rows) {
    if (rows.length === 0) return "";

    const headers = Object.keys(rows[0]);
    const escape = (value) => {
        const text = String(value ?? "");
        return text.includes(",") ? '"' + text + '"' : text;
    };

    const body = rows.map((row) =>
        headers.map((header) => escape(row[header])).join(","),
    );

    return [headers.join(","), ...body].join("\\n");
}`,
  `function diff(before, after, key = "id") {
    const beforeMap = new Map(before.map((row) => [row[key], row]));
    const afterMap = new Map(after.map((row) => [row[key], row]));

    return {
        added: after.filter((row) => !beforeMap.has(row[key])),
        removed: before.filter((row) => !afterMap.has(row[key])),
        kept: after.filter((row) => beforeMap.has(row[key])),
    };
}`,
  `async function copyToClipboard(text) {
    if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        return true;
    }

    const area = document.createElement("textarea");
    area.value = text;
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
}`,
  `function lazyLoadImages() {
    const images = document.querySelectorAll("img[data-src]");

    const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const img = entry.target;
            img.src = img.dataset.src;
            observer.unobserve(img);
        }
    });

    images.forEach((img) => observer.observe(img));
}`,
  `const routes = new Map();

function route(path, render) {
    routes.set(path, render);
}

function renderRoute() {
    const path = location.hash.slice(1) || "/";
    const render = routes.get(path) ?? routes.get("/404");
    document.querySelector("#app").innerHTML = render();
}

window.addEventListener("hashchange", renderRoute);
window.addEventListener("load", renderRoute);`,
  `document.querySelector("#list").addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const { action, id } = button.dataset;

    if (action === "remove") {
        button.closest("li").remove();
    } else if (action === "edit") {
        openEditor(Number(id));
    }
});`,
  `const bar = document.querySelector("#progress");

function updateProgress() {
    const scrolled = window.scrollY;
    const height = document.body.scrollHeight - window.innerHeight;
    const percent = height > 0 ? (scrolled / height) * 100 : 0;
    bar.style.width = percent.toFixed(1) + "%";
}

window.addEventListener("scroll", updateProgress, { passive: true });
window.addEventListener("resize", updateProgress);`,
  `function transpose(matrix) {
    return matrix[0].map((_, column) =>
        matrix.map((row) => row[column]),
    );
}

function rotateRight(matrix) {
    return transpose(matrix).map((row) => row.reverse());
}

function printMatrix(matrix) {
    for (const row of matrix) {
        console.log(row.join(" "));
    }
}`,
  `function multiply(a, b) {
    const rows = a.length;
    const cols = b[0].length;
    const shared = b.length;
    const out = [];

    for (let i = 0; i < rows; i++) {
        out[i] = [];
        for (let j = 0; j < cols; j++) {
            let sum = 0;
            for (let k = 0; k < shared; k++) {
                sum += a[i][k] * b[k][j];
            }
            out[i][j] = sum;
        }
    }
    return out;
}`,
  `function primesUpTo(limit) {
    const sieve = new Array(limit + 1).fill(true);
    sieve[0] = false;
    sieve[1] = false;

    for (let n = 2; n * n <= limit; n++) {
        if (!sieve[n]) continue;
        for (let multiple = n * n; multiple <= limit; multiple += n) {
            sieve[multiple] = false;
        }
    }

    return sieve.reduce((out, isPrime, n) => {
        if (isPrime) out.push(n);
        return out;
    }, []);
}`,
  `function gcd(a, b) {
    while (b !== 0) {
        [a, b] = [b, a % b];
    }
    return Math.abs(a);
}

function lcm(a, b) {
    return Math.abs(a * b) / gcd(a, b);
}

function reduceFraction(numerator, denominator) {
    const divisor = gcd(numerator, denominator);
    return [numerator / divisor, denominator / divisor];
}`,
  `let controller = null;

async function search(term) {
    controller?.abort();
    controller = new AbortController();

    try {
        const url = "/api/search?q=" + encodeURIComponent(term);
        const res = await fetch(url, {
            signal: controller.signal,
        });
        renderResults(await res.json());
    } catch (error) {
        if (error.name !== "AbortError") showError(error);
    }
}`,
])
