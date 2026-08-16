import { env } from "cloudflare:workers";
import { and, eq } from "drizzle-orm";
import { ensureSchema, getDb } from "../../../db";
import { studentStories, teachers } from "../../../db/schema";
import { getAdminUser } from "../../admin-access";

export async function GET(request: Request) {
  try {
    await ensureSchema();
    const url = new URL(request.url);
    const kind = url.searchParams.get("kind");
    const id = Number(url.searchParams.get("id"));
    if ((kind !== "teacher" && kind !== "student") || !Number.isInteger(id) || id < 1) return Response.json({ error: "Invalid media request." }, { status: 400 });
    const db = getDb();
    const admin = await getAdminUser();
    const item = kind === "teacher"
      ? (await db.select().from(teachers).where(admin ? eq(teachers.id, id) : and(eq(teachers.id, id), eq(teachers.active, true), eq(teachers.consentConfirmed, true))).limit(1))[0]
      : (await db.select().from(studentStories).where(admin ? eq(studentStories.id, id) : and(eq(studentStories.id, id), eq(studentStories.active, true), eq(studentStories.consentConfirmed, true))).limit(1))[0];
    if (!item?.photoObjectKey || !item.photoContentType) return Response.json({ error: "Photo not found." }, { status: 404 });
    const bucket = (env as unknown as { DOCUMENTS?: R2Bucket }).DOCUMENTS;
    const object = await bucket?.get(item.photoObjectKey) as { body: BodyInit } | null | undefined;
    if (!object) return Response.json({ error: "Photo not found." }, { status: 404 });
    return new Response(object.body, { headers: { "content-type": item.photoContentType, "cache-control": "public, max-age=86400", "x-content-type-options": "nosniff" } });
  } catch {
    return Response.json({ error: "Media is temporarily unavailable." }, { status: 500 });
  }
}
