import Link from "next/link";
import { MapPin, Clock, Heart } from "lucide-react";
import type { ActivityWithSession } from "@/types";
import { formatDuration } from "@/lib/utils/pace";

interface ActivityListCardProps {
  activity: ActivityWithSession;
}

function formatActivityDate(date: Date): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function ActivityListCard({ activity }: ActivityListCardProps) {
  return (
    <Link
      href={`/activities/${activity.id}`}
      className="block bg-card border border-border rounded-xl p-4 flex flex-col gap-2 active:opacity-80 transition-opacity"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <span className="font-bebas text-lg leading-tight text-text">
            {activity.name ?? "Course"}
          </span>
          <span className="text-xs font-dm text-muted capitalize">
            {formatActivityDate(activity.date)}
          </span>
        </div>

        {/* Plan badge */}
        {activity.linkedSession && (
          <span className="shrink-0 bg-accent/10 text-accent text-[10px] font-dm font-semibold px-2 py-0.5 rounded-full border border-accent/30">
            Plan
          </span>
        )}
      </div>

      {/* Metrics row */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-muted">
          <MapPin size={13} strokeWidth={2} />
          <span className="font-bebas text-base text-text leading-none">
            {activity.distanceKm.toFixed(2)}
          </span>
          <span className="text-xs font-dm text-muted">km</span>
        </div>

        <div className="flex items-center gap-1.5 text-muted">
          <Clock size={13} strokeWidth={2} />
          <span className="font-bebas text-base text-text leading-none">
            {activity.avgPace ?? "--:--"}
          </span>
          <span className="text-xs font-dm text-muted">/km</span>
        </div>

        {activity.avgHeartRate != null && (
          <div className="flex items-center gap-1.5 text-muted">
            <Heart size={13} strokeWidth={2} />
            <span className="font-bebas text-base text-text leading-none">
              {activity.avgHeartRate}
            </span>
            <span className="text-xs font-dm text-muted">bpm</span>
          </div>
        )}

        <div className="ml-auto flex items-center gap-1 text-muted">
          <Clock size={12} strokeWidth={2} />
          <span className="text-xs font-dm">
            {formatDuration(activity.durationSeconds)}
          </span>
        </div>
      </div>
    </Link>
  );
}
