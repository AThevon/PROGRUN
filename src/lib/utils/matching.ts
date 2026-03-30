import { db } from "@/lib/db";
import { plans, planWeeks, planSessions, activities } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";

/**
 * Attempt to auto-match an activity to a plan session.
 *
 * Strategy:
 * 1. Find the user's active plan.
 * 2. Compute the week number based on the plan's startDate.
 * 3. Find a session in that week whose dayOfWeek matches the activity date's
 *    day and whose targetDistanceKm is within ±20% of the activity's distance.
 * 4. Skip if the session already has a matched activity.
 * 5. Link the activity to that session.
 */
export async function autoMatchActivity(
  activityId: string,
  userId: string,
  activityDate: Date,
  activityDistanceKm: number
): Promise<boolean> {
  // 1. Find active plan
  const activePlan = await db.query.plans.findFirst({
    where: and(eq(plans.userId, userId), eq(plans.isActive, true)),
  });

  if (!activePlan || !activePlan.startDate) return false;

  // 2. Compute week number (1-based)
  const start = new Date(activePlan.startDate);
  start.setHours(0, 0, 0, 0);
  const actDate = new Date(activityDate);
  actDate.setHours(0, 0, 0, 0);
  const diffDays = Math.floor(
    (actDate.getTime() - start.getTime()) / 86_400_000
  );
  if (diffDays < 0) return false; // activity before plan start

  const weekNumber = Math.floor(diffDays / 7) + 1;

  // Day of week: 0=Sun, 1=Mon ... 6=Sat
  const dayOfWeek = actDate.getDay();

  // 3. Find the week record
  const planWeek = await db.query.planWeeks.findFirst({
    where: and(
      eq(planWeeks.planId, activePlan.id),
      eq(planWeeks.weekNumber, weekNumber)
    ),
  });

  if (!planWeek) return false;

  // 4. Find matching session: dayOfWeek + distance ±20%
  const weekSessions = await db.query.planSessions.findMany({
    where: eq(planSessions.weekId, planWeek.id),
  });

  const TOLERANCE = 0.2;
  const candidate = weekSessions.find((s) => {
    if (s.type === "rest") return false;
    if (s.dayOfWeek !== dayOfWeek) return false;
    if (!s.targetDistanceKm) return false;
    const lower = s.targetDistanceKm * (1 - TOLERANCE);
    const upper = s.targetDistanceKm * (1 + TOLERANCE);
    return activityDistanceKm >= lower && activityDistanceKm <= upper;
  });

  if (!candidate) return false;

  // 5. Check that the session is not already matched to another activity
  const existingMatch = await db.query.activities.findFirst({
    where: and(
      eq(activities.userId, userId),
      eq(activities.linkedSessionId, candidate.id)
    ),
  });

  if (existingMatch) return false;

  // 6. Update activity with the matched session
  await db
    .update(activities)
    .set({
      linkedSessionId: candidate.id,
      matchStatus: "auto_matched",
    })
    .where(eq(activities.id, activityId));

  return true;
}
