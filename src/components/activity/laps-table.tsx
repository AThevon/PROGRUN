import { paceToSeconds } from "@/lib/utils/pace";

interface Lap {
  distanceKm: number;
  durationSeconds: number;
  avgPace: string;
  avgHeartRate: number | null;
  avgCadence: number | null;
}

interface LapsTableProps {
  laps: Lap[];
  avgPace: string | null;
}

export function LapsTable({ laps, avgPace }: LapsTableProps) {
  const avgPaceSec = avgPace ? paceToSeconds(avgPace) : null;

  function getLapColor(lapPace: string): string {
    if (!avgPaceSec || lapPace === "--:--") return "text-text";
    const lapSec = paceToSeconds(lapPace);
    // Faster than average = green (lower seconds = faster)
    if (lapSec < avgPaceSec) return "text-success";
    // Slower than average = orange
    return "text-accent2";
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="font-bebas text-lg text-text tracking-wide">Tours</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-4 py-2 text-[10px] font-dm text-muted uppercase tracking-wide">
                #
              </th>
              <th className="text-right px-3 py-2 text-[10px] font-dm text-muted uppercase tracking-wide">
                Dist
              </th>
              <th className="text-right px-3 py-2 text-[10px] font-dm text-muted uppercase tracking-wide">
                Allure
              </th>
              <th className="text-right px-3 py-2 text-[10px] font-dm text-muted uppercase tracking-wide">
                FC moy
              </th>
              <th className="text-right px-4 py-2 text-[10px] font-dm text-muted uppercase tracking-wide">
                Cad
              </th>
            </tr>
          </thead>
          <tbody>
            {laps.map((lap, i) => (
              <tr
                key={i}
                className="border-b border-border/50 last:border-0"
              >
                <td className="px-4 py-2.5 font-bebas text-base text-muted">
                  {i + 1}
                </td>
                <td className="px-3 py-2.5 text-right">
                  <span className="font-bebas text-base text-text">
                    {lap.distanceKm.toFixed(2)}
                  </span>
                  <span className="text-[10px] font-dm text-muted ml-0.5">km</span>
                </td>
                <td className="px-3 py-2.5 text-right">
                  <span className={`font-bebas text-base ${getLapColor(lap.avgPace)}`}>
                    {lap.avgPace}
                  </span>
                  <span className="text-[10px] font-dm text-muted ml-0.5">/km</span>
                </td>
                <td className="px-3 py-2.5 text-right">
                  <span className="font-bebas text-base text-text">
                    {lap.avgHeartRate ?? "--"}
                  </span>
                  {lap.avgHeartRate != null && (
                    <span className="text-[10px] font-dm text-muted ml-0.5">bpm</span>
                  )}
                </td>
                <td className="px-4 py-2.5 text-right">
                  <span className="font-bebas text-base text-text">
                    {lap.avgCadence ?? "--"}
                  </span>
                  {lap.avgCadence != null && (
                    <span className="text-[10px] font-dm text-muted ml-0.5">spm</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
