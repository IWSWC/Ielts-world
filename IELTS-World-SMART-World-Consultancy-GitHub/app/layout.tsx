import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { Noto_Sans_Bengali, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { SiteLanguageProvider } from "./components/SiteLanguage";
import { FirebaseAnalytics } from "./components/FirebaseAnalytics";
import { ensureSchema, getDb } from "../db";
import { siteSettings as siteSettingsTable } from "../db/schema";
import { defaultSiteSettings, mergeSiteSettings, type SiteSettings } from "./site-settings";

export const dynamic = "force-dynamic";

const bengali = Noto_Sans_Bengali({ variable: "--font-bn", subsets: ["bengali"], display: "swap" });
const jakarta = Plus_Jakarta_Sans({ variable: "--font-en", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: { default: "IELTS World & SMART World Consultancy", template: "%s | IELTS World & SMART World Consultancy" },
  description: "IELTS, PTE, OIETC and language courses with trusted study-abroad and visa consultancy in Narayanganj, Bangladesh.",
  keywords: ["IELTS Narayanganj", "PTE course", "study abroad Bangladesh", "student visa consultancy", "IELTS World"],
  metadataBase: new URL("https://ieltsworldedu.com"),
  icons: {
    icon: "/brand-logo.png",
    shortcut: "/brand-logo.png",
    apple: "/brand-logo.png",
  },
  openGraph: { title: "IELTS World & SMART World Consultancy", description: "Learn English. Study Abroad. Build Your Future.", type: "website", locale: "bn_BD", images: [{ url: "/og.png", width: 1734, height: 907, alt: "IELTS World & SMART World Consultancy" }] },
  twitter: { card: "summary_large_image", title: "IELTS World & SMART World Consultancy", description: "Your destination, guided by our experience.", images: ["/og.png"] },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  let settings:SiteSettings = { ...defaultSiteSettings };
  try { await ensureSchema(); settings = mergeSiteSettings(await getDb().select().from(siteSettingsTable)); } catch { settings = { ...defaultSiteSettings }; }
  const theme = {
    "--navy":settings.themeNavy,
    "--blue":settings.themeBlue,
    "--red":settings.themeRed,
    "--paper":settings.themePaper,
    "--ink":settings.themeInk,
    "--sky":settings.themeSky,
    "--surface":settings.themeSurface,
    "--aqua":settings.themeAqua,
    "--heading-weight":settings.headingWeight,
    "--course-columns":settings.courseColumns,
    "--content-width":`${settings.contentWidth}px`,
    "--section-space":`${settings.sectionSpacing}px`,
    "--card-radius":`${settings.cardRadius}px`,
    "--button-radius":`${settings.buttonRadius}px`,
  } as CSSProperties;
  return <html lang="en"><body
    className={`${bengali.variable} ${jakarta.variable}`}
    style={theme}
    data-template={settings.templatePreset}
    data-card-effect={settings.cardEffect}
    data-button-effect={settings.buttonEffect}
    data-icon-style={settings.iconStyle}
    data-animation={settings.animationLevel}
    data-navbar={settings.navbarStyle}
    data-heading-case={settings.headingCase}
    data-water={settings.waterIntensity}
  ><SiteLanguageProvider>{children}<FirebaseAnalytics/></SiteLanguageProvider></body></html>;
}
