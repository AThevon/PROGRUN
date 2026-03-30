import { db } from "@/lib/db";
import { plans, planWeeks, planSessions, activities } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";
import type { PlanWithWeeks, WeekWithProgress } from "@/types";

export async function getActivePlan(userId: string): Promise<PlanWithWeeks | null> {
  const result = await db.query.plans.findFirst({
    where: and(eq(plans.userId, userId), eq(plans.isActive, true)),
    with: {
      weeks: {
        orderBy: [asc(planWeeks.weekNumber)],
        with: {
          sessions: {
            orderBy: [asc(planSessions.dayOfWeek)],
          },
        },
      },
    },
  });

  return result ?? null;
}

export async function getPlanWeeksWithProgress(
  planId: string,
  userId: string
): Promise<WeekWithProgress[]> {
  const plan = await db.query.plans.findFirst({
    where: and(eq(plans.id, planId), eq(plans.userId, userId)),
    with: {
      weeks: {
        orderBy: [asc(planWeeks.weekNumber)],
        with: {
          sessions: {
            orderBy: [asc(planSessions.dayOfWeek)],
            with: {
              activities: true,
            },
          },
        },
      },
    },
  });

  if (!plan) return [];

  return plan.weeks.map((week) => {
    const sessionsWithActivity = week.sessions.map((session) => {
      const sessionActivities = (session as typeof session & { activities: typeof activities.$inferSelect[] }).activities;
      const activity = sessionActivities && sessionActivities.length > 0
        ? sessionActivities[0]
        : null;
      return { ...session, activity };
    });

    const actualVolumeKm = sessionsWithActivity.reduce((sum, s) => {
      return sum + (s.activity?.distanceKm ?? 0);
    }, 0);

    const completedSessions = sessionsWithActivity.filter(
      (s) => s.activity !== null
    ).length;

    return {
      ...week,
      sessions: sessionsWithActivity,
      actualVolumeKm,
      completedSessions,
    } as WeekWithProgress;
  });
}

export async function getUserPlans(userId: string) {
  return db.query.plans.findMany({
    where: eq(plans.userId, userId),
    orderBy: [asc(plans.createdAt)],
  });
}
