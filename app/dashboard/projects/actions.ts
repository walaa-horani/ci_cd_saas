"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isOrgAdmin } from "@/lib/permissions";
import { PLAN_LIMITS, type ActionState } from "@/lib/plan-limits";

// Resolve the signed-in user's *current* organization to a local DB row.
// Returns null when there is no active organization. Lazily upserts the org
// if the webhook hasn't synced it yet, so projects always have a valid FK.
async function getCurrentOrg() {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) return null;

  let org = await prisma.organization.findUnique({
    where: { clerkOrgId: orgId },
  });

  if (!org) {
    const client = await clerkClient();
    const clerkOrg = await client.organizations.getOrganization({
      organizationId: orgId,
    });
    org = await prisma.organization.upsert({
      where: { clerkOrgId: orgId },
      create: { clerkOrgId: orgId, name: clerkOrg.name, plan: "FREE" },
      update: {},
    });
  }

  return org;
}

export async function createProject(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  // Only ADMINs may create projects.
  if (!(await isOrgAdmin())) {
    return { error: "Only organization admins can create projects." };
  }

  const org = await getCurrentOrg();
  if (!org) return { error: "No active organization selected." };

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Project name is required." };

  // Enforce the plan's project limit (FREE is finite, PRO is Infinity).
  const limit = PLAN_LIMITS[org.plan].projects;
  if (Number.isFinite(limit)) {
    const count = await prisma.project.count({
      where: { organizationId: org.id },
    });
    if (count >= limit) {
      return {
        error: `Your ${org.plan} plan is limited to ${limit} projects. Upgrade to Pro for unlimited projects.`,
        upgrade: true,
      };
    }
  }

  await prisma.project.create({
    data: { name, organizationId: org.id },
  });
  revalidatePath("/dashboard/projects");
  return {};
}

export async function renameProject(formData: FormData) {
  const org = await getCurrentOrg();
  if (!org) return;

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!id || !name) return;

  // Scoped to the current org — a project from another org matches 0 rows.
  await prisma.project.updateMany({
    where: { id, organizationId: org.id },
    data: { name },
  });
  revalidatePath("/dashboard/projects");
}

export async function deleteProject(formData: FormData) {
  // Only ADMINs may delete projects.
  if (!(await isOrgAdmin())) return;

  const org = await getCurrentOrg();
  if (!org) return;

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  // Scoped delete — cannot remove another org's project.
  await prisma.project.deleteMany({
    where: { id, organizationId: org.id },
  });
  revalidatePath("/dashboard/projects");
}
