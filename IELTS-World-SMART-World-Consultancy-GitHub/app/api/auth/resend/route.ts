import { allowRequest, requestFingerprint } from "../../../rate-limit";
import { authDatabase, normalizeEmail, validEmail } from "../../../auth-core";
import { EmailProviderError, issueEmailCode } from "../../../email-verification";
import { ensureSchema } from "../../../../db";

export async function POST(request: Request) {
  try {
    await ensureSchema();
    const payload = await request.json() as { email?: string };
    const email = normalizeEmail(payload.email || "");
    if (!validEmail(email)) return Response.json({ error: "Enter a valid email address." }, { status: 400 });
    if (!(await allowRequest(`auth-resend:${email}:${requestFingerprint(request)}`, 4, 60 * 60 * 1000))) {
      return Response.json({ error: "Please wait before requesting another code." }, { status: 429 });
    }
    const user = await authDatabase().prepare("SELECT name, email_verified FROM auth_users WHERE email = ? LIMIT 1").bind(email).first<{ name: string; email_verified: number }>();
    if (!user || user.email_verified) return Response.json({ error: "This account does not need email verification." }, { status: 400 });
    const delivery = await issueEmailCode(email, "signup", user.name);
    return Response.json({ ok: true, ...delivery });
  } catch (error) {
    if (error instanceof EmailProviderError) return Response.json({ error: error.message }, { status: 503 });
    return Response.json({ error: "Could not resend the verification code." }, { status: 500 });
  }
}
