import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { syncStravaActivities } from "@/lib/strava/sync";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const synced = await syncStravaActivities(session.user.id);
  return NextResponse.json({ message: "Sync complete", synced });
}
