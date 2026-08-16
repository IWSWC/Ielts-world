import { allowRequest, requestFingerprint } from "../../../rate-limit";
import { attachSession, authDatabase, normalizeEmail, verifyPassword } from "../../../auth-core";
import { ensureSchema } from "../../../../db";

export async function POST(request: Request) {
  try {
    await ensureSchema();
    if (!(await allowRequest(`auth-login:${requestFingerprint(request)}`, 12, 15 * 60 * 1000))) {
      return Response.json({ error: "Too many sign-in attempts. Try again in 15 minutes." }, { status: 429 });
    }
    const payload = await request.json() as { email?: string; password?: string; remember?: boolean };
    const email = normalizeEmail(payload.email || "");
    const row = await authDatabase()
      .prepare("SELECT id, password_hash, password_salt, email_verified FROM auth_users WHERE email = ? LIMIT 1")
      .bind(email)
      .first<{ id: string; password_hash: string | null; password_salt: string | null; email_verified: number }>();
    const authenticated = Boolean(row?.password_hash && row.password_salt && await verifyPassword(payload.password || "", row.password_salt, row.password_hash));
    if (!authenticated || !row) return Response.json({ error: "Email or password is incorrect." }, { status: 401 });
    if (!row.email_verified) return Response.json({ error: "Verify your email before signing in.", needsVerification: true, email }, { status: 403 });
    return attachSession(Response.json({ ok: true }), request, row.id, Boolean(payload.remember));
  } catch {
    return Response.json({ error: "Sign-in is temporarily unavailable." }, { status: 500 });
  }
}
