import Link from "next/link";
import {
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import {
  Building2,
  FolderKanban,
  ListChecks,
  Users,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const features = [
  {
    icon: Building2,
    title: "Organizations",
    description:
      "Group your team into a shared workspace and manage everything in one place.",
  },
  {
    icon: FolderKanban,
    title: "Projects",
    description:
      "Organize work into projects, each with its own focused set of tasks.",
  },
  {
    icon: ListChecks,
    title: "Tasks",
    description:
      "Move tasks through To Do, In Progress, and Done to keep work flowing.",
  },
  {
    icon: Users,
    title: "Team Roles",
    description:
      "Invite teammates as Admins or Members with permissions that fit their role.",
  },
];

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Everything you need to get a small team started.",
    features: [
      "1 team member",
      "Up to 3 projects",
      "20 tasks per project",
      "To Do / In Progress / Done tracking",
    ],
    cta: "Get started",
    featured: false,
  },
  {
    name: "Pro",
    price: "$12",
    period: "per month",
    description: "For growing teams that need room to scale.",
    features: [
      "Unlimited team members",
      "Unlimited projects",
      "Unlimited tasks",
      "Team invitations & roles",
    ],
    cta: "Upgrade to Pro",
    featured: true,
  },
];

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-10 flex w-full items-center justify-between border-b bg-background/80 px-6 py-4 backdrop-blur">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Tasky
        </Link>
        <nav className="flex items-center gap-3">
          <Show when="signed-out">
            <SignInButton mode="modal">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button size="sm">Sign up</Button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>
        </nav>
      </header>

      <main className="flex flex-1 flex-col">
        {/* Hero */}
        <section className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 px-6 py-24 text-center sm:py-32">
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Task management that keeps your team in sync
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground text-pretty">
            Organize your work into projects and tasks, invite your team, and
            track everything from a single, clean workspace.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/sign-up">Get started free</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/sign-in">Sign in</Link>
            </Button>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto w-full max-w-5xl px-6 py-16">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Everything your team needs
            </h2>
            <p className="mt-3 text-muted-foreground text-pretty">
              A simple structure that scales from a solo project to a full
              organization.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title}>
                <CardHeader>
                  <div className="mb-2 flex size-10 items-center justify-center rounded-md border bg-muted">
                    <feature.icon className="size-5" aria-hidden="true" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section className="mx-auto w-full max-w-4xl px-6 py-16">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-3 text-muted-foreground text-pretty">
              Start free. Upgrade when your team grows.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={plan.featured ? "border-foreground shadow-sm" : ""}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{plan.name}</span>
                    {plan.featured && (
                      <span className="rounded-full bg-foreground px-2.5 py-0.5 text-xs font-medium text-background">
                        Popular
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-semibold">{plan.price}</span>
                    <span className="text-sm text-muted-foreground">
                      {plan.period}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-6">
                  <ul className="flex flex-col gap-3 text-sm">
                    {plan.features.map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <Check
                          className="size-4 shrink-0 text-muted-foreground"
                          aria-hidden="true"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    asChild
                    className="w-full"
                    variant={plan.featured ? "default" : "outline"}
                  >
                    <Link href="/sign-up">{plan.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t px-6 py-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Tasky. All rights reserved.
        </footer>
      </main>
    </div>
  );
}
