import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("ships the bilingual branded public website and secure account entry", async () => {
  const [layout, home, language, analytics, firebaseModule, firebaseAuth, firebaseSession, auth, logo] = await Promise.all([
    source("app/layout.tsx"),
    source("app/components/HomeExperience.tsx"),
    source("app/components/SiteLanguage.tsx"),
    source("app/components/FirebaseAnalytics.tsx"),
    source("public/firebase-analytics.js"),
    source("public/firebase-auth.js"),
    source("app/api/auth/firebase-session/route.ts"),
    source("app/auth/auth-book.tsx"),
    access(new URL("public/brand-logo.png", root)),
  ]);

  assert.match(layout, /IELTS World & SMART World Consultancy/);
  assert.match(home, /HomeExperience/);
  assert.match(home, /PublicCourse/);
  assert.match(home, /Courses/);
  assert.match(home, /কোর্স/);
  assert.match(language, /localStorage/);
  assert.match(language, /LanguageSwitcher/);
  assert.match(language, /বাংলা/);
  assert.match(language, /closest<HTMLAnchorElement>\("a\.brand"\)/);
  assert.match(language, /window\.location\.assign\("\/#top"\)/);
  assert.match(layout, /FirebaseAnalytics/);
  assert.match(analytics, /firebase-analytics\.js/);
  assert.match(analytics, /iw-analytics-consent/);
  assert.match(firebaseModule, /ielts-a4c80/);
  assert.match(firebaseModule, /G-XELQ5XWY02/);
  assert.match(firebaseModule, /isSupported/);
  assert.match(firebaseModule, /ad_storage:"denied"/);
  assert.match(auth, /Continue securely/);
  assert.match(auth, /Continue with mobile OTP/);
  assert.match(auth, /Firebase Authentication/);
  assert.match(auth, /\/api\/auth\/firebase-session/);
  assert.match(auth, /window\.location\.assign\("\/#top"\)/);
  assert.doesNotMatch(auth, /from "next\/link"/);
  assert.match(auth, /type="password"/);
  assert.doesNotMatch(auth, /signin-with-chatgpt/i);
  assert.match(firebaseAuth, /createUserWithEmailAndPassword/);
  assert.match(firebaseAuth, /sendEmailVerification/);
  assert.doesNotMatch(auth, /Continue with Google|startGoogle|finishGoogle/);
  assert.doesNotMatch(firebaseAuth, /accounts:createAuthUri|accounts:signInWithIdp|iw-firebase-google-session|signInWithPopup/);
  assert.match(firebaseAuth, /signInWithPhoneNumber/);
  assert.match(firebaseAuth, /RecaptchaVerifier/);
  assert.match(firebaseSession, /accounts:lookup/);
  assert.match(firebaseSession, /attachSession/);
  assert.match(firebaseSession, /requestFingerprint/);
  assert.equal(logo, undefined);
});

