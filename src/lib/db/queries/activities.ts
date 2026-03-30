import { db } from "@/lib/db";
import { activities } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import type { ActivityWithSession } from "@/types";

export async function getUserActivities(
  userId: string,
  limit = 50
): Promise<ActivityWithSession[]> {
  const results = await db.query.activities.findMany({
    where: eq(activities.userId, userId),
    orderBy: [desc(activities.date)],
    limit,
    with: {
      linkedSession: true,
    },
  });

  return results as ActivityWithSession[];
}

export async function getActivity(
  id: string,
  userId: string
): Promise<ActivityWithSession | null> {
  const result = await db.query.activities.findFirst({
    where: and(eq(activities.id, id), eq(activities.userId, userId)),
    with: {
      linkedSession: {
        with: {
          week: true,
        },
      },
    },
  });

  return (result as ActivityWithSession | undefined) ?? null;
}

export async function getLastActivity(
  userId: string
): Promise<ActivityWithSession | null> {
  const result = await db.query.activities.findFirst({
    where: eq(activities.userId, userId),
    orderBy: [desc(activities.date)],
    with: {
      linkedSession: true,
    },
  });

  return (result as ActivityWithSession | undefined) ?? null;
}

export async function linkActivityToSession(
  activityId: string,
  sessionId: string
): Promise<void> {
  await db
    .update(activities)
    .set({ linkedSessionId: sessionId, matchStatus: "manual_matched" })
    .where(eq(activities.id, activityId));
}
