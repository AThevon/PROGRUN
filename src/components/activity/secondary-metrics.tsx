import { Heart, Flame, Activity, TrendingUp, Zap, Timer } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Activity as ActivityType } from "@/types";

interface MetricItemProps {
  Icon: LucideIcon;
  value: string | number;
  unit: string;
  label: string;
}

function MetricItem({ Icon, value, unit, label }: MetricItemProps) {
  return (
    <div className="flex flex-col items-center gap-1 p-3">
      <Icon size={14} strokeWidth={2} className="text-muted" />
      <div className="flex items-end gap-0.5">
        <span className="font-bebas text-2xl leading-none text-text">
          {value}
        </span>
        {unit && (
          <span className="text-[10px] font-dm text-muted mb-0.5">{unit}</span>
        )}
      </div>
      <span className="text-[10px] font-dm text-muted text-center leading-tight">
        {label}
      </span>
    </div>
  );
}

interface SecondaryMetricsProps {
  activity: ActivityType;
}

export function SecondaryMetrics({ activity }: SecondaryMetricsProps) {
  const metrics: MetricItemProps[] = [
    {
      Icon: Heart,
      value: activity.avgHeartRate ?? "--",
      unit: "bpm",
      label: "FC moy",
    },
    {
      Icon: Activity,
      value: activity.maxHeartRate ?? "--",
      unit: "bpm",
      label: "FC max",
    },
    {
      Icon: Zap,
      value: activity.avgCadence ?? "--",
      unit: "spm",
      label: "Cadence",
    },
    {
      Icon: TrendingUp,
      value: activity.elevationGain != null ? Math.round(activity.elevationGain) : "--",
      unit: "m",
      label: "Denivele",
    },
    {
      Icon: Flame,
      value: activity.calories ?? "--",
      unit: "kcal",
      label: "Calories",
    },
    {
      Icon: Timer,
      value: activity.groundContactTime ?? "--",
      unit: "ms",
      label: "Contact sol",
    },
  ];

  return (
    <div className="bg-card border border-border rounded-xl grid grid-cols-3">
      {metrics.map((m, i) => (
        <div
          key={m.label}
          className={[
            i % 3 !== 2 ? "border-r border-border" : "",
            i < 3 ? "border-b border-border" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <MetricItem {...m} />
        </div>
      ))}
    </div>
  );
}
