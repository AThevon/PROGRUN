import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, activities } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { refreshStravaToken } from "@/lib/strava/oauth";
import { calculatePace } from "@/lib/utils/pace";
import { autoMatchActivity } from "@/lib/utils/matching";
import { refreshPersonalRecords } from "@/lib/utils/records";

async function getValidToken(userId: string) {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user?.stravaAccessToken || !user?.stravaRefreshToken) return null;

  const expiresAt = parseInt(user.stravaTokenExpiresAt || "0");
  if (Date.now() / 1000 < expiresAt - 60) return user.stravaAccessToken;

  const tokens = await refreshStravaToken(user.stravaRefreshToken);
  await db
    .update(users)
    .set({
      stravaAccessToken: tokens.access_token,
      stravaRefreshToken: tokens.refresh_token,
      stravaTokenExpiresAt: String(tokens.expires_at),
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
        eq(activities.stravaActivityId, `strava_${id}`)
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

    // Fetch GPS streams (latlng + heartrate + cadence)
    let gpsTrack: Array<[number, number]> | null = null;
    try {
      const streamsRes = await fetch(
        `https://www.strava.com/api/v3/activities/${id}/streams?keys=latlng,heartrate,cadence,altitude&key_type=time`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (streamsRes.ok) {
        const streams = (await streamsRes.json()) as Array<{
          type: string;
          data: number[] | Array<[number, number]>;
        }>;
        const latlngStream = streams.find((s) => s.type === "latlng");
        if (latlngStream?.data?.length) {
          gpsTrack = latlngStream.data as Array<[number, number]>;
        }
      }
    } catch {
      // GPS is optional — continue without it
    }

    // Build laps from Strava laps endpoint
    let laps: Array<{
      distanceKm: number;
      durationSeconds: number;
      avgPace: string;
      avgHeartRate: number | null;
      avgCadence: number | null;
    }> | null = null;
    try {
      const lapsRes = await fetch(
        `https://www.strava.com/api/v3/activities/${id}/laps`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (lapsRes.ok) {
        const stravaLaps = (await lapsRes.json()) as Array<{
          distance: number;
          moving_time: number;
          average_heartrate?: number;
          average_cadence?: number;
        }>;
        if (stravaLaps.length > 0) {
          laps = stravaLaps.map((l) => {
            const lapDist = l.distance / 1000;
            return {
              distanceKm: Math.round(lapDist * 100) / 100,
              durationSeconds: l.moving_time,
              avgPace: calculatePace(lapDist, l.moving_time),
              avgHeartRate: l.average_heartrate ? Math.round(l.average_heartrate) : null,
              avgCadence: l.average_cadence ? Math.round(l.average_cadence * 2) : null,
            };
          });
        }
      }
    } catch {
      // Laps are optional
    }

    const [activity] = await db
      .insert(activities)
      .values({
        userId,
        stravaActivityId: `strava_${sa.id}`,
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
        gpsTrack,
        laps,
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

  // Refresh personal records after import
  if (imported > 0) {
    await refreshPersonalRecords(userId);
  }

  return NextResponse.json({ imported });
}
