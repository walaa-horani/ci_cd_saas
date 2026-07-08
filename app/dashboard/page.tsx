import Link from "next/link";
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-background text-foreground">
      {/* Top bar */}
      <header className="flex w-full items-center justify-between border-b px-6 py-4">
        <Link href="/dashboard" className="text-lg font-semibold tracking-tight">
          Tasks
        </Link>
        <div className="flex items-center gap-4">
          <OrganizationSwitcher
            hidePersonal
            afterCreateOrganizationUrl="/dashboard"
            afterSelectOrganizationUrl="/dashboard"
            afterLeaveOrganizationUrl="/dashboard"
          />
          <UserButton />
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-2 text-muted-foreground text-pretty">
          Use the organization switcher above to create a new organization or
          switch between the ones you belong to.
        </p>
        <Button asChild className="mt-6">
          <Link href="/dashboard/projects">Manage projects</Link>
        </Button>
      </main>
    </div>
  );
}
