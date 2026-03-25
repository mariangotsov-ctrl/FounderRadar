import { db } from "@/lib/db";
import type { Category } from "@prisma/client";

export type CategoryWithCount = Category & {
  _count: { startups: number };
};

export async function getAllCategories(): Promise<CategoryWithCount[]> {
  const categories = await db.category.findMany({
    include: { _count: { select: { startups: true } } },
    orderBy: { name: "asc" },
  });
  return categories;
}

export async function getCategoryBySlug(slug: string) {
  return db.category.findUnique({
    where: { slug },
    include: {
      _count: { select: { startups: true } },
      startups: {
        where: { status: "ACTIVE" },
        include: {
          category: true,
          tags: { include: { tag: true } },
          _count: { select: { watchlistItems: true } },
        },
        orderBy: { trendingScore: "desc" },
        take: 20,
      },
    },
  });
}
