import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { planSessions, planWeeks, plans } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const { dayOfWeek } = body as { dayOfWeek: number };

  if (dayOfWeek == null || dayOfWeek < 0 || dayOfWeek > 6) {
    return NextResponse.json({ error: "Invalid dayOfWeek (0-6)" }, { status: 400 });
  }

  // Verify session belongs to user's plan
  const planSession = await db.query.planSessions.findFirst({
    where: eq(planSessions.id, id),
    with: { week: { with: { plan: true } } },
  });

  if (!planSession) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const weekData = planSession.week as any;
  if (weekData?.plan?.userId !== session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  await db
    .update(planSessions)
    .set({ dayOfWeek })
    .where(eq(planSessions.id, id));

  return NextResponse.json({ ok: true, dayOfWeek });
}
