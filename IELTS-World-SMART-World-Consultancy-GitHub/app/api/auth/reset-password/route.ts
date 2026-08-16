import { allowRequest, requestFingerprint } from "../../../rate-limit";
import { authDatabase, hashPassword, normalizeEmail, passwordProblem } from "../../../auth-core";
import { consumeEmailCode } from "../../../email-verification";
import { ensureSchema } from "../../../../db";

export async function POST(request: Request) {
  try {
    await ensureSchema();
    if (!(await allowRequest(`auth-reset-confirm:${requestFingerprint(request)}`, 12, 30 * 60 * 1000))) {
      return Response.json({ error: "Too many reset attempts. Try again later." }, { status: 429 });
    }
    const payload = await request.json() as { email?: string; code?: string; password?: string };
    const email = normalizeEmail(payload.email || "");
    const problem = passwordProblem(payload.password || "");
    if (problem) return Response.json({ error: problem }, { status: 400 });
    if (!/^\d{6}$/.test(payload.code || "") || !(await consumeEmailCode(email, "reset", payload.code || ""))) {
      return Response.json({ error: "The reset code is incorrect or expired." }, { status: 400 });
    }
    const credentials = await hashPassword(payload.password || "");
    const database = authDatabase();
    await database.prepare("UPDATE auth_users SET password_hash = ?, password_salt = ?, updated_at = CURRENT_TIMESTAMP WHERE email = ? AND email_verified = 1")
      .bind(credentials.hash, credentials.salt, email).run();
    const user = await database.prepare("SELECT id FROM auth_users WHERE email = ? LIMIT 1").bind(email).first<{ id: string }>();
    if (user) await database.prepare("DELETE FROM auth_sessions WHERE user_id = ?").bind(user.id).run();
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Could not reset the password." }, { status: 500 });
  }
}
