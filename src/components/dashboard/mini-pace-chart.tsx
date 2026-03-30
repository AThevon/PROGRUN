"use client";

import { AreaChart, Area, ResponsiveContainer, YAxis } from "recharts";

interface Lap {
  avgPace: string;
  avgHeartRate?: number | null;
}

export function MiniPaceChart({ laps }: { laps: Lap[] }) {
  if (!laps || laps.length < 2) return null;

  const data = laps.map((lap, i) => {
    const [m, s] = lap.avgPace.split(":").map(Number);
    return { km: i + 1, pace: m * 60 + (s || 0) };
  });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="miniPaceGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e8ff47" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#e8ff47" stopOpacity={0} />
          </linearGradient>
        </defs>
        <YAxis domain={["dataMin - 10", "dataMax + 10"]} hide reversed />
        <Area
          type="monotone"
          dataKey="pace"
          stroke="#e8ff47"
          strokeWidth={2}
          fill="url(#miniPaceGrad)"
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
