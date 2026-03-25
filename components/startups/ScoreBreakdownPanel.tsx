import { TrendingUp, Zap, Hash, CalendarDays, Star } from "lucide-react";
import { scoreColor, scoreBarColor } from "@/lib/utils";
import type { ScoreBreakdown } from "@/lib/scoring";

interface Props {
  breakdown: ScoreBreakdown;
}

const COMPONENTS: {
  key: keyof Omit<ScoreBreakdown, "total">;
  label: string;
  max: number;
  description: string;
  Icon: React.ElementType;
}[] = [
  {
    key: "activity",
    label: "Signal Activity",
    max: 50,
    description: "Recency-weighted sum of all signals — recent activity counts more",
    Icon: Zap,
  },
  {
    key: "volume",
    label: "Signal Volume",
    max: 15,
    description: "Total signals ever recorded — rewards consistent coverage",
    Icon: Hash,
  },
  {
    key: "recency",
    label: "Launch Freshness",
    max: 20,
    description: "Bonus for recently launched startups, decays over ~6 months",
    Icon: CalendarDays,
  },
  {
    key: "stars",
    label: "GitHub Stars",
    max: 15,
    description: "Peak star count from GitHub spike signals",
    Icon: Star,
  },
];

export function ScoreBreakdownPanel({ breakdown }: Props) {
  const barColor = scoreBarColor(breakdown.total);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">Score Breakdown</h2>
        <div
          className={`flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-full ${scoreColor(breakdown.total)}`}
        >
          <TrendingUp className="h-3.5 w-3.5" />
          {breakdown.total} / 100
        </div>
      </div>

      {/* Overall bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Overall</span>
          <span className="font-semibold text-gray-700">{breakdown.total}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${breakdown.total}%`, backgroundColor: barColor }}
          />
        </div>
      </div>

      <div className="border-t border-gray-100" />

      {/* Component rows */}
      <div className="space-y-4">
        {COMPONENTS.map(({ key, label, max, description, Icon }) => {
          const value = breakdown[key];
          const pct = Math.round((value / max) * 100);
          return (
            <div key={key} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Icon className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">{label}</span>
                  <span className="text-xs text-gray-400 hidden sm:inline">— {description}</span>
                </div>
                <span className="text-sm font-semibold text-gray-800 tabular-nums flex-shrink-0 ml-2">
                  {value}
                  <span className="text-xs text-gray-400 font-normal"> /{max}</span>
                </span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: barColor }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
