import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session?.user?.id;

  // Allow NextAuth API routes through
  if (nextUrl.pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Redirect authenticated users away from login page
  if (isLoggedIn && nextUrl.pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // Redirect unauthenticated users to login
  if (!isLoggedIn && nextUrl.pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next|icons|manifest.json|favicon.ico).*)"],
};
