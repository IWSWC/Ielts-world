import { clearSession, safeRelativeReturnPath } from "../../../auth-core";

async function logout(request: Request) {
  const returnTo = safeRelativeReturnPath(new URL(request.url).searchParams.get("return_to"), "/");
  return clearSession(Response.redirect(new URL(returnTo, request.url), 303), request);
}

export const GET = logout;
export const POST = logout;
