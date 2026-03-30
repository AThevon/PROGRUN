import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { activities } from "@/lib/db/schema";
import { parseFitFile, parseTcxFile, parseGpxFile } from "@/lib/garmin/parser";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const formData = await req.formData();
  const file = formData.get("file");

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const filename = file.name.toLowerCase();
  const ext = filename.split(".").pop() ?? "";

  let parsed;
  try {
    if (ext === "fit") {
      const buffer = await file.arrayBuffer();
      parsed = await parseFitFile(buffer);
    } else if (ext === "tcx") {
      const text = await file.text();
      parsed = parseTcxFile(text);
    } else if (ext === "gpx") {
      const text = await file.text();
      parsed = parseGpxFile(text);
    } else {
      return NextResponse.json(
        { error: "Unsupported file format. Use .fit, .tcx or .gpx" },
        { status: 400 }
      );
    }
  } catch (err) {
    console.error("Parse error:", err);
    return NextResponse.json(
      { error: "Failed to parse file" },
      { status: 422 }
    );
  }

  const [inserted] = await db
    .insert(activities)
    .values({
      userId,
      name: parsed.name,
      date: parsed.date,
      distanceKm: parsed.distanceKm,
      durationSeconds: parsed.durationSeconds,
      avgPace: parsed.avgPace,
      avgHeartRate: parsed.avgHeartRate,
      maxHeartRate: parsed.maxHeartRate,
      avgCadence: parsed.avgCadence,
      elevationGain: parsed.elevationGain,
      calories: parsed.calories,
      vo2max: parsed.vo2max,
      groundContactTime: parsed.groundContactTime,
      gpsTrack: parsed.gpsTrack,
      laps: parsed.laps,
      source: "manual_import",
      matchStatus: "unmatched",
    })
    .returning();

  return NextResponse.json(inserted, { status: 201 });
}
