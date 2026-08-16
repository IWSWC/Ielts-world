export const defaultSiteSettings = {
  heroTitle1En:"Learn English.", heroTitle2En:"Study the world.", heroTitle3En:"Build your future.",
  heroTitle1Bn:"ইংরেজি শিখুন।", heroTitle2Bn:"বিশ্বজুড়ে পড়ুন।", heroTitle3Bn:"ভবিষ্যৎ গড়ুন।",
  heroDescriptionEn:"Experienced guidance, a transparent process and personal care at every step—from IELTS preparation to university applications and visas.",
  heroDescriptionBn:"IELTS থেকে বিশ্ববিদ্যালয়ে আবেদন ও ভিসা—আপনার আন্তর্জাতিক যাত্রার প্রতিটি ধাপে অভিজ্ঞ গাইডেন্স, স্বচ্ছ প্রক্রিয়া এবং ব্যক্তিগত যত্ন।",
  coursesTitleEn:"Preparation designed around your goals", coursesTitleBn:"আপনার লক্ষ্য অনুযায়ী সঠিক প্রস্তুতি",
  coursesLeadEn:"A structured curriculum, experienced trainers, regular mock tests and personal feedback that make learning effective.", coursesLeadBn:"পরিকল্পিত কারিকুলাম, অভিজ্ঞ প্রশিক্ষক, নিয়মিত মক টেস্ট এবং ব্যক্তিগত ফিডব্যাক—যাতে শেখা সত্যিই ফলপ্রসূ হয়।",
  teachersTitleEn:"Meet our experienced educators", teachersTitleBn:"অভিজ্ঞ শিক্ষকদের পরিচিতি",
  teachersLeadEn:"Explore verified qualifications, professional experience and subject expertise to find the right instructor for you.", teachersLeadBn:"যোগ্যতা, পেশাগত অভিজ্ঞতা ও বিষয়ভিত্তিক দক্ষতা যাচাই করে আপনার জন্য সঠিক প্রশিক্ষক সম্পর্কে জানুন।",
  abroadTitleEn:"Your dream destination", abroadTitleBn:"আপনার স্বপ্নের গন্তব্য",
  abroadLeadEn:"A clear, responsible and trackable application journey—from course selection to visa submission.", abroadLeadBn:"কোর্স নির্বাচন থেকে ভিসা জমা—একটি পরিষ্কার, দায়িত্বশীল ও অনুসরণযোগ্য আবেদন প্রক্রিয়া।",
  servicesTitleEn:"Complete support in one place", servicesTitleBn:"এক জায়গায় সম্পূর্ণ সেবা",
  successTitleEn:"Stories of success", successTitleBn:"সাফল্যের গল্প",
  successLeadEn:"Consent-approved student photos, course journeys and achievements—in their own words.", successLeadBn:"শিক্ষার্থীদের অনুমোদিত ছবি, কোর্সের যাত্রা এবং অর্জন—তাদের নিজের অভিজ্ঞতা থেকে।",
  ctaTitleEn:"Start planning your future today", ctaTitleBn:"আজই আপনার পরিকল্পনা শুরু করুন",
  footerDescriptionEn:"English language, overseas education and visa consultancy—all on one trusted platform.", footerDescriptionBn:"ইংরেজি ভাষা, বিদেশে শিক্ষা এবং ভিসা পরামর্শ—একটি বিশ্বস্ত প্ল্যাটফর্মে।",
  addressEn:"Narayanganj, Dhaka", addressBn:"নারায়ণগঞ্জ, ঢাকা", phonePrimary:"01903-666656", phoneSecondary:"01683-164503",
  themeNavy:"#071a34", themeBlue:"#1457d9", themeRed:"#ef4136", themePaper:"#f7faff", themeInk:"#10223d",
  themeSky:"#eaf3ff", themeSurface:"#ffffff", themeAqua:"#38c9f2",
  templatePreset:"ocean-premium", cardEffect:"water-3d", buttonEffect:"raised-3d", iconStyle:"crystal",
  animationLevel:"dynamic", navbarStyle:"glass", headingWeight:"900", headingCase:"normal",
  courseColumns:"3", contentWidth:"1180", sectionSpacing:"86", cardRadius:"24", buttonRadius:"12", waterIntensity:"medium",
} as const;

export type SiteSettings = { -readonly [K in keyof typeof defaultSiteSettings]: string };

export function mergeSiteSettings(rows: Array<{key:string;value:string}>): SiteSettings {
  const values = { ...defaultSiteSettings } as SiteSettings;
  for (const row of rows) if (row.key in values) values[row.key as keyof SiteSettings] = row.value;
  return values;
}

export const siteSettingKeys = Object.keys(defaultSiteSettings) as Array<keyof SiteSettings>;
