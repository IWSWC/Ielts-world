import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export function getDb() {
  const database = env.DB as unknown as D1Database | undefined;
  if (!database) {
    throw new Error(
      "Cloudflare D1 binding `DB` is unavailable. Set the `d1` field in .openai/hosting.json to `DB` or let your control plane inject the real binding values before using the database."
    );
  }

  return drizzle(database as Parameters<typeof drizzle>[0], { schema });
}

export async function ensureSchema() {
  const database = env.DB as unknown as {
    prepare(sql: string): unknown;
    batch(statements: unknown[]): Promise<unknown>;
  } | undefined;
  if (!database) throw new Error("Database unavailable");
  const statements = [
    `CREATE TABLE IF NOT EXISTS enquiries (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, phone TEXT NOT NULL, interest TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'new', assigned_to TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS profiles (user_id TEXT PRIMARY KEY NOT NULL, email TEXT NOT NULL, full_name TEXT, phone TEXT, destination TEXT, service TEXT, application_status TEXT NOT NULL DEFAULT 'Profile Created', updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS documents (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT NOT NULL, object_key TEXT NOT NULL UNIQUE, filename TEXT NOT NULL, content_type TEXT NOT NULL, size INTEGER NOT NULL, category TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'Pending Review', admin_note TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS audit_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, actor_id TEXT NOT NULL, action TEXT NOT NULL, target_id TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS appointments (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT NOT NULL, name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT NOT NULL, service TEXT NOT NULL, preferred_date TEXT, message TEXT, status TEXT NOT NULL DEFAULT 'Requested', admin_note TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS verified_contacts (user_id TEXT PRIMARY KEY NOT NULL, phone TEXT NOT NULL, verified_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS courses (id INTEGER PRIMARY KEY AUTOINCREMENT, icon TEXT NOT NULL, title TEXT NOT NULL, description TEXT NOT NULL, tags TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1, sort_order INTEGER NOT NULL DEFAULT 0, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS course_details (course_id INTEGER PRIMARY KEY NOT NULL, card_description_bn TEXT NOT NULL, tags_bn TEXT NOT NULL, subtitle TEXT NOT NULL, subtitle_bn TEXT NOT NULL, overview TEXT NOT NULL, overview_bn TEXT NOT NULL, duration TEXT NOT NULL, schedule TEXT NOT NULL, level TEXT NOT NULL, fee TEXT NOT NULL, modules TEXT NOT NULL, modules_bn TEXT NOT NULL, outcomes TEXT NOT NULL, outcomes_bn TEXT NOT NULL, requirements TEXT NOT NULL, requirements_bn TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS site_settings (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS offers (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, description TEXT NOT NULL, button_label TEXT NOT NULL, button_href TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1, sort_order INTEGER NOT NULL DEFAULT 0, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS notifications (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT NOT NULL, title TEXT NOT NULL, message TEXT NOT NULL, read_at TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS rate_limits (bucket_key TEXT PRIMARY KEY NOT NULL, count INTEGER NOT NULL DEFAULT 0, reset_at INTEGER NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS auth_users (id TEXT PRIMARY KEY NOT NULL, email TEXT NOT NULL UNIQUE, name TEXT NOT NULL, password_hash TEXT, password_salt TEXT, email_verified INTEGER NOT NULL DEFAULT 0, google_sub TEXT UNIQUE, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS auth_sessions (token_hash TEXT PRIMARY KEY NOT NULL, user_id TEXT NOT NULL, expires_at INTEGER NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS auth_codes (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL, purpose TEXT NOT NULL, code_hash TEXT NOT NULL, expires_at INTEGER NOT NULL, attempts INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS teachers (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, profession TEXT NOT NULL, organization TEXT, qualifications TEXT NOT NULL, experience TEXT NOT NULL, expertise TEXT NOT NULL, bio TEXT NOT NULL, achievements TEXT, photo_object_key TEXT, photo_content_type TEXT, consent_confirmed INTEGER NOT NULL DEFAULT 0, active INTEGER NOT NULL DEFAULT 0, sort_order INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS student_stories (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, program TEXT NOT NULL, destination TEXT, result TEXT, quote TEXT NOT NULL, photo_object_key TEXT, photo_content_type TEXT, consent_confirmed INTEGER NOT NULL DEFAULT 0, active INTEGER NOT NULL DEFAULT 0, sort_order INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_enquiries_status_created ON enquiries(status, created_at)`,
    `CREATE INDEX IF NOT EXISTS idx_appointments_user_created ON appointments(user_id, created_at)`,
    `CREATE INDEX IF NOT EXISTS idx_appointments_status_created ON appointments(status, created_at)`,
    `CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at)`,
    `CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_expiry ON auth_sessions(user_id, expires_at)`,
    `CREATE INDEX IF NOT EXISTS idx_auth_codes_lookup ON auth_codes(email, purpose, expires_at)`,
    `CREATE INDEX IF NOT EXISTS idx_teachers_active_sort ON teachers(active, consent_confirmed, sort_order)`,
    `CREATE INDEX IF NOT EXISTS idx_student_stories_active_sort ON student_stories(active, consent_confirmed, sort_order)`,
    `INSERT OR IGNORE INTO courses (id, icon, title, description, tags, active, sort_order) VALUES (1, '🎯', 'IELTS Preparation', 'Academic ও General—চারটি module-এর পূর্ণাঙ্গ প্রস্তুতি, mock test এবং ব্যক্তিগত feedback।', 'Regular · Weekend', 1, 1)`,
    `INSERT OR IGNORE INTO courses (id, icon, title, description, tags, active, sort_order) VALUES (2, '⚡', 'PTE Academic', 'AI-scored practice, exam strategy এবং দ্রুত score improvement-এর intensive course।', 'Practice Lab · Mock', 1, 2)`,
    `INSERT OR IGNORE INTO courses (id, icon, title, description, tags, active, sort_order) VALUES (3, '🎓', 'OIETC / ELLT', 'UK admission-এর জন্য Oxford International English Test প্রস্তুতি ও application guidance।', 'A1 to Advanced', 1, 3)`,
    `INSERT OR IGNORE INTO courses (id, icon, title, description, tags, active, sort_order) VALUES (4, '💬', 'Spoken English', 'দৈনন্দিন ও professional communication-এ আত্মবিশ্বাস তৈরির practical course।', 'Beginner · Advanced', 1, 4)`,
    `INSERT OR IGNORE INTO courses (id, icon, title, description, tags, active, sort_order) VALUES (5, '🇯🇵', 'Japanese Language', 'জাপানে study ও career-এর লক্ষ্য নিয়ে N5–N4 ভিত্তিক ভাষা প্রশিক্ষণ।', 'N5 · N4', 1, 5)`,
    `INSERT OR IGNORE INTO courses (id, icon, title, description, tags, active, sort_order) VALUES (6, '🇰🇷', 'Korean Language', 'Korean communication ও future study/work pathway-এর structured programme।', 'Beginner · EPS', 1, 6)`,
    `INSERT OR IGNORE INTO offers (id, title, description, button_label, button_href, active, sort_order) VALUES (1, 'Free Profile Assessment', 'আপনার academic result, language score ও budget দেখে realistic destination shortlist করুন।', 'আজই শুরু করুন', '#contact', 1, 1)`,
    `PRAGMA optimize`,
  ];
  await database.batch(statements.map((statement) => database.prepare(statement)));
}
