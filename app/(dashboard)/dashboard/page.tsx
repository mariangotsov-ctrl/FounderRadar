import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getTrendingStartups, getNewStartupsThisWeek } from "@/lib/queries/startups";
import { getRecentSignals } from "@/lib/queries/signals";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StartupCard } from "@/components/startups/StartupCard";
import { SignalFeed } from "@/components/signals/SignalFeed";
import { CategoryChart } from "@/components/charts/CategoryChart";
import { PageHeader } from "@/components/shared/PageHeader";
import { Rocket, TrendingUp, Layers, Zap, ArrowRight } from "lucide-react";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth();

  const [trending, newThisWeek, recentSignals, totalStartups, categoryData] =
    await Promise.all([
      getTrendingStartups(6),
      getNewStartupsThisWeek(),
      getRecentSignals(8),
      db.startup.count({ where: { status: "ACTIVE" } }),
      db.category.findMany({
        include: { _count: { select: { startups: true } } },
        orderBy: { startups: { _count: "desc" } },
        take: 8,
      }),
    ]);

  const totalSignals = await db.signal.count();

  const chartData = categoryData
    .filter((c) => c._count.startups > 0)
    .map((c) => ({
      name: c.name,
      value: c._count.startups,
      color: c.color,
    }));

  const userName = session?.user?.name?.split(" ")[0] ?? "there";

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Good morning, ${userName} 👋`}
        description="Here's what's happening in the AI startup ecosystem."
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          title="Total Startups"
          value={totalStartups}
          icon={<Rocket className="h-5 w-5 text-indigo-600" />}
          bg="bg-indigo-50"
        />
        <StatCard
          title="New This Week"
          value={newThisWeek}
          icon={<TrendingUp className="h-5 w-5 text-green-600" />}
          bg="bg-green-50"
        />
        <StatCard
          title="Categories"
          value={categoryData.length}
          icon={<Layers className="h-5 w-5 text-purple-600" />}
          bg="bg-purple-50"
        />
        <StatCard
          title="Total Signals"
          value={totalSignals}
          icon={<Zap className="h-5 w-5 text-amber-600" />}
          bg="bg-amber-50"
        />
      </div>

      {/* Trending + Categories */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Trending Now</h2>
            <Link
              href="/startups"
              className="text-sm text-indigo-600 hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {trending.map((startup) => (
              <StartupCard key={startup.id} startup={startup} />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Top Categories</h2>
          <Card>
            <CardContent className="pt-4">
              <CategoryChart data={chartData} />
            </CardContent>
          </Card>
          <div className="space-y-2">
            {categoryData.slice(0, 5).map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="flex items-center justify-between rounded-lg border border-gray-100 bg-white px-4 py-3 hover:border-indigo-200 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                </div>
                <span className="text-xs text-gray-400">{cat._count.startups}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Signals */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Signals</h2>
          <Link
            href="/signals"
            className="text-sm text-indigo-600 hover:underline flex items-center gap-1"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <SignalFeed signals={recentSignals} />
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  bg,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  bg: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-3">
          <div className={`rounded-lg p-2 ${bg}`}>{icon}</div>
          <div>
            <p className="text-xs text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
