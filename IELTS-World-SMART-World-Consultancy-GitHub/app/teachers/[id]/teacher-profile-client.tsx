"use client";

import Link from "next/link";
import { LanguageSwitcher, useSiteLanguage } from "../../components/SiteLanguage";

type Teacher = {
  id: number; name: string; profession: string; organization: string | null; qualifications: string;
  experience: string; expertise: string; bio: string; achievements: string | null; hasPhoto: boolean;
};

export function TeacherProfileClient({ teacher }: { teacher: Teacher | null }) {
  const { language } = useSiteLanguage();
  const bn = language === "bn";
  if (!teacher) return <main className="legal"><div className="legal-top"><Link className="brand" href="/"><img className="brand-mark" src="/brand-logo.png" alt="IELTS World & SMART World Consultancy logo"/><span>IELTS World &amp; SMART World Consultancy</span></Link><LanguageSwitcher/></div><h1>{bn ? "শিক্ষকের প্রোফাইল পাওয়া যায়নি" : "Teacher profile unavailable"}</h1><p>{bn ? "প্রোফাইলটি প্রকাশিত হয়নি অথবা খুঁজে পাওয়া যায়নি।" : "This profile is not published or could not be found."}</p><Link className="btn btn-blue" href="/#teachers">← {bn ? "শিক্ষকদের দেখুন" : "View teachers"}</Link></main>;

  const expertise = teacher.expertise.split(/[,\n]/).map(item => item.trim()).filter(Boolean);
  const qualifications = teacher.qualifications.split(/\n/).map(item => item.trim()).filter(Boolean);
  const achievements = teacher.achievements?.split(/\n/).map(item => item.trim()).filter(Boolean) || [];
  return <main className="teacher-profile-page"><div className="teacher-profile-top"><Link className="brand" href="/"><img className="brand-mark" src="/brand-logo.png" alt="IELTS World & SMART World Consultancy logo"/><span>IELTS World &amp; SMART World Consultancy</span></Link><div className="teacher-profile-actions"><LanguageSwitcher/><Link className="btn btn-light" href="/#teachers">← {bn ? "শিক্ষকদের কাছে ফিরুন" : "Back to teachers"}</Link></div></div><article className="teacher-profile-shell"><aside className="teacher-profile-summary"><div className="teacher-profile-photo">{teacher.hasPhoto ? <img src={`/api/media?kind=teacher&id=${teacher.id}`} alt={`${teacher.name}, ${teacher.profession}`}/> : <span>{teacher.name.slice(0, 2).toUpperCase()}</span>}</div><span className="kicker">{teacher.profession}</span><h1>{teacher.name}</h1>{teacher.organization && <p>{teacher.organization}</p>}<strong>{teacher.experience}</strong><div className="teacher-expertise">{expertise.map(item => <span key={item}>{item}</span>)}</div></aside><div className="teacher-profile-content"><section><span className="kicker">{bn ? "শিক্ষক পরিচিতি" : "ABOUT THE EDUCATOR"}</span><h2>{bn ? "পেশাগত জীবনী" : "Professional biography"}</h2><p>{teacher.bio}</p></section><section><h2>{bn ? "যোগ্যতা" : "Qualifications"}</h2><ul>{qualifications.map(item => <li key={item}>{item}</li>)}</ul></section>{achievements.length > 0 && <section><h2>{bn ? "অর্জন ও সনদ" : "Achievements & credentials"}</h2><ul>{achievements.map(item => <li key={item}>{item}</li>)}</ul></section>}<div className="teacher-profile-cta"><div><h2>{bn ? `${teacher.name}-এর সাথে শিখুন` : `Learn with ${teacher.name}`}</h2><p>{bn ? "কোর্সের বিস্তারিত ও ব্যাচের আসন জানতে কাউন্সেলিংয়ের অনুরোধ করুন।" : "Request counselling to learn about course details and batch availability."}</p></div><Link className="btn btn-primary" href="/#contact">{bn ? "যোগাযোগ করুন" : "Contact us"}</Link></div></div></article></main>;
}
