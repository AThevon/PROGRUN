import type { WeekWithProgress } from "@/types";
import { SessionCard } from "@/components/ui/session-card";
import { PHASE_COLORS } from "@/lib/utils/zones";

const PHASE_NAMES: Record<string, string> = {
  build: "Construction",
  recovery: "Recuperation",
  performance: "Performance",
  taper: "Affutage",
  race: "Race Week",
};

interface WeekSectionProps {
  week: WeekWithProgress;
  isCurrent: boolean;
}

export function WeekSection({ week, isCurrent }: WeekSectionProps) {
  const phaseColor = week.phase
    ? (PHASE_COLORS[week.phase] ?? "var(--color-border)")
    : "var(--color-border)";
  const phaseName = week.phase ? (PHASE_NAMES[week.phase] ?? week.phase) : null;

  return (
    <div className="flex flex-col gap-3">
      {/* Section divider */}
      <div className="flex items-center gap-3">
        <span className="font-bebas text-xl leading-none text-text tracking-wide">
          Semaine {week.weekNumber}
        </span>
        {phaseName && (
          <span
            className="text-[10px] font-dm font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full"
            style={{
              color: phaseColor,
              backgroundColor: `${phaseColor}22`,
              border: `1px solid ${phaseColor}55`,
            }}
          >
            {phaseName}
          </span>
        )}
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Hint for current week */}
      {isCurrent && (
        <p className="text-xs font-dm text-muted italic">
          Touche une seance pour voir le detail
        </p>
      )}

      {/* Session list */}
      <div className="flex flex-col gap-2">
        {week.sessions.map((session) => (
          <SessionCard
            key={session.id}
            session={session}
            activity={session.activity}
          />
        ))}
      </div>
    </div>
  );
}
