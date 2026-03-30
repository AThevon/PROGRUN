import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  real,
  jsonb,
  date,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ---------------------------------------------------------------------------
// users
// ---------------------------------------------------------------------------
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").unique().notNull(),
  name: text("name"),
  image: text("image"),
  garminAccessToken: text("garmin_access_token"),
  garminRefreshToken: text("garmin_refresh_token"),
  garminUserId: text("garmin_user_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// accounts (NextAuth)
// ---------------------------------------------------------------------------
export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refreshToken: text("refresh_token"),
  accessToken: text("access_token"),
  expiresAt: integer("expires_at"),
  tokenType: text("token_type"),
  scope: text("scope"),
  idToken: text("id_token"),
  sessionState: text("session_state"),
});

// ---------------------------------------------------------------------------
// sessions (NextAuth)
// ---------------------------------------------------------------------------
export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionToken: text("session_token").unique().notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires").notNull(),
});

// ---------------------------------------------------------------------------
// verificationTokens (NextAuth)
// ---------------------------------------------------------------------------
export const verificationTokens = pgTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: timestamp("expires").notNull(),
});

// ---------------------------------------------------------------------------
// plans
// ---------------------------------------------------------------------------
export const plans = pgTable("plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  targetDistance: real("target_distance"),
  targetTime: text("target_time"),
  targetPace: text("target_pace"),
  durationWeeks: integer("duration_weeks"),
  startDate: date("start_date"),
  isActive: boolean("is_active").default(false),
  zones: jsonb("zones"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// planWeeks
// ---------------------------------------------------------------------------
export const planWeeks = pgTable("plan_weeks", {
  id: uuid("id").primaryKey().defaultRandom(),
  planId: uuid("plan_id")
    .notNull()
    .references(() => plans.id, { onDelete: "cascade" }),
  weekNumber: integer("week_number").notNull(),
  phase: text("phase"),
  title: text("title"),
  targetVolumeKm: real("target_volume_km"),
  targetSessions: integer("target_sessions"),
});

// ---------------------------------------------------------------------------
// planSessions
// ---------------------------------------------------------------------------
export const planSessions = pgTable("plan_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  weekId: uuid("week_id")
    .notNull()
    .references(() => planWeeks.id, { onDelete: "cascade" }),
  dayOfWeek: integer("day_of_week"),
  type: text("type"),
  isKeySession: boolean("is_key_session").default(false),
  title: text("title"),
  description: text("description"),
  targetDistanceKm: real("target_distance_km"),
  targetPace: text("target_pace"),
  targetZone: text("target_zone"),
  intervals: jsonb("intervals"),
});

// ---------------------------------------------------------------------------
// activities
// ---------------------------------------------------------------------------
export const activities = pgTable("activities", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  garminActivityId: text("garmin_activity_id").unique(),
  source: text("source"),
  name: text("name"),
  date: timestamp("date").notNull(),
  distanceKm: real("distance_km").notNull(),
  durationSeconds: integer("duration_seconds").notNull(),
  avgPace: text("avg_pace"),
  avgHeartRate: integer("avg_heart_rate"),
  maxHeartRate: integer("max_heart_rate"),
  avgCadence: integer("avg_cadence"),
  elevationGain: real("elevation_gain"),
  calories: integer("calories"),
  vo2max: real("vo2max"),
  groundContactTime: integer("ground_contact_time"),
  gpsTrack: jsonb("gps_track"),
  laps: jsonb("laps"),
  rawData: jsonb("raw_data"),
  linkedSessionId: uuid("linked_session_id").references(
    () => planSessions.id,
    { onDelete: "set null" }
  ),
  matchStatus: text("match_status"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// personalRecords
// ---------------------------------------------------------------------------
export const personalRecords = pgTable("personal_records", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  value: text("value").notNull(),
  activityId: uuid("activity_id")
    .notNull()
    .references(() => activities.id, { onDelete: "cascade" }),
  achievedAt: timestamp("achieved_at").notNull(),
});

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------

export const usersRelations = relations(users, ({ many }) => ({
  plans: many(plans),
  activities: many(activities),
  records: many(personalRecords),
  accounts: many(accounts),
  sessions: many(sessions),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const plansRelations = relations(plans, ({ one, many }) => ({
  user: one(users, { fields: [plans.userId], references: [users.id] }),
  weeks: many(planWeeks),
}));

export const planWeeksRelations = relations(planWeeks, ({ one, many }) => ({
  plan: one(plans, { fields: [planWeeks.planId], references: [plans.id] }),
  sessions: many(planSessions),
}));

export const planSessionsRelations = relations(
  planSessions,
  ({ one, many }) => ({
    week: one(planWeeks, {
      fields: [planSessions.weekId],
      references: [planWeeks.id],
    }),
    activities: many(activities),
  })
);

export const activitiesRelations = relations(activities, ({ one }) => ({
  user: one(users, { fields: [activities.userId], references: [users.id] }),
  linkedSession: one(planSessions, {
    fields: [activities.linkedSessionId],
    references: [planSessions.id],
  }),
}));

export const personalRecordsRelations = relations(
  personalRecords,
  ({ one }) => ({
    user: one(users, {
      fields: [personalRecords.userId],
      references: [users.id],
    }),
    activity: one(activities, {
      fields: [personalRecords.activityId],
      references: [activities.id],
    }),
  })
);
