import { HomeExperience } from "./components/HomeExperience";
import { and, asc, eq } from "drizzle-orm";
import { ensureSchema, getDb } from "../db";
import { courseDetails as courseDetailsTable, courses as courseTable, offers as offerTable, siteSettings as siteSettingsTable, studentStories as studentStoryTable, teachers as teacherTable } from "../db/schema";
import { defaultCourses, defaultOffers, defaultStudentStories, type PublicTeacher } from "./site-content";
import { defaultSiteSettings, mergeSiteSettings, type SiteSettings } from "./site-settings";

export const dynamic = "force-dynamic";

export default async function Home() {
  let courses = defaultCourses;
  let offers = defaultOffers;
  let teachers: PublicTeacher[] = [];
  let studentStories = defaultStudentStories;
  let siteSettings:SiteSettings = { ...defaultSiteSettings };
  try {
    await ensureSchema();
    const db = getDb();
    const [courseRows, offerRows, teacherRows, studentStoryRows, settingRows, courseDetailRows] = await Promise.all([
      db.select().from(courseTable).where(eq(courseTable.active, true)).orderBy(asc(courseTable.sortOrder)),
      db.select().from(offerTable).where(eq(offerTable.active, true)).orderBy(asc(offerTable.sortOrder)),
      db.select().from(teacherTable).where(and(eq(teacherTable.active, true), eq(teacherTable.consentConfirmed, true))).orderBy(asc(teacherTable.sortOrder)),
      db.select().from(studentStoryTable).where(and(eq(studentStoryTable.active, true), eq(studentStoryTable.consentConfirmed, true))).orderBy(asc(studentStoryTable.sortOrder)),
      db.select().from(siteSettingsTable),
      db.select().from(courseDetailsTable),
    ]);
    const detailMap = new Map(courseDetailRows.map(row=>[row.courseId,row]));
    courses = courseRows.map(({ id, icon, title, description, tags }) => ({ id, icon, title, description, tags, descriptionBn:detailMap.get(id)?.cardDescriptionBn, tagsBn:detailMap.get(id)?.tagsBn }));
    offers = offerRows.map(({ id, title, description, buttonLabel, buttonHref }) => ({ id, title, description, buttonLabel, buttonHref }));
    teachers = teacherRows.map(({ id, name, profession, organization, qualifications, experience, expertise, bio, achievements, photoObjectKey }) => ({ id, name, profession, organization, qualifications, experience, expertise, bio, achievements, hasPhoto:Boolean(photoObjectKey) }));
    studentStories = studentStoryRows.map(({ id, name, program, destination, result, quote, photoObjectKey }) => ({ id, name, program, destination, result, quote, hasPhoto:Boolean(photoObjectKey) }));
    siteSettings = mergeSiteSettings(settingRows);
  } catch { courses = defaultCourses; offers = defaultOffers; teachers = []; studentStories = defaultStudentStories; siteSettings = { ...defaultSiteSettings }; }
  return <HomeExperience courses={courses} offers={offers} teachers={teachers} studentStories={studentStories} siteSettings={siteSettings} />;
}
