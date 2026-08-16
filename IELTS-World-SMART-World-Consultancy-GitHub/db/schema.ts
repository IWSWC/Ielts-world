import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const enquiries = sqliteTable("enquiries", {
  id: integer("id").primaryKey({ autoIncrement: true }), name: text("name").notNull(), phone: text("phone").notNull(), interest: text("interest").notNull(), status: text("status").notNull().default("new"), assignedTo: text("assigned_to"), createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
export const profiles = sqliteTable("profiles", {
  userId: text("user_id").primaryKey(), email: text("email").notNull(), fullName: text("full_name"), phone: text("phone"), destination: text("destination"), service: text("service"), applicationStatus: text("application_status").notNull().default("Profile Created"), updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
export const documents = sqliteTable("documents", {
  id: integer("id").primaryKey({ autoIncrement: true }), userId: text("user_id").notNull(), objectKey: text("object_key").notNull().unique(), filename: text("filename").notNull(), contentType: text("content_type").notNull(), size: integer("size").notNull(), category: text("category").notNull(), status: text("status").notNull().default("Pending Review"), adminNote: text("admin_note"), createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
export const auditLogs = sqliteTable("audit_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }), actorId: text("actor_id").notNull(), action: text("action").notNull(), targetId: text("target_id"), createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const appointments = sqliteTable("appointments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  service: text("service").notNull(),
  preferredDate: text("preferred_date"),
  message: text("message"),
  status: text("status").notNull().default("Requested"),
  adminNote: text("admin_note"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const verifiedContacts = sqliteTable("verified_contacts", {
  userId: text("user_id").primaryKey(),
  phone: text("phone").notNull(),
  verifiedAt: text("verified_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const courses = sqliteTable("courses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  icon: text("icon").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  tags: text("tags").notNull(),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const courseDetails = sqliteTable("course_details", {
  courseId: integer("course_id").primaryKey(),
  cardDescriptionBn: text("card_description_bn").notNull(),
  tagsBn: text("tags_bn").notNull(),
  subtitle: text("subtitle").notNull(),
  subtitleBn: text("subtitle_bn").notNull(),
  overview: text("overview").notNull(),
  overviewBn: text("overview_bn").notNull(),
  duration: text("duration").notNull(),
  schedule: text("schedule").notNull(),
  level: text("level").notNull(),
  fee: text("fee").notNull(),
  modules: text("modules").notNull(),
  modulesBn: text("modules_bn").notNull(),
  outcomes: text("outcomes").notNull(),
  outcomesBn: text("outcomes_bn").notNull(),
  requirements: text("requirements").notNull(),
  requirementsBn: text("requirements_bn").notNull(),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const siteSettings = sqliteTable("site_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const offers = sqliteTable("offers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  buttonLabel: text("button_label").notNull(),
  buttonHref: text("button_href").notNull(),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const notifications = sqliteTable("notifications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  readAt: text("read_at"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const rateLimits = sqliteTable("rate_limits", {
  bucketKey: text("bucket_key").primaryKey(),
  count: integer("count").notNull().default(0),
  resetAt: integer("reset_at").notNull(),
});

export const authUsers = sqliteTable("auth_users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash"),
  passwordSalt: text("password_salt"),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
  googleSub: text("google_sub").unique(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const authSessions = sqliteTable("auth_sessions", {
  tokenHash: text("token_hash").primaryKey(),
  userId: text("user_id").notNull(),
  expiresAt: integer("expires_at").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const authCodes = sqliteTable("auth_codes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull(),
  purpose: text("purpose").notNull(),
  codeHash: text("code_hash").notNull(),
  expiresAt: integer("expires_at").notNull(),
  attempts: integer("attempts").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const teachers = sqliteTable("teachers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  profession: text("profession").notNull(),
  organization: text("organization"),
  qualifications: text("qualifications").notNull(),
  experience: text("experience").notNull(),
  expertise: text("expertise").notNull(),
  bio: text("bio").notNull(),
  achievements: text("achievements"),
  photoObjectKey: text("photo_object_key"),
  photoContentType: text("photo_content_type"),
  consentConfirmed: integer("consent_confirmed", { mode: "boolean" }).notNull().default(false),
  active: integer("active", { mode: "boolean" }).notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const studentStories = sqliteTable("student_stories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  program: text("program").notNull(),
  destination: text("destination"),
  result: text("result"),
  quote: text("quote").notNull(),
  photoObjectKey: text("photo_object_key"),
  photoContentType: text("photo_content_type"),
  consentConfirmed: integer("consent_confirmed", { mode: "boolean" }).notNull().default(false),
  active: integer("active", { mode: "boolean" }).notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
