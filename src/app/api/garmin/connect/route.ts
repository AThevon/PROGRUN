import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { cookies } from "next/headers";
import { getRequestToken, getAuthorizeUrl } from "@/lib/garmin/oauth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { oauthToken, oauthTokenSecret } = await getRequestToken();

    const cookieStore = await cookies();
    cookieStore.set("garmin_oauth_secret", oauthTokenSecret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600, // 10 minutes
      path: "/",
    });

    const authorizeUrl = getAuthorizeUrl(oauthToken);
    return NextResponse.redirect(authorizeUrl);
  } catch (err) {
    console.error("Garmin connect error:", err);
    return NextResponse.json(
      { error: "Failed to initiate Garmin OAuth" },
      { status: 500 }
    );
  }
}
