import { and, eq } from "drizzle-orm";
import { ensureSchema, getDb } from "../../../db";
import { courseDetails, courses } from "../../../db/schema";
import { courseDetailFor } from "../../course-content";
import { CourseDetailClient, type CourseDetailRecord } from "./course-detail-client";

export const dynamic = "force-dynamic";

export default async function CoursePage({ params }: { params: Promise<{id:string}> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id < 1) return <CourseDetailClient course={null}/>;
  let record:CourseDetailRecord|null = null;
  try {
    await ensureSchema();
    const db = getDb();
    const course = (await db.select().from(courses).where(and(eq(courses.id,id),eq(courses.active,true))).limit(1))[0];
    if (course) {
      const saved = (await db.select().from(courseDetails).where(eq(courseDetails.courseId,id)).limit(1))[0];
      record = {...course,...courseDetailFor(course.title),...saved};
    }
  } catch { record = null; }
  return <CourseDetailClient course={record}/>;
}
