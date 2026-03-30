import { db } from "@/lib/db";
import { activities } from "@/lib/db/schema";
import { and, eq, gte, sql } from "drizzle-orm";

export interface WeeklyStats {
  totalDistanceKm: number;
  totalDurationSeconds: number;
  sessionCount: number;
  avgHeartRate: number | null;
}

export interface CumulativeStats {
  totalDistanceKm: number;
  totalDurationSeconds: number;
  sessionCount: number;
}

export interface WeeklyVolume {
  weekStart: Date;
  totalDistanceKm: number;
  avgPaceSeconds: number;
  sessionCount: number;
}

export async function getWeeklyStats(
  userId: string,
  weekStart: Date,
): Promise<WeeklyStats> {
  const result = await db
    .select({
      totalDistanceKm:
        sql<number>`coalesce(sum(${activities.distanceKm}), 0)`,
      totalDurationSeconds:
        sql<number>`coalesce(sum(${activities.durationSeconds}), 0)`,
      sessionCount: sql<number>`count(*)`,
      avgHeartRate: sql<number | null>`avg(${activities.avgHeartRate})`,
    })
    .from(activities)
    .where(and(eq(activities.userId, userId), gte(activities.date, weekStart)));

  const row = result[0];
  return {
    totalDistanceKm: Number(row.totalDistanceKm),
    totalDurationSeconds: Number(row.totalDurationSeconds),
    sessionCount: Number(row.sessionCount),
    avgHeartRate: row.avgHeartRate !== null ? Number(row.avgHeartRate) : null,
  };
}

export async function getCumulativeStats(
  userId: string,
): Promise<CumulativeStats> {
  const result = await db
    .select({
      totalDistanceKm:
        sql<number>`coalesce(sum(${activities.distanceKm}), 0)`,
      totalDurationSeconds:
        sql<number>`coalesce(sum(${activities.durationSeconds}), 0)`,
      sessionCount: sql<number>`count(*)`,
    })
    .from(activities)
    .where(eq(activities.userId, userId));

  const row = result[0];
  return {
    totalDistanceKm: Number(row.totalDistanceKm),
    totalDurationSeconds: Number(row.totalDurationSeconds),
    sessionCount: Number(row.sessionCount),
  };
}

export async function getWeeklyVolumes(
  userId: string,
): Promise<WeeklyVolume[]> {
  const results = await db
    .select({
      weekStart: sql<Date>`date_trunc('week', ${activities.date})`,
      totalDistanceKm:
        sql<number>`coalesce(sum(${activities.distanceKm}), 0)`,
      avgPaceSeconds: sql<number>`coalesce(
        avg(${activities.durationSeconds}::float / nullif(${activities.distanceKm}, 0)),
        0
      )`,
      sessionCount: sql<number>`count(*)`,
    })
    .from(activities)
    .where(eq(activities.userId, userId))
    .groupBy(sql`date_trunc('week', ${activities.date})`)
    .orderBy(sql`date_trunc('week', ${activities.date})`);

  return results.map((row) => ({
    weekStart: new Date(row.weekStart),
    totalDistanceKm: Number(row.totalDistanceKm),
    avgPaceSeconds: Number(row.avgPaceSeconds),
    sessionCount: Number(row.sessionCount),
  }));
}
