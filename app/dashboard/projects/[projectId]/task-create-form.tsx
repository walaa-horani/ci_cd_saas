"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ActionState } from "@/lib/plan-limits";
import { createTask } from "./actions";

const initialState: ActionState = {};

export function TaskCreateForm({ projectId }: { projectId: string }) {
  const [state, formAction, pending] = useActionState(createTask, initialState);

  return (
    <div className="mt-6">
      <form action={formAction} className="flex gap-2">
        <input type="hidden" name="projectId" value={projectId} />
        <Input
          name="title"
          placeholder="New task title"
          required
          maxLength={200}
          aria-label="New task title"
        />
        <Button type="submit" disabled={pending}>
          Add task
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
