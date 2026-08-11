import { defineSnippets } from '../define'

/** Bài TRUNG BÌNH cho mốc 30s — xem chú thích trong `medium/javascript.ts`. */
export const typescriptMedium = defineSnippets('typescript', 'ts-med', [
  `export function isDefined<T>(value: T | null | undefined): value is T {
    return value !== null && value !== undefined;
}`,
  `interface Score {
    user: string;
    wpm: number;
    accuracy: number;
    language: SnippetLanguage;
}`,
  `export async function getJson<T>(url: string): Promise<T> {
    const res = await fetch(url);
    if (!res.ok) throw new Error(res.statusText);
    return (await res.json()) as T;
}`,
  `const [state, setState] = useState<Status>("idle");

useEffect(() => {
    setState("loading");
    load().then(() => setState("ready"));
}, []);`,
  `type Handler<T> = (payload: T) => void | Promise<void>;

export function once<T>(handler: Handler<T>): Handler<T> {
    let called = false;
    return (payload) => {
        if (called) return;
        called = true;
        return handler(payload);
    };
}`,
  `export const DEFAULTS = {
    timeLimit: 30,
    language: "javascript",
    sound: false,
} as const satisfies Partial<Preferences>;`,
  `function assertNever(value: never): never {
    throw new Error(\`unexpected variant: \${JSON.stringify(value)}\`);
}`,
  `export class Cache<T> {
    private entries = new Map<string, T>();

    getOrSet(key: string, create: () => T): T {
        const hit = this.entries.get(key);
        if (hit) return hit;
        const value = create();
        this.entries.set(key, value);
        return value;
    }
}`,
  `const byId: Record<string, User> = Object.fromEntries(
    users.map((user) => [user.id, user]),
);`,
  `export function sortBy<T>(items: T[], key: keyof T): T[] {
    return [...items].sort((a, b) => (a[key] > b[key] ? 1 : -1));
}`,
])
