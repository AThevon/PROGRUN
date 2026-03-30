import { requireAuth } from "@/lib/auth/session";
import {
  getActivePlan,
  getUserPlans,
  getPlanWeeksWithProgress,
} from "@/lib/db/queries/plans";
import { RoadmapBar } from "@/components/ui/roadmap-bar";
import { PlanSelector } from "@/components/plan/plan-selector";
import { WeekSection } from "@/components/plan/week-section";
import { WeekSummary } from "@/components/plan/week-summary";

/** Number of full weeks elapsed since planStartDate (1-based). */
function currentWeekNum(planStartDate: string): number {
  const start = new Date(planStartDate);
  start.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((now.getTime() - start.getTime()) / 86_400_000);
  return Math.max(1, Math.floor(diffDays / 7) + 1);
}

export default async function PlanPage() {
  const session = await requireAuth();
  const userId = session.user!.id as string;

  const [activePlan, allPlans] = await Promise.all([
    getActivePlan(userId),
    getUserPlans(userId),
  ]);

  // Empty state
  if (!activePlan) {
    return (
      <div className="p-5 flex flex-col gap-5">
        <h1 className="font-bebas text-[32px] leading-none text-text">
          Mon plan
        </h1>
        <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col items-center gap-3 text-center">
          <span className="font-bebas text-2xl text-muted">
            Aucun plan actif
          </span>
          <p className="text-sm font-dm text-muted">
            Cree ou importe un plan d&apos;entrainement pour commencer.
          </p>
        </div>
      </div>
    );
  }

  const weeksWithProgress = await getPlanWeeksWithProgress(
    activePlan.id,
    userId
  );

  const currentWeekNumber = activePlan.startDate
    ? currentWeekNum(activePlan.startDate)
    : 1;

  const currentWeekData =
    weeksWithProgress.find((w) => w.weekNumber === currentWeekNumber) ?? null;
  const pastWeeks = weeksWithProgress.filter(
    (w) => w.weekNumber < currentWeekNumber
  );
  const futureWeeks = weeksWithProgress.filter(
    (w) => w.weekNumber > currentWeekNumber
  );

  // Stats for PlanSelector
  const weekDistance = currentWeekData?.actualVolumeKm ?? 0;
  const weekTarget = currentWeekData?.targetVolumeKm ?? 0;
  const completedSessions = currentWeekData?.completedSessions ?? 0;
  const totalSessions = currentWeekData?.sessions.length ?? 0;

  // RoadmapBar pills
  const roadmapWeeks = weeksWithProgress.map((w) => ({
    weekNumber: w.weekNumber,
    phase: w.phase,
    isComplete: w.weekNumber < currentWeekNumber,
    isCurrent: w.weekNumber === currentWeekNumber,
  }));

  return (
    <div className="p-5 flex flex-col gap-6">
      {/* Header */}
      <h1 className="font-bebas text-[32px] leading-none text-text">
        Mon plan
      </h1>

      {/* Plan selector with progress ring */}
      <PlanSelector
        plans={allPlans}
        activePlan={activePlan}
        currentWeek={currentWeekNumber}
        weekDistance={weekDistance}
        weekTarget={weekTarget}
        completedSessions={completedSessions}
        totalSessions={totalSessions}
      />

      {/* Roadmap bar */}
      {roadmapWeeks.length > 0 && (
        <RoadmapBar weeks={roadmapWeeks} />
      )}

      {/* Past weeks — collapsed summaries */}
      {pastWeeks.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-dm text-muted uppercase tracking-widest">
            Semaines passees
          </span>
          {pastWeeks.map((week) => (
            <WeekSummary key={week.id} week={week} />
          ))}
        </div>
      )}

      {/* Current week — expanded */}
      {currentWeekData && (
        <WeekSection week={currentWeekData} isCurrent={true} />
      )}

      {/* Future weeks — grayed out */}
      {futureWeeks.length > 0 && (
        <div className="flex flex-col gap-6 opacity-50">
          {futureWeeks.map((week) => (
            <WeekSection key={week.id} week={week} isCurrent={false} />
          ))}
        </div>
      )}
    </div>
  );
}
