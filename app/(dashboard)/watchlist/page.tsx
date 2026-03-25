import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getUserWatchlist } from "@/lib/queries/watchlist";
import { StartupCard } from "@/components/startups/StartupCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { StartupWithRelations } from "@/types";

export const metadata: Metadata = { title: "Watchlist" };

export default async function WatchlistPage() {
  const session = await auth();
  const items = session ? await getUserWatchlist(session.user.id) : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Watchlist"
        description={
          items.length
            ? `You're tracking ${items.length} startup${items.length !== 1 ? "s" : ""}`
            : "Save startups to track them here"
        }
      />

      {items.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="Your watchlist is empty"
          description="Browse startups and click Watch to add them here."
          action={
            <Button asChild>
              <Link href="/startups">Browse startups</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <StartupCard
              key={item.id}
              startup={item.startup as unknown as StartupWithRelations}
            />
          ))}
        </div>
      )}
    </div>
  );
}
