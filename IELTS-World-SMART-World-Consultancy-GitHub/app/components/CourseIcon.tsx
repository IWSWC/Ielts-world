type CourseIconProps = { title:string; fallback?:string; className?:string };

export function CourseIcon({ title, fallback = "✦", className = "course-icon" }:CourseIconProps) {
  const value = title.toLowerCase();
  const kind = value.includes("ielts") ? "target"
    : value.includes("pte") ? "performance"
    : value.includes("oietc") || value.includes("ell t") || value.includes("oxford") ? "academy"
    : value.includes("spoken") ? "conversation"
    : value.includes("japanese") ? "japan"
    : value.includes("korean") ? "korea"
    : "custom";

  const icon = kind === "target" ? <svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="16"/><circle cx="24" cy="24" r="9"/><circle cx="24" cy="24" r="2"/><path d="M27 21 40 8m-7 1h7v7"/></svg>
    : kind === "performance" ? <svg viewBox="0 0 48 48"><path d="M7 28h6l4-14 7 25 6-19 4 8h7"/><circle cx="7" cy="28" r="2"/><circle cx="41" cy="28" r="2"/></svg>
    : kind === "academy" ? <svg viewBox="0 0 48 48"><path d="m5 19 19-10 19 10-19 10L5 19Z"/><path d="M12 23v10c7 5 17 5 24 0V23M42 20v12"/></svg>
    : kind === "conversation" ? <svg viewBox="0 0 48 48"><path d="M8 10h32v23H22L12 40v-7H8V10Z"/><circle cx="17" cy="22" r="2"/><circle cx="24" cy="22" r="2"/><circle cx="31" cy="22" r="2"/></svg>
    : kind === "japan" ? <svg viewBox="0 0 48 48"><circle cx="33" cy="14" r="6"/><path d="M9 18h30M13 18v22m22-22v22M8 25h32M18 25v15m12-15v15"/></svg>
    : kind === "korea" ? <svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="16"/><path d="M9 24c8-10 14-10 20-3 4 5 7 4 10 3M39 24c-8 10-14 10-20 3-4-5-7-4-10-3"/><circle cx="18" cy="20" r="2"/><circle cx="30" cy="28" r="2"/></svg>
    : <span className="course-icon-fallback">{fallback}</span>;

  return <span className={className} data-course-icon={kind} aria-hidden="true">{icon}</span>;
}
