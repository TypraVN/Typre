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
    return rows.filter((row) => !seen.has(row[key]) && seen.add(row[key]));
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
])
