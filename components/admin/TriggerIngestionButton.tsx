"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle, AlertCircle } from "lucide-react";

interface RunResult {
  source: string;
  newStartups: number;
  newSignals: number;
  errors: string[];
  durationMs: number;
}

type State =
  | { status: "idle" }
  | { status: "running" }
  | { status: "done"; results: RunResult[] }
  | { status: "error"; message: string };

export function TriggerIngestionButton() {
  const [state, setState] = useState<State>({ status: "idle" });

  async function handleRun() {
    setState({ status: "running" });
    try {
      const res = await fetch("/api/ingest", { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        setState({ status: "error", message: json.error ?? "Request failed" });
        return;
      }
      setState({ status: "done", results: json.results });
    } catch (err) {
      setState({
        status: "error",
        message: err instanceof Error ? err.message : "Network error",
      });
    }
  }

  return (
    <div className="space-y-4">
      <Button
        onClick={handleRun}
        disabled={state.status === "running"}
        className="flex items-center gap-2"
      >
        <RefreshCw
          className={`h-4 w-4 ${state.status === "running" ? "animate-spin" : ""}`}
        />
        {state.status === "running" ? "Running…" : "Run Ingestion Now"}
      </Button>

      {state.status === "done" && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 space-y-2">
          <div className="flex items-center gap-2 text-green-700 font-medium text-sm">
            <CheckCircle className="h-4 w-4" />
            Ingestion complete
          </div>
          {state.results.map((r) => (
            <div key={r.source} className="text-sm text-green-700 pl-6">
              <span className="font-medium capitalize">{r.source}</span>
              {" — "}
              {r.newStartups} new startup{r.newStartups !== 1 ? "s" : ""},
              {" "}{r.newSignals} new signal{r.newSignals !== 1 ? "s" : ""}
              <span className="text-green-500 ml-2">({r.durationMs}ms)</span>
              {r.errors.length > 0 && (
                <p className="text-red-600 mt-1">{r.errors.join("; ")}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {state.status === "error" && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex items-start gap-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          {state.message}
        </div>
      )}
    </div>
  );
}
