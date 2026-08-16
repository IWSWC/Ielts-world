import { getAuthUser } from "../../auth-core";
import { ensureSchema, getDb } from "../../../db";
import { profiles } from "../../../db/schema";
import { allowRequest } from "../../rate-limit";

export async function POST(request: Request) {
  const user = await getAuthUser(); if (!user) return Response.json({ error: "Sign in required" }, { status: 401 });
  try {
    await ensureSchema();
    if (!(await allowRequest(`profile:${user.userId}`, 20, 60 * 60 * 1000))) return Response.json({ error: "Too many updates. Please try again later." }, { status: 429 });
    const payload = await request.json() as Record<string, string>; const clean = (value?: string) => value?.trim().slice(0, 120) || null;
    await getDb().insert(profiles).values({ userId: user.userId, email: user.email, fullName: clean(payload.fullName), phone: clean(payload.phone), destination: clean(payload.destination), service: clean(payload.service) }).onConflictDoUpdate({ target: profiles.userId, set: { fullName: clean(payload.fullName), phone: clean(payload.phone), destination: clean(payload.destination), service: clean(payload.service), updatedAt: new Date().toISOString() } });
    return Response.json({ ok: true });
  } catch { return Response.json({ error: "Update failed" }, { status: 500 }); }
}
