"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
  Tooltip,
} from "recharts";
import { secondsToPace } from "@/lib/utils/pace";

interface PaceDataPoint {
  week: number;
  avgPaceSeconds: number;
}

interface PaceEvolutionChartProps {
  data: PaceDataPoint[];
  targetPaceSeconds: number;
  currentWeek: number;
}

function formatYTick(value: number): string {
  return secondsToPace(value);
}

export function PaceEvolutionChart({
  data,
  targetPaceSeconds,
  currentWeek,
}: PaceEvolutionChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-2xl p-4">
        <h3 className="font-bebas text-xl text-text tracking-wide mb-4">
          Evolution de l&apos;allure
        </h3>
        <p className="text-muted text-sm font-dm">
          Pas encore de donnees d&apos;allure.
        </p>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    ...d,
    pace: d.avgPaceSeconds,
  }));

  const paceValues = data.map((d) => d.avgPaceSeconds).filter((v) => v > 0);
  const minPace = Math.min(...paceValues, targetPaceSeconds) - 30;
  const maxPace = Math.max(...paceValues, targetPaceSeconds) + 30;

  return (
    <div className="bg-surface border border-border rounded-2xl p-4 flex flex-col gap-4">
      <div className="flex items-baseline justify-between">
        <h3 className="font-bebas text-xl text-text tracking-wide">
          Evolution de l&apos;allure
        </h3>
        <span className="text-xs font-dm text-muted">
          Cible: {secondsToPace(targetPaceSeconds)}/km
        </span>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
          <XAxis
            dataKey="week"
            tick={{ fontSize: 10, fill: "var(--color-muted)", fontFamily: "DM Sans" }}
            tickFormatter={(v) => `S${v}`}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[minPace, maxPace]}
            reversed
            tick={{ fontSize: 10, fill: "var(--color-muted)", fontFamily: "DM Sans" }}
            tickFormatter={formatYTick}
            axisLine={false}
            tickLine={false}
            width={42}
          />
          <Tooltip
            formatter={(value) => [secondsToPace(Number(value)), "Allure"]}
            labelFormatter={(label) => `Semaine ${label}`}
            contentStyle={{
              backgroundColor: "var(--color-card)",
              border: "1px solid var(--color-border)",
              borderRadius: "8px",
              fontSize: "12px",
              fontFamily: "DM Sans",
              color: "var(--color-text)",
            }}
          />
          <ReferenceLine
            y={targetPaceSeconds}
            stroke="var(--color-accent)"
            strokeDasharray="4 4"
            strokeOpacity={0.6}
          />
          <Line
            type="monotone"
            dataKey="pace"
            stroke="var(--color-accent)"
            strokeWidth={2}
            dot={{ r: 3, fill: "var(--color-accent)", strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
