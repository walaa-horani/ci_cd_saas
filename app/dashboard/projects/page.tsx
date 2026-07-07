import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { createProject } from "./actions";
import { ProjectActions } from "./project-actions";

export default async function ProjectsPage() {
  const { userId, orgId } = await auth();
  if (!userId) return null; // proxy already protects this route

  // No active organization selected.
  if (!orgId) {
    return (
      <div className="mx-auto w-full max-w-3xl px-6 py-12">
        <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
        <p className="mt-2 text-muted-foreground text-pretty">
          Select or create an organization from the switcher to manage its
          projects.
        </p>
        <Button asChild className="mt-4">
          <Link href="/dashboard">Go to dashboard</Link>
        </Button>
      </div>
    );
  }

  const org = await prisma.organization.findUnique({
    where: { clerkOrgId: orgId },
  });
  const projects = org
    ? await prisma.project.findMany({
        where: { organizationId: org.id },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard">Dashboard</Link>
        </Button>
      </div>

      {/* Create */}
      <form action={createProject} className="mt-6 flex gap-2">
        <Input
          name="name"
          placeholder="New project name"
          required
          maxLength={100}
          aria-label="New project name"
        />
        <Button type="submit">Add project</Button>
      </form>

      {/* List */}
      <div className="mt-8 flex flex-col gap-3">
        {projects.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No projects yet. Create your first one above.
          </p>
        ) : (
          projects.map((project) => (
            <Card key={project.id}>
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <CardTitle className="text-base font-medium">
                  {project.name}
                </CardTitle>
                <ProjectActions id={project.id} name={project.name} />
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
