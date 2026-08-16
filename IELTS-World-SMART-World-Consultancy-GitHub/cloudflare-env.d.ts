declare module "cloudflare:workers" { export const env: Record<string, unknown>; }
interface Fetcher { fetch(request: Request): Promise<Response>; }
interface D1Database { prepare(query: string): unknown; }
interface R2Bucket { put(key: string, value: ArrayBuffer | ReadableStream, options?: unknown): Promise<unknown>; get(key: string): Promise<unknown>; }
