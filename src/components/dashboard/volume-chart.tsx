"use client";

interface WeekBarData {
  weekNumber: number;
  targetVolumeKm: number;
  actualVolumeKm: number;
  isCurrent: boolean;
  isPast: boolean;
}

interface VolumeChartProps {
  weeks: WeekBarData[];
  totalKm: number;
}

export function VolumeChart({ weeks, totalKm }: VolumeChartProps) {
  const maxKm = Math.max(
    ...weeks.map((w) => Math.max(w.targetVolumeKm, w.actualVolumeKm, 1)),
    1
  );

  return (
    <div className="bg-surface border border-border rounded-2xl p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-baseline justify-between">
        <h3 className="font-bebas text-xl text-text tracking-wide">
          Volume hebdo
        </h3>
        <span className="font-bebas text-2xl text-accent">
          {totalKm.toFixed(0)} km
        </span>
      </div>

      {/* Bar chart */}
      <div className="flex items-end gap-1.5 h-24">
        {weeks.map((week) => {
          const isCurrentOrPast = week.isCurrent || week.isPast;
          const displayKm = isCurrentOrPast ? week.actualVolumeKm : week.targetVolumeKm;
          const heightPct = (displayKm / maxKm) * 100;
          const targetHeightPct = (week.targetVolumeKm / maxKm) * 100;

          let barColor: string;
          if (week.isPast) {
            barColor = "var(--color-success)";
          } else if (week.isCurrent) {
            barColor = "var(--color-accent)";
          } else {
            barColor = "var(--color-border)";
          }

          return (
            <div
              key={week.weekNumber}
              className="flex-1 flex flex-col items-center gap-1"
            >
              <div className="w-full flex-1 relative flex items-end">
                {/* Target ghost bar (future only) */}
                {!week.isPast && !week.isCurrent && (
                  <div
                    className="absolute bottom-0 left-0 right-0 rounded-t-sm opacity-20"
                    style={{
                      height: `${targetHeightPct}%`,
                      backgroundColor: "var(--color-muted)",
                    }}
                  />
                )}
                {/* Main bar */}
                <div
                  className="w-full rounded-t-sm transition-all duration-500"
                  style={{
                    height: `${Math.max(heightPct, week.isCurrent || isCurrentOrPast ? 4 : 2)}%`,
                    backgroundColor: barColor,
                    opacity: week.isCurrent ? 1 : week.isPast ? 0.85 : 0.35,
                  }}
                />
              </div>
              <span
                className={`text-[9px] font-dm ${
                  week.isCurrent ? "text-accent" : "text-muted"
                }`}
              >
                S{week.weekNumber}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4">
        <LegendDot color="var(--color-success)" label="Realisé" />
        <LegendDot color="var(--color-accent)" label="En cours" />
        <LegendDot color="var(--color-border)" label="Planifie" />
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="text-[10px] font-dm text-muted">{label}</span>
    </div>
  );
}
