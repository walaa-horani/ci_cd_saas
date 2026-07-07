import Link from "next/link";
import { Check } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PLAN_LIMITS } from "@/lib/plan-limits";

function CurrentBadge() {
  return (
    <span className="rounded-full bg-foreground px-2.5 py-0.5 text-xs font-medium text-background">
      Current
    </span>
  );
}

export default async function BillingPage() {
  const { userId, orgId } = await auth();
  if (!userId) return null;

  let plan: "FREE" | "PRO" = "FREE";
  if (orgId) {
    const org = await prisma.organization.findUnique({
      where: { clerkOrgId: orgId },
      select: { plan: true },
    });
    if (org) plan = org.plan;
  }
  const free = PLAN_LIMITS.FREE;

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12">
      <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
        <Link href="/dashboard">← Dashboard</Link>
      </Button>
      <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
      <p className="mt-2 text-muted-foreground">
        Your organization is on the{" "}
        <span className="font-medium text-foreground">{plan}</span> plan.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {/* Free */}
        <Card className={plan === "FREE" ? "border-foreground" : ""}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Free</span>
              {plan === "FREE" && <CurrentBadge />}
            </CardTitle>
            <CardDescription>For small teams getting started.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-3 text-sm">
              <li className="flex items-center gap-2">
                <Check className="size-4 text-muted-foreground" /> {free.members}{" "}
                team member
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 text-muted-foreground" /> Up to{" "}
                {free.projects} projects
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 text-muted-foreground" />{" "}
                {free.tasksPerProject} tasks per project
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Pro */}
        <Card className={plan === "PRO" ? "border-foreground" : ""}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Pro</span>
              {plan === "PRO" && <CurrentBadge />}
            </CardTitle>
            <CardDescription>
              For growing teams that need more room.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <ul className="flex flex-col gap-3 text-sm">
              <li className="flex items-center gap-2">
                <Check className="size-4 text-muted-foreground" /> Unlimited team
                members
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 text-muted-foreground" /> Unlimited
                projects
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 text-muted-foreground" /> Unlimited tasks
              </li>
            </ul>
            {plan === "FREE" && (
              <Button disabled className="w-full">
                Upgrade to Pro (coming soon)
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        This is an informational page — there is no live checkout in this
        project.
      </p>
    </div>
  );
}
