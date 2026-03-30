import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, activities } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { refreshStravaToken } from "@/lib/strava/oauth";
import { calculatePace } from "@/lib/utils/pace";
import { autoMatchActivity } from "@/lib/utils/matching";

async function getValidToken(userId: string) {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user?.garminAccessToken || !user?.garminRefreshToken) return null;

  const expiresAt = parseInt(user.garminUserId || "0");
  if (Date.now() / 1000 < expiresAt - 60) return user.garminAccessToken;

  const tokens = await refreshStravaToken(user.garminRefreshToken);
  await db
    .update(users)
    .set({
      garminAccessToken: tokens.access_token,
      garminRefreshToken: tokens.refresh_token,
      garminUserId: String(tokens.expires_at),
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
  return tokens.access_token;
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { activityIds } = (await request.json()) as { activityIds: number[] };
  if (!activityIds?.length)
    return NextResponse.json({ error: "No activities selected" }, { status: 400 });

  const userId = session.user.id as string;

  const token = await getValidToken(userId);
  if (!token)
    return NextResponse.json({ error: "Strava not connected" }, { status: 400 });

  let imported = 0;
  for (const id of activityIds) {
    // Check not already imported
    const existing = await db.query.activities.findFirst({
      where: and(
        eq(activities.userId, userId),
        eq(activities.garminActivityId, `strava_${id}`)
      ),
    });
    if (existing) continue;

    // Fetch full activity detail from Strava
    const res = await fetch(`https://www.strava.com/api/v3/activities/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) continue;
    const sa = await res.json();

    const distanceKm = sa.distance / 1000;
    const avgPace = calculatePace(distanceKm, sa.moving_time);

    const [activity] = await db
      .insert(activities)
      .values({
        userId,
        garminActivityId: `strava_${sa.id}`,
        source: "strava_sync",
        name: sa.name,
        date: new Date(sa.start_date),
        distanceKm: Math.round(distanceKm * 100) / 100,
        durationSeconds: sa.moving_time,
        avgPace,
        avgHeartRate: sa.average_heartrate
          ? Math.round(sa.average_heartrate)
          : null,
        maxHeartRate: sa.max_heartrate ? Math.round(sa.max_heartrate) : null,
        avgCadence: sa.average_cadence
          ? Math.round(sa.average_cadence * 2)
          : null,
        elevationGain: sa.total_elevation_gain || null,
        calories: sa.calories ? Math.round(sa.calories) : null,
        matchStatus: "unmatched",
      })
      .returning();

    // Auto-match
    await autoMatchActivity(
      activity.id,
      userId,
      new Date(sa.start_date),
      distanceKm
    );
    imported++;
  }

  return NextResponse.json({ imported });
}
