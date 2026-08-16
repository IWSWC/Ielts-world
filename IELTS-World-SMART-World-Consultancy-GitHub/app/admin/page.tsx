import { asc, desc } from "drizzle-orm";
import { authSignOutPath, requireAuthUser } from "../auth-core";
import { getAdminUser } from "../admin-access";
import { ensureSchema, getDb } from "../../db";
import { appointments, courseDetails, courses, documents, enquiries, offers, profiles, siteSettings, studentStories, teachers } from "../../db/schema";
import { AdminClient } from "./admin-client";
import Link from "next/link";
import { courseDetailFor, type CourseDetailContent } from "../course-content";
import { mergeSiteSettings } from "../site-settings";

export const dynamic = "force-dynamic";

export default async function Admin() {
  const user = await requireAuthUser("/admin");
  const admin = await getAdminUser();
  if (!admin) {
    return <main className="auth-note"><span className="kicker">RESTRICTED AREA</span><h1>Admin access protected</h1><p className="section-lead">আপনি <strong>{user.email}</strong> হিসেবে sign in করেছেন। শুধুমাত্র configured site-owner account এই dashboard ব্যবহার করতে পারবে।</p><Link className="btn btn-blue" href="/">Back to website</Link></main>;
  }

  let leads: typeof enquiries.$inferSelect[] = [];
  let docs: typeof documents.$inferSelect[] = [];
  let students: typeof profiles.$inferSelect[] = [];
  let bookings: typeof appointments.$inferSelect[] = [];
  let baseCourseRows: typeof courses.$inferSelect[] = [];
  let offerRows: typeof offers.$inferSelect[] = [];
  let teacherRows: typeof teachers.$inferSelect[] = [];
  let studentStoryRows: typeof studentStories.$inferSelect[] = [];
  let detailRows: typeof courseDetails.$inferSelect[] = [];
  let settingRows: typeof siteSettings.$inferSelect[] = [];
  try {
    await ensureSchema();
    const db = getDb();
    [leads, docs, students, bookings, baseCourseRows, offerRows, teacherRows, studentStoryRows, detailRows, settingRows] = await Promise.all([
      db.select().from(enquiries).orderBy(desc(enquiries.createdAt)).limit(100),
      db.select().from(documents).orderBy(desc(documents.createdAt)).limit(100),
      db.select().from(profiles).orderBy(desc(profiles.updatedAt)).limit(100),
      db.select().from(appointments).orderBy(desc(appointments.createdAt)).limit(100),
      db.select().from(courses).orderBy(asc(courses.sortOrder)),
      db.select().from(offers).orderBy(asc(offers.sortOrder)),
      db.select().from(teachers).orderBy(asc(teachers.sortOrder)),
      db.select().from(studentStories).orderBy(asc(studentStories.sortOrder)),
      db.select().from(courseDetails),
      db.select().from(siteSettings),
    ]);
  } catch { leads = []; docs = []; students = []; bookings = []; baseCourseRows = []; offerRows = []; teacherRows = []; studentStoryRows = []; detailRows = []; settingRows = []; }

  const detailMap = new Map(detailRows.map(row => [row.courseId,row]));
  const courseRows:Array<typeof courses.$inferSelect & CourseDetailContent> = baseCourseRows.map(course => ({ ...course, ...courseDetailFor(course.title), ...detailMap.get(course.id) }));
  return <AdminClient adminName={admin.displayName} signOut={authSignOutPath("/")} leads={leads} documents={docs} students={students} appointments={bookings} courses={courseRows} offers={offerRows} teachers={teacherRows} studentStories={studentStoryRows} siteSettings={mergeSiteSettings(settingRows)}/>;
}
