import type { Metadata } from "next";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/shared/PageHeader";
import { CreateTagForm } from "@/components/admin/CreateTagForm";
import { DeleteTagButton } from "@/components/admin/DeleteTagButton";

export const metadata: Metadata = { title: "Manage Tags" };

export default async function AdminTagsPage() {
  const tags = await db.tag.findMany({
    include: { _count: { select: { startups: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Tags" description={`${tags.length} tags`} />
      <CreateTagForm />

      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Slug</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Used by</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tags.map((tag) => (
              <tr key={tag.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                    {tag.name}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{tag.slug}</td>
                <td className="px-4 py-3 text-gray-600">{tag._count.startups} startups</td>
                <td className="px-4 py-3 text-right">
                  <DeleteTagButton tagId={tag.id} tagName={tag.name} />
                </td>
              </tr>
            ))}
            {tags.length === 0 && (
              <tr>
                <td colSpan={4} className="py-12 text-center text-gray-400 text-sm">
                  No tags yet. Create one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
