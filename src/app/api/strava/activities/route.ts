import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, activities } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { refreshStravaToken } from "@/lib/strava/oauth";

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

export async function GET() {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const token = await getValidToken(session.user.id);
  if (!token)
    return NextResponse.json({ error: "Strava not connected" }, { status: 400 });

  const res = await fetch(
    "https://www.strava.com/api/v3/athlete/activities?per_page=30",
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok)
    return NextResponse.json({ error: "Strava API error" }, { status: 502 });

  const stravaActivities = await res.json();

  const userId = session.user.id as string;

  const alreadyImported = await Promise.all(
    stravaActivities
      .filter((a: { type: string }) => a.type === "Run")
      .map(async (a: { id: number; [key: string]: unknown }) => {
        const existing = await db.query.activities.findFirst({
          where: and(
            eq(activities.userId, userId),
            eq(activities.garminActivityId, `strava_${a.id}`)
          ),
        });
        return { ...a, alreadyImported: !!existing };
      })
  );

  return NextResponse.json({ activities: alreadyImported });
}
