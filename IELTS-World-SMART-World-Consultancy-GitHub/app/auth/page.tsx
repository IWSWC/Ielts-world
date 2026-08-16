import { AuthBook } from "./auth-book";
import { safeRelativeReturnPath } from "../auth-core";

export default async function AuthPage({ searchParams }: { searchParams: Promise<{ mode?: string; return_to?: string }> }) {
  const { mode, return_to: requestedReturn } = await searchParams;
  const returnTo = safeRelativeReturnPath(requestedReturn, mode === "admin" ? "/admin" : "/portal");
  const admin = mode === "admin" || returnTo.startsWith("/admin");
  return <AuthBook admin={admin} returnTo={returnTo} />;
}
