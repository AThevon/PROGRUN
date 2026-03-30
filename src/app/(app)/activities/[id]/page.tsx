import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { requireAuth } from "@/lib/auth/session";
import { getActivity } from "@/lib/db/queries/activities";
import { PrimaryMetrics } from "@/components/activity/primary-metrics";
import { SecondaryMetrics } from "@/components/activity/secondary-metrics";
import { PaceChart } from "@/components/activity/pace-chart";
import { LapsTable } from "@/components/activity/laps-table";
import { DeleteButton } from "@/components/activity/delete-button";
import { minDelay } from "@/lib/utils/delay";

interface Lap {
  distanceKm: number;
  durationSeconds: number;
  avgPace: string;
  avgHeartRate: number | null;
  avgCadence: number | null;
}

function formatActivityDate(date: Date): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getWeekBadge(date: Date): string {
  const now = new Date();
  const diffDays = Math.round(
    (now.getTime() - new Date(date).getTime()) / 86_400_000
  );
  const weekNum = Math.floor(diffDays / 7) + 1;
  return `S-${weekNum}`;
}

// Simple GPS polyline as SVG
function GpsPolyline({
  track,
}: {
  track: Array<[number, number]>;
}) {
  if (!track || track.length < 2) return null;

  const lats = track.map(([lat]) => lat);
  const lons = track.map(([, lon]) => lon);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);
  const latRange = maxLat - minLat || 1;
  const lonRange = maxLon - minLon || 1;

  const W = 360;
  const H = 180;
  const PAD = 12;

  const points = track
    .filter((_, i) => i % Math.max(1, Math.floor(track.length / 200)) === 0)
    .map(([lat, lon]) => {
      const x = PAD + ((lon - minLon) / lonRange) * (W - 2 * PAD);
      const y = PAD + ((maxLat - lat) / latRange) * (H - 2 * PAD);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height: 180 }}
        aria-label="GPS Track"
      >
        <rect width={W} height={H} fill="var(--color-card)" />
        <polyline
          points={points}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

export default async function ActivityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireAuth();
  const userId = session.user!.id as string;

  const activity = await minDelay(getActivity(id, userId));
  if (!activity) notFound();

  const laps = (activity.laps as Lap[] | null) ?? null;
  const gpsTrack = (activity.gpsTrack as Array<[number, number]> | null) ?? null;

  return (
    <div className="p-5 flex flex-col gap-5 pb-24">
      {/* Back header */}
      <div className="flex items-center gap-2">
        <Link
          href="/activities"
          className="flex items-center justify-center w-8 h-8 rounded-full bg-surface border border-border text-muted active:opacity-70 transition-opacity"
        >
          <ChevronLeft size={18} strokeWidth={2} />
        </Link>
        <div className="flex-1 flex flex-col gap-0">
          <h1 className="font-bebas text-xl leading-tight text-text">
            {activity.name ?? "Course"}
          </h1>
          <p className="text-xs font-dm text-muted capitalize">
            {formatActivityDate(activity.date)}
          </p>
        </div>
        <span className="bg-surface border border-border text-muted text-[10px] font-dm font-semibold px-2 py-0.5 rounded-full">
          {getWeekBadge(activity.date)}
        </span>
        <DeleteButton activityId={activity.id} redirectToList />
      </div>

      {/* GPS map placeholder */}
      {gpsTrack && gpsTrack.length > 1 ? (
        <GpsPolyline track={gpsTrack} />
      ) : (
        <div className="bg-card border border-border rounded-xl h-[120px] flex items-center justify-center">
          <span className="text-xs font-dm text-muted">Pas de trace GPS</span>
        </div>
      )}

      {/* Primary metrics */}
      <PrimaryMetrics activity={activity} />

      {/* Secondary metrics */}
      <SecondaryMetrics activity={activity} />

      {/* Pace chart (only if laps available) */}
      {laps && laps.length > 1 && (
        <PaceChart
          laps={laps}
          avgPace={activity.avgPace ?? null}
          avgHeartRate={activity.avgHeartRate ?? null}
        />
      )}

      {/* Laps table */}
      {laps && laps.length > 0 && (
        <LapsTable laps={laps} avgPace={activity.avgPace ?? null} />
      )}

      {/* Linked session card */}
      {activity.linkedSession && (
        <div className="bg-card border border-accent/30 rounded-xl p-4 flex flex-col gap-2">
          <span className="text-[10px] font-dm text-accent uppercase tracking-wide">
            Seance liee au plan
          </span>
          <span className="font-bebas text-lg text-text leading-tight">
            {activity.linkedSession.title ?? "Seance"}
          </span>
          {activity.linkedSession.type && (
            <span className="text-xs font-dm text-muted uppercase">
              {activity.linkedSession.type}
            </span>
          )}
          {activity.linkedSession.description && (
            <p className="text-xs font-dm text-muted">
              {activity.linkedSession.description}
            </p>
          )}
          <div className="flex items-center gap-3">
            {activity.linkedSession.targetDistanceKm != null && (
              <span className="text-xs font-dm text-muted">
                {activity.linkedSession.targetDistanceKm.toFixed(1)} km cible
              </span>
            )}
            {activity.linkedSession.targetPace && (
              <span className="text-xs font-dm text-muted">
                @ {activity.linkedSession.targetPace} /km
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
