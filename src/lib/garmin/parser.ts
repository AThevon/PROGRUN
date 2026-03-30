import FitParser from "fit-file-parser";
import { secondsToPace } from "@/lib/utils/pace";

export interface ParsedActivity {
  name: string;
  date: Date;
  distanceKm: number;
  durationSeconds: number;
  avgPace: string;
  avgHeartRate: number | null;
  maxHeartRate: number | null;
  avgCadence: number | null;
  elevationGain: number | null;
  calories: number | null;
  vo2max: number | null;
  groundContactTime: number | null;
  gpsTrack: Array<[number, number]> | null;
  laps: Array<{
    distanceKm: number;
    durationSeconds: number;
    avgPace: string;
    avgHeartRate: number | null;
    avgCadence: number | null;
  }> | null;
}

// ---------------------------------------------------------------------------
// FIT parser
// ---------------------------------------------------------------------------

export async function parseFitFile(buffer: ArrayBuffer): Promise<ParsedActivity> {
  const fitParser = new FitParser({
    force: true,
    speedUnit: "km/h",
    lengthUnit: "km",
    elapsedRecordField: true,
    mode: "cascade",
  });

  const data = await fitParser.parseAsync(buffer);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sessions: any[] = (data as any).activity?.sessions ?? [];
  const session = sessions[0] ?? {};

  const distanceKm = (session.total_distance as number | undefined) ?? 0;
  const durationSeconds = Math.round(
    (session.total_elapsed_time as number | undefined) ?? 0
  );
  const paceSeconds = distanceKm > 0 ? durationSeconds / distanceKm : 0;
  const avgPace = paceSeconds > 0 ? secondsToPace(paceSeconds) : "--:--";

  // HR
  const avgHeartRate = (session.avg_heart_rate as number | undefined) ?? null;
  const maxHeartRate = (session.max_heart_rate as number | undefined) ?? null;

  // Cadence (stored as steps per minute in FIT, multiply by 2 for SPM)
  const rawCadence = (session.avg_running_cadence as number | undefined) ?? (session.avg_cadence as number | undefined) ?? null;
  const avgCadence = rawCadence != null ? Math.round(rawCadence * 2) : null;

  // Elevation
  const elevationGain = (session.total_ascent as number | undefined) ?? null;

  // Calories
  const calories = (session.total_calories as number | undefined) ?? null;

  // VO2max — not available in standard FIT session fields.
  // enhanced_avg_respiration_rate is respiration rate, not VO2max.
  const vo2max = null;

  // Ground contact time (in ms in FIT)
  const groundContactTime = (session.avg_stance_time as number | undefined) ?? null;

  // GPS track from records
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const records: any[] = session.laps?.flatMap((lap: any) => lap.records ?? []) ?? [];
  const gpsTrack: Array<[number, number]> = records
    .filter(
      (r) =>
        typeof r.position_lat === "number" &&
        typeof r.position_long === "number"
    )
    .map((r) => [r.position_lat as number, r.position_long as number]);

  // Laps
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fitLaps: any[] = session.laps ?? [];
  const laps = fitLaps.map((lap) => {
    const lapDist = (lap.total_distance as number | undefined) ?? 0;
    const lapDur = Math.round((lap.total_elapsed_time as number | undefined) ?? 0);
    const lapPaceSec = lapDist > 0 ? lapDur / lapDist : 0;
    return {
      distanceKm: lapDist,
      durationSeconds: lapDur,
      avgPace: lapPaceSec > 0 ? secondsToPace(lapPaceSec) : "--:--",
      avgHeartRate: (lap.avg_heart_rate as number | undefined) ?? null,
      avgCadence:
        (lap.avg_running_cadence as number | undefined) != null
          ? Math.round((lap.avg_running_cadence as number) * 2)
          : (lap.avg_cadence as number | undefined) != null
          ? Math.round((lap.avg_cadence as number) * 2)
          : null,
    };
  });

  // Name & date
  const name = "Course importee";
  const rawDate = (session.start_time as Date | undefined) ?? new Date();
  const date = rawDate instanceof Date ? rawDate : new Date(rawDate as string);

  return {
    name,
    date,
    distanceKm,
    durationSeconds,
    avgPace,
    avgHeartRate,
    maxHeartRate,
    avgCadence,
    elevationGain,
    calories,
    vo2max,
    groundContactTime,
    gpsTrack: gpsTrack.length > 0 ? gpsTrack : null,
    laps: laps.length > 0 ? laps : null,
  };
}

// ---------------------------------------------------------------------------
// TCX parser
// ---------------------------------------------------------------------------

function extractXmlNumber(xml: string, tag: string): number | null {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\d.]+)</${tag}>`, "i"));
  return match ? parseFloat(match[1]) : null;
}

function extractXmlString(xml: string, tag: string): string | null {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([^<]+)</${tag}>`, "i"));
  return match ? match[1].trim() : null;
}

