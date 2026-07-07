"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { TaskStatus } from "@/lib/generated/prisma/enums";
import { PLAN_LIMITS, type ActionState } from "@/lib/plan-limits";

// The signed-in user's current organization (id + plan), or null.
async function getCurrentOrg() {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) return null;
  return prisma.organization.findUnique({
    where: { clerkOrgId: orgId },
    select: { id: true, plan: true },
  });
}

export async function createTask(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const org = await getCurrentOrg();
  if (!org) return { error: "No active organization selected." };

  const projectId = String(formData.get("projectId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  if (!projectId || !title) return { error: "Task title is required." };

  // The parent project must belong to the current org.
  const project = await prisma.project.findFirst({
    where: { id: projectId, organizationId: org.id },
    select: { id: true },
  });
  if (!project) return { error: "Project not found." };

  // Enforce the plan's per-project task limit.
  const limit = PLAN_LIMITS[org.plan].tasksPerProject;
  if (Number.isFinite(limit)) {
    const count = await prisma.task.count({ where: { projectId } });
    if (count >= limit) {
      return {
        error: `Your ${org.plan} plan is limited to ${limit} tasks per project. Upgrade to Pro for unlimited tasks.`,
        upgrade: true,
      };
    }
  }

  await prisma.task.create({ data: { title, projectId } });
  revalidatePath(`/dashboard/projects/${projectId}`);
  return {};
}

export async function updateTaskStatus(
  taskId: string,
  status: string,
  projectId: string,
) {
  const org = await getCurrentOrg();
  if (!org) return;
  if (!(Object.values(TaskStatus) as string[]).includes(status)) return;

  // Scoped through the task's project to the current org.
  await prisma.task.updateMany({
    where: { id: taskId, project: { organizationId: org.id } },
    data: { status: status as TaskStatus },
  });
  revalidatePath(`/dashboard/projects/${projectId}`);
}

export async function deleteTask(formData: FormData) {
  const org = await getCurrentOrg();
  if (!org) return;

  const taskId = String(formData.get("taskId") ?? "");
  const projectId = String(formData.get("projectId") ?? "");
  if (!taskId) return;

  await prisma.task.deleteMany({
    where: { id: taskId, project: { organizationId: org.id } },
  });
  revalidatePath(`/dashboard/projects/${projectId}`);
}
