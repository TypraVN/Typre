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

export async function attempt<T>(
    fn: () => Promise<T>,
): Promise<Result<T>> {
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
  `type Action =
    | { type: "add"; text: string }
    | { type: "remove"; id: number }
    | { type: "clear" };

export function reducer(state: Todo[], action: Action): Todo[] {
    switch (action.type) {
        case "add":
            return [...state, { id: Date.now(), text: action.text }];
        case "remove":
            return state.filter((todo) => todo.id !== action.id);
        case "clear":
            return [];
    }
}`,
  `export class TtlCache<T> {
    private entries = new Map<string, { value: T; expires: number }>();

    constructor(private ttlMs = 60_000) {}

    set(key: string, value: T): void {
        const expires = Date.now() + this.ttlMs;
        this.entries.set(key, { value, expires });
    }

    get(key: string): T | undefined {
        const entry = this.entries.get(key);
        if (!entry || entry.expires < Date.now()) return undefined;
        return entry.value;
    }
}`,
  `export function isRecord(
    value: unknown,
): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

export function isStringArray(value: unknown): value is string[] {
    if (!Array.isArray(value)) return false;
    return value.every((v) => typeof v === "string");
}

export function assertNever(value: never): never {
    throw new Error("unexpected value: " + String(value));
}`,
  `type DeepReadonly<T> = {
    readonly [K in keyof T]: T[K] extends object
        ? DeepReadonly<T[K]>
        : T[K];
};

type Config = {
    port: number;
    db: { host: string; user: string };
};

export const config: DeepReadonly<Config> = {
    port: 5432,
    db: { host: "localhost", user: "admin" },
};`,
  `type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

type RequireKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

interface User {
    id: string;
    name: string;
    email?: string;
}

export type NewUser = Optional<User, "id">;
export type VerifiedUser = RequireKeys<User, "email">;`,
  `interface Rule {
    kind: "string" | "number";
    required?: boolean;
}

export function validate(
    input: Record<string, unknown>,
    schema: Record<string, Rule>,
): string[] {
    const errors: string[] = [];

    for (const [key, rule] of Object.entries(schema)) {
        const value = input[key];

        if (rule.required && value === undefined) {
            errors.push(key + " is required");
        } else if (value !== undefined && typeof value !== rule.kind) {
            errors.push(key + " must be a " + rule.kind);
        }
    }
    return errors;
}`,
  `export class ApiClient {
    constructor(
        private baseUrl: string,
        private token?: string,
    ) {}

    async get<T>(path: string): Promise<T> {
        const headers: Record<string, string> = {};
        if (this.token) headers.Authorization = "Bearer " + this.token;

        const res = await fetch(this.baseUrl + path, { headers });
        if (!res.ok) {
            throw new Error("GET " + path + " failed: " + res.status);
        }

        return (await res.json()) as T;
    }
}`,
  `type Outcome<T> =
    | { ok: true; value: T }
    | { ok: false; error: string };

export function mapOutcome<T, U>(
    outcome: Outcome<T>,
    fn: (value: T) => U,
): Outcome<U> {
    if (!outcome.ok) return outcome;
    return { ok: true, value: fn(outcome.value) };
}

export function unwrapOr<T>(outcome: Outcome<T>, fallback: T): T {
    return outcome.ok ? outcome.value : fallback;
}`,
  `export enum Level {
    Debug = 10,
    Info = 20,
    Warn = 30,
    Error = 40,
}

const COLORS: Record<Level, string> = {
    [Level.Debug]: "gray",
    [Level.Info]: "blue",
    [Level.Warn]: "orange",
    [Level.Error]: "red",
};

export function color(level: Level): string {
    return COLORS[level];
}`,
  `export function useLocalStorage<T>(key: string, initial: T) {
    const [value, setValue] = useState<T>(() => {
        const raw = localStorage.getItem(key);
        return raw === null ? initial : (JSON.parse(raw) as T);
    });

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(value));
    }, [key, value]);

    return [value, setValue] as const;
}`,
  `export function useFetch<T>(url: string) {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        fetch(url, { signal: controller.signal })
            .then((res) => res.json() as Promise<T>)
            .then(setData)
            .catch(setError);

        return () => controller.abort();
    }, [url]);

    return { data, error };
}`,
  `type Events = {
    login: { userId: string };
    logout: undefined;
};

export class Emitter {
    private handlers: {
        [K in keyof Events]?: ((payload: Events[K]) => void)[];
    } = {};

    on<K extends keyof Events>(
        event: K,
        handler: (payload: Events[K]) => void,
    ): void {
        (this.handlers[event] ??= []).push(handler);
    }
}`,
  `export function sortBy<T, K extends keyof T>(
    items: readonly T[],
    key: K,
    direction: "asc" | "desc" = "asc",
): T[] {
    const factor = direction === "asc" ? 1 : -1;

    return [...items].sort((a, b) => {
        if (a[key] === b[key]) return 0;
        return a[key] > b[key] ? factor : -factor;
    });
}`,
  `export class QueryBuilder {
    private parts: string[] = [];

    select(...columns: string[]): this {
        this.parts.push("select " + columns.join(", "));
        return this;
    }

    from(table: string): this {
        this.parts.push("from " + table);
        return this;
    }

    where(condition: string): this {
        this.parts.push("where " + condition);
        return this;
    }

    build(): string {
        return this.parts.join(" ") + ";";
    }
}`,
  `type Middleware = (
    ctx: Context,
    next: () => Promise<void>,
) => Promise<void>;

export function compose(middleware: Middleware[]) {
    return function run(ctx: Context): Promise<void> {
        let index = -1;

        function dispatch(i: number): Promise<void> {
            if (i <= index) throw new Error("next() called twice");
            index = i;

            const fn = middleware[i];
            if (!fn) return Promise.resolve();
            return fn(ctx, () => dispatch(i + 1));
        }

        return dispatch(0);
    };
}`,
  `type Method = "GET" | "POST" | "DELETE";
type Resource = "users" | "scores" | "profiles";

type Endpoint = \`\${Method} /\${Resource}\`;

const handlers: Partial<Record<Endpoint, () => void>> = {
    "GET /users": listUsers,
    "POST /scores": createScore,
};

export function handle(endpoint: Endpoint): void {
    const handler = handlers[endpoint];
    if (!handler) throw new Error("no handler: " + endpoint);
    handler();
}`,
  `type Unwrap<T> = T extends Promise<infer U> ? U : T;

type ElementOf<T> = T extends readonly (infer U)[] ? U : never;

async function loadScores(): Promise<Score[]> {
    const res = await fetch("/api/scores");
    return res.json() as Promise<Score[]>;
}

export type Scores = Unwrap<ReturnType<typeof loadScores>>;
export type OneScore = ElementOf<Scores>;`,
  `export function parseValue(input: string): string;
export function parseValue(input: string, asNumber: true): number;
export function parseValue(
    input: string,
    asNumber?: boolean,
): string | number {
    const trimmed = input.trim();
    if (!asNumber) return trimmed;

    const value = Number(trimmed);
    if (Number.isNaN(value)) {
        throw new Error("not a number: " + trimmed);
    }
    return value;
}`,
  `export abstract class Shape {
    abstract area(): number;

    describe(): string {
        return this.constructor.name + " " + this.area().toFixed(2);
    }
}

export class Circle extends Shape {
    constructor(private radius: number) {
        super();
    }

    area(): number {
        return Math.PI * this.radius ** 2;
    }
}`,
  `export function applyPatch<T extends object>(
    current: T,
    patch: Partial<T>,
): T {
    const next = { ...current };

    for (const key of Object.keys(patch) as (keyof T)[]) {
        const value = patch[key];
        if (value !== undefined) next[key] = value;
    }

    return next;
}`,
  `interface State {
    count: number;
    increase: (by?: number) => void;
    reset: () => void;
}

export const useCounter = create<State>((set) => ({
    count: 0,
    increase: (by = 1) => set((s) => ({ count: s.count + by })),
    reset: () => set({ count: 0 }),
}));`,
  `interface FormState {
    values: Record<string, string>;
    errors: Partial<Record<string, string>>;
    touched: Set<string>;
}

export function setField(
    state: FormState,
    name: string,
    value: string,
): FormState {
    return {
        values: { ...state.values, [name]: value },
        errors: { ...state.errors, [name]: undefined },
        touched: new Set(state.touched).add(name),
    };
}`,
  `interface Column<T> {
    key: keyof T & string;
    label: string;
    align?: "left" | "right";
}

const columns: Column<Score>[] = [
    { key: "name", label: "player" },
    { key: "wpm", label: "wpm", align: "right" },
    { key: "accuracy", label: "acc", align: "right" },
];

export function headers<T>(cols: Column<T>[]): string[] {
    return cols.map((col) => col.label);
}`,
  `export function debounce<A extends unknown[]>(
    fn: (...args: A) => void,
    wait = 300,
): (...args: A) => void {
    let timer: ReturnType<typeof setTimeout> | undefined;

    return (...args: A) => {
        if (timer !== undefined) clearTimeout(timer);
        timer = setTimeout(() => fn(...args), wait);
    };
}`,
  `export class Queue<T> {
    private items: T[] = [];

    enqueue(item: T): void {
        this.items.push(item);
    }

    dequeue(): T | undefined {
        return this.items.shift();
    }

    get size(): number {
        return this.items.length;
    }

    isEmpty(): boolean {
        return this.items.length === 0;
    }
}`,
  `type Listener<T> = (value: T) => void;

export class Observable<T> {
    private listeners = new Set<Listener<T>>();

    constructor(private value: T) {}

    subscribe(listener: Listener<T>): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    set(next: T): void {
        this.value = next;
        this.listeners.forEach((listener) => listener(next));
    }
}`,
  `export class HttpError extends Error {
    constructor(
        readonly status: number,
        readonly url: string,
    ) {
        super("HTTP " + status + " for " + url);
        this.name = "HttpError";
    }

    get isRetryable(): boolean {
        return this.status >= 500 || this.status === 429;
    }
}`,
  `interface Range {
    from: Date;
    to: Date;
}

export function days(range: Range): number {
    const ms = range.to.getTime() - range.from.getTime();
    return Math.round(ms / 86_400_000);
}

export function overlaps(a: Range, b: Range): boolean {
    return a.from <= b.to && b.from <= a.to;
}

export function clamp(date: Date, range: Range): Date {
    if (date < range.from) return range.from;
    return date > range.to ? range.to : date;
}`,
  `const formatters = new Map<string, Intl.NumberFormat>();

export function money(amount: number, currency = "USD"): string {
    let formatter = formatters.get(currency);

    if (!formatter) {
        formatter = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency,
        });
        formatters.set(currency, formatter);
    }

    return formatter.format(amount);
}`,
  `type Incoming =
    | { type: "score"; wpm: number }
    | { type: "ping" };

export function connect(
    url: string,
    onScore: (wpm: number) => void,
): () => void {
    const socket = new WebSocket(url);

    socket.addEventListener("message", (event) => {
        const message = JSON.parse(event.data as string) as Incoming;
        if (message.type === "score") onScore(message.wpm);
    });

    return () => socket.close();
}`,
  `const FLAGS = {
    leaderboard: true,
    friends: false,
    darkMode: true,
} as const;

export type Flag = keyof typeof FLAGS;

export function isEnabled(flag: Flag): boolean {
    const override = localStorage.getItem("flag:" + flag);
    if (override !== null) return override === "true";
    return FLAGS[flag];
}`,
  `const messages = {
    signIn: "Sign in",
    signOut: "Sign out",
    submitScore: "Submit to leaderboard",
} as const;

export type MessageKey = keyof typeof messages;

export function t(key: MessageKey, fallback = ""): string {
    return messages[key] ?? fallback;
}`,
  `interface TreeNode<T> {
    value: T;
    children: TreeNode<T>[];
}

export function flattenTree<T>(node: TreeNode<T>): T[] {
    return [
        node.value,
        ...node.children.flatMap((child) => flattenTree(child)),
    ];
}

export function depth<T>(node: TreeNode<T>): number {
    if (node.children.length === 0) return 1;
    return 1 + Math.max(...node.children.map(depth));
}`,
  `type ThemeName = "dark" | "light";

const themes = {
    dark: { bg: "#18181b", fg: "#fafafa" },
    light: { bg: "#ffffff", fg: "#18181b" },
} satisfies Record<ThemeName, { bg: string; fg: string }>;

export function resolve(name: ThemeName) {
    return themes[name];
}`,
  `export async function* pages<T>(
    load: (page: number) => Promise<T[]>,
): AsyncGenerator<T[]> {
    let page = 1;

    while (true) {
        const rows = await load(page);
        if (rows.length === 0) return;

        yield rows;
        page += 1;
    }
}`,
  `export const TIME_LIMITS = [15, 30, 60] as const;

export type TimeLimit = (typeof TIME_LIMITS)[number];

export function isTimeLimit(value: number): value is TimeLimit {
    return (TIME_LIMITS as readonly number[]).includes(value);
}

export function nextLimit(current: TimeLimit): TimeLimit {
    const index = TIME_LIMITS.indexOf(current);
    return TIME_LIMITS[(index + 1) % TIME_LIMITS.length];
}`,
  `export interface Store<T> {
    read(key: string): Promise<T | null>;
    write(key: string, value: T): Promise<void>;
}

export class MemoryStore<T> implements Store<T> {
    private map = new Map<string, T>();

    async read(key: string): Promise<T | null> {
        return this.map.get(key) ?? null;
    }

    async write(key: string, value: T): Promise<void> {
        this.map.set(key, value);
    }
}`,
  `interface Guest {
    kind: "guest";
}

interface Member {
    kind: "member";
    email: string;
}

type Visitor = Guest | Member;

export function canSubmit(visitor: Visitor): boolean {
    if ("email" in visitor) {
        return visitor.email.includes("@");
    }
    return false;
}`,
  `export function mapValues<T, U>(
    source: Record<string, T>,
    fn: (value: T, key: string) => U,
): Record<string, U> {
    const out: Record<string, U> = {};

    for (const [key, value] of Object.entries(source)) {
        out[key] = fn(value, key);
    }

    return out;
}`,
  `export class Attempt {
    #wpm = 0;

    get wpm(): number {
        return this.#wpm;
    }

    set wpm(value: number) {
        if (value < 0 || value > 300) {
            throw new RangeError("wpm out of range: " + value);
        }
        this.#wpm = Math.round(value);
    }
}`,
  `export async function settle<T>(
    tasks: Promise<T>[],
): Promise<{ values: T[]; errors: unknown[] }> {
    const results = await Promise.allSettled(tasks);

    return {
        values: results
            .filter((r) => r.status === "fulfilled")
            .map((r) => (r as PromiseFulfilledResult<T>).value),
        errors: results
            .filter((r) => r.status === "rejected")
            .map((r) => (r as PromiseRejectedResult).reason),
    };
}`,
  `export function expectEqual<T>(
    actual: T,
    expected: T,
    label = "",
): void {
    const same = JSON.stringify(actual) === JSON.stringify(expected);

    if (!same) {
        throw new Error(
            label + " expected " + JSON.stringify(expected),
        );
    }
}`,

  `export function createEmitter<E extends Record<string, unknown>>() {
    const listeners = new Map<keyof E, Set<(payload: never) => void>>();

    return {
        on<K extends keyof E>(event: K, fn: (payload: E[K]) => void) {
            const set = listeners.get(event) ?? new Set();
            set.add(fn as (payload: never) => void);
            listeners.set(event, set);
            return () => set.delete(fn as (payload: never) => void);
        },
        emit<K extends keyof E>(event: K, payload: E[K]) {
            listeners.get(event)?.forEach((fn) => (fn as (p: E[K]) => void)(payload));
        },
    };
}`,
  `type Validator<T> = (value: unknown) => value is T;

export function arrayOf<T>(check: Validator<T>): Validator<T[]> {
    return (value): value is T[] =>
        Array.isArray(value) && value.every(check);
}

export const isStringArray = arrayOf(
    (value): value is string => typeof value === "string",
);`,
  `export class Result<T, E = Error> {
    private constructor(
        private readonly value?: T,
        private readonly error?: E,
    ) {}

    static ok<T>(value: T) {
        return new Result<T, never>(value);
    }

    static fail<E>(error: E) {
        return new Result<never, E>(undefined, error);
    }

    unwrapOr(fallback: T): T {
        return this.error ? fallback : (this.value as T);
    }
}`,
  `interface Column<T> {
    key: keyof T;
    label: string;
    align?: "left" | "right";
}

export function renderHeader<T>(columns: Column<T>[]): string {
    return columns
        .map((column) => \`<th>\${column.label}</th>\`)
        .join("");
}`,
  `type Path<T> = T extends object
    ? { [K in keyof T & string]: K | \`\${K}.\${Path<T[K]>}\` }[keyof T & string]
    : never;

export function get(source: unknown, path: string): unknown {
    return path
        .split(".")
        .reduce<unknown>(
            (value, key) => (value as Record<string, unknown>)?.[key],
            source,
        );
}`,
  `export function useThrottled<T>(value: T, limit = 200): T {
    const [throttled, setThrottled] = useState(value);
    const last = useRef(Date.now());

    useEffect(() => {
        const wait = limit - (Date.now() - last.current);
        const id = setTimeout(() => {
            last.current = Date.now();
            setThrottled(value);
        }, Math.max(0, wait));

        return () => clearTimeout(id);
    }, [value, limit]);

    return throttled;
}`,
  `export class TypedStorage<T extends Record<string, unknown>> {
    constructor(private readonly prefix: string) {}

    read<K extends keyof T & string>(key: K): T[K] | null {
        const raw = localStorage.getItem(this.prefix + key);
        if (raw === null) return null;

        try {
            return JSON.parse(raw) as T[K];
        } catch {
            return null;
        }
    }

    write<K extends keyof T & string>(key: K, value: T[K]): void {
        localStorage.setItem(this.prefix + key, JSON.stringify(value));
    }
}`,
  `type Reducer<S, A> = (state: S, action: A) => S;

export function createStore<S, A>(reduce: Reducer<S, A>, initial: S) {
    let state = initial;
    const listeners = new Set<(state: S) => void>();

    return {
        getState: () => state,
        dispatch(action: A) {
            state = reduce(state, action);
            listeners.forEach((listener) => listener(state));
        },
        subscribe(listener: (state: S) => void) {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
    };
}`,
  `export interface Paginated<T> {
    items: T[];
    total: number;
    page: number;
}

export async function fetchPage<T>(
    url: string,
    page: number,
): Promise<Paginated<T>> {
    const target = new URL(url, location.origin);
    target.searchParams.set("page", String(page));

    const res = await fetch(target);
    if (!res.ok) throw new Error(\`HTTP \${res.status}\`);

    return (await res.json()) as Paginated<T>;
}`,
  `type Branded<T, B extends string> = T & { readonly __brand: B };

export type UserId = Branded<string, "UserId">;
export type RunId = Branded<string, "RunId">;

export function toUserId(raw: string): UserId {
    if (raw.length !== 36) throw new Error("not a uuid");
    return raw as UserId;
}

export function findRun(runs: Map<RunId, Run>, id: RunId): Run | undefined {
    return runs.get(id);
}`,
])
