import { db } from "@/lib/db";
import type { SignalWithStartup } from "@/types";
import type { Prisma } from "@prisma/client";

export async function getRecentSignals(limit = 10): Promise<SignalWithStartup[]> {
  const signals = await db.signal.findMany({
    include: {
      startup: {
        select: { id: true, name: true, slug: true, logoUrl: true },
      },
    },
    orderBy: { occurredAt: "desc" },
    take: limit,
  });
  return signals as SignalWithStartup[];
}

export async function getSignalsForStartup(
  startupId: string,
  limit = 20
): Promise<SignalWithStartup[]> {
  const signals = await db.signal.findMany({
    where: { startupId },
    include: {
      startup: {
        select: { id: true, name: true, slug: true, logoUrl: true },
      },
    },
    orderBy: { occurredAt: "desc" },
    take: limit,
  });
  return signals as SignalWithStartup[];
}

export async function getSignalStats() {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [total, thisWeek, byType] = await Promise.all([
    db.signal.count(),
    db.signal.count({ where: { occurredAt: { gte: weekAgo } } }),
    db.signal.groupBy({
      by: ["type"],
      _count: { type: true },
      orderBy: { _count: { type: "desc" } },
    }),
  ]);

  return { total, thisWeek, byType };
}

export async function getAllSignalsPaginated(page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const where: Prisma.SignalWhereInput = {};

  const [data, total] = await Promise.all([
    db.signal.findMany({
      where,
      include: {
        startup: {
          select: { id: true, name: true, slug: true, logoUrl: true },
        },
      },
      orderBy: { occurredAt: "desc" },
      skip,
      take: limit,
    }),
    db.signal.count({ where }),
  ]);

  return {
    data: data as SignalWithStartup[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
