import { db } from "@/lib/db";
import { computeTrendingScore, computeScoreBreakdown } from "@/lib/scoring";
import type { ScoreBreakdown } from "@/lib/scoring";
import type { StartupFilters, PaginatedResult, StartupWithRelations, StartupWithCompetitors } from "@/types";
import type { Prisma, PricingModel, StartupStatus } from "@prisma/client";

const startupInclude = {
  category: true,
  tags: { include: { tag: true } },
  // Fetch only the most recent signal so StartupTable can show "Latest Signal"
  signals: { orderBy: { occurredAt: "desc" as const }, take: 1 },
  _count: { select: { watchlistItems: true, signals: true } },
} satisfies Prisma.StartupInclude;

export async function getStartups(
  filters: StartupFilters = {}
): Promise<PaginatedResult<StartupWithRelations>> {
  const {
    q,
    category,
    pricingModel,
    status,
    sort = "trendingScore",
    order = "desc",
    page = 1,
    limit = 20,
  } = filters;

  const where: Prisma.StartupWhereInput = {
    ...(status ? { status: status as StartupStatus } : { status: "ACTIVE" }),
    ...(pricingModel ? { pricingModel: pricingModel as PricingModel } : {}),
    ...(category
      ? { category: { slug: category } }
      : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { shortDescription: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
            { tags: { some: { tag: { name: { contains: q, mode: "insensitive" } } } } },
          ],
        }
      : {}),
  };

  const orderBy: Prisma.StartupOrderByWithRelationInput =
    sort === "name"
      ? { name: order }
      : sort === "createdAt"
      ? { createdAt: order }
      : { trendingScore: order };

  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    db.startup.findMany({
      where,
      include: startupInclude,
      orderBy,
      skip,
      take: limit,
    }),
    db.startup.count({ where }),
  ]);

  return {
    data: data as unknown as StartupWithRelations[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getStartupBySlug(
  slug: string
): Promise<StartupWithCompetitors | null> {
  const startup = await db.startup.findUnique({
    where: { slug },
    include: {
      category: true,
      tags: { include: { tag: true } },
      signals: { orderBy: { occurredAt: "desc" }, take: 20 },
      pricingSnapshots: { orderBy: { recordedAt: "desc" }, take: 5 },
      _count: { select: { watchlistItems: true } },
      competitorsA: {
        include: {
          startupB: {
            include: {
              category: true,
              tags: { include: { tag: true } },
              _count: { select: { watchlistItems: true } },
            },
          },
        },
      },
      competitorsB: {
        include: {
          startupA: {
            include: {
              category: true,
              tags: { include: { tag: true } },
              _count: { select: { watchlistItems: true } },
            },
          },
        },
      },
    },
  });

  return startup as unknown as StartupWithCompetitors | null;
}

export async function getTrendingStartups(limit = 6): Promise<StartupWithRelations[]> {
  const startups = await db.startup.findMany({
    where: { status: "ACTIVE" },
    include: startupInclude,
    orderBy: { trendingScore: "desc" },
    take: limit,
  });
  return startups as unknown as StartupWithRelations[];
}

export async function getNewStartupsThisWeek(): Promise<number> {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  return db.startup.count({
    where: { createdAt: { gte: weekAgo }, status: "ACTIVE" },
  });
}

export async function recalculateTrendingScore(startupId: string): Promise<void> {
  const [signals, startup] = await Promise.all([
    db.signal.findMany({
      where: { startupId },
      select: { type: true, weight: true, occurredAt: true, title: true },
    }),
    db.startup.findUnique({
      where: { id: startupId },
      select: { launchDate: true, createdAt: true },
    }),
  ]);

  if (!startup) return;

  const score = computeTrendingScore({
    signals,
    launchDate: startup.launchDate,
    createdAt: startup.createdAt,
  });

  await db.startup.update({
    where: { id: startupId },
    data: { trendingScore: score },
  });
}

export async function getScoreBreakdown(startupId: string): Promise<ScoreBreakdown> {
  const [signals, startup] = await Promise.all([
    db.signal.findMany({
      where: { startupId },
      select: { type: true, weight: true, occurredAt: true, title: true },
    }),
    db.startup.findUnique({
      where: { id: startupId },
      select: { launchDate: true, createdAt: true },
    }),
  ]);

  if (!startup) return { total: 0, activity: 0, volume: 0, recency: 0, stars: 0 };

  return computeScoreBreakdown({
    signals,
    launchDate: startup.launchDate,
    createdAt: startup.createdAt,
  });
}
