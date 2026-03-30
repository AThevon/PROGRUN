import { MapPin, Clock, Heart, Activity } from "lucide-react";
import type { CumulativeStats } from "@/lib/db/queries/stats";
import { secondsToPace } from "@/lib/utils/pace";

interface SummaryCardsProps {
  stats: CumulativeStats;
  avgHeartRate: number | null;
  vo2max: number | null;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
  trend?: string;
  trendUp?: boolean;
}

function StatCard({ icon, label, value, unit, trend, trendUp }: StatCardProps) {
  return (
    <div className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2 text-muted">
        {icon}
        <span className="text-xs font-dm uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="font-bebas text-3xl leading-none text-text">{value}</span>
        <span className="font-dm text-xs text-muted">{unit}</span>
      </div>
      {trend && (
        <span
          className={`text-xs font-dm ${
            trendUp ? "text-success" : "text-accent2"
          }`}
        >
          {trend}
        </span>
      )}
    </div>
  );
}

export function SummaryCards({ stats, avgHeartRate, vo2max }: SummaryCardsProps) {
  const avgPaceSeconds =
    stats.totalDistanceKm > 0
      ? stats.totalDurationSeconds / stats.totalDistanceKm
      : 0;
  const avgPaceStr = avgPaceSeconds > 0 ? secondsToPace(avgPaceSeconds) : "--:--";

  return (
    <div className="grid grid-cols-2 gap-3">
      <StatCard
        icon={<MapPin size={16} strokeWidth={2} />}
        label="Distance totale"
        value={stats.totalDistanceKm.toFixed(0)}
        unit="km"
      />
      <StatCard
        icon={<Clock size={16} strokeWidth={2} />}
        label="Allure moyenne"
        value={avgPaceStr}
        unit="/ km"
      />
      <StatCard
        icon={<Heart size={16} strokeWidth={2} />}
        label="FC repos"
        value={avgHeartRate ? avgHeartRate.toFixed(0) : "--"}
        unit="bpm"
      />
      <StatCard
        icon={<Activity size={16} strokeWidth={2} />}
        label="VO2max"
        value={vo2max ? vo2max.toFixed(0) : "--"}
        unit="ml/kg/min"
      />
    </div>
  );
}
