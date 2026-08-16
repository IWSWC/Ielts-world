import { getAuthUser } from "../../auth-core";
import { allowRequest } from "../../rate-limit";
import { ensureSchema, getDb } from "../../../db";
import { appointments } from "../../../db/schema";

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) return Response.json({ error: "Sign in required" }, { status: 401 });
  try {
    await ensureSchema();
    if (!(await allowRequest(`appointment:${user.userId}`, 5, 24 * 60 * 60 * 1000))) return Response.json({ error: "Daily appointment request limit reached." }, { status: 429 });
    const payload = await request.json() as Record<string, string>;
    const clean = (value: string | undefined, max: number) => value?.trim().slice(0, max) || "";
    const name = clean(payload.name, 100);
    const phone = clean(payload.phone, 30);
    const service = clean(payload.service, 100);
    const preferredDate = clean(payload.preferredDate, 30) || null;
    const message = clean(payload.message, 500) || null;
    if (!name || !phone || !service) return Response.json({ error: "Name, phone and service are required." }, { status: 400 });
    const [appointment] = await getDb().insert(appointments).values({ userId: user.userId, name, email: user.email, phone, service, preferredDate, message }).returning();
    return Response.json({ appointment }, { status: 201 });
  } catch {
    return Response.json({ error: "Could not submit appointment." }, { status: 500 });
  }
}
