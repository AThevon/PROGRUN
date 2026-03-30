import { Clock } from "lucide-react";
import type { PlanSession, PlanWeek } from "@/types";

const DAY_NAMES = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

interface NextSessionHeroProps {
  session: PlanSession;
  week: PlanWeek;
}

export function NextSessionHero({ session, week }: NextSessionHeroProps) {
  const dayName =
    session.dayOfWeek != null ? (DAY_NAMES[session.dayOfWeek] ?? "?") : "?";

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-4"
      style={{
        background:
          "linear-gradient(135deg, #1c1c22 0%, #1a1a24 40%, #16161a 100%)",
        borderTop: "2px solid var(--color-accent)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 text-muted">
        <Clock size={14} strokeWidth={2} />
        <span className="text-xs font-dm uppercase tracking-widest">
          Prochaine seance — {dayName}
        </span>
      </div>

      {/* Title */}
      <div>
        <h2 className="font-bebas text-[42px] leading-none text-accent">
          {session.title ?? "Seance"}
        </h2>
        {session.description && (
          <p className="text-sm font-dm text-muted mt-1 line-clamp-2">
            {session.description}
          </p>
        )}
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap gap-3">
        {session.targetDistanceKm != null && (
          <MetaPill label="Distance" value={`${session.targetDistanceKm.toFixed(1)} km`} />
        )}
        {session.targetPace && (
          <MetaPill label="Allure cible" value={`${session.targetPace} /km`} />
        )}
        {session.targetZone && (
          <MetaPill label="Zone" value={session.targetZone} />
        )}
        <MetaPill label="Semaine" value={`S${week.weekNumber}`} />
      </div>
    </div>
  );
}

function MetaPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-dm text-muted uppercase tracking-wide">
        {label}
      </span>
      <span className="text-sm font-dm text-text font-medium">{value}</span>
    </div>
  );
}
