import type { Activity } from "@/types";
import { formatDuration } from "@/lib/utils/pace";

interface PrimaryMetricsProps {
  activity: Activity;
}

export function PrimaryMetrics({ activity }: PrimaryMetricsProps) {
  return (
    <div className="bg-card border border-border rounded-xl grid grid-cols-3">
      {/* Distance */}
      <div className="flex flex-col items-center justify-center p-4 border-r border-border">
        <span className="text-[10px] font-dm text-muted uppercase tracking-wide mb-1">
          Distance
        </span>
        <div className="flex items-end gap-0.5">
          <span className="font-bebas text-4xl leading-none text-text">
            {activity.distanceKm.toFixed(2)}
          </span>
        </div>
        <span className="text-xs font-dm text-muted">km</span>
      </div>

      {/* Allure moyenne */}
      <div className="flex flex-col items-center justify-center p-4 border-r border-border">
        <span className="text-[10px] font-dm text-muted uppercase tracking-wide mb-1">
          Allure moy
        </span>
        <div className="flex items-end gap-0.5">
          <span className="font-bebas text-4xl leading-none text-accent2">
            {activity.avgPace ?? "--:--"}
          </span>
        </div>
        <span className="text-xs font-dm text-muted">/km</span>
      </div>

      {/* Temps */}
      <div className="flex flex-col items-center justify-center p-4">
        <span className="text-[10px] font-dm text-muted uppercase tracking-wide mb-1">
          Temps
        </span>
        <div className="flex items-end gap-0.5">
          <span className="font-bebas text-4xl leading-none text-text">
            {formatDuration(activity.durationSeconds)}
          </span>
        </div>
        <span className="text-xs font-dm text-muted invisible">-</span>
      </div>
    </div>
  );
}
