import Link from "next/link";
import type { SignalWithStartup } from "@/types";
import { SignalBadge } from "./SignalBadge";
import { formatRelativeDate } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

interface SignalFeedProps {
  signals: SignalWithStartup[];
}

export function SignalFeed({ signals }: SignalFeedProps) {
  if (signals.length === 0) {
    return (
      <p className="text-sm text-gray-500 py-4 text-center">No signals yet.</p>
    );
  }

  return (
    <div className="space-y-3">
      {signals.map((signal) => (
        <div
          key={signal.id}
          className="flex items-start gap-3 rounded-lg border border-gray-100 bg-white p-4 hover:border-gray-200 transition-colors"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <SignalBadge type={signal.type} />
              <Link
                href={`/startups/${signal.startup.slug}`}
                className="text-sm font-medium text-gray-900 hover:text-indigo-600 truncate"
              >
                {signal.startup.name}
              </Link>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">{signal.title}</p>
            {signal.description && (
              <p className="text-xs text-gray-400 mt-1 line-clamp-1">{signal.description}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <span className="text-xs text-gray-400 whitespace-nowrap">
              {formatRelativeDate(signal.occurredAt)}
            </span>
            {signal.sourceUrl && (
              <a
                href={signal.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-indigo-600"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