test("includes the complete protected backend workflow", async () => {
  const [schema, adminApi, peopleApi, mediaApi, documentsApi, appointmentsApi, verificationApi, portal, authCore, emailVerification, firebaseSession] = await Promise.all([
    source("db/schema.ts"),
    source("app/api/admin/route.ts"),
    source("app/api/admin/people/route.ts"),
    source("app/api/media/route.ts"),
    source("app/api/documents/route.ts"),
    source("app/api/appointments/route.ts"),
    source("app/api/verification/phone/route.ts"),
    source("app/portal/portal-client.tsx"),
    source("app/auth-core.ts"),
    source("app/email-verification.ts"),
    source("app/api/auth/firebase-session/route.ts"),
  ]);

  for (const table of ["appointments", "verified_contacts", "courses", "course_details", "site_settings", "offers", "notifications", "rate_limits", "teachers", "student_stories", "auth_users", "auth_sessions", "auth_codes"]) assert.match(schema, new RegExp(table));
  assert.match(adminApi, /requireAdminApi/);
  assert.match(adminApi, /updateDocument/);
  assert.match(adminApi, /updateProfile/);
  assert.match(adminApi, /saveCourse/);
  assert.match(adminApi, /courseDetails/);
  assert.match(adminApi, /saveSiteSettings/);
  assert.match(peopleApi, /requireAdminApi/);
  assert.match(peopleApi, /consentConfirmed/);
  assert.match(peopleApi, /MAX_PHOTO_SIZE/);
  assert.match(peopleApi, /public\/\$\{kind === "teacher" \? "teachers" : "students"\}/);
  assert.match(mediaApi, /consentConfirmed/);
  assert.match(mediaApi, /getAdminUser/);
  assert.match(documentsApi, /document\.userId !== user\.userId && !admin/);
  assert.match(appointmentsApi, /allowRequest/);
  assert.match(verificationApi, /TWILIO_VERIFY_SERVICE_SID/);
  assert.match(authCore, /PBKDF2/);
  assert.match(authCore, /HttpOnly/);
  assert.match(authCore, /210_000/);
  assert.match(emailVerification, /RESEND_API_KEY/);
  assert.match(emailVerification, /10 \* 60 \* 1000/);
  await assert.rejects(access(new URL("app/api/auth/google/start/route.ts", root)));
  await assert.rejects(access(new URL("app/api/auth/google/callback/route.ts", root)));
  assert.match(firebaseSession, /identitytoolkit\.googleapis\.com/);
  assert.match(firebaseSession, /emailVerified/);
  assert.match(firebaseSession, /HttpOnly|attachSession/);
  assert.match(portal, /Request appointment/);
  assert.match(portal, /Account verification/);
});

test("ships professional course pages and an editable website design studio", async () => {
  const [home, coursePage, courseClient, courseIcon, adminClient, settings, layout, styles] = await Promise.all([
    source("app/components/HomeExperience.tsx"),
    source("app/courses/[id]/page.tsx"),
    source("app/courses/[id]/course-detail-client.tsx"),
    source("app/components/CourseIcon.tsx"),
    source("app/admin/admin-client.tsx"),
    source("app/site-settings.ts"),
    source("app/layout.tsx"),
    source("app/globals.css"),
  ]);

  assert.match(home, /\/courses\/\$\{c\.id\}/);
  assert.match(coursePage, /courseDetails/);
  assert.match(courseClient, /Course modules/);
  assert.match(courseClient, /LEARNING OUTCOMES/);
  assert.match(courseClient, /CourseIcon/);
  assert.match(courseIcon, /data-course-icon/);
  assert.match(adminClient, /Courses & detail pages/);
  assert.match(adminClient, /FRONTEND DESIGN STUDIO/);
  assert.match(adminClient, /3D water glass/);
  assert.match(adminClient, /Save all website customization/);
  assert.match(adminClient, /saveSiteSettings/);
  assert.match(settings, /themeNavy/);
  assert.match(settings, /cardEffect:"water-3d"/);
  assert.match(settings, /buttonEffect:"raised-3d"/);
  assert.match(settings, /headingWeight:"900"/);
  assert.match(layout, /data-card-effect/);
  assert.match(layout, /data-button-effect/);
  assert.match(styles, /Premium 3D water-glass cards/);
  assert.match(styles, /waterCaustic/);
});

test("publishes consent-approved teacher profiles and student stories", async () => {
  const [home, teacherPage, teacherClient, adminClient] = await Promise.all([
    source("app/components/HomeExperience.tsx"),
    source("app/teachers/[id]/page.tsx"),
    source("app/teachers/[id]/teacher-profile-client.tsx"),
    source("app/admin/admin-client.tsx"),
  ]);

  assert.match(home, /MEET OUR EDUCATORS/);
  assert.match(home, /studentStories/);
  assert.match(teacherPage, /consentConfirmed/);
  assert.match(teacherClient, /Qualifications/);
  assert.match(teacherClient, /Achievements/);
  assert.match(teacherClient, /যোগ্যতা/);
  assert.match(adminClient, /Teachers & Stories/);
  assert.match(adminClient, /Written consent confirmed/);
  assert.match(adminClient, /Publish on website/);
});
