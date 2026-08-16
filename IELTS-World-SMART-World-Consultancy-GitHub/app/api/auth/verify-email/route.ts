import { allowRequest, requestFingerprint } from "../../../rate-limit";
import { attachSession, authDatabase, normalizeEmail, safeRelativeReturnPath } from "../../../auth-core";
import { consumeEmailCode } from "../../../email-verification";
import { ensureSchema } from "../../../../db";

export async function POST(request: Request) {
  try {
    await ensureSchema();
    if (!(await allowRequest(`auth-verify:${requestFingerprint(request)}`, 15, 30 * 60 * 1000))) {
      return Response.json({ error: "Too many verification attempts. Try again later." }, { status: 429 });
    }
    const payload = await request.json() as { email?: string; code?: string; returnTo?: string };
    const email = normalizeEmail(payload.email || "");
    if (!/^\d{6}$/.test(payload.code || "") || !(await consumeEmailCode(email, "signup", payload.code || ""))) {
      return Response.json({ error: "The verification code is incorrect or expired." }, { status: 400 });
    }
    const database = authDatabase();
    await database.prepare("UPDATE auth_users SET email_verified = 1, updated_at = CURRENT_TIMESTAMP WHERE email = ?").bind(email).run();
    const user = await database.prepare("SELECT id FROM auth_users WHERE email = ? LIMIT 1").bind(email).first<{ id: string }>();
    if (!user) return Response.json({ error: "Account not found." }, { status: 404 });
    const returnTo = safeRelativeReturnPath(payload.returnTo, "/portal");
    return attachSession(Response.json({ ok: true, returnTo }), request, user.id);
  } catch {
    return Response.json({ error: "Email verification is temporarily unavailable." }, { status: 500 });
  }
}
