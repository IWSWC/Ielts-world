"use client";

import { BookLoginLink } from "./BookLoginLink";
import { CourseIcon } from "./CourseIcon";
import { LanguageSwitcher, useSiteLanguage } from "./SiteLanguage";
import { defaultCourses, defaultOffers, defaultStudentStories, type PublicCourse, type PublicOffer, type PublicStudentStory, type PublicTeacher } from "../site-content";
import { defaultSiteSettings, type SiteSettings } from "../site-settings";

const text = {
  en: {
    location: "📍 Narayanganj, Dhaka · Sat–Thu, 9:00 AM–8:00 PM",
    nav: ["Courses", "Teachers", "Study Abroad", "Services", "Success Stories", "Contact"],
    login: "Login", apply: "Apply",
    hero: "Experienced guidance, a transparent process and personal care at every step—from IELTS preparation to university applications and visas.",
    counselling: "Book free counselling →", viewCourses: "View courses",
    destination: "Destinations", languageCourses: "Language Courses", counsellingShort: "Counselling",
    courseTitle: <>Preparation designed<br/>around your goals</>,
    courseLead: "A structured curriculum, experienced trainers, regular mock tests and personal feedback that make learning effective.",
    teacherTitle: <>Meet our experienced<br/>educators</>,
    teacherLead: "Explore verified qualifications, professional experience and subject expertise to find the right instructor for you.",
    profile: "View full profile →", teacherEmpty: "Teacher profiles are being prepared", teacherEmptyText: "Verified teacher information and approved photos will appear here soon.",
    abroadTitle: "Your dream destination", abroadLead: "A clear, responsible and trackable application journey—from course selection to visa submission.",
    servicesTitle: "Complete support in one place",
    services: [
      ["Course & Country Selection", "Choose the right option based on your profile, budget and career goals."],
      ["Application & Documents", "Application forms, SOPs, document checklists and submission support."],
      ["Visa Guidance", "Process-focused support for student, visit, Hajj and Umrah visas."],
      ["Travel Support", "Air tickets, foreign tours and pre-departure briefing arrangements."],
    ],
    successTitle: "Stories of success", successLead: "Consent-approved student photos, course journeys and achievements—in their own words.",
    storyEmpty: "Student stories are being prepared", storyEmptyText: "Only consent-approved student photos and success stories will be published here.",
    nextTitle: "Start planning your future today", call: "Call now",
    footer: "English language, overseas education and visa consultancy—all on one trusted platform.",
    footerCourses: "Courses", footerServices: "Services", footerInfo: "Information",
  },
  bn: {
    location: "📍 নারায়ণগঞ্জ, ঢাকা · শনি–বৃহস্পতি, সকাল ৯টা–রাত ৮টা",
    nav: ["কোর্স", "শিক্ষক", "বিদেশে পড়াশোনা", "সেবা", "সাফল্যের গল্প", "যোগাযোগ"],
    login: "লগইন", apply: "আবেদন",
    hero: "IELTS থেকে বিশ্ববিদ্যালয়ে আবেদন ও ভিসা—আপনার আন্তর্জাতিক যাত্রার প্রতিটি ধাপে অভিজ্ঞ গাইডেন্স, স্বচ্ছ প্রক্রিয়া এবং ব্যক্তিগত যত্ন।",
    counselling: "ফ্রি কাউন্সেলিং বুক করুন →", viewCourses: "কোর্স দেখুন",
    destination: "গন্তব্য", languageCourses: "ভাষা কোর্স", counsellingShort: "কাউন্সেলিং",
    courseTitle: <>আপনার লক্ষ্য অনুযায়ী<br/>সঠিক প্রস্তুতি</>,
    courseLead: "পরিকল্পিত কারিকুলাম, অভিজ্ঞ প্রশিক্ষক, নিয়মিত মক টেস্ট এবং ব্যক্তিগত ফিডব্যাক—যাতে শেখা সত্যিই ফলপ্রসূ হয়।",
    teacherTitle: <>অভিজ্ঞ শিক্ষকদের<br/>পরিচিতি</>,
    teacherLead: "যোগ্যতা, পেশাগত অভিজ্ঞতা ও বিষয়ভিত্তিক দক্ষতা যাচাই করে আপনার জন্য সঠিক প্রশিক্ষক সম্পর্কে জানুন।",
    profile: "সম্পূর্ণ প্রোফাইল দেখুন →", teacherEmpty: "শিক্ষকদের প্রোফাইল প্রস্তুত করা হচ্ছে", teacherEmptyText: "যাচাইকৃত তথ্য ও অনুমোদিত ছবি শিগগিরই এখানে দেখা যাবে।",
    abroadTitle: "আপনার স্বপ্নের গন্তব্য", abroadLead: "কোর্স নির্বাচন থেকে ভিসা জমা—একটি পরিষ্কার, দায়িত্বশীল ও অনুসরণযোগ্য আবেদন প্রক্রিয়া।",
    servicesTitle: "এক জায়গায় সম্পূর্ণ সেবা",
    services: [
      ["কোর্স ও দেশ নির্বাচন", "আপনার প্রোফাইল, বাজেট এবং ক্যারিয়ারের লক্ষ্য অনুযায়ী সঠিক বিকল্প নির্বাচন।"],
      ["আবেদন ও কাগজপত্র", "আবেদনপত্র, SOP, কাগজপত্রের তালিকা ও জমা দেওয়ার সহায়তা।"],
      ["ভিসা গাইডেন্স", "স্টুডেন্ট, ভিজিট, হজ ও ওমরাহ ভিসার জন্য প্রক্রিয়াভিত্তিক সহায়তা।"],
      ["ভ্রমণ সহায়তা", "এয়ার টিকিট, বিদেশ ভ্রমণ এবং যাত্রাপূর্ব ব্রিফিংয়ের ব্যবস্থা।"],
    ],
    successTitle: "সাফল্যের গল্প", successLead: "শিক্ষার্থীদের অনুমোদিত ছবি, কোর্সের যাত্রা এবং অর্জন—তাদের নিজের অভিজ্ঞতা থেকে।",
    storyEmpty: "শিক্ষার্থীদের গল্প প্রস্তুত করা হচ্ছে", storyEmptyText: "শুধু সম্মতিপ্রাপ্ত শিক্ষার্থীদের ছবি ও সাফল্যের গল্প এখানে প্রকাশ করা হবে।",
    nextTitle: "আজই আপনার পরিকল্পনা শুরু করুন", call: "এখনই কল করুন",
    footer: "ইংরেজি ভাষা, বিদেশে শিক্ষা এবং ভিসা পরামর্শ—একটি বিশ্বস্ত প্ল্যাটফর্মে।",
    footerCourses: "কোর্স", footerServices: "সেবা", footerInfo: "তথ্য",
  },
} as const;

