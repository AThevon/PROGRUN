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
  primaryKey,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ---------------------------------------------------------------------------
// users
// ---------------------------------------------------------------------------
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").unique().notNull(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  name: text("name"),
  image: text("image"),
  stravaAccessToken: text("strava_access_token"),
  stravaRefreshToken: text("strava_refresh_token"),
  stravaTokenExpiresAt: text("strava_token_expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// accounts (NextAuth)
// ---------------------------------------------------------------------------
export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ],
);

// ---------------------------------------------------------------------------
// sessions (NextAuth)
// ---------------------------------------------------------------------------
export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

// ---------------------------------------------------------------------------
// verificationTokens (NextAuth)
// ---------------------------------------------------------------------------
export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })],
);

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
  stravaActivityId: text("strava_activity_id").unique(),
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
export const personalRecords = pgTable(
  "personal_records",
  {
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
  },
  (table) => [
    uniqueIndex("personal_records_user_id_type_idx").on(
      table.userId,
      table.type,
    ),
  ],
);

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
