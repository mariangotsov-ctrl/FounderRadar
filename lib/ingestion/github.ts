import type { RawGitHubRepo } from "./types";

// GitHub topics to search for. These map to the `topic:` qualifier in the
// GitHub search API. Using OR logic so repos need only one matching topic.
const TOPICS = ["llm", "generative-ai", "ai-agents", "large-language-model"];
const PER_PAGE = 30;

export async function fetchGitHubRepos(): Promise<RawGitHubRepo[]> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "FounderRadar/1.0",
  };

  // Optional token raises rate limit from 60 to 5 000 requests/hour
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const q = TOPICS.map((t) => `topic:${t}`).join(" OR ");
  const url =
    `https://api.github.com/search/repositories` +
    `?q=${encodeURIComponent(q)}&sort=updated&order=desc&per_page=${PER_PAGE}`;

  const res = await fetch(url, {
    headers,
    // Always fetch fresh data — this runs as a background job
    cache: "no-store",
  });

  if (res.status === 403) {
    const remaining = res.headers.get("x-ratelimit-remaining");
    throw new Error(
      `GitHub API rate limit hit (remaining: ${remaining ?? "unknown"}). ` +
        `Set GITHUB_TOKEN in .env to increase the limit.`
    );
  }

  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as { items: RawGitHubRepo[] };
  return data.items ?? [];
}
