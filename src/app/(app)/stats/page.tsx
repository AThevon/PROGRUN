import { requireAuth } from "@/lib/auth/session";
import { getCumulativeStats, getWeeklyVolumes } from "@/lib/db/queries/stats";
import { getActivePlan, getPlanWeeksWithProgress } from "@/lib/db/queries/plans";
import { getUserRecords } from "@/lib/db/queries/records";
import { db } from "@/lib/db";
import { activities } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { paceToSeconds } from "@/lib/utils/pace";
import { SummaryCards } from "@/components/stats/summary-cards";
import { PaceEvolutionChart } from "@/components/stats/pace-evolution-chart";
import { PlanAdherence } from "@/components/stats/plan-adherence";
import { PersonalRecords } from "@/components/stats/personal-records";

/** Number of full weeks elapsed since planStartDate (1-based). */
function currentWeekNum(planStartDate: string): number {
  const start = new Date(planStartDate);
  start.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((now.getTime() - start.getTime()) / 86_400_000);
  return Math.max(1, Math.floor(diffDays / 7) + 1);
}

export default async function StatsPage() {
  const session = await requireAuth();
  const userId = session.user!.id as string;

  const [cumulativeStats, weeklyVolumes, plan, records] = await Promise.all([
    getCumulativeStats(userId),
    getWeeklyVolumes(userId),
    getActivePlan(userId),
    getUserRecords(userId),
  ]);

  const weeksWithProgress = plan
    ? await getPlanWeeksWithProgress(plan.id, userId)
    : [];

  const currentWeek = plan?.startDate ? currentWeekNum(plan.startDate) : 1;

  // Get avg heart rate and vo2max from most recent activity
  const lastActivityWithHR = await db.query.activities.findFirst({
    where: eq(activities.userId, userId),
    orderBy: [desc(activities.date)],
  });
  const avgHeartRate = lastActivityWithHR?.avgHeartRate ?? null;
  const vo2max = lastActivityWithHR?.vo2max ?? null;

  // Build pace evolution data from weekly volumes
  const paceChartData = weeklyVolumes
    .filter((v) => v.avgPaceSeconds > 0)
    .map((v, i) => ({
      week: i + 1,
      avgPaceSeconds: v.avgPaceSeconds,
    }));

  // Target pace from plan
  const targetPaceSeconds = plan?.targetPace
    ? paceToSeconds(plan.targetPace)
    : 360; // default 6:00/km

  return (
    <div className="p-5 flex flex-col gap-5">
      {/* Header */}
      <div>
        <h1 className="font-bebas text-[36px] leading-none text-text">
          Statistiques
        </h1>
        <p className="text-xs font-dm text-muted uppercase tracking-widest mt-0.5">
          Vue d&apos;ensemble de ta progression
        </p>
      </div>

      {/* Summary cards 2x2 */}
      <SummaryCards
        stats={cumulativeStats}
        avgHeartRate={avgHeartRate}
        vo2max={vo2max}
      />

      {/* Pace evolution chart */}
      <PaceEvolutionChart
        data={paceChartData}
        targetPaceSeconds={targetPaceSeconds}
        currentWeek={currentWeek}
      />

      {/* Plan adherence */}
      {weeksWithProgress.length > 0 && (
        <PlanAdherence
          weeks={weeksWithProgress}
          currentWeek={currentWeek}
        />
      )}

      {/* Personal records */}
      <PersonalRecords records={records} />
    </div>
  );
}
