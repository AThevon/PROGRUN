"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardPen, ChevronRight, Check } from "lucide-react";
import type { Plan } from "@/types";

interface PlanListProps {
  plans: Plan[];
}

export function PlanList({ plans }: PlanListProps) {
  const router = useRouter();
  const [activatingId, setActivatingId] = useState<string | null>(null);
  const [localPlans, setLocalPlans] = useState<Plan[]>(plans);

  async function handleActivate(
    e: React.MouseEvent,
    planId: string
  ) {
    e.stopPropagation();
    setActivatingId(planId);
    try {
      const res = await fetch(`/api/plans/${planId}/activate`, {
        method: "POST",
      });
      if (res.ok) {
        setLocalPlans((prev) =>
          prev.map((p) => ({ ...p, isActive: p.id === planId }))
        );
      }
    } finally {
      setActivatingId(null);
    }
  }

  if (localPlans.length === 0) {
    return (
      <div className="p-5 flex flex-col gap-5">
        <h1 className="font-bebas text-[32px] leading-none text-text">
          Mes plans
        </h1>
        <div className="bg-surface border border-border rounded-xl p-8 flex flex-col items-center gap-3">
          <ClipboardPen size={32} className="text-muted" />
          <p className="text-muted text-sm font-dm">Aucun plan</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 flex flex-col gap-5">
      <h1 className="font-bebas text-[32px] leading-none text-text">
        Mes plans
      </h1>

      <div className="flex flex-col gap-3">
        {localPlans.map((plan) => (
          <div
            key={plan.id}
            className="bg-surface border border-border rounded-xl p-4 flex items-center gap-4 active:opacity-75 transition-opacity cursor-pointer"
            onClick={() => router.push(`/plan/${plan.id}`)}
          >
            {/* Icon */}
            <div className="w-10 h-10 rounded-full bg-bg border border-border flex items-center justify-center flex-shrink-0">
              <ClipboardPen
                size={18}
                className={plan.isActive ? "text-accent" : "text-muted"}
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bebas text-[20px] leading-none text-text truncate">
                  {plan.name}
                </span>
                {plan.isActive && (
                  <span className="text-[10px] font-dm font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full text-success bg-success/10 border border-success/30 flex items-center gap-1">
                    <Check size={10} />
                    Actif
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                {plan.durationWeeks != null && (
                  <span className="text-xs font-dm text-muted">
                    {plan.durationWeeks} semaines
                  </span>
                )}
                {plan.targetPace && (
                  <span className="text-xs font-dm text-muted">
                    {plan.targetPace}&nbsp;/km
                  </span>
                )}
                {plan.targetTime && (
                  <span className="text-xs font-dm text-muted">
                    {plan.targetTime}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {!plan.isActive && (
                <button
                  onClick={(e) => handleActivate(e, plan.id)}
                  disabled={activatingId === plan.id}
                  className="text-[11px] font-dm font-semibold uppercase tracking-wide px-3 py-1.5 rounded-full border border-accent text-accent active:opacity-70 transition-opacity disabled:opacity-40"
                >
                  {activatingId === plan.id ? "..." : "Activer"}
                </button>
              )}
              <ChevronRight size={16} className="text-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
