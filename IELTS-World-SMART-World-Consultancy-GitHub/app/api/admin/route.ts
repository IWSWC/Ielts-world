import { eq } from "drizzle-orm";
import { requireAdminApi } from "../../admin-access";
import { allowRequest } from "../../rate-limit";
import { ensureSchema, getDb } from "../../../db";
import {
  appointments,
  auditLogs,
  courseDetails,
  courses,
  documents,
  enquiries,
  notifications,
  offers,
  profiles,
  siteSettings,
} from "../../../db/schema";
import { siteSettingKeys, type SiteSettings } from "../../site-settings";

const documentStatuses = new Set(["Pending Review", "Approved", "Rejected", "Needs Changes"]);
const enquiryStatuses = new Set(["new", "contacted", "converted", "closed"]);
const applicationStatuses = new Set(["Profile Created", "Documents Pending", "Under Review", "Application Submitted", "Offer Received", "Visa Processing", "Visa Approved", "Closed"]);
const appointmentStatuses = new Set(["Requested", "Confirmed", "Completed", "Cancelled"]);
const visualSettingOptions:Partial<Record<keyof SiteSettings,Set<string>>> = {
  templatePreset:new Set(["ocean-premium","executive-blue","crystal-white"]),
  cardEffect:new Set(["water-3d","glass","solid-3d","minimal"]),
  buttonEffect:new Set(["raised-3d","glass","flat"]),
  iconStyle:new Set(["crystal","orb","minimal"]),
  animationLevel:new Set(["none","subtle","dynamic"]),
  navbarStyle:new Set(["glass","solid"]),
  headingWeight:new Set(["700","800","900"]),
  headingCase:new Set(["normal","uppercase"]),
  courseColumns:new Set(["2","3","4"]),
  contentWidth:new Set(["1080","1180","1320"]),
  sectionSpacing:new Set(["64","86","108"]),
  waterIntensity:new Set(["off","calm","medium","vivid"]),
};

