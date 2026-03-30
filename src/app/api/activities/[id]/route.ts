import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { activities } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { refreshPersonalRecords } from "@/lib/utils/records";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id as string;
  const { id } = await params;

  await db
    .delete(activities)
    .where(and(eq(activities.id, id), eq(activities.userId, userId)));

  // Refresh personal records after deletion
  await refreshPersonalRecords(userId);

  return NextResponse.json({ ok: true });
}
