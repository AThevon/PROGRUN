import { BarChart3, Clock, Activity } from "lucide-react";
import { MetricCard } from "@/components/ui/metric-card";

interface QuickStatsProps {
  weekDistanceKm: number;
  weekTargetKm: number;
  avgPace: string;
  paceTrend?: string;
  totalDistanceKm: number;
}

export function QuickStats({
  weekDistanceKm,
  weekTargetKm,
  avgPace,
  paceTrend,
  totalDistanceKm,
}: QuickStatsProps) {
  const weekProgress =
    weekTargetKm > 0
      ? Math.round((weekDistanceKm / weekTargetKm) * 100)
      : 0;

  return (
    <div className="grid grid-cols-3 gap-3">
      <MetricCard
        icon={BarChart3}
        label="Cette semaine"
        value={weekDistanceKm.toFixed(1)}
        unit="km"
        trend={
          weekTargetKm > 0
            ? { value: `${weekProgress}%`, positive: weekProgress >= 80 }
            : undefined
        }
        valueColor="text-accent"
      />
      <MetricCard
        icon={Clock}
        label="Allure moy."
        value={avgPace}
        unit="/km"
        trend={
          paceTrend ? { value: paceTrend, positive: false } : undefined
        }
      />
      <MetricCard
        icon={Activity}
        label="Total"
        value={totalDistanceKm >= 1000
          ? `${(totalDistanceKm / 1000).toFixed(1)}k`
          : totalDistanceKm.toFixed(0)}
        unit="km"
      />
    </div>
  );
}