const banglaCourses: Record<string, { description: string; tags?: string }> = {
  "IELTS Preparation": { description: "Academic ও General—চারটি মডিউলের পূর্ণাঙ্গ প্রস্তুতি, মক টেস্ট এবং ব্যক্তিগত ফিডব্যাক।", tags: "নিয়মিত · সাপ্তাহিক ছুটি" },
  "PTE Academic": { description: "AI-ভিত্তিক অনুশীলন, পরীক্ষার কৌশল এবং দ্রুত স্কোর উন্নয়নের নিবিড় কোর্স।", tags: "প্র্যাকটিস ল্যাব · মক" },
  "OIETC / ELLT": { description: "UK-তে ভর্তির জন্য Oxford International English Test প্রস্তুতি ও আবেদন গাইডেন্স।", tags: "A1 থেকে Advanced" },
  "Spoken English": { description: "দৈনন্দিন ও পেশাগত যোগাযোগে আত্মবিশ্বাস তৈরির ব্যবহারিক কোর্স।", tags: "Beginner · Advanced" },
  "Japanese Language": { description: "জাপানে পড়াশোনা ও ক্যারিয়ারের লক্ষ্য নিয়ে N5–N4 ভিত্তিক ভাষা প্রশিক্ষণ।" },
  "Korean Language": { description: "ভবিষ্যৎ পড়াশোনা ও কাজের জন্য পরিকল্পিত কোরিয়ান ভাষা কোর্স।", tags: "Beginner · EPS" },
};

