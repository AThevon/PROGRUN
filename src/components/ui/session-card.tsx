import { Check, Zap, Moon } from "lucide-react";
import type { PlanSession, Activity } from "@/types";
import { CompareStrip } from "./compare-strip";
import { calculatePace } from "@/lib/utils/pace";

const DAY_NAMES = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

interface SessionCardProps {
  session: PlanSession;
  activity?: Activity | null;
  onClick?: () => void;
}

function getSessionIcon(type: string | null, isKeySession: boolean) {
  if (type === "rest") return Moon;
  if (isKeySession) return Zap;
  return Check;
}

function getBorderClass(session: PlanSession, hasActivity: boolean): string {
  if (hasActivity) return "border-success";
  if (session.isKeySession) return "border-accent";
  if (session.type === "rest") return "border-border border-dashed";
  return "border-border";
}

export function SessionCard({ session, activity, onClick }: SessionCardProps) {
  const hasActivity = activity != null;
  const Icon = getSessionIcon(session.type, session.isKeySession ?? false);
  const borderClass = getBorderClass(session, hasActivity);
  const dayName = session.dayOfWeek != null ? (DAY_NAMES[session.dayOfWeek] ?? "?") : "?";

  const compareItems = hasActivity
    ? [
        {
          label: "Dist",
          target: session.targetDistanceKm != null
            ? `${session.targetDistanceKm.toFixed(1)} km`
            : null,
          actual: `${activity!.distanceKm.toFixed(1)} km`,
          status:
            session.targetDistanceKm != null
              ? activity!.distanceKm >= session.targetDistanceKm * 0.95
                ? ("good" as const)
                : ("slow" as const)
              : ("neutral" as const),
        },
        {
          label: "Allure",
          target: session.targetPace ?? null,
          actual: calculatePace(activity!.distanceKm, activity!.durationSeconds),
          status: (session.targetPace
            ? (() => {
                const [tMin, tSec] = session.targetPace.split(":").map(Number);
                const targetSec = tMin * 60 + tSec;
                const actualSec = activity!.durationSeconds / activity!.distanceKm;
                return actualSec <= targetSec * 1.05
                  ? ("good" as const)
                  : ("slow" as const);
              })()
            : "neutral") as "good" | "slow" | "neutral",
        },
        ...(activity!.avgHeartRate != null
          ? [
              {
                label: "FC",
                actual: `${activity!.avgHeartRate}`,
                status: "neutral" as const,
              },
            ]
          : []),
        ...(activity!.avgCadence != null
          ? [
              {
                label: "Cad",
                actual: `${activity!.avgCadence}`,
                status: "neutral" as const,
              },
            ]
          : []),
      ]
    : [];

  return (
    <button
      onClick={onClick}
      className={`w-full bg-card border ${borderClass} rounded-xl p-3 flex flex-col gap-2 text-left transition-opacity active:opacity-80`}
    >
      <div className="flex items-start gap-3">
        {/* Left column */}
        <div className="flex flex-col items-center gap-1 min-w-[40px]">
          <span className="text-xs font-dm text-muted">{dayName}</span>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              hasActivity
                ? "bg-success/20 text-success"
                : session.isKeySession
                ? "bg-accent/20 text-accent"
                : "bg-border/30 text-muted"
            }`}
          >
            <Icon size={16} strokeWidth={2} />
          </div>
        </div>

        {/* Right column */}
        <div className="flex-1 flex flex-col gap-0.5">
          {session.type && (
            <span className="text-[10px] font-dm text-muted uppercase tracking-wide">
              {session.type}
            </span>
          )}
          <span className="font-bebas text-lg leading-tight text-text">
            {session.title ?? "Seance"}
          </span>
          {session.description && (
            <p className="text-xs font-dm text-muted line-clamp-2">
              {session.description}
            </p>
          )}
          {session.targetDistanceKm != null && !hasActivity && (
            <span className="text-xs font-dm text-muted">
              {session.targetDistanceKm.toFixed(1)} km
              {session.targetPace ? ` @ ${session.targetPace}` : ""}
            </span>
          )}
        </div>
      </div>

      {hasActivity && compareItems.length > 0 && (
        <CompareStrip items={compareItems} />
      )}
    </button>
  );
}
