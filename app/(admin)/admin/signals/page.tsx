import type { Metadata } from "next";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/shared/PageHeader";
import { CreateSignalForm } from "@/components/admin/CreateSignalForm";
import { SignalBadge } from "@/components/signals/SignalBadge";
import { formatRelativeDate, formatScore } from "@/lib/utils";
import Link from "next/link";

export const metadata: Metadata = { title: "Manage Signals" };

export default async function AdminSignalsPage() {
  const [startups, signals] = await Promise.all([
    db.startup.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    db.signal.findMany({
      include: { startup: { select: { id: true, name: true, slug: true } } },
      orderBy: { occurredAt: "desc" },
      take: 50,
    }),
  ]);

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader title="Signals" description="Add activity signals to startups" />

      <CreateSignalForm startups={startups} />

      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Recent signals (last 50)
          </p>
        </div>
        <div className="divide-y divide-gray-100">
          {signals.map((signal) => (
            <div key={signal.id} className="flex items-start justify-between px-4 py-3 hover:bg-gray-50">
              <div className="flex items-start gap-3">
                <SignalBadge type={signal.type} />
                <div>
                  <p className="text-sm font-medium text-gray-800">{signal.title}</p>
                  <Link
                    href={`/startups/${signal.startup.slug}`}
                    className="text-xs text-indigo-600 hover:underline"
                  >
                    {signal.startup.name}
                  </Link>
                </div>
              </div>
              <div className="flex flex-col items-end text-xs text-gray-400 flex-shrink-0 ml-4">
                <span>{formatRelativeDate(signal.occurredAt)}</span>
                <span>weight: {signal.weight}</span>
              </div>
            </div>
          ))}
          {signals.length === 0 && (
            <p className="py-12 text-center text-gray-400 text-sm">
              No signals yet. Create one above.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
