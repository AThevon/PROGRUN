import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { cookies } from "next/headers";
import { getAccessToken } from "@/lib/garmin/oauth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  const userId = session.user.id;

  const { searchParams } = new URL(req.url);
  const oauthToken = searchParams.get("oauth_token");
  const oauthVerifier = searchParams.get("oauth_verifier");

  if (!oauthToken || !oauthVerifier) {
    return NextResponse.redirect(
      new URL("/settings?error=garmin_callback_missing_params", req.url)
    );
  }

  const cookieStore = await cookies();
  const oauthTokenSecret = cookieStore.get("garmin_oauth_secret")?.value;

  if (!oauthTokenSecret) {
    return NextResponse.redirect(
      new URL("/settings?error=garmin_secret_missing", req.url)
    );
  }

  try {
    const { oauthToken: accessToken, oauthTokenSecret: accessSecret, garminUserId } =
      await getAccessToken(oauthToken, oauthTokenSecret, oauthVerifier);

    await db
      .update(users)
      .set({
        garminAccessToken: accessToken,
        garminRefreshToken: accessSecret,
        garminUserId: garminUserId ?? null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    // Clear the temp cookie
    cookieStore.delete("garmin_oauth_secret");

    return NextResponse.redirect(
      new URL("/settings?success=garmin_connected", req.url)
    );
  } catch (err) {
    console.error("Garmin callback error:", err);
    return NextResponse.redirect(
      new URL("/settings?error=garmin_access_token_failed", req.url)
    );
  }
}
