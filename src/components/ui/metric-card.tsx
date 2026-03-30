import type { LucideIcon } from "lucide-react";

interface Trend {
  value: string;
  positive: boolean;
}

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  unit?: string;
  trend?: Trend;
  valueColor?: string;
}

export function MetricCard({
  icon: Icon,
  label,
  value,
  unit,
  trend,
  valueColor,
}: MetricCardProps) {
  return (
    <div className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2 text-muted">
        <Icon size={16} strokeWidth={2} />
        <span className="text-xs font-dm uppercase tracking-wide">{label}</span>
      </div>

      <div className="flex items-end gap-1">
        <span
          className={`font-bebas text-4xl leading-none ${valueColor ?? "text-text"}`}
        >
          {value}
        </span>
        {unit && (
          <span className="text-muted text-sm font-dm mb-0.5">{unit}</span>
        )}
      </div>

      {trend && (
        <div
          className={`text-xs font-dm flex items-center gap-1 ${
            trend.positive ? "text-success" : "text-accent2"
          }`}
        >
          <span>{trend.positive ? "+" : ""}{trend.value}</span>
        </div>
      )}
    </div>
  );
}
