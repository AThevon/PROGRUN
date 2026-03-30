/** Convert "6:18" -> 378 seconds */
export function paceToSeconds(pace: string): number {
  const [min, sec] = pace.split(":").map(Number);
  return min * 60 + sec;
}

/** Convert 378 seconds -> "6:18" */
export function secondsToPace(seconds: number): string {
  const min = Math.floor(seconds / 60);
  const sec = Math.round(seconds % 60);
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

/** Convert duration seconds to "45:22" or "1:05:22" */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Calculate pace from distance (km) and duration (seconds) */
export function calculatePace(distanceKm: number, durationSeconds: number): string {
  if (distanceKm <= 0) return "--:--";
  const paceSeconds = durationSeconds / distanceKm;
  return secondsToPace(paceSeconds);
}

/** Compare two paces: negative = faster, positive = slower */
export function comparePace(actual: string, target: string): number {
  return paceToSeconds(actual) - paceToSeconds(target);
}
