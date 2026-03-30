"use client";

import { useState } from "react";
import { RefreshCw, X, Check, MapPin, Clock, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDuration, calculatePace } from "@/lib/utils/pace";

interface StravaActivity {
  id: number;
  name: string;
  start_date: string;
  distance: number;
  moving_time: number;
  alreadyImported: boolean;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function StravaSyncModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [activities, setActivities] = useState<StravaActivity[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [result, setResult] = useState<number | null>(null);
  const router = useRouter();

  async function openModal() {
    setOpen(true);
    setLoading(true);
    setResult(null);
    setSelected(new Set());
    try {
      const res = await fetch("/api/strava/activities");
      const data = await res.json();
      setActivities(data.activities ?? []);
    } catch {
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }

  function toggleSelect(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  async function handleImport() {
    if (selected.size === 0) return;
    setImporting(true);
    try {
      const res = await fetch("/api/strava/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activityIds: Array.from(selected) }),
      });
      const data = await res.json();
      setResult(data.imported ?? 0);
      router.refresh();
      // Re-fetch to update alreadyImported flags
      const refreshed = await fetch("/api/strava/activities");
      const refreshedData = await refreshed.json();
      setActivities(refreshedData.activities ?? []);
      setSelected(new Set());
    } catch {
      // Keep modal open on error
    } finally {
      setImporting(false);
    }
  }

  const selectableActivities = activities.filter((a) => !a.alreadyImported);

  return (
    <>
      <button
        onClick={openModal}
        className="w-full flex items-center justify-center gap-2 bg-accent text-bg font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors"
      >
        <RefreshCw size={16} />
        Importer depuis Strava
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-bg/95 backdrop-blur"
          style={{ WebkitBackdropFilter: "blur(8px)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-border shrink-0">
            <h2 className="font-bebas text-2xl leading-none text-text">
              Importer depuis Strava
            </h2>
            <button
              onClick={() => setOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-surface border border-border text-muted active:opacity-70 transition-opacity"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
            {loading ? (
              <div className="flex-1 flex items-center justify-center py-16">
                <Loader2 size={28} className="animate-spin text-accent" />
              </div>
            ) : activities.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-16 gap-2 text-center">
                <span className="font-bebas text-xl text-muted">
                  Aucune course disponible
                </span>
                <p className="text-sm font-dm text-muted">
                  Aucune activite de course trouvee sur Strava.
                </p>
              </div>
            ) : (
              <>
                {result !== null && (
                  <div className="flex items-center gap-2 bg-success/10 border border-success/20 rounded-xl p-3">
                    <Check size={16} className="text-success shrink-0" />
                    <span className="text-sm font-dm text-success">
                      {result} activite{result !== 1 ? "s" : ""} importee
                      {result !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}

                {selectableActivities.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-dm text-muted">
                      {selected.size} / {selectableActivities.length} selectionnee
                      {selectableActivities.length !== 1 ? "s" : ""}
                    </span>
                    <button
                      onClick={() =>
                        setSelected(
                          selected.size === selectableActivities.length
                            ? new Set()
                            : new Set(selectableActivities.map((a) => a.id))
                        )
                      }
                      className="text-xs font-dm text-accent"
                    >
                      {selected.size === selectableActivities.length
                        ? "Tout deselectionner"
                        : "Tout selectionner"}
                    </button>
                  </div>
                )}

                {activities.map((activity) => {
                  const distanceKm = activity.distance / 1000;
                  const pace = calculatePace(distanceKm, activity.moving_time);
                  const isImported = activity.alreadyImported;
                  const isSelected = selected.has(activity.id);

                  return (
                    <button
                      key={activity.id}
                      disabled={isImported}
                      onClick={() => !isImported && toggleSelect(activity.id)}
                      className={`w-full text-left bg-card border rounded-xl p-4 flex items-center gap-3 transition-colors ${
                        isImported
                          ? "border-border opacity-50 cursor-default"
                          : isSelected
                          ? "border-accent"
                          : "border-border active:opacity-80"
                      }`}
                    >
                      {/* Checkbox */}
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border transition-colors ${
                          isImported
                            ? "border-border bg-surface"
                            : isSelected
                            ? "border-accent bg-accent"
                            : "border-border bg-surface"
                        }`}
                      >
                        {(isSelected || isImported) && (
                          <Check
                            size={12}
                            className={isImported ? "text-muted" : "text-bg"}
                          />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-bebas text-base leading-tight text-text truncate">
                            {activity.name}
                          </span>
                          {isImported && (
                            <span className="shrink-0 text-[10px] font-dm text-muted bg-surface border border-border rounded-full px-2 py-0.5">
                              Deja importe
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-dm text-muted capitalize">
                          {formatDate(activity.start_date)}
                        </span>
                        <div className="flex items-center gap-3 mt-1.5">
                          <div className="flex items-center gap-1 text-muted">
                            <MapPin size={11} strokeWidth={2} />
                            <span className="font-bebas text-sm text-text leading-none">
                              {distanceKm.toFixed(2)}
                            </span>
                            <span className="text-xs font-dm text-muted">km</span>
                          </div>
                          <div className="flex items-center gap-1 text-muted">
                            <Clock size={11} strokeWidth={2} />
                            <span className="font-bebas text-sm text-text leading-none">
                              {pace}
                            </span>
                            <span className="text-xs font-dm text-muted">/km</span>
                          </div>
                          <span className="text-xs font-dm text-muted ml-auto">
                            {formatDuration(activity.moving_time)}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </>
            )}
          </div>

          {/* Sticky bottom bar */}
          {!loading && selected.size > 0 && (
            <div className="shrink-0 p-4 border-t border-border bg-bg">
              <button
                onClick={handleImport}
                disabled={importing}
                className="w-full flex items-center justify-center gap-2 bg-accent text-bg font-semibold text-sm px-4 py-3 rounded-xl disabled:opacity-50 transition-colors"
              >
                {importing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Importation...
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    Importer {selected.size} activite{selected.size !== 1 ? "s" : ""}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
