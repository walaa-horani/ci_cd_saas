import Link from "next/link";
import { PricingTable } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";

export default async function BillingPage() {
  const { userId } = await auth();
  if (!userId) return null; // proxy already protects this route

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12">
      <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
        <Link href="/dashboard">← Dashboard</Link>
      </Button>
      <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
      <p className="mt-2 text-muted-foreground text-pretty">
        Choose a plan for your organization. Plans are managed in Clerk.
      </p>

      <div className="mt-8">
        {/* Renders the plans defined in Clerk for the active organization. */}
        <PricingTable for="organization" />
      </div>
    </div>
  );
}
