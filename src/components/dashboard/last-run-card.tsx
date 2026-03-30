import Link from "next/link";
import { MapPin, Clock, Heart, Timer, ArrowRight } from "lucide-react";
import type { Activity } from "@/types";
import { formatDuration, calculatePace } from "@/lib/utils/pace";

interface LastRunCardProps {
  activity: Activity;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
  }).format(new Date(date));
}

export function LastRunCard({ activity }: LastRunCardProps) {
  const pace = calculatePace(activity.distanceKm, activity.durationSeconds);
  const duration = formatDuration(activity.durationSeconds);

  return (
    <Link href={`/activities/${activity.id}`} className="block">
      <div className="bg-card border border-border rounded-2xl overflow-hidden active:opacity-80 transition-opacity">
        {/* Mini SVG trace placeholder */}
        <div className="h-24 bg-surface relative overflow-hidden">
          <svg
            viewBox="0 0 400 96"
            className="w-full h-full"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
          >
            {/* Background grid lines */}
            <line x1="0" y1="32" x2="400" y2="32" stroke="var(--color-border)" strokeWidth="1" />
            <line x1="0" y1="64" x2="400" y2="64" stroke="var(--color-border)" strokeWidth="1" />
            {/* Simulated route path */}
            <path
              d="M 20 72 C 60 68, 80 30, 120 28 S 180 60, 220 55 S 280 20, 320 24 S 370 52, 390 48"
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.7"
            />
            {/* Start dot */}
            <circle cx="20" cy="72" r="4" fill="var(--color-success)" />
            {/* End dot */}
            <circle cx="390" cy="48" r="4" fill="var(--color-accent)" />
          </svg>
          {/* MapPin overlay */}
          <div className="absolute top-3 right-3 text-muted">
            <MapPin size={14} strokeWidth={2} />
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Title row */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <h3 className="font-bebas text-2xl leading-none text-text">
                {activity.name ?? "Course"}
              </h3>
              <p className="text-xs font-dm text-muted mt-0.5">
                {formatDate(activity.date)}
              </p>
            </div>
            <div className="text-muted mt-1">
              <ArrowRight size={16} strokeWidth={2} />
            </div>
          </div>

          {/* 5 metrics */}
          <div className="grid grid-cols-5 gap-2">
            <Metric
              icon={<MapPin size={12} strokeWidth={2} />}
              label="Dist"
              value={`${activity.distanceKm.toFixed(1)}`}
              unit="km"
            />
            <Metric
              icon={<Clock size={12} strokeWidth={2} />}
              label="Allure"
              value={pace}
              unit="/km"
            />
            <Metric
              icon={<Heart size={12} strokeWidth={2} />}
              label="FC"
              value={activity.avgHeartRate != null ? `${activity.avgHeartRate}` : "--"}
              unit="bpm"
            />
            <Metric
              icon={<Timer size={12} strokeWidth={2} />}
              label="Temps"
              value={duration}
            />
            <Metric
              icon={<span className="text-[10px] font-dm">spm</span>}
              label="Cad."
              value={activity.avgCadence != null ? `${activity.avgCadence}` : "--"}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}

function Metric({
  icon,
  label,
  value,
  unit,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="text-muted">{icon}</div>
      <span className="font-bebas text-lg leading-none text-text">{value}</span>
      {unit && <span className="text-[9px] font-dm text-muted">{unit}</span>}
      {!unit && <span className="text-[9px] font-dm text-muted">{label}</span>}
    </div>
  );
}
