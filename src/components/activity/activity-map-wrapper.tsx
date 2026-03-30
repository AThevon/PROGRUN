"use client";

import dynamic from "next/dynamic";

const ActivityMap = dynamic(
  () => import("./activity-map").then((m) => m.ActivityMap),
  {
    ssr: false,
    loading: () => (
      <div className="bg-card border border-border rounded-xl h-[220px] animate-pulse" />
    ),
  },
);

export function ActivityMapWrapper({ track }: { track: Array<[number, number]> }) {
  return <ActivityMap track={track} />;
}
