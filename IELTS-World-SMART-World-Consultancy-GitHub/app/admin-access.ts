import { env } from "cloudflare:workers";
import { getAuthUser, type AuthUser } from "./auth-core";

export async function getAdminUser(): Promise<AuthUser | null> {
  const user = await getAuthUser();
  if (!user) return null;

  const localPreview =
    process.env.NODE_ENV === "development" &&
    user.email === "preview@ieltsworldedu.com";
  if (localPreview) return user;

  const configuredEmail = (env as unknown as { ADMIN_EMAIL?: string })
    .ADMIN_EMAIL?.trim()
    .toLowerCase();
  return configuredEmail && user.email.toLowerCase() === configuredEmail
    ? user
    : null;
}

export async function requireAdminApi(): Promise<
  | { user: AuthUser; error: null }
  | { user: null; error: Response }
> {
  const signedIn = await getAuthUser();
  if (!signedIn) {
    return {
      user: null,
      error: Response.json({ error: "Sign in required" }, { status: 401 }),
    };
  }

  const admin = await getAdminUser();
  if (!admin) {
    return {
      user: null,
      error: Response.json({ error: "Admin access required" }, { status: 403 }),
    };
  }
  return { user: admin, error: null };
}
