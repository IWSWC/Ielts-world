import { env } from "cloudflare:workers";

type RateLimitStatement = {
  bind(...values: unknown[]): RateLimitStatement;
  first<T>(): Promise<T | null>;
  run(): Promise<unknown>;
};
type RateLimitDatabase = { prepare(sql: string): RateLimitStatement };

export function requestFingerprint(request: Request): string {
  const ip = request.headers.get("cf-connecting-ip") || "local";
  const agent = request.headers.get("user-agent") || "unknown";
  return `${ip}:${agent.slice(0, 80)}`;
}

export async function allowRequest(
  bucket: string,
  limit: number,
  windowMs: number,
): Promise<boolean> {
  const database = (env as unknown as { DB?: RateLimitDatabase }).DB;
  if (!database) return process.env.NODE_ENV === "development";

  const now = Date.now();
  const existing = await database
    .prepare("SELECT count, reset_at FROM rate_limits WHERE bucket_key = ?")
    .bind(bucket)
    .first<{ count: number; reset_at: number }>();

  if (!existing || existing.reset_at <= now) {
    await database
      .prepare(
        "INSERT OR REPLACE INTO rate_limits (bucket_key, count, reset_at) VALUES (?, 1, ?)",
      )
      .bind(bucket, now + windowMs)
      .run();
    return true;
  }

  if (existing.count >= limit) return false;
  await database
    .prepare("UPDATE rate_limits SET count = count + 1 WHERE bucket_key = ?")
    .bind(bucket)
    .run();
  return true;
}
