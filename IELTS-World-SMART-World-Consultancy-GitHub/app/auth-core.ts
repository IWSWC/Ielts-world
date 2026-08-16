import { env } from "cloudflare:workers";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ensureSchema } from "../db";

export type AuthUser = {
  userId: string;
  displayName: string;
  email: string;
  fullName: string | null;
};

type Statement = {
  bind(...values: unknown[]): Statement;
  first<T>(): Promise<T | null>;
  run(): Promise<unknown>;
};
type Database = { prepare(sql: string): Statement };
type AuthEnvironment = { DB?: Database; AUTH_SECRET?: string };

const SESSION_COOKIE = "iw_session";
const SESSION_SECONDS = 7 * 24 * 60 * 60;

export function authDatabase(): Database {
  const database = (env as unknown as AuthEnvironment).DB;
  if (!database) throw new Error("Authentication database is unavailable");
  return database;
}

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase().slice(0, 254);
}

export function validEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function passwordProblem(password: string): string | null {
  if (password.length < 10) return "Password must be at least 10 characters.";
  if (password.length > 128) return "Password is too long.";
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
    return "Use uppercase, lowercase and at least one number.";
  }
  return null;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

export async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return bytesToBase64(new Uint8Array(digest));
}

export async function hashPassword(password: string): Promise<{ hash: string; salt: string }> {
  const saltBytes = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: saltBytes, iterations: 210_000, hash: "SHA-256" },
    key,
    256,
  );
  return { hash: bytesToBase64(new Uint8Array(bits)), salt: bytesToBase64(saltBytes) };
}

export async function verifyPassword(password: string, salt: string, expectedHash: string): Promise<boolean> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: base64ToBytes(salt).buffer as ArrayBuffer, iterations: 210_000, hash: "SHA-256" },
    key,
    256,
  );
  const actual = new Uint8Array(bits);
  const expected = base64ToBytes(expectedHash);
  if (actual.length !== expected.length) return false;
  let difference = 0;
  for (let index = 0; index < actual.length; index += 1) difference |= actual[index] ^ expected[index];
  return difference === 0;
}

export function randomToken(bytes = 32): string {
  return bytesToBase64(crypto.getRandomValues(new Uint8Array(bytes)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function readCookie(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}

export function sessionTokenFromRequest(request: Request): string | null {
  return readCookie(request.headers.get("cookie"), SESSION_COOKIE);
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const requestHeaders = await headers();
  const token = readCookie(requestHeaders.get("cookie"), SESSION_COOKIE);
  if (!token) return null;
  try {
    await ensureSchema();
    const row = await authDatabase()
      .prepare(`SELECT u.id, u.email, u.name FROM auth_sessions s JOIN auth_users u ON u.id = s.user_id WHERE s.token_hash = ? AND s.expires_at > ? AND u.email_verified = 1 LIMIT 1`)
      .bind(await sha256(token), Date.now())
      .first<{ id: string; email: string; name: string }>();
    return row ? { userId: row.id, email: row.email, displayName: row.name || row.email, fullName: row.name || null } : null;
  } catch {
    return null;
  }
}

export async function requireAuthUser(returnTo: string): Promise<AuthUser> {
  const user = await getAuthUser();
  if (user) return user;
  redirect(authSignInPath(returnTo));
}

export function safeRelativeReturnPath(value: string | null | undefined, fallback = "/portal"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return fallback;
  try {
    const url = new URL(value, "https://app.local");
    if (url.origin !== "https://app.local" || url.pathname.startsWith("/api/auth")) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}

export function authSignInPath(returnTo: string): string {
  return `/auth?return_to=${encodeURIComponent(safeRelativeReturnPath(returnTo))}`;
}

export function authSignOutPath(returnTo = "/"): string {
  return `/api/auth/logout?return_to=${encodeURIComponent(safeRelativeReturnPath(returnTo, "/"))}`;
}

function sessionCookie(token: string, request: Request, maxAge: number): string {
  const secure = new URL(request.url).protocol === "https:" || process.env.NODE_ENV === "production";
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure ? "; Secure" : ""}`;
}

export async function attachSession(response: Response, request: Request, userId: string, remember = false): Promise<Response> {
  await ensureSchema();
  const token = randomToken();
  const maxAge = remember ? 30 * 24 * 60 * 60 : SESSION_SECONDS;
  await authDatabase()
    .prepare("INSERT INTO auth_sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)")
    .bind(await sha256(token), userId, Date.now() + maxAge * 1000)
    .run();
  const responseHeaders = new Headers(response.headers);
  responseHeaders.append("set-cookie", sessionCookie(token, request, maxAge));
  responseHeaders.set("cache-control", "no-store");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers: responseHeaders });
}

export async function clearSession(response: Response, request: Request): Promise<Response> {
  const token = sessionTokenFromRequest(request);
  if (token) {
    try {
      await ensureSchema();
      await authDatabase().prepare("DELETE FROM auth_sessions WHERE token_hash = ?").bind(await sha256(token)).run();
    } catch {
      // The cookie must still be cleared when the database is temporarily unavailable.
    }
  }
  const responseHeaders = new Headers(response.headers);
  responseHeaders.append("set-cookie", sessionCookie("", request, 0));
  responseHeaders.set("cache-control", "no-store");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers: responseHeaders });
}

export function authSecret(): string {
  const secret = (env as unknown as AuthEnvironment).AUTH_SECRET?.trim();
  if (secret) return secret;
  if (process.env.NODE_ENV === "development") return "local-development-auth-secret-change-before-deploy";
  throw new Error("AUTH_SECRET is not configured");
}
