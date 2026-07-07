import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { TaskCreateForm } from "./task-create-form";
import { TaskItem } from "./task-item";

type Status = "TODO" | "IN_PROGRESS" | "DONE";

const COLUMNS: { status: Status; label: string }[] = [
  { status: "TODO", label: "Todo" },
  { status: "IN_PROGRESS", label: "In Progress" },
  { status: "DONE", label: "Done" },
];

export default async function ProjectTasksPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const { userId, orgId } = await auth();
  if (!userId || !orgId) return null;

  const org = await prisma.organization.findUnique({
    where: { clerkOrgId: orgId },
    select: { id: true },
  });
  if (!org) notFound();

  // Project must belong to the current org, or it's a 404.
  const project = await prisma.project.findFirst({
    where: { id: projectId, organizationId: org.id },
    include: { tasks: { orderBy: { createdAt: "desc" } } },
  });
  if (!project) notFound();

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
          <Link href="/dashboard/projects">← Projects</Link>
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">{project.name}</h1>
      </div>

      {/* Create */}
      <TaskCreateForm projectId={project.id} />

      {/* Board grouped by status */}
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {COLUMNS.map((col) => {
          const tasks = project.tasks.filter((t) => t.status === col.status);
          return (
            <div key={col.status} className="flex flex-col gap-3">
              <h2 className="text-sm font-medium text-muted-foreground">
                {col.label} ({tasks.length})
              </h2>
              {tasks.length === 0 ? (
                <p className="text-sm text-muted-foreground/60">No tasks.</p>
              ) : (
                tasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    id={task.id}
                    title={task.title}
                    status={task.status}
                    projectId={project.id}
                  />
                ))
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
