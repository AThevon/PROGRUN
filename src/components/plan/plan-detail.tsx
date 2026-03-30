"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Check,
  Zap,
  Moon,
  MapPin,
  Clock,
  Heart,
  ArrowRight,
} from "lucide-react";
import type { Plan, WeekWithProgress } from "@/types";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DAY_NAMES = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

const PHASE_NAMES: Record<string, string> = {
  build: "Construction",
  recovery: "Recuperation",
  performance: "Performance",
  taper: "Affutage",
  race: "Race Week",
};

const PHASE_COLORS: Record<string, string> = {
  build: "#81c784",
  recovery: "#4fc3f7",
  performance: "#ff6b35",
  taper: "#4fc3f7",
  race: "#e8ff47",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getCurrentWeek(startDate: string | null, maxWeeks: number): number {
  if (!startDate) return 1;
  const start = new Date(startDate);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - start.getTime()) / 86400000
  );
  return Math.min(Math.max(1, Math.floor(diffDays / 7) + 1), maxWeeks);
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface PlanDetailProps {
  plan: Plan;
  weeks: WeekWithProgress[];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PlanDetail({ plan, weeks }: PlanDetailProps) {
  const router = useRouter();
  const weekRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const durationWeeks = plan.durationWeeks ?? weeks.length;
  const currentWeek = getCurrentWeek(plan.startDate ?? null, durationWeeks);

  // Track which weeks are collapsed (past weeks default collapsed, others expanded)
  const [collapsed, setCollapsed] = useState<Record<number, boolean>>(() => {
    const init: Record<number, boolean> = {};
    weeks.forEach((w) => {
      init[w.weekNumber] = w.weekNumber < currentWeek;
    });
    return init;
  });

  function toggleWeek(weekNumber: number) {
    setCollapsed((prev) => ({ ...prev, [weekNumber]: !prev[weekNumber] }));
  }

  function scrollToWeek(weekNumber: number) {
    // Expand if collapsed
    setCollapsed((prev) => ({ ...prev, [weekNumber]: false }));
    setTimeout(() => {
      weekRefs.current[weekNumber]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  }

  // Progress ring
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(currentWeek / durationWeeks, 1);
  const offset = circumference * (1 - progress);

  const currentWeekData = weeks.find((w) => w.weekNumber === currentWeek);
  const weekDistance = currentWeekData?.actualVolumeKm ?? 0;
  const weekTarget = currentWeekData?.targetVolumeKm ?? 0;
  const completedSessions = currentWeekData?.completedSessions ?? 0;
  const totalSessions = currentWeekData?.sessions?.length ?? 0;

  return (
    <div className="p-5 flex flex-col gap-5 pb-20">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/plan")}
          className="w-9 h-9 rounded-full bg-surface border border-border flex items-center justify-center active:opacity-70 transition-opacity"
          aria-label="Retour"
        >
          <ChevronLeft size={18} className="text-text" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="font-bebas text-[28px] leading-none text-text truncate">
              {plan.name}
            </h1>
            {plan.isActive && (
              <span className="text-[10px] font-dm font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full text-success bg-success/10 border border-success/30 flex items-center gap-1 flex-shrink-0">
                <Check size={10} />
                Actif
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Progress card */}
      <div className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-4">
        <div className="flex items-center gap-5">
          {/* Ring */}
          <div className="relative" style={{ width: 88, height: 88 }}>
            <svg width={88} height={88} className="-rotate-90">
              <circle
                cx={44}
                cy={44}
                r={radius}
                fill="none"
                stroke="var(--color-border)"
                strokeWidth={6}
              />
              <circle
                cx={44}
                cy={44}
                r={radius}
                fill="none"
                stroke="var(--color-accent)"
                strokeWidth={6}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-bebas text-2xl leading-none text-accent">
                {currentWeek}/{durationWeeks}
              </span>
              <span className="text-[9px] text-muted uppercase tracking-wider">
                semaines
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-col gap-2 flex-1">
            <div>
              <span className="text-[10px] font-dm text-muted uppercase tracking-widest">
                Volume cette semaine
              </span>
              <div className="flex items-end gap-1">
                <span className="font-bebas text-2xl leading-none text-accent">
                  {weekDistance.toFixed(1)}
                </span>
                <span className="text-muted text-xs font-dm mb-0.5">
                  / {weekTarget.toFixed(1)} km
                </span>
              </div>
            </div>
            <div>
              <span className="text-[10px] font-dm text-muted uppercase tracking-widest">
                Seances
              </span>
              <div className="flex items-end gap-1">
                <span className="font-bebas text-2xl leading-none text-success">
                  {completedSessions}
                </span>
                <span className="text-muted text-xs font-dm mb-0.5">
                  / {totalSessions} faites
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Roadmap bar */}
      <div className="flex gap-1">
        {weeks.map((w) => {
          const color = PHASE_COLORS[w.phase ?? "build"] ?? "#888890";
          const isCurrent = w.weekNumber === currentWeek;
          const isDone = w.weekNumber < currentWeek;
          return (
            <button
              key={w.weekNumber}
              onClick={() => scrollToWeek(w.weekNumber)}
              className={`flex-1 h-7 rounded-md flex items-center justify-center font-bebas text-xs text-bg ${
                isCurrent
                  ? "ring-2 ring-text ring-offset-2 ring-offset-bg"
                  : ""
              } ${isDone ? "opacity-60" : ""}`}
              style={{ backgroundColor: color }}
            >
              S{w.weekNumber}
              {isDone && <Check size={10} className="ml-0.5" />}
            </button>
          );
        })}
      </div>

      {/* Weeks */}
      {weeks.map((week) => {
        const isCurrent = week.weekNumber === currentWeek;
        const isPast = week.weekNumber < currentWeek;
        const isFuture = week.weekNumber > currentWeek;
        const phaseColor = PHASE_COLORS[week.phase ?? "build"] ?? "#888890";
        const phaseName =
          PHASE_NAMES[week.phase ?? ""] ?? week.phase ?? "";
        const isCollapsed = collapsed[week.weekNumber] ?? false;

        // Past weeks: compact summary card
        if (isPast) {
          return (
            <div
              key={week.id}
              ref={(el) => {
                weekRefs.current[week.weekNumber] = el;
              }}
              className="bg-surface border border-border rounded-xl overflow-hidden"
            >
              <button
                className="w-full px-4 py-3 flex items-center gap-4 active:opacity-75 transition-opacity"
                onClick={() => toggleWeek(week.weekNumber)}
              >
                <span className="font-bebas text-3xl leading-none text-success min-w-[28px]">
                  {week.weekNumber}
                </span>
                <div className="flex-1 text-left">
                  <span className="text-sm font-dm text-text">
                    {week.title}
                  </span>
                  <div className="text-[11px] font-dm text-muted">
                    {week.actualVolumeKm.toFixed(1)} /{" "}
                    {(week.targetVolumeKm ?? 0).toFixed(1)} km -{" "}
                    {week.completedSessions} seances
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-success/20 flex items-center justify-center">
                    <Check size={14} className="text-success" />
                  </div>
                  {isCollapsed ? (
                    <ChevronDown size={14} className="text-muted" />
                  ) : (
                    <ChevronUp size={14} className="text-muted" />
                  )}
                </div>
              </button>

              {!isCollapsed && (
                <div className="px-4 pb-4 flex flex-col gap-2">
                  {week.sessions.map((s) => (
                    <SessionCard key={s.id} session={s} />
                  ))}
                </div>
              )}
            </div>
          );
        }

        // Current & future weeks: expanded (future is dimmed)
        return (
          <div
            key={week.id}
            ref={(el) => {
              weekRefs.current[week.weekNumber] = el;
            }}
            className={`flex flex-col gap-3 ${isFuture ? "opacity-50" : ""}`}
          >
            <button
              className="flex items-center gap-3 w-full active:opacity-75 transition-opacity"
              onClick={() => toggleWeek(week.weekNumber)}
            >
              <span className="font-bebas text-xl leading-none text-text">
                Semaine {week.weekNumber}
              </span>
              {phaseName && (
                <span
                  className="text-[10px] font-dm font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full"
                  style={{
                    color: phaseColor,
                    backgroundColor: `${phaseColor}22`,
                    border: `1px solid ${phaseColor}55`,
                  }}
                >
                  {phaseName}
                </span>
              )}
              <div className="flex-1 h-px bg-border" />
              {isCollapsed ? (
                <ChevronDown size={14} className="text-muted" />
              ) : (
                <ChevronUp size={14} className="text-muted" />
              )}
            </button>

            {!isCollapsed && (
              <>
                {isCurrent && (
                  <p className="text-xs font-dm text-muted italic">
                    Semaine en cours
                  </p>
                )}
                <div className="flex flex-col gap-2">
                  {week.sessions.map((s) => (
                    <SessionCard key={s.id} session={s} />
                  ))}
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SessionCard
// ---------------------------------------------------------------------------

type SessionWithActivity = WeekWithProgress["sessions"][number];

function SessionCard({ session: s }: { session: SessionWithActivity }) {
  const hasActivity = !!s.activity;
  const isKey = s.isKeySession ?? false;
  const isRest = s.type === "repos";
  const dayName = s.dayOfWeek != null ? (DAY_NAMES[s.dayOfWeek] ?? "?") : "?";

  return (
    <div
      className={`bg-card border rounded-xl p-3 flex gap-3 ${
        hasActivity
          ? "border-success"
          : isKey
          ? "border-accent"
          : isRest
          ? "border-border border-dashed opacity-45"
          : "border-border"
      }`}
    >
      {/* Day + icon column */}
      <div className="flex flex-col items-center gap-1 min-w-[40px]">
        <span className="text-xs font-dm text-muted">{dayName}</span>
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            hasActivity
              ? "bg-success/20 text-success"
              : isKey
              ? "bg-accent/20 text-accent"
              : "bg-border/30 text-muted"
          }`}
        >
          {hasActivity ? (
            <Check size={16} />
          ) : isKey ? (
            <Zap size={16} />
          ) : isRest ? (
            <Moon size={16} />
          ) : (
            <MapPin size={16} />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {s.type && (
          <span className="text-[10px] font-dm text-muted uppercase tracking-wide">
            {s.type}
          </span>
        )}
        <div className="font-bebas text-lg leading-tight text-text">
          {s.title ?? "Seance"}
        </div>
        {s.description && (
          <p className="text-xs font-dm text-muted line-clamp-2">
            {s.description}
          </p>
        )}

        {/* Target info when no activity */}
        {!hasActivity && (
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            {s.targetDistanceKm != null && (
              <span className="flex items-center gap-1 text-xs font-dm text-muted">
                <MapPin size={11} />
                {s.targetDistanceKm.toFixed(1)} km
              </span>
            )}
            {s.targetPace && (
              <span className="flex items-center gap-1 text-xs font-dm text-muted">
                <Clock size={11} />
                {s.targetPace} /km
              </span>
            )}
          </div>
        )}

        {/* Activity compare strip */}
        {hasActivity && s.activity && (
          <div className="flex bg-bg rounded-lg overflow-hidden mt-2 border border-border">
            <div className="flex-1 flex flex-col items-center py-2 border-r border-border">
              <span className="flex items-center gap-0.5 text-[9px] text-muted uppercase">
                <MapPin size={8} />
                Dist.
              </span>
              <span className="font-bebas text-lg leading-none text-success">
                {s.activity.distanceKm.toFixed(1)}
              </span>
            </div>
            <div className="flex-1 flex flex-col items-center py-2 border-r border-border">
              <span className="flex items-center gap-0.5 text-[9px] text-muted uppercase">
                <Clock size={8} />
                Allure
              </span>
              <span className="font-bebas text-lg leading-none text-text">
                {s.activity.avgPace ?? "--"}
              </span>
            </div>
            <div className="flex-1 flex flex-col items-center py-2">
              <span className="flex items-center gap-0.5 text-[9px] text-muted uppercase">
                <Heart size={8} />
                FC
              </span>
              <span className="font-bebas text-lg leading-none text-text">
                {s.activity.avgHeartRate ?? "--"}
              </span>
            </div>
          </div>
        )}

        {/* Target vs actual arrow row */}
        {hasActivity && s.targetDistanceKm != null && s.activity && (
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[10px] font-dm text-muted">
              Cible {s.targetDistanceKm.toFixed(1)} km
              {s.targetPace ? ` @ ${s.targetPace}` : ""}
            </span>
            <ArrowRight size={10} className="text-muted" />
            <span className="text-[10px] font-dm text-success">
              {s.activity.distanceKm.toFixed(1)} km
              {s.activity.avgPace ? ` @ ${s.activity.avgPace}` : ""}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
