import { and, eq } from "drizzle-orm";
import { ensureSchema, getDb } from "../../../db";
import { teachers } from "../../../db/schema";
import { TeacherProfileClient } from "./teacher-profile-client";

export const dynamic = "force-dynamic";

export default async function TeacherProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const id = Number(rawId);
  let teacher: typeof teachers.$inferSelect | null = null;
  if (Number.isInteger(id) && id > 0) {
    try {
      await ensureSchema();
      teacher = (await getDb().select().from(teachers).where(and(eq(teachers.id, id), eq(teachers.active, true), eq(teachers.consentConfirmed, true))).limit(1))[0] ?? null;
    } catch { teacher = null; }
  }

  return <TeacherProfileClient teacher={teacher ? { id: teacher.id, name: teacher.name, profession: teacher.profession, organization: teacher.organization, qualifications: teacher.qualifications, experience: teacher.experience, expertise: teacher.expertise, bio: teacher.bio, achievements: teacher.achievements, hasPhoto: Boolean(teacher.photoObjectKey) } : null}/>;
}