const clean = (value: unknown, max = 300) => String(value ?? "").trim().slice(0, max);
const validId = (value: unknown) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;
  try {
    await ensureSchema();
    if (!(await allowRequest(`admin:${auth.user.userId}`, 180, 60 * 60 * 1000))) return Response.json({ error: "Too many admin updates. Try again later." }, { status: 429 });
    const payload = await request.json() as Record<string, unknown>;
    const action = clean(payload.action, 50);
    const db = getDb();
    let result: unknown = null;
    let targetId: string | null = null;

    if (action === "updateDocument") {
      const id = validId(payload.id); const status = clean(payload.status, 40); const adminNote = clean(payload.adminNote, 500) || null;
      if (!id || !documentStatuses.has(status)) return Response.json({ error: "Invalid document update." }, { status: 400 });
      const current = (await db.select().from(documents).where(eq(documents.id, id)).limit(1))[0];
      if (!current) return Response.json({ error: "Document not found." }, { status: 404 });
      [result] = await db.update(documents).set({ status, adminNote }).where(eq(documents.id, id)).returning();
      await db.insert(notifications).values({ userId: current.userId, title: `Document ${status}`, message: adminNote || `${current.filename} is now marked ${status}.` });
      targetId = String(id);
    } else if (action === "updateEnquiry") {
      const id = validId(payload.id); const status = clean(payload.status, 30); const assignedTo = clean(payload.assignedTo, 100) || null;
      if (!id || !enquiryStatuses.has(status)) return Response.json({ error: "Invalid enquiry update." }, { status: 400 });
      [result] = await db.update(enquiries).set({ status, assignedTo }).where(eq(enquiries.id, id)).returning(); targetId = String(id);
    } else if (action === "updateProfile") {
      const userId = clean(payload.userId, 160); const applicationStatus = clean(payload.applicationStatus, 60);
      if (!userId || !applicationStatuses.has(applicationStatus)) return Response.json({ error: "Invalid student update." }, { status: 400 });
      [result] = await db.update(profiles).set({ applicationStatus, updatedAt: new Date().toISOString() }).where(eq(profiles.userId, userId)).returning();
      await db.insert(notifications).values({ userId, title: "Application status updated", message: `Your application is now: ${applicationStatus}.` }); targetId = userId;
    } else if (action === "updateAppointment") {
      const id = validId(payload.id); const status = clean(payload.status, 30); const adminNote = clean(payload.adminNote, 500) || null;
      if (!id || !appointmentStatuses.has(status)) return Response.json({ error: "Invalid appointment update." }, { status: 400 });
      const current = (await db.select().from(appointments).where(eq(appointments.id, id)).limit(1))[0];
      if (!current) return Response.json({ error: "Appointment not found." }, { status: 404 });
      [result] = await db.update(appointments).set({ status, adminNote }).where(eq(appointments.id, id)).returning();
      await db.insert(notifications).values({ userId: current.userId, title: `Appointment ${status}`, message: adminNote || `Your ${current.service} appointment is now ${status}.` }); targetId = String(id);
    } else if (action === "saveCourse") {
      const id = validId(payload.id); const values = { icon: clean(payload.icon, 12) || "🎓", title: clean(payload.title, 100), description: clean(payload.description, 600), tags: clean(payload.tags, 120), active: Boolean(payload.active), sortOrder: Number(payload.sortOrder) || 0, updatedAt: new Date().toISOString() };
      if (!values.title || !values.description || !values.tags) return Response.json({ error: "Course title, description and tags are required." }, { status: 400 });
      const detailValues = {
        cardDescriptionBn:clean(payload.cardDescriptionBn,600) || clean(payload.description,600), tagsBn:clean(payload.tagsBn,120) || clean(payload.tags,120), subtitle:clean(payload.subtitle,240), subtitleBn:clean(payload.subtitleBn,240), overview:clean(payload.overview,3000), overviewBn:clean(payload.overviewBn,3000),
        duration:clean(payload.duration,100), schedule:clean(payload.schedule,160), level:clean(payload.level,140), fee:clean(payload.fee,120),
        modules:clean(payload.modules,3000), modulesBn:clean(payload.modulesBn,3000), outcomes:clean(payload.outcomes,3000), outcomesBn:clean(payload.outcomesBn,3000),
        requirements:clean(payload.requirements,2000), requirementsBn:clean(payload.requirementsBn,2000), updatedAt:new Date().toISOString(),
      };
      if (Object.values(detailValues).some(value => !value)) return Response.json({ error: "Complete all course-detail fields in English and Bangla." }, { status: 400 });
      if (id) [result] = await db.update(courses).set(values).where(eq(courses.id, id)).returning(); else [result] = await db.insert(courses).values(values).returning();
      if (!result) return Response.json({ error: "Course not found." }, { status: 404 });
      const courseId = (result as typeof courses.$inferSelect).id;
      await db.insert(courseDetails).values({ courseId, ...detailValues }).onConflictDoUpdate({ target:courseDetails.courseId, set:detailValues });
      result = { ...(result as object), ...detailValues };
      targetId = String(courseId);
    } else if (action === "saveOffer") {
      const id = validId(payload.id); const values = { title: clean(payload.title, 120), description: clean(payload.description, 600), buttonLabel: clean(payload.buttonLabel, 80), buttonHref: clean(payload.buttonHref, 200), active: Boolean(payload.active), sortOrder: Number(payload.sortOrder) || 0, updatedAt: new Date().toISOString() };
      if (!values.title || !values.description || !values.buttonLabel || !/^[/#]/.test(values.buttonHref)) return Response.json({ error: "Offer information or link is invalid." }, { status: 400 });
      if (id) [result] = await db.update(offers).set(values).where(eq(offers.id, id)).returning(); else [result] = await db.insert(offers).values(values).returning();
      targetId = id ? String(id) : "new";
    } else if (action === "saveSiteSettings") {
      const next:Record<string,string> = {};
      for (const key of siteSettingKeys) {
        const value = clean(payload[key], key.startsWith("theme") ? 20 : key.startsWith("phone") ? 30 : 1200);
        if (!value) return Response.json({ error: `Website setting ${key} is required.` }, { status:400 });
        if (key.startsWith("theme") && !/^#[0-9a-fA-F]{6}$/.test(value)) return Response.json({ error:"Theme colours must use a valid six-digit hex code." }, { status:400 });
        const allowed = visualSettingOptions[key];
        if (allowed && !allowed.has(value)) return Response.json({ error:`Website visual setting ${key} is invalid.` }, { status:400 });
        if (key === "cardRadius" && (!/^\d{1,2}$/.test(value) || Number(value) < 8 || Number(value) > 42)) return Response.json({ error:"Card radius must be between 8 and 42." }, { status:400 });
        if (key === "buttonRadius" && (!/^\d{1,2}$/.test(value) || Number(value) < 4 || Number(value) > 32)) return Response.json({ error:"Button radius must be between 4 and 32." }, { status:400 });
        next[key] = value;
      }
      const updatedAt = new Date().toISOString();
      for (const [key,value] of Object.entries(next)) await db.insert(siteSettings).values({ key,value,updatedAt }).onConflictDoUpdate({ target:siteSettings.key,set:{value,updatedAt} });
      result = next; targetId = "website";
    } else {
      return Response.json({ error: "Unknown admin action." }, { status: 400 });
    }

    if (!result) return Response.json({ error: "Record not found." }, { status: 404 });
    await db.insert(auditLogs).values({ actorId: auth.user.userId, action, targetId });
    return Response.json({ ok: true, result });
  } catch {
    return Response.json({ error: "Admin update failed." }, { status: 500 });
  }
}
