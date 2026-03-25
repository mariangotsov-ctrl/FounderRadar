import type { Metadata } from "next";
import { Suspense } from "react";
import { getAllSignalsPaginated, getSignalStats } from "@/lib/queries/signals";
import { SignalFeed } from "@/components/signals/SignalFeed";
import { Pagination } from "@/components/shared/Pagination";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { SIGNAL_TYPE_LABELS } from "@/lib/utils";
import { Zap } from "lucide-react";

export const metadata: Metadata = { title: "Signals" };

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function SignalsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10));

  const [result, stats] = await Promise.all([
    getAllSignalsPaginated(page, 20),
    getSignalStats(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Signal Feed"
        description="Real-time activity across all tracked startups"
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-500 mb-1">Total signals</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-500 mb-1">This week</p>
            <p className="text-2xl font-bold text-green-600">{stats.thisWeek}</p>
          </CardContent>
        </Card>
        {stats.byType.slice(0, 2).map((item) => (
          <Card key={item.type}>
            <CardContent className="p-4">
              <p className="text-xs text-gray-500 mb-1">
                {SIGNAL_TYPE_LABELS[item.type]}
              </p>
              <p className="text-2xl font-bold text-indigo-600">
                {item._count.type}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Type breakdown */}
      <div className="flex flex-wrap gap-2">
        {stats.byType.map((item) => (
          <div
            key={item.type}
            className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs"
          >
            <Zap className="h-3 w-3 text-indigo-500" />
            <span className="font-medium">{SIGNAL_TYPE_LABELS[item.type]}</span>
            <span className="text-gray-400">{item._count.type}</span>
          </div>
        ))}
      </div>

      {/* Feed */}
      <SignalFeed signals={result.data} />

      <Suspense>
        <Pagination
          page={result.page}
          totalPages={result.totalPages}
          total={result.total}
          limit={result.limit}
        />
      </Suspense>
    </div>
  );
}
