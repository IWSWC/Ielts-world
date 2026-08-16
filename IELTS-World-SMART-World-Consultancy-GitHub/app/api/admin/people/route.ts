import { env } from "cloudflare:workers";
import { eq } from "drizzle-orm";
import { requireAdminApi } from "../../../admin-access";
import { allowRequest } from "../../../rate-limit";
import { ensureSchema, getDb } from "../../../../db";
import { auditLogs, studentStories, teachers } from "../../../../db/schema";

const MAX_PHOTO_SIZE = 5 * 1024 * 1024;
const photoTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

function clean(form: FormData, key: string, max: number) {
  return String(form.get(key) ?? "").trim().slice(0, max);
}

function positiveId(value: FormDataEntryValue | null) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

async function validPhoto(file: File) {
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  if (file.type === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (file.type === "image/png") return bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a;
  if (file.type === "image/webp") return String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  return false;
}

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;
  try {
    await ensureSchema();
    if (!(await allowRequest(`people-admin:${auth.user.userId}`, 100, 60 * 60 * 1000))) return Response.json({ error: "Too many profile updates. Try again later." }, { status: 429 });
    const form = await request.formData();
    const kind = clean(form, "kind", 20);
    if (kind !== "teacher" && kind !== "student") return Response.json({ error: "Invalid profile type." }, { status: 400 });
    const id = positiveId(form.get("id"));
    const active = form.get("active") === "on" || form.get("active") === "true";
    const consentConfirmed = form.get("consentConfirmed") === "on" || form.get("consentConfirmed") === "true";
    if (active && !consentConfirmed) return Response.json({ error: "Photo/profile consent must be confirmed before publishing." }, { status: 400 });

    const db = getDb();
    const current = id
      ? kind === "teacher"
        ? (await db.select().from(teachers).where(eq(teachers.id, id)).limit(1))[0]
        : (await db.select().from(studentStories).where(eq(studentStories.id, id)).limit(1))[0]
      : null;
    if (id && !current) return Response.json({ error: "Profile not found." }, { status: 404 });

    const photo = form.get("photo");
    const hasPhoto = photo instanceof File && photo.size > 0;
    if (hasPhoto && (!photoTypes.has(photo.type) || photo.size > MAX_PHOTO_SIZE || !(await validPhoto(photo)))) return Response.json({ error: "Use a valid JPG, PNG or WebP photo up to 5 MB." }, { status: 400 });
    if (active && !hasPhoto && !current?.photoObjectKey) return Response.json({ error: "Upload a profile photo before publishing." }, { status: 400 });

    let photoObjectKey = current?.photoObjectKey || null;
    let photoContentType = current?.photoContentType || null;
    const bucket = (env as unknown as { DOCUMENTS?: R2Bucket & { delete(key: string): Promise<unknown> } }).DOCUMENTS;
    if (hasPhoto) {
      if (!bucket) return Response.json({ error: "Photo storage is unavailable." }, { status: 503 });
      const extension = photo.type === "image/png" ? "png" : photo.type === "image/webp" ? "webp" : "jpg";
      const nextKey = `public/${kind === "teacher" ? "teachers" : "students"}/${crypto.randomUUID()}.${extension}`;
      await bucket.put(nextKey, await photo.arrayBuffer(), { httpMetadata: { contentType: photo.type, cacheControl: "public, max-age=86400" }, customMetadata: { uploadedBy: auth.user.userId, consentConfirmed: String(consentConfirmed) } });
      if (photoObjectKey) await bucket.delete(photoObjectKey);
      photoObjectKey = nextKey;
      photoContentType = photo.type;
    }

    let item: unknown;
    if (kind === "teacher") {
      const values = {
        name: clean(form, "name", 120), profession: clean(form, "profession", 160), organization: clean(form, "organization", 180) || null,
        qualifications: clean(form, "qualifications", 1200), experience: clean(form, "experience", 500), expertise: clean(form, "expertise", 800),
        bio: clean(form, "bio", 3000), achievements: clean(form, "achievements", 1500) || null, photoObjectKey, photoContentType,
        consentConfirmed, active, sortOrder: Number(form.get("sortOrder")) || 0, updatedAt: new Date().toISOString(),
      };
      if (!values.name || !values.profession || !values.qualifications || !values.experience || !values.expertise || !values.bio) return Response.json({ error: "Complete all required teacher information." }, { status: 400 });
      if (id) [item] = await db.update(teachers).set(values).where(eq(teachers.id, id)).returning(); else [item] = await db.insert(teachers).values(values).returning();
    } else {
      const values = {
        name: clean(form, "name", 120), program: clean(form, "program", 180), destination: clean(form, "destination", 120) || null,
        result: clean(form, "result", 240) || null, quote: clean(form, "quote", 1600), photoObjectKey, photoContentType,
        consentConfirmed, active, sortOrder: Number(form.get("sortOrder")) || 0, updatedAt: new Date().toISOString(),
      };
      if (!values.name || !values.program || !values.quote) return Response.json({ error: "Complete the student name, program and story." }, { status: 400 });
      if (id) [item] = await db.update(studentStories).set(values).where(eq(studentStories.id, id)).returning(); else [item] = await db.insert(studentStories).values(values).returning();
    }
    await db.insert(auditLogs).values({ actorId: auth.user.userId, action: `save${kind === "teacher" ? "Teacher" : "StudentStory"}`, targetId: id ? String(id) : "new" });
    return Response.json({ ok: true, item });
  } catch {
    return Response.json({ error: "Could not save this profile." }, { status: 500 });
  }
}
