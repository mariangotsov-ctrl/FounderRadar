import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategoryBySlug } from "@/lib/queries/categories";
import { StartupCard } from "@/components/startups/StartupCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Rocket, ArrowLeft } from "lucide-react";
import type { StartupWithRelations } from "@/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Not Found" };
  return { title: category.name };
}

export default async function CategoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/categories"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" /> All categories
      </Link>

      <div className="flex items-center gap-4">
        <div
          className="h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${category.color}20` }}
        >
          <div
            className="h-6 w-6 rounded-full"
            style={{ backgroundColor: category.color }}
          />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{category.name}</h1>
          <p className="text-sm text-gray-500">
            {category._count.startups} startups
            {category.description ? ` · ${category.description}` : ""}
          </p>
        </div>
      </div>

      {category.startups.length === 0 ? (
        <EmptyState
          icon={Rocket}
          title="No startups yet"
          description="No active startups in this category yet."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(category.startups as unknown as StartupWithRelations[]).map((startup) => (
            <StartupCard key={startup.id} startup={startup} />
          ))}
        </div>
      )}
    </div>
  );
}
