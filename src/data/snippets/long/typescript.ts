import { defineSnippets } from '../define'

/** Bài DÀI cho mốc 60s — xem chú thích trong `long/javascript.ts`. */
export const typescriptLong = defineSnippets('typescript', 'ts-long', [
  `interface Snippet {
    id: string;
    language: SnippetLanguage;
    code: string;
}

export function pickRandom<T extends { id: string }>(
    items: T[],
    excludeId?: string,
): T {
    const pool = items.filter((item) => item.id !== excludeId);
    return pool[Math.floor(Math.random() * pool.length)];
}`,
  `type Result<T, E = Error> =
    | { ok: true; value: T }
    | { ok: false; error: E };

export async function attempt<T>(fn: () => Promise<T>): Promise<Result<T>> {
    try {
        return { ok: true, value: await fn() };
    } catch (error) {
        return { ok: false, error: error as Error };
    }
}`,
  `export function useDebounced<T>(value: T, delay = 300): T {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debounced;
}`,
  `export class Repository<T extends { id: string }> {
    private items = new Map<string, T>();

    add(item: T): void {
        this.items.set(item.id, item);
    }

    find(id: string): T | undefined {
        return this.items.get(id);
    }

    all(): T[] {
        return [...this.items.values()];
    }
}`,
  `type Status = "idle" | "loading" | "ready" | "error";

export function statusLabel(status: Status): string {
    switch (status) {
        case "idle":
            return "waiting";
        case "loading":
            return "loading...";
        case "ready":
            return "done";
        default:
            return "something broke";
    }
}`,
  `export interface Props {
    title: string;
    items: readonly string[];
    onSelect?: (value: string) => void;
}

export function List({ title, items, onSelect }: Props) {
    return (
        <section>
            <h2>{title}</h2>
            {items.map((item) => (
                <button key={item} onClick={() => onSelect?.(item)}>
                    {item}
                </button>
            ))}
        </section>
    );
}`,
  `export function groupBy<T, K extends string>(
    items: readonly T[],
    keyFn: (item: T) => K,
): Record<K, T[]> {
    const out = {} as Record<K, T[]>;

    for (const item of items) {
        const key = keyFn(item);
        (out[key] ??= []).push(item);
    }

    return out;
}`,
  `export async function loadUsers(page = 1): Promise<User[]> {
    const params = new URLSearchParams({ page: String(page) });
    const res = await fetch(\`/api/users?\${params}\`);

    if (!res.ok) {
        throw new Error(\`users failed: \${res.status}\`);
    }

    const body = (await res.json()) as { data: User[] };
    return body.data;
}`,
])
