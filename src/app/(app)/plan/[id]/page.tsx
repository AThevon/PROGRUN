import { requireAuth } from "@/lib/auth/session";
import { getPlanWeeksWithProgress } from "@/lib/db/queries/plans";
import { db } from "@/lib/db";
import { plans } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { PlanDetail } from "@/components/plan/plan-detail";

export default async function PlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireAuth();
  const userId = session.user!.id as string;
  const { id } = await params;

  const plan = await db.query.plans.findFirst({
    where: and(eq(plans.id, id), eq(plans.userId, userId)),
  });
  if (!plan) notFound();

  const weeksWithProgress = await getPlanWeeksWithProgress(id, userId);

  // Serialize everything to plain JSON
  const data = JSON.parse(JSON.stringify({ plan, weeks: weeksWithProgress }));

  return <PlanDetail plan={data.plan} weeks={data.weeks} />;
}