export function parseTcxFile(xml: string): ParsedActivity {
  const distanceMeters = extractXmlNumber(xml, "DistanceMeters") ?? 0;
  const distanceKm = distanceMeters / 1000;

  const durationSeconds = Math.round(
    extractXmlNumber(xml, "TotalTimeSeconds") ?? 0
  );

  const paceSeconds = distanceKm > 0 ? durationSeconds / distanceKm : 0;
  const avgPace = paceSeconds > 0 ? secondsToPace(paceSeconds) : "--:--";

  // Heart rate
  const avgHeartRate = extractXmlNumber(xml, "AverageHeartRateBpm") ?? null;
  const maxHeartRate = extractXmlNumber(xml, "MaximumHeartRateBpm") ?? null;

  // Calories
  const calories = extractXmlNumber(xml, "Calories") ?? null;

  // Cadence
  const avgCadence = extractXmlNumber(xml, "Cadence") ?? null;

  // Date
  const dateStr = extractXmlString(xml, "Id");
  const date = dateStr ? new Date(dateStr) : new Date();

  // Name
  const name = extractXmlString(xml, "Name") ?? "Course importee";

  // GPS track from Trackpoint
  const trkptRegex =
    /<Trackpoint>[\s\S]*?<LatitudeDegrees>([\d.-]+)<\/LatitudeDegrees>[\s\S]*?<LongitudeDegrees>([\d.-]+)<\/LongitudeDegrees>[\s\S]*?<\/Trackpoint>/gi;
  const gpsTrack: Array<[number, number]> = [];
  let trkMatch: RegExpExecArray | null;
  while ((trkMatch = trkptRegex.exec(xml)) !== null) {
    gpsTrack.push([parseFloat(trkMatch[1]), parseFloat(trkMatch[2])]);
  }

  return {
    name,
    date,
    distanceKm,
    durationSeconds,
    avgPace,
    avgHeartRate,
    maxHeartRate,
    avgCadence,
    elevationGain: null,
    calories: calories != null ? Math.round(calories) : null,
    vo2max: null,
    groundContactTime: null,
    gpsTrack: gpsTrack.length > 0 ? gpsTrack : null,
    laps: null,
  };
}

// ---------------------------------------------------------------------------
// GPX parser
// ---------------------------------------------------------------------------

function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function parseGpxFile(xml: string): ParsedActivity {
  // Extract all trackpoints
  const trkptRegex =
    /<trkpt\s+lat="([\d.-]+)"\s+lon="([\d.-]+)"[^>]*>([\s\S]*?)<\/trkpt>/gi;
  const points: Array<{
    lat: number;
    lon: number;
    ele: number | null;
    time: Date | null;
  }> = [];

  let m: RegExpExecArray | null;
  while ((m = trkptRegex.exec(xml)) !== null) {
    const lat = parseFloat(m[1]);
    const lon = parseFloat(m[2]);
    const inner = m[3];
    const eleMatch = inner.match(/<ele>([\d.-]+)<\/ele>/i);
    const timeMatch = inner.match(/<time>([^<]+)<\/time>/i);
    points.push({
      lat,
      lon,
      ele: eleMatch ? parseFloat(eleMatch[1]) : null,
      time: timeMatch ? new Date(timeMatch[1]) : null,
    });
  }

  // Compute distance via haversine
  let distanceKm = 0;
  for (let i = 1; i < points.length; i++) {
    distanceKm += haversineKm(
      points[i - 1].lat,
      points[i - 1].lon,
      points[i].lat,
      points[i].lon
    );
  }

  // Duration from first / last trackpoint time
  const firstTime = points.find((p) => p.time != null)?.time ?? null;
  const lastTime = [...points].reverse().find((p) => p.time != null)?.time ?? null;
  const durationSeconds =
    firstTime && lastTime
      ? Math.round((lastTime.getTime() - firstTime.getTime()) / 1000)
      : 0;

  const paceSeconds = distanceKm > 0 && durationSeconds > 0 ? durationSeconds / distanceKm : 0;
  const avgPace = paceSeconds > 0 ? secondsToPace(paceSeconds) : "--:--";

  // Elevation gain
  let elevationGain = 0;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1].ele;
    const curr = points[i].ele;
    if (prev != null && curr != null && curr > prev) {
      elevationGain += curr - prev;
    }
  }

  // Name from metadata
  const nameMatch = xml.match(/<name>([^<]+)<\/name>/i);
  const name = nameMatch ? nameMatch[1].trim() : "Course importee";

  const gpsTrack: Array<[number, number]> = points.map((p) => [p.lat, p.lon]);
  const date = firstTime ?? new Date();

  return {
    name,
    date,
    distanceKm,
    durationSeconds,
    avgPace,
    avgHeartRate: null,
    maxHeartRate: null,
    avgCadence: null,
    elevationGain: elevationGain > 0 ? Math.round(elevationGain) : null,
    calories: null,
    vo2max: null,
    groundContactTime: null,
    gpsTrack: gpsTrack.length > 0 ? gpsTrack : null,
    laps: null,
  };
}
