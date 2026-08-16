"use client";

import { createContext, useContext, useEffect, useSyncExternalStore, type ReactNode } from "react";

export type SiteLanguage = "en" | "bn";

const LanguageContext = createContext<{ language: SiteLanguage; setLanguage: (language: SiteLanguage) => void }>({
  language: "en",
  setLanguage: () => undefined,
});

export function SiteLanguageProvider({ children }: { children: ReactNode }) {
  const language = useSyncExternalStore<SiteLanguage>(
    (onChange) => {
      window.addEventListener("storage", onChange);
      window.addEventListener("iw-language-change", onChange);
      return () => {
        window.removeEventListener("storage", onChange);
        window.removeEventListener("iw-language-change", onChange);
      };
    },
    () => window.localStorage.getItem("iw-language") === "bn" ? "bn" : "en",
    () => "en",
  );

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    function openHome(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || !(event.target instanceof Element)) return;
      const brand = event.target.closest<HTMLAnchorElement>("a.brand");
      if (!brand) return;
      event.preventDefault();
      if (window.location.pathname === "/") {
        window.history.replaceState(null, "", "/#top");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        window.location.assign("/#top");
      }
    }
    document.addEventListener("click", openHome);
    return () => document.removeEventListener("click", openHome);
  }, []);

  function setLanguage(next: SiteLanguage) {
    window.localStorage.setItem("iw-language", next);
    document.documentElement.lang = next;
    window.dispatchEvent(new Event("iw-language-change"));
  }

  return <LanguageContext.Provider value={{ language, setLanguage }}>{children}</LanguageContext.Provider>;
}

export function useSiteLanguage() {
  return useContext(LanguageContext);
}

export function LanguageSwitcher() {
  const { language, setLanguage } = useSiteLanguage();
  return <div className="language-switcher" role="group" aria-label="Choose website language">
    <button type="button" className={language === "en" ? "active" : ""} onClick={() => setLanguage("en")} aria-pressed={language === "en"}>EN</button>
    <button type="button" className={language === "bn" ? "active" : ""} onClick={() => setLanguage("bn")} aria-pressed={language === "bn"}>বাংলা</button>
  </div>;
}
