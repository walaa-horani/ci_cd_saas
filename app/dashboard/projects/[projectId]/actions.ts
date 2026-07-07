"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { TaskStatus } from "@/lib/generated/prisma/enums";

// Local id of the signed-in user's current organization, or null.
async function getOrgId() {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) return null;
  const org = await prisma.organization.findUnique({
    where: { clerkOrgId: orgId },
    select: { id: true },
  });
  return org?.id ?? null;
}

export async function createTask(formData: FormData) {
  const organizationId = await getOrgId();
  if (!organizationId) return;

  const projectId = String(formData.get("projectId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  if (!projectId || !title) return;

  // The parent project must belong to the current org.
  const project = await prisma.project.findFirst({
    where: { id: projectId, organizationId },
    select: { id: true },
  });
  if (!project) return;

  await prisma.task.create({ data: { title, projectId } });
  revalidatePath(`/dashboard/projects/${projectId}`);
}

export async function updateTaskStatus(
  taskId: string,
  status: string,
  projectId: string,
) {
  const organizationId = await getOrgId();
  if (!organizationId) return;
  if (!(Object.values(TaskStatus) as string[]).includes(status)) return;

  // Scoped through the task's project to the current org.
  await prisma.task.updateMany({
    where: { id: taskId, project: { organizationId } },
    data: { status: status as TaskStatus },
  });
  revalidatePath(`/dashboard/projects/${projectId}`);
}

export async function deleteTask(formData: FormData) {
  const organizationId = await getOrgId();
  if (!organizationId) return;

  const taskId = String(formData.get("taskId") ?? "");
  const projectId = String(formData.get("projectId") ?? "");
  if (!taskId) return;

  await prisma.task.deleteMany({
    where: { id: taskId, project: { organizationId } },
  });
  revalidatePath(`/dashboard/projects/${projectId}`);
}
