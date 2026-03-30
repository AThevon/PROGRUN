import { Check } from "lucide-react";
import type { WeekWithProgress } from "@/types";
import { calculatePace } from "@/lib/utils/pace";

interface WeekSummaryProps {
  week: WeekWithProgress;
}

export function WeekSummary({ week }: WeekSummaryProps) {
  const targetKm = week.targetVolumeKm ?? 0;
  const actualKm = week.actualVolumeKm;

  // Compute average pace from all sessions that have an activity
  const totalDistanceKm = week.sessions.reduce(
    (sum, s) => sum + (s.activity?.distanceKm ?? 0),
    0
  );
  const totalDurationSeconds = week.sessions.reduce(
    (sum, s) => sum + (s.activity?.durationSeconds ?? 0),
    0
  );
  const avgPace =
    totalDistanceKm > 0
      ? calculatePace(totalDistanceKm, totalDurationSeconds)
      : null;

  return (
    <div className="bg-surface border border-border rounded-xl px-4 py-3 flex items-center gap-4">
      {/* Week number */}
      <span className="font-bebas text-3xl leading-none text-success min-w-[28px]">
        {week.weekNumber}
      </span>

      {/* Info */}
      <div className="flex-1 flex flex-col gap-0.5">
        {week.title && (
          <span className="text-xs font-dm text-text leading-snug truncate">
            {week.title}
          </span>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-dm text-muted">
            {actualKm.toFixed(1)}{" "}
            <span className="text-muted/60">/ {targetKm.toFixed(1)} km</span>
          </span>
          <span className="text-muted/40 text-[11px]">&bull;</span>
          <span className="text-[11px] font-dm text-muted">
            {week.completedSessions} seances
          </span>
          {avgPace && (
            <>
              <span className="text-muted/40 text-[11px]">&bull;</span>
              <span className="text-[11px] font-dm text-muted">
                {avgPace} /km moy
              </span>
            </>
          )}
        </div>
      </div>

      {/* Check icon */}
      <div className="w-7 h-7 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
        <Check size={14} strokeWidth={2.5} className="text-success" />
      </div>
    </div>
  );
}
