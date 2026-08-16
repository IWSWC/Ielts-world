import { env } from "cloudflare:workers";
import { getAuthUser } from "../../../auth-core";
import { allowRequest } from "../../../rate-limit";
import { ensureSchema, getDb } from "../../../../db";
import { profiles, verifiedContacts } from "../../../../db/schema";

type TwilioEnv = {
  TWILIO_ACCOUNT_SID?: string;
  TWILIO_AUTH_TOKEN?: string;
  TWILIO_VERIFY_SERVICE_SID?: string;
};

function normalizeBangladeshPhone(value: string): string | null {
  const digits = value.replace(/\D/g, "");
  if (/^01\d{9}$/.test(digits)) return `+88${digits}`;
  if (/^8801\d{9}$/.test(digits)) return `+${digits}`;
  if (/^1\d{9}$/.test(digits)) return `+880${digits}`;
  return null;
}

function twilioConfig() {
  const values = env as unknown as TwilioEnv;
  const accountSid = values.TWILIO_ACCOUNT_SID?.trim();
  const authToken = values.TWILIO_AUTH_TOKEN?.trim();
  const serviceSid = values.TWILIO_VERIFY_SERVICE_SID?.trim();
  return accountSid && authToken && serviceSid
    ? { accountSid, authToken, serviceSid }
    : null;
}

async function twilioRequest(path: string, values: Record<string, string>) {
  const config = twilioConfig();
  if (!config) return null;
  const response = await fetch(
    `https://verify.twilio.com/v2/Services/${encodeURIComponent(config.serviceSid)}/${path}`,
    {
      method: "POST",
      headers: {
        authorization: `Basic ${btoa(`${config.accountSid}:${config.authToken}`)}`,
        "content-type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(values),
    },
  );
  const result = await response.json() as { status?: string; message?: string };
  if (!response.ok) throw new Error(result.message || "Verification provider rejected the request");
  return result;
}

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) return Response.json({ error: "Sign in required" }, { status: 401 });
  try {
    await ensureSchema();
    const payload = await request.json() as { action?: string; phone?: string; code?: string };
    const phone = normalizeBangladeshPhone(payload.phone || "");
    if (!phone) return Response.json({ error: "Enter a valid Bangladesh mobile number." }, { status: 400 });

    if (payload.action === "send") {
      if (!(await allowRequest(`phone-verify:${user.userId}`, 5, 60 * 60 * 1000))) return Response.json({ error: "Too many verification requests. Try again later." }, { status: 429 });
      const result = await twilioRequest("Verifications", { To: phone, Channel: "sms" });
      if (!result && process.env.NODE_ENV !== "development") return Response.json({ error: "SMS verification provider is not configured yet." }, { status: 503 });
      return Response.json({ sent: true, phone, ...(result ? {} : { previewCode: "123456" }) });
    }

    if (payload.action === "confirm") {
      const code = (payload.code || "").trim();
      if (!/^\d{4,10}$/.test(code)) return Response.json({ error: "Enter the verification code." }, { status: 400 });
      const result = await twilioRequest("VerificationCheck", { To: phone, Code: code });
      const approved = result ? result.status === "approved" : process.env.NODE_ENV === "development" && code === "123456";
      if (!approved) return Response.json({ error: "The code is incorrect or expired." }, { status: 400 });

      await getDb().insert(verifiedContacts).values({ userId: user.userId, phone, verifiedAt: new Date().toISOString() }).onConflictDoUpdate({ target: verifiedContacts.userId, set: { phone, verifiedAt: new Date().toISOString() } });
      await getDb().insert(profiles).values({ userId: user.userId, email: user.email, fullName: user.fullName, phone }).onConflictDoUpdate({ target: profiles.userId, set: { phone, updatedAt: new Date().toISOString() } });
      return Response.json({ verified: true, phone });
    }

    return Response.json({ error: "Invalid verification action." }, { status: 400 });
  } catch {
    return Response.json({ error: "Verification is temporarily unavailable." }, { status: 500 });
  }
}
