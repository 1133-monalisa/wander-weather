import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { CalendarDays, Droplets } from "lucide-react";
import { CardShell, EmptyBlock } from "./Shared";
import { formatDay, formatWeekday } from "@/lib/weather-utils";
import { WeatherPayload } from "@/types/weather";

export function WeatherCharts({
  daily,
}: {
  daily?: WeatherPayload["weather"]["daily"];
}) {
  const chartData = useMemo(() => {
    return (daily ?? []).slice(0, 7).map((d) => ({
      dt: d.dt,
      day: formatWeekday(d.dt),
      label: formatDay(d.dt),
      max: typeof d.temp?.max === "number" ? Math.round(d.temp.max) : null,
      min: typeof d.temp?.min === "number" ? Math.round(d.temp.min) : null,
      pop: typeof d.pop === "number" ? Math.round(d.pop * 100) : 0,
    }));
  }, [daily]);

  const hasData = chartData.length > 0;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <CardShell
        title="Temperature trend"
        subtitle="7-day max vs min"
        right={hasData ? "Interactive" : "—"}
        icon={<CalendarDays className="w-4 h-4" />}
      >
        {!hasData ? (
          <EmptyBlock />
        ) : (
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="max"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={false}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="min"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  strokeDasharray="6 6"
                  dot={false}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardShell>

      <CardShell
        title="Rain probability"
        subtitle="7-day chance of precipitation"
        right={hasData ? "Interactive" : "—"}
        icon={<Droplets className="w-4 h-4" />}
      >
        {!hasData ? (
          <EmptyBlock />
        ) : (
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis tickFormatter={(v) => `${v}%`} />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="pop"
                  name="Rain chance"
                  fill="#60a5fa"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardShell>
    </div>
  );
}
