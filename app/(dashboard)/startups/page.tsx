import type { Metadata } from "next";
import { Suspense } from "react";
import { getStartups } from "@/lib/queries/startups";
import { getAllCategories } from "@/lib/queries/categories";
import { StartupFilters } from "@/components/startups/StartupFilters";
import { StartupTable } from "@/components/startups/StartupTable";
import { Pagination } from "@/components/shared/Pagination";
import { PageHeader } from "@/components/shared/PageHeader";
import type { StartupFilters as IFilters } from "@/types";
import type { PricingModel } from "@prisma/client";

export const metadata: Metadata = { title: "Startups" };

interface Props {
  searchParams: Promise<{
    q?: string;
    category?: string;
    pricingModel?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function StartupsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10));
  const filters: IFilters = {
    q: sp.q,
    category: sp.category,
    pricingModel: (sp.pricingModel as PricingModel) || undefined,
    sort: (sp.sort as IFilters["sort"]) ?? "trendingScore",
    order: sp.sort === "name" ? "asc" : "desc",
    page,
    limit: 20,
  };

  const [result, categories] = await Promise.all([
    getStartups(filters),
    getAllCategories(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Startup Database"
        description={`${result.total} startups tracked`}
      />
      <Suspense>
        <StartupFilters categories={categories} />
      </Suspense>
      <StartupTable startups={result.data} />
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
