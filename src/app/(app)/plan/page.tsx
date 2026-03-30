import { requireAuth } from "@/lib/auth/session";
import {
  getActivePlan,
  getPlanWeeksWithProgress,
} from "@/lib/db/queries/plans";
import { Check, Zap, Moon } from "lucide-react";
import { PHASE_COLORS } from "@/lib/utils/zones";
import { calculatePace } from "@/lib/utils/pace";

const PHASE_NAMES: Record<string, string> = {
  build: "Construction",
  recovery: "Recuperation",
  performance: "Performance",
  taper: "Affutage",
  race: "Race Week",
};

const DAY_NAMES = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

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

  const activePlan = await getActivePlan(userId);

  if (!activePlan) {
    return (
      <div className="p-5">
        <h1 className="font-bebas text-[32px] text-text">Mon plan</h1>
        <p className="text-muted text-sm mt-2">Aucun plan actif</p>
      </div>
    );
  }

  const weeksWithProgress = await getPlanWeeksWithProgress(activePlan.id, userId);
  const durationWeeks = activePlan.durationWeeks ?? 8;
  const currentWeekNumber = activePlan.startDate
    ? currentWeekNum(activePlan.startDate, durationWeeks)
    : 1;

  // Progress ring math
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(currentWeekNumber / durationWeeks, 1);
  const offset = circumference * (1 - progress);

  const currentWeekData = weeksWithProgress.find((w) => w.weekNumber === currentWeekNumber);
  const weekDistance = currentWeekData?.actualVolumeKm ?? 0;
  const weekTarget = currentWeekData?.targetVolumeKm ?? 0;
  const completedSessions = currentWeekData?.completedSessions ?? 0;
  const totalSessions = currentWeekData?.sessions?.length ?? 0;

  return (
    <div className="p-5 flex flex-col gap-5">
      <h1 className="font-bebas text-[32px] leading-none text-text">Mon plan</h1>

      {/* Plan selector */}
      <div className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="font-bebas text-[22px] leading-none text-text">Mon plan</span>
          <span className="bg-bg border border-border rounded-full px-3 py-1.5 text-sm font-dm text-text truncate max-w-[200px]">
            {activePlan.name}
          </span>
        </div>
        <div className="flex items-center gap-5">
          <div className="relative" style={{ width: 88, height: 88 }}>
            <svg width={88} height={88} className="-rotate-90">
              <circle cx={44} cy={44} r={radius} fill="none" stroke="var(--color-border)" strokeWidth={6} />
              <circle cx={44} cy={44} r={radius} fill="none" stroke="var(--color-accent)" strokeWidth={6} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-bebas text-2xl leading-none text-accent">{currentWeekNumber}/{durationWeeks}</span>
              <span className="text-[9px] text-muted uppercase tracking-wider">semaines</span>
            </div>
          </div>
          <div className="flex flex-col gap-2 flex-1">
            <div>
              <span className="text-[10px] font-dm text-muted uppercase tracking-widest">Volume cette semaine</span>
              <div className="flex items-end gap-1">
                <span className="font-bebas text-2xl leading-none text-accent">{weekDistance.toFixed(1)}</span>
                <span className="text-muted text-xs font-dm mb-0.5">/ {weekTarget.toFixed(1)} km</span>
              </div>
            </div>
            <div>
              <span className="text-[10px] font-dm text-muted uppercase tracking-widest">Seances</span>
              <div className="flex items-end gap-1">
                <span className="font-bebas text-2xl leading-none text-success">{completedSessions}</span>
                <span className="text-muted text-xs font-dm mb-0.5">/ {totalSessions} faites</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Roadmap */}
      <div className="flex gap-1">
        {weeksWithProgress.map((w) => {
          const color = PHASE_COLORS[w.phase ?? "build"] ?? "#888890";
          const isCurrent = w.weekNumber === currentWeekNumber;
          const isDone = w.weekNumber < currentWeekNumber;
          return (
            <div
              key={w.weekNumber}
              className={`flex-1 h-7 rounded-md flex items-center justify-center font-bebas text-xs text-bg ${isCurrent ? "ring-2 ring-text ring-offset-2 ring-offset-bg" : ""} ${isDone ? "opacity-60" : ""}`}
              style={{ backgroundColor: color }}
            >
              S{w.weekNumber}
              {isDone && <Check size={10} className="ml-0.5" />}
            </div>
          );
        })}
      </div>

      {/* Weeks */}
      {weeksWithProgress.map((week) => {
        const isCurrent = week.weekNumber === currentWeekNumber;
        const isPast = week.weekNumber < currentWeekNumber;
        const isFuture = week.weekNumber > currentWeekNumber;
        const phaseColor = PHASE_COLORS[week.phase ?? "build"] ?? "#888890";
        const phaseName = PHASE_NAMES[week.phase ?? ""] ?? week.phase;

        // Past weeks: compact summary
        if (isPast) {
          const totalDist = week.sessions.reduce((s, x) => s + (x.activity?.distanceKm ?? 0), 0);
          const totalDur = week.sessions.reduce((s, x) => s + (x.activity?.durationSeconds ?? 0), 0);
          const avgPace = totalDist > 0 ? calculatePace(totalDist, totalDur) : null;

          return (
            <div key={week.id} className="bg-surface border border-border rounded-xl px-4 py-3 flex items-center gap-4">
              <span className="font-bebas text-3xl leading-none text-success min-w-[28px]">{week.weekNumber}</span>
              <div className="flex-1">
                <span className="text-xs font-dm text-text">{week.title}</span>
                <div className="text-[11px] font-dm text-muted">
                  {week.actualVolumeKm.toFixed(1)} / {(week.targetVolumeKm ?? 0).toFixed(1)} km
                  {" - "}{week.completedSessions} seances
                  {avgPace && ` - ${avgPace} /km`}
                </div>
              </div>
              <div className="w-7 h-7 rounded-full bg-success/20 flex items-center justify-center">
                <Check size={14} className="text-success" />
              </div>
            </div>
          );
        }

        // Current & future weeks: expanded
        return (
          <div key={week.id} className={`flex flex-col gap-3 ${isFuture ? "opacity-50" : ""}`}>
            <div className="flex items-center gap-3">
              <span className="font-bebas text-xl leading-none text-text">Semaine {week.weekNumber}</span>
              {phaseName && (
                <span className="text-[10px] font-dm font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ color: phaseColor, backgroundColor: `${phaseColor}22`, border: `1px solid ${phaseColor}55` }}>
                  {phaseName}
                </span>
              )}
              <div className="flex-1 h-px bg-border" />
            </div>

            {isCurrent && (
              <p className="text-xs font-dm text-muted italic">Touche une seance pour voir le detail</p>
            )}

            <div className="flex flex-col gap-2">
              {week.sessions.map((s) => {
                const hasActivity = !!s.activity;
                const isKey = s.isKeySession ?? false;
                const isRest = s.type === "repos";
                const dayName = s.dayOfWeek != null ? (DAY_NAMES[s.dayOfWeek] ?? "?") : "?";

                return (
                  <div
                    key={s.id}
                    className={`bg-card border rounded-xl p-3 flex gap-3 ${hasActivity ? "border-success" : isKey ? "border-accent" : isRest ? "border-border border-dashed opacity-45" : "border-border"}`}
                  >
                    <div className="flex flex-col items-center gap-1 min-w-[40px]">
                      <span className="text-xs font-dm text-muted">{dayName}</span>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${hasActivity ? "bg-success/20 text-success" : isKey ? "bg-accent/20 text-accent" : "bg-border/30 text-muted"}`}>
                        {hasActivity ? <Check size={16} /> : isKey ? <Zap size={16} /> : isRest ? <Moon size={16} /> : <span className="font-bebas text-xs">{s.targetDistanceKm}</span>}
                      </div>
                    </div>
                    <div className="flex-1">
                      {s.type && <span className="text-[10px] font-dm text-muted uppercase tracking-wide">{s.type}</span>}
                      <div className="font-bebas text-lg leading-tight text-text">{s.title ?? "Seance"}</div>
                      {s.description && <p className="text-xs font-dm text-muted line-clamp-2">{s.description}</p>}
                      {!hasActivity && s.targetDistanceKm != null && (
                        <span className="text-xs font-dm text-muted">{s.targetDistanceKm.toFixed(1)} km{s.targetPace ? ` @ ${s.targetPace}` : ""}</span>
                      )}
                      {hasActivity && s.activity && (
                        <div className="flex bg-card rounded-lg overflow-hidden mt-2 border border-border">
                          <div className="flex-1 flex flex-col items-center py-2 border-r border-border">
                            <span className="text-[9px] text-muted uppercase">Dist.</span>
                            <span className="font-bebas text-lg leading-none text-success">{s.activity.distanceKm.toFixed(1)}</span>
                          </div>
                          <div className="flex-1 flex flex-col items-center py-2 border-r border-border">
                            <span className="text-[9px] text-muted uppercase">Allure</span>
                            <span className="font-bebas text-lg leading-none text-text">{s.activity.avgPace ?? "--"}</span>
                          </div>
                          <div className="flex-1 flex flex-col items-center py-2">
                            <span className="text-[9px] text-muted uppercase">FC</span>
                            <span className="font-bebas text-lg leading-none text-text">{s.activity.avgHeartRate ?? "--"}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
