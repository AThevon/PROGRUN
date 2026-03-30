"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
  Tooltip,
} from "recharts";
import { paceToSeconds, secondsToPace } from "@/lib/utils/pace";

interface Lap {
  distanceKm: number;
  durationSeconds: number;
  avgPace: string;
  avgHeartRate: number | null;
  avgCadence: number | null;
}

interface PaceChartProps {
  laps: Lap[];
  avgPace: string | null;
  avgHeartRate: number | null;
}

type Tab = "Allure" | "FC";

export function PaceChart({ laps, avgPace, avgHeartRate }: PaceChartProps) {
  const [activeTab, setActiveTab] = useState<Tab>("Allure");

  const chartData = laps.map((lap, i) => ({
    lap: i + 1,
    paceSeconds: lap.avgPace !== "--:--" ? paceToSeconds(lap.avgPace) : null,
    hr: lap.avgHeartRate,
  }));

  const avgPaceSec = avgPace ? paceToSeconds(avgPace) : null;

  // For pace chart: invert Y axis (lower seconds = faster = better, shown at top)
  const allPaceSec = chartData
    .map((d) => d.paceSeconds)
    .filter((v): v is number => v != null);
  const minPace = allPaceSec.length > 0 ? Math.min(...allPaceSec) - 15 : 0;
  const maxPace = allPaceSec.length > 0 ? Math.max(...allPaceSec) + 15 : 600;

  const allHr = chartData.map((d) => d.hr).filter((v): v is number => v != null);
  const minHr = allHr.length > 0 ? Math.min(...allHr) - 5 : 60;
  const maxHr = allHr.length > 0 ? Math.max(...allHr) + 5 : 200;

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-4">
      {/* Tabs */}
      <div className="flex items-center gap-1">
        {(["Allure", "FC"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1 rounded-lg text-xs font-dm font-semibold transition-colors ${
              activeTab === tab
                ? "bg-accent text-bg"
                : "text-muted hover:text-text"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="h-36">
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === "Allure" ? (
            <AreaChart
              data={chartData}
              margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="paceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-accent2)"
                    stopOpacity={0.4}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-accent2)"
                    stopOpacity={0.02}
                  />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="lap"
                tick={{ fill: "var(--color-muted)", fontSize: 10, fontFamily: "var(--font-dm)" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[minPace, maxPace]}
                reversed
                tickFormatter={(v: number) => secondsToPace(v)}
                tick={{ fill: "var(--color-muted)", fontSize: 9, fontFamily: "var(--font-dm)" }}
                tickLine={false}
                axisLine={false}
                width={44}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontFamily: "var(--font-dm)",
                  color: "var(--color-text)",
                }}
                formatter={(value) => [
                  typeof value === "number" ? secondsToPace(value) : String(value),
                  "Allure",
                ]}
                labelFormatter={(label) => `Tour ${label}`}
              />
              {avgPaceSec != null && (
                <ReferenceLine
                  y={avgPaceSec}
                  stroke="var(--color-accent2)"
                  strokeDasharray="4 3"
                  strokeWidth={1.5}
                />
              )}
              <Area
                type="monotone"
                dataKey="paceSeconds"
                stroke="var(--color-accent2)"
                strokeWidth={2}
                fill="url(#paceGradient)"
                connectNulls
                dot={false}
                activeDot={{ r: 4, fill: "var(--color-accent2)" }}
              />
            </AreaChart>
          ) : (
            <AreaChart
              data={chartData}
              margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="hrGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-accent)"
                    stopOpacity={0.4}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-accent)"
                    stopOpacity={0.02}
                  />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="lap"
                tick={{ fill: "var(--color-muted)", fontSize: 10, fontFamily: "var(--font-dm)" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[minHr, maxHr]}
                tick={{ fill: "var(--color-muted)", fontSize: 9, fontFamily: "var(--font-dm)" }}
                tickLine={false}
                axisLine={false}
                width={30}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontFamily: "var(--font-dm)",
                  color: "var(--color-text)",
                }}
                formatter={(value) => [`${value} bpm`, "FC"]}
                labelFormatter={(label) => `Tour ${label}`}
              />
              {avgHeartRate != null && (
                <ReferenceLine
                  y={avgHeartRate}
                  stroke="var(--color-accent2)"
                  strokeDasharray="4 3"
                  strokeWidth={1.5}
                />
              )}
              <Area
                type="monotone"
                dataKey="hr"
                stroke="var(--color-accent)"
                strokeWidth={2}
                fill="url(#hrGradient)"
                connectNulls
                dot={false}
                activeDot={{ r: 4, fill: "var(--color-accent)" }}
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
