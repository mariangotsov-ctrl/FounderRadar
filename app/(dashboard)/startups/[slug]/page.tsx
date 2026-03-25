import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getStartupBySlug } from "@/lib/queries/startups";
import { isInWatchlist } from "@/lib/queries/watchlist";
import { WatchlistButton } from "@/components/watchlist/WatchlistButton";
import { SignalBadge } from "@/components/signals/SignalBadge";
import { TrendingScoreChart } from "@/components/charts/TrendingScoreChart";
import { StartupCard } from "@/components/startups/StartupCard";
import {
  PRICING_MODEL_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
  formatDate,
  formatRelativeDate,
  formatScore,
} from "@/lib/utils";
import {
  Globe,
  ExternalLink,
  TrendingUp,
  Calendar,
  ArrowLeft,
} from "lucide-react";
import type { StartupWithRelations } from "@/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const startup = await getStartupBySlug(slug);
  if (!startup) return { title: "Not Found" };
  return {
    title: startup.name,
    description: startup.shortDescription,
  };
}

export default async function StartupDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [startup, session] = await Promise.all([
    getStartupBySlug(slug),
    auth(),
  ]);

  if (!startup) notFound();

  const watched = session
    ? await isInWatchlist(session.user.id, startup.id)
    : false;

  const competitors: StartupWithRelations[] = [
    ...startup.competitorsA.map((r) => r.startupB),
    ...startup.competitorsB.map((r) => r.startupA),
  ] as StartupWithRelations[];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Back */}
      <Link
        href="/startups"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" /> Back to startups
      </Link>

      {/* Header */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-5">
          <div className="h-16 w-16 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
            {startup.logoUrl ? (
              <Image
                src={startup.logoUrl}
                alt={startup.name}
                width={64}
                height={64}
                className="object-contain"
              />
            ) : (
              <span className="text-2xl font-bold text-gray-400">
                {startup.name[0]}
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{startup.name}</h1>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[startup.status]}`}
              >
                {STATUS_LABELS[startup.status]}
              </span>
            </div>
            <p className="text-gray-600 mb-4">{startup.shortDescription}</p>

            {/* Meta row */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
              {startup.category && (
                <Link href={`/categories/${startup.category.slug}`} className="flex items-center gap-1 hover:text-indigo-600">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: startup.category.color }} />
                  {startup.category.name}
                </Link>
              )}
              <span className="flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5 text-amber-500" />
                Score: <strong className="text-gray-700">{formatScore(startup.trendingScore)}</strong>
              </span>
              <span>{PRICING_MODEL_LABELS[startup.pricingModel]}</span>
              {startup.launchDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(startup.launchDate)}
                </span>
              )}
            </div>

            {/* Tags */}
            {startup.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {startup.tags.map(({ tag }) => (
                  <span
                    key={tag.id}
                    className="text-xs text-indigo-600 bg-indigo-50 rounded-full px-2.5 py-0.5"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}

            {/* Links + Watchlist */}
            <div className="flex flex-wrap items-center gap-3">
              {startup.website && (
                <a href={startup.website} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-indigo-600 border border-gray-200 rounded-md px-3 py-1.5">
                  <Globe className="h-3.5 w-3.5" /> Website
                </a>
              )}
              {startup._count.watchlistItems > 0 && (
                <span className="text-sm text-gray-500">
                  {startup._count.watchlistItems} watching
                </span>
              )}
              <WatchlistButton
                startupId={startup.id}
                initialWatched={watched}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Description + Signal Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 rounded-xl border border-gray-200 bg-white p-6 space-y-3">
          <h2 className="font-semibold text-gray-900">About</h2>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
            {startup.description}
          </p>
        </div>

        <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-6 space-y-3">
          <h2 className="font-semibold text-gray-900">Trending Score Timeline</h2>
          <TrendingScoreChart signals={startup.signals} />
        </div>
      </div>

      {/* Signals */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">
          Signal History ({startup.signals.length})
        </h2>
        {startup.signals.length === 0 ? (
          <p className="text-sm text-gray-400">No signals recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {startup.signals.map((signal) => (
              <div
                key={signal.id}
                className="flex items-start gap-3 border-l-2 border-indigo-100 pl-4 py-1"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <SignalBadge type={signal.type} />
                    <span className="text-xs text-gray-400">
                      {formatRelativeDate(signal.occurredAt)}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-800">{signal.title}</p>
                  {signal.description && (
                    <p className="text-xs text-gray-500 mt-0.5">{signal.description}</p>
                  )}
                </div>
                {signal.sourceUrl && (
                  <a
                    href={signal.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-indigo-600 flex-shrink-0 mt-1"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Competitors */}
      {competitors.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-semibold text-gray-900">Competitors</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {competitors.map((c) => (
              <StartupCard key={c.id} startup={c} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
