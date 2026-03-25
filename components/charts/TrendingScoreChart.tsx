"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatDate } from "@/lib/utils";
import type { Signal } from "@prisma/client";

interface TrendingScoreChartProps {
  signals: Signal[];
}

export function TrendingScoreChart({ signals }: TrendingScoreChartProps) {
  // Build cumulative score timeline from signals
  const LAMBDA = 0.05;
  const now = Date.now();

  const sorted = [...signals].sort(
    (a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime()
  );

  const chartData = sorted.map((signal, i) => {
    const signalsUpToHere = sorted.slice(0, i + 1);
    const score = signalsUpToHere.reduce((sum, s) => {
      const daysSince =
        (now - new Date(s.occurredAt).getTime()) / (1000 * 60 * 60 * 24);
      return sum + s.weight * Math.exp(-LAMBDA * daysSince);
    }, 0);
    return {
      date: formatDate(signal.occurredAt),
      score: Math.round(score * 10) / 10,
      label: signal.title,
    };
  });

  if (chartData.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-8">No signal data available</p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} />
        <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: 12 }}
          formatter={(value: number) => [value.toFixed(1), "Score"]}
        />
        <Line
          type="monotone"
          dataKey="score"
          stroke="#6366f1"
          strokeWidth={2}
          dot={{ r: 3, fill: "#6366f1" }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
