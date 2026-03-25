import { db } from "@/lib/db";
import type { WatchlistItemWithStartup } from "@/types";

export async function getUserWatchlist(userId: string): Promise<WatchlistItemWithStartup[]> {
  const items = await db.watchlistItem.findMany({
    where: { userId },
    include: {
      startup: {
        include: {
          category: true,
          tags: { include: { tag: true } },
          _count: { select: { watchlistItems: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return items as unknown as WatchlistItemWithStartup[];
}

export async function isInWatchlist(
  userId: string,
  startupId: string
): Promise<boolean> {
  const item = await db.watchlistItem.findUnique({
    where: { userId_startupId: { userId, startupId } },
    select: { id: true },
  });
  return !!item;
}

export async function toggleWatchlist(
  userId: string,
  startupId: string
): Promise<{ added: boolean }> {
  const existing = await db.watchlistItem.findUnique({
    where: { userId_startupId: { userId, startupId } },
    select: { id: true },
  });

  if (existing) {
    await db.watchlistItem.delete({
      where: { userId_startupId: { userId, startupId } },
    });
    return { added: false };
  }

  await db.watchlistItem.create({ data: { userId, startupId } });
  return { added: true };
}
