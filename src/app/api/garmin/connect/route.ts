import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getStravaAuthorizeUrl } from "@/lib/strava/oauth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL));
  }

  const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/garmin/callback`;
  return NextResponse.redirect(getStravaAuthorizeUrl(callbackUrl));
}
