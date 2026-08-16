import { env } from "cloudflare:workers";
import { authDatabase, authSecret, normalizeEmail, sha256 } from "./auth-core";
import { ensureSchema } from "../db";

export type EmailCodePurpose = "signup" | "reset";

type EmailEnvironment = {
  RESEND_API_KEY?: string;
  AUTH_FROM_EMAIL?: string;
};

export class EmailProviderError extends Error {}

export function emailProviderConfigured(): boolean {
  const configuration = env as unknown as EmailEnvironment;
  return Boolean(configuration.RESEND_API_KEY?.trim() && configuration.AUTH_FROM_EMAIL?.trim());
}

function generateCode(): string {
  const values = crypto.getRandomValues(new Uint32Array(1));
  return String(100000 + (values[0] % 900000));
}

async function codeHash(email: string, purpose: EmailCodePurpose, code: string): Promise<string> {
  return sha256(`${authSecret()}\u0000${normalizeEmail(email)}\u0000${purpose}\u0000${code}`);
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] || character);
}

async function deliverEmail(email: string, name: string, code: string, purpose: EmailCodePurpose): Promise<boolean> {
  const configuration = env as unknown as EmailEnvironment;
  const apiKey = configuration.RESEND_API_KEY?.trim();
  const from = configuration.AUTH_FROM_EMAIL?.trim();
  if (!apiKey || !from) {
    if (process.env.NODE_ENV === "development") return false;
    throw new EmailProviderError("Email verification is not configured yet.");
  }

  const action = purpose === "signup" ? "verify your email" : "reset your password";
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
    body: JSON.stringify({
      from,
      to: [email],
      subject: `${code} is your IELTS World verification code`,
      html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:28px;color:#10223d"><h2>IELTS World &amp; SMART World Consultancy</h2><p>Hello ${escapeHtml(name || "Student")},</p><p>Use this one-time code to ${action}:</p><p style="font-size:32px;font-weight:800;letter-spacing:7px;color:#1457d9">${code}</p><p>This code expires in 10 minutes. Never share it with anyone.</p></div>`,
    }),
  });
  if (!response.ok) throw new EmailProviderError("The verification email could not be sent.");
  return true;
}

export async function issueEmailCode(emailInput: string, purpose: EmailCodePurpose, name: string): Promise<{ previewCode?: string }> {
  await ensureSchema();
  const email = normalizeEmail(emailInput);
  const code = generateCode();
  const database = authDatabase();
  await database.prepare("DELETE FROM auth_codes WHERE email = ? AND purpose = ?").bind(email, purpose).run();
  await database
    .prepare("INSERT INTO auth_codes (email, purpose, code_hash, expires_at, attempts) VALUES (?, ?, ?, ?, 0)")
    .bind(email, purpose, await codeHash(email, purpose, code), Date.now() + 10 * 60 * 1000)
    .run();
  try {
    const delivered = await deliverEmail(email, name, code, purpose);
    return delivered ? {} : { previewCode: code };
  } catch (error) {
    await database.prepare("DELETE FROM auth_codes WHERE email = ? AND purpose = ?").bind(email, purpose).run();
    throw error;
  }
}

export async function consumeEmailCode(emailInput: string, purpose: EmailCodePurpose, code: string): Promise<boolean> {
  await ensureSchema();
  const email = normalizeEmail(emailInput);
  const database = authDatabase();
  const record = await database
    .prepare("SELECT id, code_hash, attempts FROM auth_codes WHERE email = ? AND purpose = ? AND expires_at > ? ORDER BY id DESC LIMIT 1")
    .bind(email, purpose, Date.now())
    .first<{ id: number; code_hash: string; attempts: number }>();
  if (!record || record.attempts >= 5) return false;
  await database.prepare("UPDATE auth_codes SET attempts = attempts + 1 WHERE id = ?").bind(record.id).run();
  const valid = record.code_hash === await codeHash(email, purpose, code.trim());
  if (valid) await database.prepare("DELETE FROM auth_codes WHERE email = ? AND purpose = ?").bind(email, purpose).run();
  return valid;
}
