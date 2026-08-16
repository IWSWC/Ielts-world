export function BookLoginLink({ admin = false, label }: { admin?: boolean; label?: string }) {
  return <a className="book-login" href={admin ? "/auth?mode=admin" : "/auth"} aria-label={admin ? "Open admin login" : "Open student login"}>
    <span className="mini-book" aria-hidden="true"><i className="book-spine"/><i className="book-cover"><img src="/brand-logo.png" alt=""/></i><i className="book-pages"/></span>
    <span>{label ?? (admin ? "Admin" : "Login")}</span>
  </a>;
}
