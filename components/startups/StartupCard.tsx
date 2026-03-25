import Link from "next/link";
import Image from "next/image";
import type { StartupWithRelations } from "@/types";
import { Badge } from "@/components/ui/badge";
import { PRICING_MODEL_LABELS, STATUS_COLORS, formatScore } from "@/lib/utils";
import { TrendingUp, Globe } from "lucide-react";

interface StartupCardProps {
  startup: StartupWithRelations;
}

export function StartupCard({ startup }: StartupCardProps) {
  return (
    <Link href={`/startups/${startup.slug}`}>
      <div className="group rounded-xl border border-gray-200 bg-white p-5 hover:border-indigo-300 hover:shadow-md transition-all duration-200">
        <div className="flex items-start gap-3 mb-3">
          <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {startup.logoUrl ? (
              <Image
                src={startup.logoUrl}
                alt={startup.name}
                width={40}
                height={40}
                className="object-contain"
              />
            ) : (
              <span className="text-sm font-bold text-gray-500">
                {startup.name[0]}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 truncate">
              {startup.name}
            </h3>
            {startup.category && (
              <span className="text-xs text-gray-500">{startup.category.name}</span>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-full flex-shrink-0">
            <TrendingUp className="h-3 w-3" />
            {formatScore(startup.trendingScore)}
          </div>
        </div>

        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {startup.shortDescription}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[startup.status]}`}
            >
              {startup.status}
            </span>
            <Badge variant="outline" className="text-xs">
              {PRICING_MODEL_LABELS[startup.pricingModel]}
            </Badge>
          </div>
          {startup.website && (
            <Globe className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
          )}
        </div>

        {startup.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {startup.tags.slice(0, 3).map(({ tag }) => (
              <span
                key={tag.id}
                className="text-xs text-indigo-600 bg-indigo-50 rounded-full px-2 py-0.5"
              >
                {tag.name}
              </span>
            ))}
            {startup.tags.length > 3 && (
              <span className="text-xs text-gray-400">+{startup.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
