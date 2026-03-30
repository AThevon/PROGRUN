import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { seedPlan } from "@/lib/db/seed";

export async function POST() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const plan = await seedPlan(session.user.id);
  return NextResponse.json(plan);
}
