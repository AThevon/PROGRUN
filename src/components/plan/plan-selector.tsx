"use client";

import { ChevronDown } from "lucide-react";
import type { Plan } from "@/types";
import { ProgressRing } from "@/components/ui/progress-ring";

interface PlanSelectorProps {
  plans: Plan[];
  activePlan: Plan;
  currentWeek: number;
  weekDistance: number;
  weekTarget: number;
  completedSessions: number;
  totalSessions: number;
}

export function PlanSelector({
  activePlan,
  currentWeek,
  weekDistance,
  weekTarget,
  completedSessions,
  totalSessions,
}: PlanSelectorProps) {
  const durationWeeks = activePlan.durationWeeks ?? 1;

  return (
    <div className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-4">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <span className="font-bebas text-[22px] leading-none text-text tracking-wide">
          Mon plan
        </span>
        <button
          className="flex items-center gap-1.5 bg-bg border border-border rounded-full px-3 py-1.5 text-sm font-dm text-text active:opacity-70 transition-opacity"
          aria-label="Changer de plan"
        >
          <span className="truncate max-w-[160px]">{activePlan.name}</span>
          <ChevronDown size={14} strokeWidth={2} className="text-muted flex-shrink-0" />
        </button>
      </div>

      {/* Progress ring + stats */}
      <div className="flex items-center gap-5">
        <ProgressRing
          value={currentWeek}
          max={durationWeeks}
          label={`${currentWeek}/${durationWeeks}`}
          sublabel="semaines"
          size={88}
        />

        <div className="flex flex-col gap-2 flex-1">
          {/* Volume this week */}
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

          {/* Sessions done */}
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
