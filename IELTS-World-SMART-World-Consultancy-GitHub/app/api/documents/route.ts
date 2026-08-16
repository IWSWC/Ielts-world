import { env } from "cloudflare:workers";
import { getAuthUser } from "../../auth-core";
import { getAdminUser } from "../../admin-access";
import { allowRequest } from "../../rate-limit";
import { ensureSchema, getDb } from "../../../db";
import { documents } from "../../../db/schema";
import { eq } from "drizzle-orm";

const allowed = new Set(["application/pdf", "image/jpeg", "image/png"]); const MAX_SIZE = 8 * 1024 * 1024;
async function hasValidSignature(file: File) {
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  if (file.type === "application/pdf") return bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46 && bytes[4] === 0x2d;
  if (file.type === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (file.type === "image/png") return bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a;
  return false;
}
export async function POST(request: Request) {
  const user = await getAuthUser(); if (!user) return Response.json({ error: "Sign in required" }, { status: 401 });
  try {
    await ensureSchema();
    if (!(await allowRequest(`document-upload:${user.userId}`, 12, 60 * 60 * 1000))) return Response.json({ error: "Upload limit reached. Please try again later." }, { status: 429 });
    const form = await request.formData(); const file = form.get("file"); const category = String(form.get("category") || "Other").slice(0, 80);
    if (!(file instanceof File) || !allowed.has(file.type) || file.size < 1 || file.size > MAX_SIZE || !(await hasValidSignature(file))) return Response.json({ error: "Use a valid PDF, JPG or PNG file up to 8 MB." }, { status: 400 });
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120); const objectKey = `users/${user.userId}/${crypto.randomUUID()}-${safeName}`; const bucket = (env as unknown as { DOCUMENTS: R2Bucket }).DOCUMENTS;
    if (!bucket) throw new Error("Storage unavailable");
    await bucket.put(objectKey, await file.arrayBuffer(), { httpMetadata: { contentType: file.type }, customMetadata: { owner: user.userId } });
    const [document] = await getDb().insert(documents).values({ userId: user.userId, objectKey, filename: file.name.slice(0, 180), contentType: file.type, size: file.size, category }).returning();
    return Response.json({ document }, { status: 201 });
  } catch { return Response.json({ error: "Secure storage is temporarily unavailable." }, { status: 500 }); }
}

export async function GET(request: Request) {
  const user = await getAuthUser();
  if (!user) return Response.json({ error: "Sign in required" }, { status: 401 });
  try {
    await ensureSchema();
    const id = Number(new URL(request.url).searchParams.get("id"));
    if (!Number.isInteger(id) || id < 1) return Response.json({ error: "Invalid document" }, { status: 400 });
    const document = (await getDb().select().from(documents).where(eq(documents.id, id)).limit(1))[0];
    if (!document) return Response.json({ error: "Document not found" }, { status: 404 });
    const admin = await getAdminUser();
    if (document.userId !== user.userId && !admin) return Response.json({ error: "Access denied" }, { status: 403 });
    const bucket = (env as unknown as { DOCUMENTS: R2Bucket }).DOCUMENTS;
    const object = await bucket?.get(document.objectKey) as { body: BodyInit } | null | undefined;
    if (!object) return Response.json({ error: "Stored file not found" }, { status: 404 });
    const safeFilename = document.filename.replace(/["\r\n]/g, "_");
    return new Response(object.body, { headers: { "content-type": document.contentType, "content-length": String(document.size), "content-disposition": `inline; filename="${safeFilename}"`, "cache-control": "private, no-store", "x-content-type-options": "nosniff" } });
  } catch { return Response.json({ error: "Could not open document" }, { status: 500 }); }
}
