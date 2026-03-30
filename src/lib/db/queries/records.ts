import { db } from "@/lib/db";
import { personalRecords } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import type { PersonalRecord } from "@/types";

export interface RecordWithActivity extends PersonalRecord {
  activity: import("@/types").Activity;
}

export async function getUserRecords(
  userId: string,
): Promise<RecordWithActivity[]> {
  const results = await db.query.personalRecords.findMany({
    where: eq(personalRecords.userId, userId),
    orderBy: [desc(personalRecords.achievedAt)],
    with: {
      activity: true,
    },
  });

  return results as RecordWithActivity[];
}

export async function upsertRecord(
  userId: string,
  type: string,
  value: string,
  activityId: string,
  achievedAt: Date,
): Promise<PersonalRecord> {
  const [result] = await db
    .insert(personalRecords)
    .values({ userId, type, value, activityId, achievedAt })
    .onConflictDoUpdate({
      target: [personalRecords.userId, personalRecords.type],
      set: { value, activityId, achievedAt },
    })
    .returning();
  return result;
}
