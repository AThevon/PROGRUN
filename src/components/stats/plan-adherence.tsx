import { Scan } from "lucide-react";
import type { WeekWithProgress } from "@/types";

interface PlanAdherenceProps {
  weeks: WeekWithProgress[];
  currentWeek: number;
}

export function PlanAdherence({ weeks, currentWeek }: PlanAdherenceProps) {
  const doneWeeks = weeks.filter((w) => w.weekNumber < currentWeek);

  const totalSessions = doneWeeks.reduce(
    (sum, w) => sum + (w.targetSessions ?? w.sessions.length),
    0
  );
  const completedSessions = doneWeeks.reduce(
    (sum, w) => sum + w.completedSessions,
    0
  );
  const score =
    totalSessions > 0
      ? Math.round((completedSessions / totalSessions) * 100)
      : 0;

  const displayWeeks = weeks.filter((w) => w.weekNumber <= currentWeek);

  return (
    <div className="bg-surface border border-border rounded-2xl p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scan size={18} strokeWidth={2} className="text-accent" />
          <h3 className="font-bebas text-xl text-text tracking-wide">
            Respect du plan
          </h3>
        </div>
        <span className="font-bebas text-2xl text-accent">{score}%</span>
      </div>

      {/* Per-week progress bars */}
      <div className="flex flex-col gap-2">
        {displayWeeks.map((week) => {
          const target = week.targetSessions ?? week.sessions.filter((s) => s.type !== "rest").length;
          const pct = target > 0 ? Math.min((week.completedSessions / target) * 100, 100) : 0;
          const isCurrent = week.weekNumber === currentWeek;
          const isDone = pct >= 100;

          return (
            <div key={week.id} className="flex items-center gap-3">
              <span
                className={`text-xs font-dm w-8 shrink-0 ${
                  isCurrent ? "text-accent" : "text-muted"
                }`}
              >
                S{week.weekNumber}
              </span>
              <div className="flex-1 h-2 bg-card rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: isDone
                      ? "var(--color-success)"
                      : isCurrent
                      ? "var(--color-accent)"
                      : "var(--color-accent)",
                    opacity: isDone ? 1 : 0.75,
                  }}
                />
              </div>
              <span className="text-xs font-dm text-muted w-14 shrink-0 text-right">
                {week.completedSessions}/{target} seances
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
