import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { exchangeStravaCode } from "@/lib/strava/oauth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL));
  }

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(new URL("/settings?error=no_code", process.env.NEXT_PUBLIC_APP_URL));
  }

  const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/garmin/callback`;
  const tokens = await exchangeStravaCode(code, callbackUrl);

  // Store tokens in DB (reusing garmin columns)
  await db.update(users).set({
    garminAccessToken: tokens.access_token,
    garminRefreshToken: tokens.refresh_token,
    garminUserId: String(tokens.expires_at),
    updatedAt: new Date(),
  }).where(eq(users.id, session.user.id));

  return NextResponse.redirect(new URL("/settings", process.env.NEXT_PUBLIC_APP_URL));
}