export function HomeExperience({ courses = defaultCourses, offers = defaultOffers, teachers = [], studentStories = defaultStudentStories, siteSettings = defaultSiteSettings }: { courses?: PublicCourse[]; offers?: PublicOffer[]; teachers?: PublicTeacher[]; studentStories?: PublicStudentStory[]; siteSettings?: SiteSettings }) {
  const { language } = useSiteLanguage();
  const t = text[language];
  const s = siteSettings;
  const setting = (english:keyof SiteSettings,bangla:keyof SiteSettings) => s[language === "bn" ? bangla : english];
  const initials = (name: string) => name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase();
  const localCourse = (course: PublicCourse) => language === "bn" ? { ...course, ...(banglaCourses[course.title] || {}), ...(course.descriptionBn ? {description:course.descriptionBn} : {}), ...(course.tagsBn ? {tags:course.tagsBn} : {}) } : course;
  const localOffer = (offer: PublicOffer) => {
    if (offer.title !== "Free Profile Assessment") return offer;
    return language === "bn"
      ? { ...offer, title: "ফ্রি প্রোফাইল মূল্যায়ন", description: "আপনার একাডেমিক ফলাফল, ভাষার স্কোর ও বাজেট দেখে বাস্তবসম্মত গন্তব্যের তালিকা তৈরি করুন।", buttonLabel: "আজই শুরু করুন" }
      : { ...offer, title: "Free Profile Assessment", description: "Get a realistic destination shortlist based on your academic results, language score and budget.", buttonLabel: "Start today" };
  };

  return <>
    <div className="topbar"><div className="container"><span>📍 {setting("addressEn","addressBn")} · {language === "bn" ? "শনি–বৃহস্পতি, সকাল ৯টা–রাত ৮টা" : "Sat–Thu, 9:00 AM–8:00 PM"}</span><span>☎ {s.phonePrimary} · {s.phoneSecondary}</span></div></div>
    <header className="navbar"><div className="container nav-inner"><a className="brand" href="#top"><img className="brand-mark" src="/brand-logo.png" alt="IELTS World & SMART World Consultancy logo"/><span><em>IELTS</em> World & SMART World Consultancy<small>EDUCATION · LANGUAGE · VISA</small></span></a><nav className="navlinks" aria-label="Main navigation"><a href="#courses">{t.nav[0]}</a><a href="#teachers">{t.nav[1]}</a><a href="#abroad">{t.nav[2]}</a><a href="#services">{t.nav[3]}</a><a href="#success">{t.nav[4]}</a><a href="#contact">{t.nav[5]}</a><BookLoginLink label={t.login}/></nav><LanguageSwitcher/><span className="mobile-book"><BookLoginLink label={t.login}/></span><a className="btn btn-primary mobile-cta" href="#contact">{t.apply}</a></div></header>
    <main id="top">
      <section className="hero"><div className="container hero-grid"><div><span className="eyebrow">● ADMISSIONS OPEN · 2026 INTAKE</span><h1>{setting("heroTitle1En","heroTitle1Bn")}<br/><span>{setting("heroTitle2En","heroTitle2Bn")}</span><br/>{setting("heroTitle3En","heroTitle3Bn")}</h1><p>{setting("heroDescriptionEn","heroDescriptionBn")}</p><div className="hero-actions"><a className="btn btn-primary" href="#contact">{t.counselling}</a><a className="btn btn-light" href="#courses">{t.viewCourses}</a></div><div className="hero-trust"><div><strong>10+</strong>{t.destination}</div><div><strong>6</strong>{t.languageCourses}</div><div><strong>1:1</strong>{t.counsellingShort}</div></div></div></div></section>
      <div className="ticker"><div className="container ticker-track">{offers.length ? offers.map(offer => <span key={offer.id}>🔥 {localOffer(offer).title}</span>) : <span>✦ 2026 Intake Applications Open</span>}<span>✦ 2026 Intake Applications Open</span></div></div>
      <section className="section" id="courses"><div className="container"><div className="section-head"><div><span className="kicker">LANGUAGE ACADEMY</span><h2>{setting("coursesTitleEn","coursesTitleBn")}</h2></div><p className="section-lead">{setting("coursesLeadEn","coursesLeadBn")}</p></div><div className="grid course-grid">{courses.map((course,index) => { const c = localCourse(course); return <a className="course-card-link" href={`/courses/${c.id}`} key={c.id} style={{animationDelay:`${index*70}ms`}}><article className="course"><CourseIcon title={c.title} fallback={c.icon}/><h3>{c.title}</h3><p>{c.description}</p><div className="course-card-footer"><span className="tag">{c.tags}</span><strong>{language === "bn" ? "বিস্তারিত →" : "Explore →"}</strong></div></article></a>; })}</div></div></section>
      <section className="section alt" id="teachers"><div className="container"><div className="section-head"><div><span className="kicker">MEET OUR EDUCATORS</span><h2>{setting("teachersTitleEn","teachersTitleBn")}</h2></div><p className="section-lead">{setting("teachersLeadEn","teachersLeadBn")}</p></div>{teachers.length ? <div className="teacher-grid">{teachers.map(teacher => <article className="teacher-card" key={teacher.id}><div className="teacher-photo">{teacher.hasPhoto ? <img src={`/api/media?kind=teacher&id=${teacher.id}`} alt={`${teacher.name}, ${teacher.profession}`}/> : <span>{initials(teacher.name)}</span>}</div><div className="teacher-card-body"><span className="kicker">{teacher.profession}</span><h3>{teacher.name}</h3>{teacher.organization && <p className="teacher-organization">{teacher.organization}</p>}<p>{teacher.experience}</p><div className="teacher-expertise">{teacher.expertise.split(/[,\n]/).filter(Boolean).slice(0, 3).map(item => <span key={item}>{item.trim()}</span>)}</div><a className="text-link" href={`/teachers/${teacher.id}`}>{t.profile}</a></div></article>)}</div> : <div className="empty-showcase"><span>👩‍🏫</span><h3>{t.teacherEmpty}</h3><p>{t.teacherEmptyText}</p></div>}</div></section>
      <section className="section alt" id="abroad"><div className="container"><div className="section-head"><div><span className="kicker">GLOBAL OPPORTUNITIES</span><h2>{setting("abroadTitleEn","abroadTitleBn")}</h2></div><p className="section-lead">{setting("abroadLeadEn","abroadLeadBn")}</p></div><div className="countries">{["🇬🇧 UK", "🇨🇦 Canada", "🇺🇸 USA", "🇦🇺 Australia", "🇳🇿 New Zealand", "🇯🇵 Japan", "🇰🇷 Korea", "🇲🇾 Malaysia", "🇨🇾 Cyprus", "🇦🇪 Dubai"].map(country => <span className="country" key={country}>{country}</span>)}</div><div className="offer-list">{offers.map(raw => { const offer = localOffer(raw); return <div className="offer-card" key={offer.id}><div><h3>{offer.title}</h3><p>{offer.description}</p></div><a className="btn btn-light" href={offer.buttonHref}>{offer.buttonLabel}</a></div>; })}</div></div></section>
      <section className="section" id="services"><div className="container"><div className="section-head"><div><span className="kicker">END-TO-END SUPPORT</span><h2>{setting("servicesTitleEn","servicesTitleBn")}</h2></div></div><div className="grid steps">{t.services.map(([title, description]) => <article className="step" key={title}><h3>{title}</h3><p>{description}</p></article>)}</div></div></section>
      <section className="section alt" id="success"><div className="container"><div className="section-head"><div><span className="kicker">STUDENT VOICES</span><h2>{setting("successTitleEn","successTitleBn")}</h2></div><p className="section-lead">{setting("successLeadEn","successLeadBn")}</p></div>{studentStories.length ? <div className="grid testimonials">{studentStories.map(story => <article className="quote student-story" key={story.id}><div className="student-story-photo">{story.hasPhoto ? <img src={`/api/media?kind=student&id=${story.id}`} alt={`${story.name} student profile`}/> : <span>{initials(story.name)}</span>}</div><p>“{story.quote}”</p>{story.result && <strong className="story-result">{story.result}</strong>}<div className="person"><span>{story.name}<small>{[story.program, story.destination].filter(Boolean).join(" · ")}</small></span></div></article>)}</div> : <div className="empty-showcase"><span>🎓</span><h3>{t.storyEmpty}</h3><p>{t.storyEmptyText}</p></div>}</div></section>
      <section className="section" id="contact"><div className="container"><div className="cta"><div><span className="kicker">YOUR NEXT STEP</span><h2>{setting("ctaTitleEn","ctaTitleBn")}</h2><p>📍 {setting("addressEn","addressBn")} · ☎ {s.phonePrimary}, {s.phoneSecondary}</p></div><div className="hero-actions"><a className="btn btn-primary" href={`tel:+88${s.phonePrimary.replace(/\D/g,"")}`}>{t.call}</a><a className="btn btn-light" href={`https://wa.me/88${s.phonePrimary.replace(/\D/g,"")}`}>WhatsApp</a></div></div></div></section>
    </main>
    <footer className="footer"><div className="container"><div className="footer-grid"><div><a className="brand" href="#top"><img className="brand-mark" src="/brand-logo.png" alt="IELTS World & SMART World Consultancy logo"/><span><em>IELTS</em> World & SMART World Consultancy</span></a><p style={{ lineHeight: 1.8 }}>{setting("footerDescriptionEn","footerDescriptionBn")}</p></div><div><h4>{t.footerCourses}</h4><a href="#courses">IELTS</a><a href="#courses">PTE & OIETC</a><a href="#courses">Spoken English</a><a href="#courses">Japanese & Korean</a></div><div><h4>{t.footerServices}</h4><a href="#abroad">Study Abroad</a><a href="#services">Visa Guidance</a><a href="#services">Air Ticket & Tour</a><a href="/portal">Student Portal</a></div><div><h4>{t.footerInfo}</h4><a href="/privacy">Privacy Policy</a><a href="/terms">Terms of Service</a><BookLoginLink admin label={language === "bn" ? "অ্যাডমিন" : "Admin"}/></div></div><div className="copyright"><span>© 2026 IELTS World & SMART World Consultancy</span><span>www.ieltsworldedu.com</span></div></div></footer>
  </>;
}
