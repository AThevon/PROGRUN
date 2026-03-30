"use client";

import { AreaChart, Area, ResponsiveContainer, YAxis, ReferenceLine } from "recharts";

interface Lap {
  avgPace: string;
  avgHeartRate?: number | null;
}

export function LastRunChart({ laps }: { laps: Lap[] }) {
  const data = laps.map((lap, i) => {
    const [m, s] = lap.avgPace.split(":").map(Number);
    return { km: i + 1, pace: m * 60 + (s || 0) };
  });

  const avgPace = data.reduce((sum, d) => sum + d.pace, 0) / data.length;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 6, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="lastRunGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e8ff47" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#e8ff47" stopOpacity={0} />
          </linearGradient>
        </defs>
        <YAxis hide reversed />
        <ReferenceLine y={avgPace} stroke="#ff6b35" strokeDasharray="4 4" strokeWidth={1} />
        <Area
          type="monotone"
          dataKey="pace"
          stroke="#e8ff47"
          strokeWidth={2.5}
          fill="url(#lastRunGrad)"
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
