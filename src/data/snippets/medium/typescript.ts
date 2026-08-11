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
  `type Draft = Partial<Score>;
type Complete = Required<Draft>;

export function applyDraft(base: Score, draft: Draft): Complete {
    return { ...base, ...draft };
}`,
  `type PublicUser = Omit<User, "email" | "passwordHash">;
type Credentials = Pick<User, "email" | "passwordHash">;

export function toPublic(user: User): PublicUser {
    const { email, passwordHash, ...rest } = user;
    return rest;
}`,
  `export const LANGUAGES = ["javascript", "rust", "sql"] as const;

export type Language = (typeof LANGUAGES)[number];

export function isLanguage(value: string): value is Language {
    return (LANGUAGES as readonly string[]).includes(value);
}`,
  `const THEMES = {
    dark: "#18181b",
    light: "#ffffff",
};

export type ThemeName = keyof typeof THEMES;
export const bg = (name: ThemeName): string => THEMES[name];`,
  `export interface Page<T = unknown> {
    rows: T[];
    total: number;
    hasMore: boolean;
}

export const empty: Page = { rows: [], total: 0, hasMore: false };`,
  `async function loadScores() {
    return [{ wpm: 84, language: "rust" }];
}

export type Scores = Awaited<ReturnType<typeof loadScores>>;
export type OneScore = Scores[number];`,
  `function submit(user: string, wpm: number, language: string) {
    return { user, wpm, language };
}

export type SubmitArgs = Parameters<typeof submit>;
export const retry = (args: SubmitArgs) => submit(...args);`,
  `type MaybeScore = Score | null | undefined;

export function force(value: MaybeScore): NonNullable<MaybeScore> {
    if (value == null) throw new Error("score is missing");
    return value;
}`,
  `type Event = "start" | "finish" | "error" | "abort";

type Ended = Exclude<Event, "start">;
type Bad = Extract<Event, "error" | "abort">;

export const isBad = (event: Event): event is Bad =>
    event === "error" || event === "abort";`,
  `type Getters<T> = {
    [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K];
};

export type ScoreGetters = Getters<{ wpm: number; user: string }>;`,
  `type Outcome =
    | { ok: true; wpm: number }
    | { ok: false; reason: string };

export function describe(outcome: Outcome): string {
    return outcome.ok ? "got " + outcome.wpm : outcome.reason;
}`,
  `export abstract class Exporter {
    abstract dump(rows: Score[]): string;

    save(path: string, rows: Score[]): void {
        writeFileSync(path, this.dump(rows), "utf8");
    }
}`,
  `interface Clock {
    now(): number;
}

export class FakeClock implements Clock {
    constructor(private value = 0) {}

    now(): number {
        return this.value;
    }
}`,
  `export class Repo {
    constructor(
        private readonly db: Database,
        private readonly table = "scores",
    ) {}

    count(): Promise<number> {
        return this.db.count(this.table);
    }
}`,
  `export function byId<T extends { id: string }>(items: T[]) {
    return new Map(items.map((item) => [item.id, item]));
}

export const first = <T,>(items: T[]): T | undefined => items[0];`,
  `function isScore(value: unknown): value is Score {
    return (
        typeof value === "object" && value !== null && "wpm" in value
    );
}

export const onlyScores = (rows: unknown[]): Score[] =>
    rows.filter(isScore);`,
  `export function toMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    if (typeof error === "string") return error;
    return JSON.stringify(error);
}`,
  `declare global {
    interface Window {
        __TYPRE_DEBUG__?: boolean;
    }
}

export const debugOn = () => window.__TYPRE_DEBUG__ === true;`,
  `interface ButtonProps
    extends React.ComponentPropsWithoutRef<"button"> {
    variant?: "primary" | "ghost";
}

export function Button({ variant = "primary", ...rest }: ButtonProps) {
    return <button data-variant={variant} {...rest} />;
}`,
  `const inputRef = useRef<HTMLInputElement>(null);
const timerRef = useRef<ReturnType<typeof setTimeout>>();

useEffect(() => {
    inputRef.current?.focus();
}, []);`,
  `const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") restart();
    if (event.key === "Tab" && sessionOver) event.preventDefault();
};`,
  `interface Counts {
    [language: string]: number;
}

export function bump(counts: Counts, key: string): void {
    counts[key] = (counts[key] ?? 0) + 1;
}`,
  `const routes = {
    home: "/",
    board: "/leaderboard",
} satisfies Record<string, \`/\${string}\`>;

export type RouteKey = keyof typeof routes;`,
  `export function head(input: string): string;
export function head<T>(input: T[]): T | undefined;
export function head(input: string | unknown[]) {
    return input[0];
}`,
  `export function withTimeout<T>(
    task: Promise<T>,
    ms: number,
): Promise<T> {
    return Promise.race([task, rejectAfter<T>(ms)]);
}`,
  `export enum Bucket {
    Short = "short",
    Medium = "medium",
    Long = "long",
}

export const MAX_CHARS: Record<Bucket, number> = {
    [Bucket.Short]: 70,
    [Bucket.Medium]: 200,
    [Bucket.Long]: 600,
};`,
  `export type Atom<T> = {
    get(): T;
    set(next: T): void;
};

export function atom<T>(initial: T): Atom<T> {
    let value = initial;
    return { get: () => value, set: (next) => void (value = next) };
}`,
  `type Shape = Record<string, "string" | "number">;

export function check(input: unknown, shape: Shape): boolean {
    if (typeof input !== "object" || input === null) return false;

    return Object.entries(shape).every(
        ([key, kind]) => typeof (input as never)[key] === kind,
    );
}`,
])
