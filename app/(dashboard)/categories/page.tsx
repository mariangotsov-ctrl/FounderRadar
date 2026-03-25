import type { Metadata } from "next";
import Link from "next/link";
import { getAllCategories } from "@/lib/queries/categories";
import { PageHeader } from "@/components/shared/PageHeader";
import { Layers } from "lucide-react";

export const metadata: Metadata = { title: "Categories" };

export default async function CategoriesPage() {
  const categories = await getAllCategories();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        description={`${categories.length} categories covering the AI startup landscape`}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <Link key={cat.id} href={`/categories/${cat.slug}`}>
            <div className="group rounded-xl border border-gray-200 bg-white p-5 hover:border-indigo-300 hover:shadow-md transition-all duration-200">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${cat.color}20` }}
                >
                  <Layers
                    className="h-5 w-5"
                    style={{ color: cat.color }}
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {cat._count.startups}{" "}
                    {cat._count.startups === 1 ? "startup" : "startups"}
                  </p>
                </div>
              </div>
              {cat.description && (
                <p className="text-sm text-gray-500 line-clamp-2">
                  {cat.description}
                </p>
              )}
            </div>
          </Link>
        ))}

        {categories.length === 0 && (
          <div className="col-span-full text-center py-16 text-gray-400 text-sm">
            No categories yet. Add some from the admin panel.
          </div>
        )}
      </div>
    </div>
  );
}
