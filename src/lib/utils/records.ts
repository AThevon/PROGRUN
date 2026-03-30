import { db } from "@/lib/db";
import { activities, personalRecords } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { paceToSeconds, secondsToPace } from "./pace";

/**
 * Recalculate all personal records for a user based on their activities.
 * Called after import/sync/delete.
 */
export async function refreshPersonalRecords(userId: string) {
  const userActivities = await db.query.activities.findMany({
    where: eq(activities.userId, userId),
    orderBy: [desc(activities.date)],
  });

  if (userActivities.length === 0) {
    // Clear all records
    await db.delete(personalRecords).where(eq(personalRecords.userId, userId));
    return;
  }

  // Best km (fastest lap pace)
  let bestKmPace = Infinity;
  let bestKmActivityId: string | null = null;
  let bestKmDate: Date | null = null;

  // Best average pace (fastest activity avg pace)
  let bestAvgPace = Infinity;
  let bestAvgActivityId: string | null = null;
  let bestAvgDate: Date | null = null;

  // Longest run
  let longestDist = 0;
  let longestActivityId: string | null = null;
  let longestDate: Date | null = null;

  // Lowest average HR
  let lowestHr = Infinity;
  let lowestHrActivityId: string | null = null;
  let lowestHrDate: Date | null = null;

  for (const a of userActivities) {
    // Check laps for best km
    const laps = a.laps as Array<{ avgPace: string }> | null;
    if (laps) {
      for (const lap of laps) {
        if (lap.avgPace && lap.avgPace !== "--:--") {
          const sec = paceToSeconds(lap.avgPace);
          if (sec < bestKmPace) {
            bestKmPace = sec;
            bestKmActivityId = a.id;
            bestKmDate = new Date(a.date);
          }
        }
      }
    }

    // Best avg pace
    if (a.avgPace && a.avgPace !== "--:--") {
      const sec = paceToSeconds(a.avgPace);
      if (sec < bestAvgPace) {
        bestAvgPace = sec;
        bestAvgActivityId = a.id;
        bestAvgDate = new Date(a.date);
      }
    }

    // Longest run
    if (a.distanceKm > longestDist) {
      longestDist = a.distanceKm;
      longestActivityId = a.id;
      longestDate = new Date(a.date);
    }

    // Lowest HR (only if HR exists and > 0)
    if (a.avgHeartRate && a.avgHeartRate > 0 && a.avgHeartRate < lowestHr) {
      lowestHr = a.avgHeartRate;
      lowestHrActivityId = a.id;
      lowestHrDate = new Date(a.date);
    }
  }

  // Delete existing records
  await db.delete(personalRecords).where(eq(personalRecords.userId, userId));

  // Insert new records
  const records: Array<{
    userId: string;
    type: string;
    value: string;
    activityId: string;
    achievedAt: Date;
  }> = [];

  if (bestKmActivityId && bestKmDate) {
    records.push({
      userId,
      type: "best_km",
      value: secondsToPace(bestKmPace),
      activityId: bestKmActivityId,
      achievedAt: bestKmDate,
    });
  }

  if (bestAvgActivityId && bestAvgDate) {
    records.push({
      userId,
      type: "best_avg_pace",
      value: secondsToPace(bestAvgPace),
      activityId: bestAvgActivityId,
      achievedAt: bestAvgDate,
    });
  }

  if (longestActivityId && longestDate) {
    records.push({
      userId,
      type: "longest_run",
      value: `${longestDist.toFixed(1)} km`,
      activityId: longestActivityId,
      achievedAt: longestDate,
    });
  }

  if (lowestHrActivityId && lowestHrDate && lowestHr < Infinity) {
    records.push({
      userId,
      type: "lowest_hr",
      value: `${lowestHr} bpm`,
      activityId: lowestHrActivityId,
      achievedAt: lowestHrDate,
    });
  }

  if (records.length > 0) {
    await db.insert(personalRecords).values(records);
  }
}
