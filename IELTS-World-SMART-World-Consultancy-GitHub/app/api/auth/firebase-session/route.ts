import { allowRequest, requestFingerprint } from "../../../rate-limit";
import { attachSession, authDatabase, normalizeEmail, validEmail } from "../../../auth-core";
import { ensureSchema } from "../../../../db";

const firebaseApiKey = "AIzaSyC0wEmGPbzB2Xyze5AXElDwHjvHreuuUmM";
type FirebaseIdentity = {
  localId?:string;
  email?:string;
  emailVerified?:boolean;
  displayName?:string;
  phoneNumber?:string;
  disabled?:boolean;
  providerUserInfo?:Array<{providerId?:string}>;
};

export async function POST(request:Request) {
  try {
    const origin = request.headers.get("origin");
    if (origin && origin !== new URL(request.url).origin) return Response.json({ error:"Invalid authentication origin." }, { status:403 });
    if (!(await allowRequest(`firebase-session:${requestFingerprint(request)}`, 40, 60 * 60 * 1000))) {
      return Response.json({ error:"Too many sign-in attempts. Please try again later." }, { status:429 });
    }
    const payload = await request.json() as { idToken?:string; remember?:boolean };
    const idToken = String(payload.idToken || "");
    if (idToken.length < 100 || idToken.length > 4096) return Response.json({ error:"Firebase sign-in token is invalid." }, { status:400 });

    const verification = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseApiKey}`, {
      method:"POST",
      headers:{ "content-type":"application/json" },
      body:JSON.stringify({ idToken }),
    });
    const response = await verification.json() as { users?:FirebaseIdentity[] };
    const identity = response.users?.[0];
    if (!verification.ok || !identity?.localId || identity.disabled) return Response.json({ error:"Firebase identity verification failed." }, { status:401 });

    const realEmail = normalizeEmail(identity.email || "");
    const phone = String(identity.phoneNumber || "").slice(0, 30);
    if (realEmail && (!validEmail(realEmail) || !identity.emailVerified)) {
      return Response.json({ error:"Verify your email before signing in.", needsVerification:true, email:realEmail }, { status:403 });
    }
    if (!realEmail && !phone) return Response.json({ error:"Firebase account has no verified contact." }, { status:403 });

    await ensureSchema();
    const database = authDatabase();
    const email = realEmail || `phone-${identity.localId}@firebase.invalid`;
    const name = String(identity.displayName || (realEmail ? realEmail.split("@")[0] : phone) || "Student").trim().slice(0, 100);
    let user = await database.prepare("SELECT id FROM auth_users WHERE google_sub = ? OR email = ? LIMIT 1").bind(identity.localId, email).first<{id:string}>();
    if (user) {
      await database.prepare("UPDATE auth_users SET email = ?, name = ?, email_verified = 1, google_sub = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
        .bind(email, name, identity.localId, user.id).run();
    } else {
      user = { id:crypto.randomUUID() };
      await database.prepare("INSERT INTO auth_users (id, email, name, email_verified, google_sub) VALUES (?, ?, ?, 1, ?)")
        .bind(user.id, email, name, identity.localId).run();
    }
    return attachSession(Response.json({ ok:true, email:realEmail || undefined, phone:phone || undefined }), request, user.id, Boolean(payload.remember));
  } catch {
    return Response.json({ error:"Firebase sign-in is temporarily unavailable." }, { status:500 });
  }
}
