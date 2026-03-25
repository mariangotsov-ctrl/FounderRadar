import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS, STATUS_COLORS, formatDate, formatScore } from "@/lib/utils";
import { Plus, Pencil, TrendingUp } from "lucide-react";
import { DeleteStartupButton } from "@/components/admin/DeleteStartupButton";

export const metadata: Metadata = { title: "Manage Startups" };

export default async function AdminStartupsPage() {
  const startups = await db.startup.findMany({
    include: {
      category: true,
      _count: { select: { signals: true, watchlistItems: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Startups"
        description={`${startups.length} total`}
        action={
          <Button asChild>
            <Link href="/admin/startups/new">
              <Plus className="h-4 w-4 mr-1" /> New Startup
            </Link>
          </Button>
        }
      />

      <div className="rounded-lg border border-gray-200 bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Category</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Score</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Signals</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Created</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {startups.map((s) => (
              <tr key={s.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div>
                    <Link href={`/startups/${s.slug}`} className="font-medium text-gray-900 hover:text-indigo-600">
                      {s.name}
                    </Link>
                    <p className="text-xs text-gray-400 truncate max-w-xs">{s.shortDescription}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{s.category?.name ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[s.status]}`}>
                    {STATUS_LABELS[s.status]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 text-amber-600 font-semibold text-xs">
                    <TrendingUp className="h-3 w-3" />
                    {formatScore(s.trendingScore)}
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{s._count.signals}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(s.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/startups/${s.id}/edit`}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                    <DeleteStartupButton startupId={s.id} startupName={s.name} />
                  </div>
                </td>
              </tr>
            ))}
            {startups.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-gray-400 text-sm">
                  No startups yet. <Link href="/admin/startups/new" className="text-indigo-600 hover:underline">Add one</Link>.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
