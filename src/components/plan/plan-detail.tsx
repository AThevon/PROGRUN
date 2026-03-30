"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Zap,
  Moon,
  MapPin,
  Clock,
  Heart,
  ArrowRight,
  X,
  Target,
  Flame,
  Timer,
  TrendingUp,
  Footprints,
  ExternalLink,
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

  const durationWeeks = plan.durationWeeks ?? weeks.length;
  const currentWeek = getCurrentWeek(plan.startDate ?? null, durationWeeks);

  // Which week is currently selected (null = show overview of all weeks)
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  // Which session is open in detail drawer
  const [openSession, setOpenSession] = useState<SessionWithActivity | null>(null);

  function selectWeek(weekNumber: number) {
    setSelectedWeek((prev) => (prev === weekNumber ? null : weekNumber));
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
          const isSelected = selectedWeek === w.weekNumber;
          return (
            <button
              key={w.weekNumber}
              onClick={() => selectWeek(w.weekNumber)}
              className={`flex-1 h-8 rounded-md flex items-center justify-center font-bebas text-xs text-bg transition-all ${
                isSelected
                  ? "ring-2 ring-accent ring-offset-2 ring-offset-bg scale-110"
                  : isCurrent
                    ? "ring-2 ring-text ring-offset-2 ring-offset-bg"
                    : ""
              } ${isDone && !isSelected ? "opacity-60" : ""}`}
              style={{ backgroundColor: color }}
            >
              S{w.weekNumber}
              {isDone && <Check size={10} className="ml-0.5" />}
            </button>
          );
        })}
      </div>

      {/* Selected week hint */}
      {selectedWeek !== null && (
        <button
          onClick={() => setSelectedWeek(null)}
          className="text-xs font-dm text-accent flex items-center gap-1 self-start"
        >
          <ChevronLeft size={12} />
          Voir toutes les semaines
        </button>
      )}

      {/* Weeks */}
      {weeks
        .filter((w) => selectedWeek === null || w.weekNumber === selectedWeek)
        .map((week) => {
        const isCurrent = week.weekNumber === currentWeek;
        const isPast = week.weekNumber < currentWeek;
        const isFuture = week.weekNumber > currentWeek;
        const phaseColor = PHASE_COLORS[week.phase ?? "build"] ?? "#888890";
        const phaseName =
          PHASE_NAMES[week.phase ?? ""] ?? week.phase ?? "";
        const showExpanded = selectedWeek !== null || isCurrent || isFuture;

        // Compact summary (only when no week is selected and week is past)
        if (isPast && selectedWeek === null) {
          return (
            <button
              key={week.id}
              onClick={() => selectWeek(week.weekNumber)}
              className="w-full bg-surface border border-border rounded-xl px-4 py-3 flex items-center gap-4 active:opacity-75 transition-opacity text-left"
            >
              <span className="font-bebas text-3xl leading-none text-success min-w-[28px]">
                {week.weekNumber}
              </span>
              <div className="flex-1">
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
                <ChevronRight size={14} className="text-muted" />
              </div>
            </button>
          );
        }

        // Expanded week view (selected, current, or future)
        return (
          <div
            key={week.id}
            className={`flex flex-col gap-3 ${isFuture && selectedWeek === null ? "opacity-50" : ""}`}
          >
            <div className="flex items-center gap-3">
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
            </div>

            {isCurrent && selectedWeek === null && (
              <p className="text-xs font-dm text-muted italic">
                Semaine en cours
              </p>
            )}

            {/* Week stats when selected */}
            {selectedWeek !== null && (
              <div className="flex gap-3">
                <div className="flex-1 bg-surface border border-border rounded-lg p-3 text-center">
                  <span className="text-[9px] font-dm text-muted uppercase tracking-wider">Volume</span>
                  <div className="font-bebas text-xl leading-none text-accent mt-1">
                    {week.actualVolumeKm.toFixed(1)} <span className="text-sm text-muted font-dm">/ {(week.targetVolumeKm ?? 0).toFixed(1)} km</span>
                  </div>
                </div>
                <div className="flex-1 bg-surface border border-border rounded-lg p-3 text-center">
                  <span className="text-[9px] font-dm text-muted uppercase tracking-wider">Seances</span>
                  <div className="font-bebas text-xl leading-none text-success mt-1">
                    {week.completedSessions} <span className="text-sm text-muted font-dm">/ {week.sessions.length}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2">
              {week.sessions.map((s) => (
                <SessionCard key={s.id} session={s} onOpen={() => setOpenSession(s)} />
              ))}
            </div>
          </div>
        );
      })}

      {/* Session detail drawer */}
      {openSession && (
        <SessionDetailDrawer
          session={openSession}
          onClose={() => setOpenSession(null)}
          planTargetPace={plan.targetPace}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SessionCard
// ---------------------------------------------------------------------------

type SessionWithActivity = WeekWithProgress["sessions"][number];

function SessionCard({ session: s, onOpen }: { session: SessionWithActivity; onOpen?: () => void }) {
  const hasActivity = !!s.activity;
  const isKey = s.isKeySession ?? false;
  const isRest = s.type === "repos";
  const dayName = s.dayOfWeek != null ? (DAY_NAMES[s.dayOfWeek] ?? "?") : "?";

  return (
    <button
      onClick={onOpen}
      className={`w-full text-left bg-card border rounded-xl p-3 flex gap-3 active:opacity-80 transition-opacity ${
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
    </button>
  );
}

// ---------------------------------------------------------------------------
// SessionDetailDrawer
// ---------------------------------------------------------------------------

function SessionDetailDrawer({
  session: s,
  onClose,
  planTargetPace,
}: {
  session: SessionWithActivity;
  onClose: () => void;
  planTargetPace: string | null;
}) {
  const router = useRouter();
  const hasActivity = !!s.activity;
  const isKey = s.isKeySession ?? false;
  const dayName = s.dayOfWeek != null ? (DAY_NAMES[s.dayOfWeek] ?? "?") : "?";
  const intervals = s.intervals as { reps?: number; work?: string; rest?: string } | null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-bg/95 backdrop-blur"
      style={{ WebkitBackdropFilter: "blur(8px)" }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-5 border-b border-border shrink-0">
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-surface border border-border flex items-center justify-center"
        >
          <X size={16} className="text-text" />
        </button>
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-dm text-muted uppercase tracking-wider">{dayName} - {s.type}</span>
          <h2 className="font-bebas text-2xl leading-none text-text truncate">{s.title ?? "Seance"}</h2>
        </div>
        {isKey && (
          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
            <Zap size={16} className="text-accent" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">

        {/* Description */}
        {s.description && (
          <div className="bg-surface border border-border rounded-xl p-4">
            <span className="text-[10px] font-dm text-muted uppercase tracking-wider">Description</span>
            <p className="text-sm font-dm text-text mt-1 leading-relaxed">{s.description}</p>
          </div>
        )}

        {/* Objectifs */}
        <div className="bg-surface border border-border rounded-xl p-4">
          <span className="text-[10px] font-dm text-muted uppercase tracking-wider mb-3 block">Objectifs</span>
          <div className="grid grid-cols-2 gap-3">
            {s.targetDistanceKm != null && (
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
                  <MapPin size={16} className="text-accent" />
                </div>
                <div>
                  <span className="font-bebas text-xl leading-none text-text">{s.targetDistanceKm.toFixed(1)} km</span>
                  <span className="text-[10px] font-dm text-muted block">Distance</span>
                </div>
              </div>
            )}
            {s.targetPace && (
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Clock size={16} className="text-accent" />
                </div>
                <div>
                  <span className="font-bebas text-xl leading-none text-text">{s.targetPace} /km</span>
                  <span className="text-[10px] font-dm text-muted block">Allure</span>
                </div>
              </div>
            )}
            {s.targetZone && (
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Target size={16} className="text-accent" />
                </div>
                <div>
                  <span className="font-bebas text-xl leading-none text-text">{s.targetZone.toUpperCase()}</span>
                  <span className="text-[10px] font-dm text-muted block">Zone</span>
                </div>
              </div>
            )}
            {planTargetPace && (
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-accent2/10 flex items-center justify-center">
                  <TrendingUp size={16} className="text-accent2" />
                </div>
                <div>
                  <span className="font-bebas text-xl leading-none text-text">{planTargetPace} /km</span>
                  <span className="text-[10px] font-dm text-muted block">Objectif plan</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Intervals detail */}
        {intervals && (intervals.reps || intervals.work) && (
          <div className="bg-surface border border-accent/20 rounded-xl p-4">
            <span className="text-[10px] font-dm text-accent uppercase tracking-wider mb-2 block">Fractionne</span>
            <div className="flex flex-col gap-2">
              {intervals.reps && (
                <div className="flex items-center gap-2">
                  <span className="font-bebas text-3xl leading-none text-accent">{intervals.reps}x</span>
                  <div className="flex flex-col">
                    {intervals.work && <span className="text-sm font-dm text-text">{intervals.work}</span>}
                    {intervals.rest && <span className="text-xs font-dm text-muted">Recup: {intervals.rest}</span>}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Activity data if linked */}
        {hasActivity && s.activity && (
          <>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[10px] font-dm text-success uppercase tracking-wider flex items-center gap-1">
                <Check size={10} /> Activite realisee
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Primary metrics */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-surface border border-border rounded-xl p-3 text-center">
                <MapPin size={14} className="text-muted mx-auto mb-1" />
                <span className="font-bebas text-2xl leading-none text-success block">{s.activity.distanceKm.toFixed(1)}</span>
                <span className="text-[9px] font-dm text-muted uppercase">km</span>
              </div>
              <div className="bg-surface border border-border rounded-xl p-3 text-center">
                <Clock size={14} className="text-muted mx-auto mb-1" />
                <span className="font-bebas text-2xl leading-none text-text block">{s.activity.avgPace ?? "--"}</span>
                <span className="text-[9px] font-dm text-muted uppercase">/km</span>
              </div>
              <div className="bg-surface border border-border rounded-xl p-3 text-center">
                <Timer size={14} className="text-muted mx-auto mb-1" />
                <span className="font-bebas text-2xl leading-none text-text block">{formatSeconds(s.activity.durationSeconds)}</span>
                <span className="text-[9px] font-dm text-muted uppercase">temps</span>
              </div>
            </div>

            {/* Secondary metrics */}
            <div className="grid grid-cols-2 gap-2">
              {s.activity.avgHeartRate != null && (
                <div className="bg-surface border border-border rounded-xl p-3 flex items-center gap-3">
                  <Heart size={16} className="text-accent2" />
                  <div>
                    <span className="font-bebas text-xl leading-none text-text">{s.activity.avgHeartRate}</span>
                    <span className="text-[10px] font-dm text-muted block">FC moy (bpm)</span>
                  </div>
                </div>
              )}
              {s.activity.maxHeartRate != null && (
                <div className="bg-surface border border-border rounded-xl p-3 flex items-center gap-3">
                  <Heart size={16} className="text-accent2" />
                  <div>
                    <span className="font-bebas text-xl leading-none text-text">{s.activity.maxHeartRate}</span>
                    <span className="text-[10px] font-dm text-muted block">FC max (bpm)</span>
                  </div>
                </div>
              )}
              {s.activity.avgCadence != null && (
                <div className="bg-surface border border-border rounded-xl p-3 flex items-center gap-3">
                  <Footprints size={16} className="text-muted" />
                  <div>
                    <span className="font-bebas text-xl leading-none text-text">{s.activity.avgCadence}</span>
                    <span className="text-[10px] font-dm text-muted block">Cadence (spm)</span>
                  </div>
                </div>
              )}
              {s.activity.elevationGain != null && (
                <div className="bg-surface border border-border rounded-xl p-3 flex items-center gap-3">
                  <TrendingUp size={16} className="text-muted" />
                  <div>
                    <span className="font-bebas text-xl leading-none text-text">+{Math.round(s.activity.elevationGain)}</span>
                    <span className="text-[10px] font-dm text-muted block">Denivele (m)</span>
                  </div>
                </div>
              )}
              {s.activity.calories != null && (
                <div className="bg-surface border border-border rounded-xl p-3 flex items-center gap-3">
                  <Flame size={16} className="text-accent2" />
                  <div>
                    <span className="font-bebas text-xl leading-none text-text">{s.activity.calories}</span>
                    <span className="text-[10px] font-dm text-muted block">Calories</span>
                  </div>
                </div>
              )}
            </div>

            {/* Compare target vs actual */}
            {s.targetDistanceKm != null && (
              <div className="bg-surface border border-border rounded-xl p-4">
                <span className="text-[10px] font-dm text-muted uppercase tracking-wider mb-3 block">Objectif vs Realise</span>
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-dm text-muted">Distance</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-dm text-muted">{s.targetDistanceKm.toFixed(1)} km</span>
                      <ArrowRight size={10} className="text-muted" />
                      <span className="text-xs font-dm font-semibold text-success">{s.activity.distanceKm.toFixed(1)} km</span>
                    </div>
                  </div>
                  {s.targetPace && s.activity.avgPace && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-dm text-muted">Allure</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-dm text-muted">{s.targetPace} /km</span>
                        <ArrowRight size={10} className="text-muted" />
                        <span className={`text-xs font-dm font-semibold ${s.activity.avgPace <= s.targetPace ? "text-success" : "text-accent2"}`}>{s.activity.avgPace} /km</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Link to full activity */}
            <button
              onClick={() => router.push(`/activities/${s.activity!.id}`)}
              className="w-full flex items-center justify-center gap-2 bg-surface border border-border rounded-xl p-3 text-sm font-dm text-accent active:opacity-70 transition-opacity"
            >
              <ExternalLink size={14} />
              Voir l'activite complete
            </button>
          </>
        )}

        {/* Not done yet */}
        {!hasActivity && (
          <div className="bg-surface border border-border rounded-xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-border/30 flex items-center justify-center mx-auto mb-3">
              <Clock size={20} className="text-muted" />
            </div>
            <span className="font-bebas text-xl text-muted">Pas encore realisee</span>
            <p className="text-xs font-dm text-muted mt-1">
              Importe ton activite depuis Strava ou un fichier FIT pour la lier a cette seance.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function formatSeconds(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}
