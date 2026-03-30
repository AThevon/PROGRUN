import { InferSelectModel } from "drizzle-orm";
import {
  users,
  plans,
  planWeeks,
  planSessions,
  activities,
  personalRecords,
} from "@/lib/db/schema";

export type User = InferSelectModel<typeof users>;
export type Plan = InferSelectModel<typeof plans>;
export type PlanWeek = InferSelectModel<typeof planWeeks>;
export type PlanSession = InferSelectModel<typeof planSessions>;
export type Activity = InferSelectModel<typeof activities>;
export type PersonalRecord = InferSelectModel<typeof personalRecords>;

export type PlanWithWeeks = Plan & {
  weeks: (PlanWeek & { sessions: PlanSession[] })[];
};

export type ActivityWithSession = Activity & {
  linkedSession: PlanSession | null;
};

export type WeekWithProgress = PlanWeek & {
  sessions: (PlanSession & { activity: Activity | null })[];
  actualVolumeKm: number;
  completedSessions: number;
};
