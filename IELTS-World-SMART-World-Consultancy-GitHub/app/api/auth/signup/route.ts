import { allowRequest, requestFingerprint } from "../../../rate-limit";
import { authDatabase, hashPassword, normalizeEmail, passwordProblem, validEmail } from "../../../auth-core";
import { EmailProviderError, issueEmailCode } from "../../../email-verification";
import { ensureSchema } from "../../../../db";

export async function POST(request: Request) {
  try {
    await ensureSchema();
    if (!(await allowRequest(`auth-signup:${requestFingerprint(request)}`, 6, 60 * 60 * 1000))) {
      return Response.json({ error: "Too many account requests. Please try again later." }, { status: 429 });
    }
    const payload = await request.json() as { name?: string; email?: string; password?: string };
    const name = (payload.name || "").trim().slice(0, 100);
    const email = normalizeEmail(payload.email || "");
    const password = payload.password || "";
    const problem = passwordProblem(password);
    if (name.length < 2 || !validEmail(email) || problem) {
      return Response.json({ error: problem || "Enter your full name and a valid email address." }, { status: 400 });
    }

    const database = authDatabase();
    const existing = await database.prepare("SELECT id, email_verified FROM auth_users WHERE email = ? LIMIT 1").bind(email).first<{ id: string; email_verified: number }>();
    if (existing?.email_verified) return Response.json({ error: "An account already exists with this email. Please sign in." }, { status: 409 });

    const credentials = await hashPassword(password);
    const userId = existing?.id || crypto.randomUUID();
    if (existing) {
      await database.prepare("UPDATE auth_users SET name = ?, password_hash = ?, password_salt = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
        .bind(name, credentials.hash, credentials.salt, userId).run();
    } else {
      await database.prepare("INSERT INTO auth_users (id, email, name, password_hash, password_salt, email_verified) VALUES (?, ?, ?, ?, ?, 0)")
        .bind(userId, email, name, credentials.hash, credentials.salt).run();
    }
    const delivery = await issueEmailCode(email, "signup", name);
    return Response.json({ ok: true, email, ...delivery }, { status: 201 });
  } catch (error) {
    if (error instanceof EmailProviderError) return Response.json({ error: error.message }, { status: 503 });
    return Response.json({ error: "Account creation is temporarily unavailable." }, { status: 500 });
  }
}
