import type { Metadata } from "next";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TriggerIngestionButton } from "@/components/admin/TriggerIngestionButton";
import { SignalBadge } from "@/components/signals/SignalBadge";
import { formatRelativeDate } from "@/lib/utils";
import { Github, ShoppingBag, CheckCircle, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Data Ingestion" };

const SOURCE_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  github: { label: "GitHub", icon: Github, color: "text-gray-800" },
  producthunt: { label: "Product Hunt", icon: ShoppingBag, color: "text-orange-600" },
};

export default async function IngestionPage() {
  const runs = await db.ingestionRun.findMany({
    orderBy: { startedAt: "desc" },
    take: 30,
  });

  const totalStartups = runs.reduce((s, r) => s + r.newStartups, 0);
  const totalSignals = runs.reduce((s, r) => s + r.newSignals, 0);
  const lastRun = runs[0];

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Data Ingestion"
        description="Pull new startups and signals from GitHub and Product Hunt"
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total runs", value: runs.length },
          { label: "Startups ingested", value: totalStartups },
          { label: "Signals created", value: totalSignals },
          {
            label: "Last run",
            value: lastRun ? formatRelativeDate(lastRun.startedAt) : "Never",
          },
        ].map(({ label, value }) => (
          <Card key={label}>
            <CardContent className="pt-4 pb-3">
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Manual trigger */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Manual Trigger</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-500">
              Runs both GitHub and Product Hunt ingestion immediately. Safe to run
              multiple times — duplicates are skipped automatically.
            </p>
            <TriggerIngestionButton />
          </CardContent>
        </Card>

        {/* Schedule info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Automatic Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-600">
            <p>
              When deployed on <span className="font-medium">Vercel</span>, ingestion runs
              automatically every 6 hours via the cron job defined in{" "}
              <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">vercel.json</code>.
            </p>
            <p>
              To run from an external scheduler (GitHub Actions, Windows Task
              Scheduler, etc.) send a POST request to{" "}
              <code className="text-xs bg-gray-100 px-1 py-0.5 rounded break-all">
                /api/ingest
              </code>{" "}
              with header{" "}
              <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
                Authorization: Bearer &lt;INGEST_SECRET&gt;
              </code>
              .
            </p>
            <div className="rounded border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-mono text-gray-700">
              {"# GitHub Actions / curl example"}<br />
              {"curl -X POST https://your-domain.com/api/ingest \\"}<br />
              {"  -H \"Authorization: Bearer $INGEST_SECRET\""}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Run history */}
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Run history (last 30)
          </p>
        </div>

        {runs.length === 0 ? (
          <p className="py-12 text-center text-sm text-gray-400">
            No runs yet. Click &quot;Run Ingestion Now&quot; above to start.
          </p>
        ) : (
          <div className="divide-y divide-gray-100">
            {runs.map((run) => {
              const meta = SOURCE_META[run.source] ?? {
                label: run.source,
                icon: Clock,
                color: "text-gray-500",
              };
              const Icon = meta.icon;
              const isError = run.status === "error";
              const durationMs = run.finishedAt
                ? run.finishedAt.getTime() - run.startedAt.getTime()
                : null;

              return (
                <div
                  key={run.id}
                  className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 gap-4"
                >
                  {/* Source */}
                  <div className="flex items-center gap-2 w-32 flex-shrink-0">
                    <Icon className={cn("h-4 w-4", meta.color)} />
                    <span className="text-sm font-medium text-gray-700">{meta.label}</span>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-1.5 w-24 flex-shrink-0">
                    {isError ? (
                      <XCircle className="h-4 w-4 text-red-500" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    <span
                      className={cn(
                        "text-xs font-medium",
                        isError ? "text-red-600" : "text-green-600"
                      )}
                    >
                      {isError ? "Error" : "OK"}
                    </span>
                  </div>

                  {/* Counts */}
                  <div className="flex gap-4 text-sm text-gray-500 flex-1">
                    <span>
                      <span className="font-semibold text-gray-800">{run.newStartups}</span>{" "}
                      startups
                    </span>
                    <span>
                      <span className="font-semibold text-gray-800">{run.newSignals}</span>{" "}
                      signals
                    </span>
                  </div>

                  {/* Time */}
                  <div className="flex flex-col items-end text-xs text-gray-400 flex-shrink-0">
                    <span>{formatRelativeDate(run.startedAt)}</span>
                    {durationMs !== null && (
                      <span>{(durationMs / 1000).toFixed(1)}s</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
