import { auth } from "@clerk/nextjs/server";

export type OrgRole = "ADMIN" | "MEMBER";

/**
 * The signed-in user's role in their *current* organization, or null if there
 * is no signed-in user or no active organization.
 *
 * Clerk's `orgRole` (e.g. "org:admin" / "org:member") is the live source of
 * truth for the active org in the current session, so we read it directly
 * rather than querying the mirrored OrganizationMember row.
 */
export async function getCurrentRole(): Promise<OrgRole | null> {
  const { userId, orgId, orgRole } = await auth();
  if (!userId || !orgId) return null;
  return orgRole === "org:admin" ? "ADMIN" : "MEMBER";
}

/** True only when the current user is an ADMIN of the current organization. */
export async function isOrgAdmin(): Promise<boolean> {
  return (await getCurrentRole()) === "ADMIN";
}
