import { requireAuth } from "@/lib/auth/session";
import { getUserPlans } from "@/lib/db/queries/plans";
import { PlanList } from "@/components/plan/plan-list";
import { minDelay } from "@/lib/utils/delay";

export default async function PlanPage() {
  const session = await requireAuth();
  const userId = session.user!.id as string;
  const plans = await minDelay(getUserPlans(userId));

  // Serialize to plain JSON — removes Date objects
  const serializedPlans = JSON.parse(JSON.stringify(plans));

  return <PlanList plans={serializedPlans} />;
}
