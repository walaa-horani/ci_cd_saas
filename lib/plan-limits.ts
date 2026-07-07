// Per-plan limits. Infinity means "no limit" (PRO).
export const PLAN_LIMITS = {
  FREE: { members: 1, projects: 3, tasksPerProject: 20 },
  PRO: {
    members: Infinity,
    projects: Infinity,
    tasksPerProject: Infinity,
  },
} as const;

export type PlanName = keyof typeof PLAN_LIMITS;

// Shared result shape for form server actions used with `useActionState`.
export type ActionState = { error?: string; upgrade?: boolean };
