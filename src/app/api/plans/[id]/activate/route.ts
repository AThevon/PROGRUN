import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { plans } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // Deactivate all plans for this user
  await db
    .update(plans)
    .set({ isActive: false })
    .where(eq(plans.userId, session.user.id));

  // Activate the selected plan
  await db
    .update(plans)
    .set({ isActive: true })
    .where(and(eq(plans.id, id), eq(plans.userId, session.user.id)));

  return NextResponse.json({ ok: true });
}
