import { db } from "@/lib/db";
import { activities, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { refreshStravaToken } from "./oauth";
import { calculatePace } from "@/lib/utils/pace";

const STRAVA_API = "https://www.strava.com/api/v3";

async function getValidToken(userId: string): Promise<string | null> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user?.stravaAccessToken || !user?.stravaRefreshToken) return null;

  const expiresAt = parseInt(user.stravaTokenExpiresAt || "0");

  if (Date.now() / 1000 < expiresAt - 60) {
    return user.stravaAccessToken;
  }

  // Token expired, refresh it
  const tokens = await refreshStravaToken(user.stravaRefreshToken);
  await db.update(users).set({
    stravaAccessToken: tokens.access_token,
    stravaRefreshToken: tokens.refresh_token,
    stravaTokenExpiresAt: String(tokens.expires_at),
    updatedAt: new Date(),
  }).where(eq(users.id, userId));

  return tokens.access_token;
}

export async function syncStravaActivities(userId: string): Promise<number> {
  const token = await getValidToken(userId);
  if (!token) return 0;

  // Fetch last 30 activities from Strava
  const res = await fetch(`${STRAVA_API}/athlete/activities?per_page=30`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) return 0;

  const stravaActivities = await res.json() as Array<{
    id: number;
    name: string;
    start_date: string;
    distance: number; // meters
    moving_time: number; // seconds
    elapsed_time: number;
    average_speed: number; // m/s
    max_speed: number;
    average_heartrate?: number;
    max_heartrate?: number;
    average_cadence?: number;
    total_elevation_gain: number;
    calories?: number;
    type: string;
    map?: { summary_polyline?: string };
  }>;

  let synced = 0;

  for (const sa of stravaActivities) {
    // Skip non-run activities
    if (sa.type !== "Run") continue;

    // Check if already imported
    const existing = await db.query.activities.findFirst({
      where: and(
        eq(activities.userId, userId),
        eq(activities.stravaActivityId, `strava_${sa.id}`),
      ),
    });
    if (existing) continue;

    const distanceKm = sa.distance / 1000;
    const avgPace = calculatePace(distanceKm, sa.moving_time);

    await db.insert(activities).values({
      userId,
      stravaActivityId: `strava_${sa.id}`,
      source: "strava_sync",
      name: sa.name,
      date: new Date(sa.start_date),
      distanceKm: Math.round(distanceKm * 100) / 100,
      durationSeconds: sa.moving_time,
      avgPace,
      avgHeartRate: sa.average_heartrate ? Math.round(sa.average_heartrate) : null,
      maxHeartRate: sa.max_heartrate ? Math.round(sa.max_heartrate) : null,
      avgCadence: sa.average_cadence ? Math.round(sa.average_cadence * 2) : null,
      elevationGain: sa.total_elevation_gain || null,
      calories: sa.calories ? Math.round(sa.calories) : null,
      matchStatus: "unmatched",
    });
    synced++;
  }

  return synced;
}
