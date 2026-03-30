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

function currentWeekNum(planStartDate: string, maxWeeks: number): number {
  const start = new Date(planStartDate);
  start.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((now.getTime() - start.getTime()) / 86_400_000);
  return Math.min(Math.max(1, Math.floor(diffDays / 7) + 1), maxWeeks);
}

export default async function PlanPage() {
  const session = await requireAuth();
  const userId = session.user!.id as string;

  const [activePlan, allPlans] = await Promise.all([
    getActivePlan(userId),
    getUserPlans(userId),
  ]);

  if (!activePlan) {
    return (
      <div className="p-5 flex flex-col gap-5">
        <h1 className="font-bebas text-[32px] leading-none text-text">
          Mon plan
        </h1>
        <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col items-center gap-3 text-center">
          <span className="font-bebas text-2xl text-muted">Aucun plan actif</span>
          <p className="text-sm font-dm text-muted">
            Cree ou importe un plan d&apos;entrainement pour commencer.
          </p>
        </div>
      </div>
    );
  }

  const weeksWithProgress = await getPlanWeeksWithProgress(activePlan.id, userId);
  const durationWeeks = activePlan.durationWeeks ?? 8;
  const currentWeekNumber = activePlan.startDate
    ? currentWeekNum(activePlan.startDate, durationWeeks)
    : 1;

  const currentWeekData =
    weeksWithProgress.find((w) => w.weekNumber === currentWeekNumber) ?? null;
  const pastWeeks = weeksWithProgress.filter((w) => w.weekNumber < currentWeekNumber);
  const futureWeeks = weeksWithProgress.filter((w) => w.weekNumber > currentWeekNumber);

  const weekDistance = currentWeekData?.actualVolumeKm ?? 0;
  const weekTarget = currentWeekData?.targetVolumeKm ?? 0;
  const completedSessions = currentWeekData?.completedSessions ?? 0;
  const totalSessions = currentWeekData?.sessions.length ?? 0;

  const roadmapWeeks = weeksWithProgress.map((w) => ({
    weekNumber: w.weekNumber,
    phase: w.phase ?? "build",
    isComplete: w.weekNumber < currentWeekNumber,
    isCurrent: w.weekNumber === currentWeekNumber,
  }));

  // Serialize for client component (removes Date objects)
  const planSelectorProps = {
    planName: activePlan.name,
    durationWeeks,
    currentWeek: currentWeekNumber,
    weekDistance,
    weekTarget,
    completedSessions,
    totalSessions,
  };

  return (
    <div className="p-5 flex flex-col gap-6">
      <h1 className="font-bebas text-[32px] leading-none text-text">Mon plan</h1>

      <PlanSelectorSimple {...planSelectorProps} />

      {roadmapWeeks.length > 0 && <RoadmapBar weeks={roadmapWeeks} />}

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

      {currentWeekData && <WeekSection week={currentWeekData} isCurrent={true} />}

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

/** Inline server-safe plan selector — no Date serialization issues */
function PlanSelectorSimple({
  planName,
  durationWeeks,
  currentWeek,
  weekDistance,
  weekTarget,
  completedSessions,
  totalSessions,
}: {
  planName: string;
  durationWeeks: number;
  currentWeek: number;
  weekDistance: number;
  weekTarget: number;
  completedSessions: number;
  totalSessions: number;
}) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(currentWeek / durationWeeks, 1);
  const offset = circumference * (1 - progress);

  return (
    <div className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="font-bebas text-[22px] leading-none text-text tracking-wide">
          Mon plan
        </span>
        <span className="bg-bg border border-border rounded-full px-3 py-1.5 text-sm font-dm text-text truncate max-w-[200px]">
          {planName}
        </span>
      </div>

      <div className="flex items-center gap-5">
        {/* Progress ring */}
        <div className="relative" style={{ width: 88, height: 88 }}>
          <svg width={88} height={88} className="-rotate-90">
            <circle cx={44} cy={44} r={radius} fill="none" stroke="var(--color-border)" strokeWidth={6} />
            <circle
              cx={44} cy={44} r={radius} fill="none"
              stroke="var(--color-accent)" strokeWidth={6} strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={offset}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-bebas text-2xl leading-none text-accent">
              {currentWeek}/{durationWeeks}
            </span>
            <span className="text-[9px] text-muted uppercase tracking-wider">semaines</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 flex-1">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-dm text-muted uppercase tracking-widest">
              Volume cette semaine
            </span>
            <div className="flex items-end gap-1">
              <span className="font-bebas text-2xl leading-none text-accent">
                {weekDistance.toFixed(1)}
              </span>
              <span className="text-muted text-xs font-dm mb-0.5">
                / {weekTarget.toFixed(1)} km
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-dm text-muted uppercase tracking-widest">
              Seances
            </span>
            <div className="flex items-end gap-1">
              <span className="font-bebas text-2xl leading-none text-success">
                {completedSessions}
              </span>
              <span className="text-muted text-xs font-dm mb-0.5">
                / {totalSessions} faites
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
