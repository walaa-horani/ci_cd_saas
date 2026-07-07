"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

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

export async function createProject(formData: FormData) {
  const org = await getCurrentOrg();
  if (!org) return;

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  await prisma.project.create({
    data: { name, organizationId: org.id },
  });
  revalidatePath("/dashboard/projects");
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
