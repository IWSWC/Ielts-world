import { requireAuthUser, authSignOutPath } from "../auth-core";
import { desc, eq } from "drizzle-orm";
import { ensureSchema, getDb } from "../../db";
import { appointments, documents, notifications, profiles, verifiedContacts } from "../../db/schema";
import { PortalClient } from "./portal-client";

export const dynamic = "force-dynamic";
export default async function Portal() {
  const user = await requireAuthUser("/portal");
  let profile: typeof profiles.$inferSelect | null = null;
  let docs: typeof documents.$inferSelect[] = [];
  let bookings: typeof appointments.$inferSelect[] = [];
  let notices: typeof notifications.$inferSelect[] = [];
  let verifiedPhone: typeof verifiedContacts.$inferSelect | null = null;
  try {
    await ensureSchema(); const db = getDb();
    profile = (await db.select().from(profiles).where(eq(profiles.userId, user.userId)).limit(1))[0] ?? null;
    docs = await db.select().from(documents).where(eq(documents.userId, user.userId)).orderBy(desc(documents.createdAt));
    bookings = await db.select().from(appointments).where(eq(appointments.userId, user.userId)).orderBy(desc(appointments.createdAt));
    notices = await db.select().from(notifications).where(eq(notifications.userId, user.userId)).orderBy(desc(notifications.createdAt)).limit(20);
    verifiedPhone = (await db.select().from(verifiedContacts).where(eq(verifiedContacts.userId, user.userId)).limit(1))[0] ?? null;
  } catch { profile = null; docs = []; bookings = []; notices = []; verifiedPhone = null; }
  return <PortalClient user={{ name: user.displayName, email: user.email }} profile={profile} docs={docs} appointments={bookings} notifications={notices} verifiedPhone={verifiedPhone?.phone||null} signOut={authSignOutPath("/")} />;
}
