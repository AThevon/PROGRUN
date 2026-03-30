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
  const state = url.searchParams.get("state");

  if (error || !code) {
    return NextResponse.redirect(
      new URL(`/settings?error=${error || "no_code"}`, getBaseUrl()),
    );
  }

  // Vérification CSRF : le state reçu doit correspondre au cookie
  const cookies = request.headers.get("cookie") || "";
  const storedState = cookies
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("oauth_state="))
    ?.split("=")[1];

  if (!state || !storedState || state !== storedState) {
    return NextResponse.redirect(
      new URL("/settings?error=invalid_state", getBaseUrl()),
    );
  }

  try {
    const callbackUrl = `${getBaseUrl()}/api/strava/callback`;
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
        stravaAccessToken: tokens.access_token,
        stravaRefreshToken: tokens.refresh_token,
        stravaTokenExpiresAt: String(tokens.expires_at),
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id));

    const response = NextResponse.redirect(new URL("/settings?strava=connected", getBaseUrl()));
    response.cookies.delete("oauth_state");
    return response;
  } catch (err) {
    console.error("Strava callback error:", err);
    const response = NextResponse.redirect(
      new URL("/settings?error=callback_failed", getBaseUrl()),
    );
    response.cookies.delete("oauth_state");
    return response;
  }
}
