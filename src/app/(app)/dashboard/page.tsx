import { User } from "lucide-react";
import { requireAuth } from "@/lib/auth/session";
import { getActivePlan, getPlanWeeksWithProgress } from "@/lib/db/queries/plans";
import { getLastActivity } from "@/lib/db/queries/activities";
import { getCumulativeStats } from "@/lib/db/queries/stats";
import { calculatePace } from "@/lib/utils/pace";
import { NextSessionHero } from "@/components/dashboard/next-session-hero";
import { QuickStats } from "@/components/dashboard/quick-stats";
import { LastRunCard } from "@/components/dashboard/last-run-card";
import { VolumeChart } from "@/components/dashboard/volume-chart";

/** Return Monday of the ISO week that contains `date`. */
function getISOWeekMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun..6=Sat
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Number of full weeks elapsed since planStartDate (1-based). */
function currentWeekNum(planStartDate: string): number {
  const start = new Date(planStartDate);
  start.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((now.getTime() - start.getTime()) / 86_400_000);
  return Math.max(1, Math.floor(diffDays / 7) + 1);
}

export default async function DashboardPage() {
  const session = await requireAuth();
  const userId = session.user!.id as string;

  // Parallel data fetching
  const [plan, lastActivity, cumulativeStats] = await Promise.all([
    getActivePlan(userId),
    getLastActivity(userId),
    getCumulativeStats(userId),
  ]);

  const weeksWithProgress = plan
    ? await getPlanWeeksWithProgress(plan.id, userId)
    : [];

  // Determine current week number
  const currentWeek = plan?.startDate ? currentWeekNum(plan.startDate) : 1;

  // Find next undone session (first session without an activity in current/future weeks)
  let nextSession: (typeof plan extends null ? never : NonNullable<typeof plan>["weeks"][number]["sessions"][number]) | null = null;
  let nextSessionWeek: (typeof weeksWithProgress)[number] | null = null;

  for (const week of weeksWithProgress) {
    if (week.weekNumber < currentWeek) continue;
    for (const s of week.sessions) {
      if (s.type === "rest") continue;
      if (s.activity == null) {
        nextSession = s;
        nextSessionWeek = week;
        break;
      }
    }
    if (nextSession) break;
  }

  // Current week stats
  const currentWeekData = weeksWithProgress.find(
    (w) => w.weekNumber === currentWeek
  );
  const weekDistanceKm = currentWeekData?.actualVolumeKm ?? 0;
  const weekTargetKm = currentWeekData?.targetVolumeKm ?? 0;

  // Average pace from last activity
  const avgPace =
    lastActivity
      ? calculatePace(lastActivity.distanceKm, lastActivity.durationSeconds)
      : "--:--";

  // Volume chart data — show up to 8 weeks
  const chartWeeks = weeksWithProgress.slice(0, 8).map((week) => ({
    weekNumber: week.weekNumber,
    targetVolumeKm: week.targetVolumeKm ?? 0,
    actualVolumeKm: week.actualVolumeKm,
    isCurrent: week.weekNumber === currentWeek,
    isPast: week.weekNumber < currentWeek,
  }));

  // Greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Bonjour" : hour < 18 ? "Bon apres-midi" : "Bonsoir";

  const userName = session.user?.name?.split(" ")[0] ?? "Runner";


  return (
    <div className="p-5 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-dm text-muted uppercase tracking-widest">
            {greeting}
          </p>
          <h1 className="font-bebas text-[36px] leading-none text-text">
            {userName}
          </h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center text-muted">
          <User size={20} strokeWidth={2} />
        </div>
      </div>

      {/* No plan empty state */}
      {!plan && (
        <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col items-center gap-3 text-center">
          <span className="font-bebas text-2xl text-muted">Aucun plan actif</span>
          <p className="text-sm font-dm text-muted">
            Cree ou importe un plan d&apos;entrainement pour commencer.
          </p>
        </div>
      )}

      {/* Next session hero */}
      {nextSession && nextSessionWeek && (
        <NextSessionHero session={nextSession} week={nextSessionWeek} />
      )}

      {/* Quick stats */}
      {plan && (
        <QuickStats
          weekDistanceKm={weekDistanceKm}
          weekTargetKm={weekTargetKm}
          avgPace={avgPace}
          totalDistanceKm={cumulativeStats.totalDistanceKm}
        />
      )}

      {/* Last run card */}
      {lastActivity && (
        <div className="flex flex-col gap-2">
          <h2 className="font-bebas text-xl text-muted tracking-wide">
            Derniere course
          </h2>
          <LastRunCard activity={lastActivity} />
        </div>
      )}

      {/* Volume chart */}
      {chartWeeks.length > 0 && (
        <VolumeChart
          weeks={chartWeeks}
          totalKm={cumulativeStats.totalDistanceKm}
        />
      )}
    </div>
  );
}
