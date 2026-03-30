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

  const callbackUrl = `${getBaseUrl()}/api/garmin/callback`;
  return NextResponse.redirect(getStravaAuthorizeUrl(callbackUrl));
}
