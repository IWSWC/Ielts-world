"use client";

import Link from "next/link";
import { LanguageSwitcher, useSiteLanguage } from "../components/SiteLanguage";

export default function Privacy() {
  const { language } = useSiteLanguage();
  const bn = language === "bn";
  return <main className="legal">
    <div className="legal-top"><Link className="brand" href="/"><img className="brand-mark" src="/brand-logo.png" alt="IELTS World & SMART World Consultancy logo"/><span>IELTS World & SMART World Consultancy</span></Link><LanguageSwitcher/></div>
    <h1>{bn ? "গোপনীয়তা নীতি" : "Privacy Policy"}</h1>
    <p>{bn ? "সর্বশেষ হালনাগাদ: ১৬ আগস্ট ২০২৬" : "Last updated: 16 August 2026"}</p>
    <h2>{bn ? "আমরা যে তথ্য সংগ্রহ করি" : "Information we collect"}</h2>
    <p>{bn ? "আপনার enquiry, profile, application এবং আপনার সম্মতিতে upload করা document-এর তথ্য আমরা সংগ্রহ করি। Passport, academic record ও financial documents কেবল আপনার অনুরোধ করা শিক্ষা বা visa service পরিচালনার উদ্দেশ্যে ব্যবহার করা হয়।" : "We collect information from your enquiries, profile and applications, as well as documents you upload with your consent. Passports, academic records and financial documents are used only to provide the education or visa services you request."}</p>
    <h2>{bn ? "তথ্যের ব্যবহার ও নিরাপত্তা" : "Use and security of information"}</h2>
    <p>{bn ? "তথ্য private storage-এ রাখা হয় এবং শুধুমাত্র অনুমোদিত কর্মী দায়িত্ব অনুযায়ী access করতে পারেন। আইনগত প্রয়োজন বা আপনার স্পষ্ট সম্মতি ছাড়া তথ্য অপ্রয়োজনীয় তৃতীয় পক্ষের কাছে বিক্রি করা হয় না।" : "Information is kept in private storage and can only be accessed by authorised staff as required for their work. We do not sell your information to unnecessary third parties without a legal requirement or your explicit consent."}</p>
    <h2>Firebase Authentication</h2>
    <p>{bn ? "Account তৈরি ও sign in-এর জন্য আমরা Firebase Authentication ব্যবহার করি। আপনার বেছে নেওয়া পদ্ধতি অনুযায়ী email address অথবা mobile number Firebase দ্বারা যাচাই ও প্রক্রিয়া করা হয়। Phone sign-in ব্যবহার করলে abuse prevention-এর জন্য mobile number Google-এর কাছে পাঠানো এবং সংরক্ষিত হতে পারে।" : "We use Firebase Authentication for account creation and sign-in. Depending on the method you choose, Firebase verifies and processes your email address or mobile number. When phone sign-in is used, the mobile number may be sent to and stored by Google for abuse prevention."}</p>
    <h2>Firebase Analytics</h2>
    <p>{bn ? "আপনার অনুমতি পেলে আমরা Google Firebase Analytics ব্যবহার করে page visit, device ও সাধারণ usage information পরিমাপ করি। বিজ্ঞাপন-সংক্রান্ত storage ও personalization বন্ধ রাখা হয়েছে এবং অনুমতি না দিলে Analytics চালু হয় না।" : "With your permission, we use Google Firebase Analytics to measure page visits, devices and general usage information. Advertising storage and personalisation are disabled, and Analytics does not start when permission is declined."}</p>
    <h2>{bn ? "আপনার অধিকার" : "Your rights"}</h2>
    <p>{bn ? "আপনি নিজের তথ্য দেখা, সংশোধন বা প্রয়োজন শেষ হলে মুছে ফেলার অনুরোধ করতে পারেন। যোগাযোগ: 01903-666656।" : "You may ask to access or correct your information, or request deletion when it is no longer needed. Contact: 01903-666656."}</p>
    <h2>{bn ? "তথ্য সংরক্ষণের সময়" : "Retention"}</h2>
    <p>{bn ? "সেবা এবং আইনগত প্রয়োজন অনুসারে তথ্য সীমিত সময় রাখা হয়। মেয়াদ শেষে নিরাপদ deletion বা archive policy প্রয়োগ করা হয়।" : "Information is retained for a limited period according to service and legal requirements. Secure deletion or archival policies are applied when that period ends."}</p>
    <Link className="btn btn-blue" href="/">← {bn ? "হোম" : "Home"}</Link>
  </main>;
}
