import { allowRequest, requestFingerprint } from "../../../rate-limit";
import { authDatabase, normalizeEmail, validEmail } from "../../../auth-core";
import { emailProviderConfigured, EmailProviderError, issueEmailCode } from "../../../email-verification";
import { ensureSchema } from "../../../../db";

export async function POST(request: Request) {
  try {
    await ensureSchema();
    const payload = await request.json() as { email?: string };
    const email = normalizeEmail(payload.email || "");
    if (!validEmail(email)) return Response.json({ error: "Enter a valid email address." }, { status: 400 });
    if (!(await allowRequest(`auth-reset:${email}:${requestFingerprint(request)}`, 4, 60 * 60 * 1000))) {
      return Response.json({ error: "Please wait before requesting another code." }, { status: 429 });
    }
    if (!emailProviderConfigured() && process.env.NODE_ENV !== "development") throw new EmailProviderError("Email verification is not configured yet.");
    const user = await authDatabase().prepare("SELECT name FROM auth_users WHERE email = ? AND email_verified = 1 LIMIT 1").bind(email).first<{ name: string }>();
    const delivery = user ? await issueEmailCode(email, "reset", user.name) : {};
    return Response.json({ ok: true, message: "If an account exists, a reset code has been sent.", ...delivery });
  } catch (error) {
    if (error instanceof EmailProviderError) return Response.json({ error: error.message }, { status: 503 });
    return Response.json({ error: "Password recovery is temporarily unavailable." }, { status: 500 });
  }
}
