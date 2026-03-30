import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { exchangeStravaCode } from "@/lib/strava/oauth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", getBaseUrl()));
  }

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(
      new URL(`/settings?error=${error || "no_code"}`, getBaseUrl()),
    );
  }

  try {
    const callbackUrl = `${getBaseUrl()}/api/garmin/callback`;
    const tokens = await exchangeStravaCode(code, callbackUrl);

    if (!tokens.access_token) {
      console.error("Strava token exchange failed:", tokens);
      return NextResponse.redirect(
        new URL("/settings?error=token_exchange", getBaseUrl()),
      );
    }

    await db
      .update(users)
      .set({
        garminAccessToken: tokens.access_token,
        garminRefreshToken: tokens.refresh_token,
        garminUserId: String(tokens.expires_at),
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id));

    return NextResponse.redirect(new URL("/settings?strava=connected", getBaseUrl()));
  } catch (err) {
    console.error("Strava callback error:", err);
    return NextResponse.redirect(
      new URL("/settings?error=callback_failed", getBaseUrl()),
    );
  }
}
