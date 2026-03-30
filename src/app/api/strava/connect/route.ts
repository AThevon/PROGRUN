import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getStravaAuthorizeUrl } from "@/lib/strava/oauth";

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", getBaseUrl()));
  }

  const callbackUrl = `${getBaseUrl()}/api/strava/callback`;
  const { url, state } = getStravaAuthorizeUrl(callbackUrl);

  const response = NextResponse.redirect(url);
  response.cookies.set("oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 600, // 10 minutes
  });

  return response;
}
