import { Check } from "lucide-react";
import { PHASE_COLORS } from "@/lib/utils/zones";

interface WeekPill {
  weekNumber: number;
  phase?: string | null;
  isComplete: boolean;
  isCurrent: boolean;
}

interface RoadmapBarProps {
  weeks: WeekPill[];
  onWeekClick?: (weekNumber: number) => void;
}

export function RoadmapBar({ weeks, onWeekClick }: RoadmapBarProps) {
  return (
    <div className="flex flex-row gap-1.5 overflow-x-auto pb-1">
      {weeks.map((week) => {
        const color = week.phase
          ? (PHASE_COLORS[week.phase] ?? "var(--color-border)")
          : "var(--color-border)";

        return (
          <button
            key={week.weekNumber}
            onClick={() => onWeekClick?.(week.weekNumber)}
            className={`
              flex-shrink-0 flex items-center justify-center
              w-9 h-9 rounded-full text-xs font-bebas
              transition-transform active:scale-95
              ${week.isCurrent ? "ring-2 ring-text ring-offset-1 ring-offset-bg" : ""}
            `}
            style={{
              backgroundColor: week.isComplete ? color : `${color}33`,
              color: week.isComplete ? "#0d0d0f" : color,
              border: `1.5px solid ${color}`,
            }}
            aria-label={`Semaine ${week.weekNumber}${week.isComplete ? " (terminee)" : ""}${week.isCurrent ? " (en cours)" : ""}`}
          >
            {week.isComplete ? (
              <Check size={14} strokeWidth={2.5} />
            ) : (
              week.weekNumber
            )}
          </button>
        );
      })}
    </div>
  );
}
