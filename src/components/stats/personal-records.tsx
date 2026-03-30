import { Trophy } from "lucide-react";
import type { RecordWithActivity } from "@/lib/db/queries/records";
import { secondsToPace, formatDuration } from "@/lib/utils/pace";

interface PersonalRecordsProps {
  records: RecordWithActivity[];
}

const RECORD_LABELS: Record<string, string> = {
  best_km: "Meilleur km",
  best_avg_pace: "Meilleure allure moy.",
  longest_run: "Plus longue course",
  lowest_hr: "FC la plus basse",
};

const RECORD_UNITS: Record<string, string> = {
  best_km: "/ km",
  best_avg_pace: "/ km",
  longest_run: "km",
  lowest_hr: "bpm",
};

function formatRecordValue(type: string, value: string): string {
  if (type === "best_km" || type === "best_avg_pace") {
    const seconds = parseFloat(value);
    if (!isNaN(seconds)) return secondsToPace(seconds);
    return value;
  }
  if (type === "longest_run") {
    const km = parseFloat(value);
    if (!isNaN(km)) return km.toFixed(1);
    return value;
  }
  if (type === "lowest_hr") {
    const bpm = parseFloat(value);
    if (!isNaN(bpm)) return bpm.toFixed(0);
    return value;
  }
  return value;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function PersonalRecords({ records }: PersonalRecordsProps) {
  const DISPLAY_TYPES = ["best_km", "best_avg_pace", "longest_run", "lowest_hr"];

  const recordMap = new Map<string, RecordWithActivity>();
  for (const record of records) {
    if (!recordMap.has(record.type)) {
      recordMap.set(record.type, record);
    }
  }

  return (
    <div className="bg-surface border border-border rounded-2xl p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Trophy size={18} strokeWidth={2} className="text-accent" />
        <h3 className="font-bebas text-xl text-text tracking-wide">
          Records personnels
        </h3>
      </div>

      {/* Grid of record cards */}
      <div className="grid grid-cols-2 gap-3">
        {DISPLAY_TYPES.map((type) => {
          const record = recordMap.get(type);
          return (
            <div
              key={type}
              className="bg-card border border-border rounded-xl p-3 flex flex-col gap-1"
            >
              <span className="text-[10px] font-dm text-muted uppercase tracking-wider">
                {RECORD_LABELS[type] ?? type}
              </span>
              {record ? (
                <>
                  <div className="flex items-baseline gap-1">
                    <span className="font-bebas text-2xl leading-none text-accent">
                      {formatRecordValue(type, record.value)}
                    </span>
                    <span className="text-[10px] font-dm text-muted">
                      {RECORD_UNITS[type] ?? ""}
                    </span>
                  </div>
                  <span className="text-[10px] font-dm text-muted">
                    {formatDate(record.achievedAt)}
                  </span>
                </>
              ) : (
                <span className="font-bebas text-2xl leading-none text-muted">--</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
