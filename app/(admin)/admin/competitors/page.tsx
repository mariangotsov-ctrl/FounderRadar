import type { Metadata } from "next";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/shared/PageHeader";
import { CreateCompetitorForm } from "@/components/admin/CreateCompetitorForm";
import { DeleteCompetitorButton } from "@/components/admin/DeleteCompetitorButton";
import Link from "next/link";

export const metadata: Metadata = { title: "Manage Competitors" };

export default async function AdminCompetitorsPage() {
  const [startups, relations] = await Promise.all([
    db.startup.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    db.competitorRelation.findMany({
      include: {
        startupA: { select: { id: true, name: true, slug: true } },
        startupB: { select: { id: true, name: true, slug: true } },
      },
    }),
  ]);

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader title="Competitors" description={`${relations.length} relations`} />
      <CreateCompetitorForm startups={startups} />

      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Startup A</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">vs</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Startup B</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Note</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {relations.map((r) => (
              <tr key={r.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link href={`/startups/${r.startupA.slug}`} className="font-medium text-gray-900 hover:text-indigo-600">
                    {r.startupA.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">competes with</td>
                <td className="px-4 py-3">
                  <Link href={`/startups/${r.startupB.slug}`} className="font-medium text-gray-900 hover:text-indigo-600">
                    {r.startupB.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{r.note ?? "—"}</td>
                <td className="px-4 py-3 text-right">
                  <DeleteCompetitorButton relationId={r.id} />
                </td>
              </tr>
            ))}
            {relations.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-gray-400 text-sm">
                  No competitor relations yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
