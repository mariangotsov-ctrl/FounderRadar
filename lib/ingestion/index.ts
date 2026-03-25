import { db } from "@/lib/db";
import { fetchGitHubRepos } from "./github";
import { fetchProductHuntPosts } from "./producthunt";
import { processGitHubRepo, processProductHuntPost } from "./processor";
import type { IngestionResult } from "./types";

/**
 * Runs all ingestion sources and persists each run to IngestionRun.
 * Sources run sequentially so DB writes don't race each other.
 */
export async function runIngestion(): Promise<IngestionResult[]> {
  const githubResult = await runSource("github", async () => {
    const repos = await fetchGitHubRepos();
    let newStartups = 0;
    let newSignals = 0;
    for (const repo of repos) {
      const r = await processGitHubRepo(repo);
      if (r.newStartup) newStartups++;
      if (r.newSignal) newSignals++;
    }
    return { newStartups, newSignals };
  });

  const phResult = await runSource("producthunt", async () => {
    const posts = await fetchProductHuntPosts();
    let newStartups = 0;
    let newSignals = 0;
    for (const post of posts) {
      const r = await processProductHuntPost(post);
      if (r.newStartup) newStartups++;
      if (r.newSignal) newSignals++;
    }
    return { newStartups, newSignals };
  });

  return [githubResult, phResult];
}

// ─── Internal helper ──────────────────────────────────────────────────────────

async function runSource(
  source: string,
  fn: () => Promise<{ newStartups: number; newSignals: number }>
): Promise<IngestionResult> {
  const startedAt = new Date();
  const errors: string[] = [];
  let newStartups = 0;
  let newSignals = 0;
  let status = "success";

  try {
    const r = await fn();
    newStartups = r.newStartups;
    newSignals = r.newSignals;
  } catch (err) {
    status = "error";
    errors.push(err instanceof Error ? err.message : String(err));
  }

  const finishedAt = new Date();
  const durationMs = finishedAt.getTime() - startedAt.getTime();

  await db.ingestionRun.create({
    data: { source, status, newStartups, newSignals, errors, startedAt, finishedAt },
  });

  return { source, newStartups, newSignals, errors, durationMs };
}
