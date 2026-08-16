"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useSiteLanguage } from "./SiteLanguage";

type AnalyticsConsent = "loading" | "unknown" | "granted" | "denied";
const consentKey = "iw-analytics-consent";
const consentEvent = "iw-analytics-consent-change";

function consentSnapshot():AnalyticsConsent {
  const saved = window.localStorage.getItem(consentKey);
  return saved === "granted" || saved === "denied" ? saved : "unknown";
}

function subscribeConsent(notify:()=>void) {
  const storage = (event:StorageEvent) => { if (event.key === consentKey) notify(); };
  window.addEventListener("storage", storage);
  window.addEventListener(consentEvent, notify);
  return () => {
    window.removeEventListener("storage", storage);
    window.removeEventListener(consentEvent, notify);
  };
}

export function FirebaseAnalytics() {
  const { language } = useSiteLanguage();
  const consent = useSyncExternalStore(subscribeConsent, consentSnapshot, () => "loading");

  useEffect(() => {
    if (consent !== "granted") return;
    if (document.getElementById("firebase-analytics-module")) return;
    const script = document.createElement("script");
    script.id = "firebase-analytics-module";
    script.type = "module";
    script.src = "/firebase-analytics.js";
    script.async = true;
    document.head.appendChild(script);
  }, [consent]);

  function choose(next:"granted"|"denied") {
    window.localStorage.setItem(consentKey, next);
    window.dispatchEvent(new Event(consentEvent));
  }

  if (consent !== "unknown") return null;
  const bn = language === "bn";
  return <aside className="analytics-consent" aria-label={bn ? "অ্যানালিটিক্স অনুমতি" : "Analytics consent"} aria-live="polite">
    <div className="analytics-consent-mark" aria-hidden="true">◎</div>
    <div>
      <strong>{bn ? "আপনার গোপনীয়তা গুরুত্বপূর্ণ" : "Your privacy matters"}</strong>
      <p>{bn ? "সাইটটি কীভাবে ব্যবহার হচ্ছে তা বুঝে সেবা উন্নত করতে আমরা Firebase Analytics ব্যবহার করতে চাই। বিজ্ঞাপনভিত্তিক tracking বন্ধ থাকবে।" : "We would like to use Firebase Analytics to understand site usage and improve our services. Advertising-based tracking remains disabled."}</p>
      <a href="/privacy">{bn ? "গোপনীয়তা নীতি" : "Privacy policy"}</a>
    </div>
    <div className="analytics-consent-actions">
      <button type="button" className="btn btn-light" onClick={() => choose("denied")}>{bn ? "প্রয়োজন নেই" : "Decline"}</button>
      <button type="button" className="btn btn-blue" onClick={() => choose("granted")}>{bn ? "অনুমতি দিন" : "Allow analytics"}</button>
    </div>
  </aside>;
}
