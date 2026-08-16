import { ensureSchema, getDb } from "../../../db";
import { enquiries } from "../../../db/schema";
import { allowRequest, requestFingerprint } from "../../rate-limit";

export async function POST(request: Request) {
  try {
    await ensureSchema();
    const allowed = await allowRequest(`enquiry:${requestFingerprint(request)}`, 5, 60 * 60 * 1000);
    if (!allowed) return Response.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    const payload = await request.json() as Record<string, string>;
    const name = payload.name?.trim(); const phone = payload.phone?.trim(); const interest = payload.interest?.trim();
    if (!name || !phone || !interest || name.length > 100 || phone.length > 30 || interest.length > 100) return Response.json({ error: "Invalid information" }, { status: 400 });
    const [row] = await getDb().insert(enquiries).values({ name, phone, interest }).returning();
    return Response.json({ id: row.id }, { status: 201 });
  } catch { return Response.json({ error: "Service temporarily unavailable" }, { status: 500 }); }
}
