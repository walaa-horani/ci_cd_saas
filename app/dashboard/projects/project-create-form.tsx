"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ActionState } from "@/lib/plan-limits";
import { createProject } from "./actions";

const initialState: ActionState = {};

export function ProjectCreateForm() {
  const [state, formAction, pending] = useActionState(
    createProject,
    initialState,
  );

  return (
    <div className="mt-6">
      <form action={formAction} className="flex gap-2">
        <Input
          name="name"
          placeholder="New project name"
          required
          maxLength={100}
          aria-label="New project name"
        />
        <Button type="submit" disabled={pending}>
          Add project
        </Button>
      </form>
      {state.error && (
        <p className="mt-2 text-sm text-destructive">
          {state.error}{" "}
          {state.upgrade && (
            <Link href="/dashboard/billing" className="font-medium underline">
              View billing
            </Link>
          )}
        </p>
      )}
    </div>
  );
}
