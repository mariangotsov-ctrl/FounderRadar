import { db } from "@/lib/db";
import { slugify, SIGNAL_WEIGHTS } from "@/lib/utils";
import { recalculateTrendingScore } from "@/lib/queries/startups";
import type { RawGitHubRepo, RawProductHuntPost } from "./types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns a slug that doesn't collide with any existing startup.
 * Tries "my-name", then "my-name-2", "my-name-3", etc.
 */
async function ensureUniqueSlug(name: string): Promise<string> {
  const base = slugify(name);
  let slug = base;
  let i = 2;
  while (await db.startup.findFirst({ where: { slug }, select: { id: true } })) {
    slug = `${base}-${i++}`;
  }
  return slug;
}

// ─── GitHub ───────────────────────────────────────────────────────────────────

/** Minimum stars a repo must have before we ingest it */
const MIN_STARS = 50;

export async function processGitHubRepo(
  repo: RawGitHubRepo
): Promise<{ newStartup: boolean; newSignal: boolean }> {
  if (repo.stargazers_count < MIN_STARS) {
    return { newStartup: false, newSignal: false };
  }

  // Use the GitHub repo URL as the canonical deduplication key
  const website = repo.html_url;
  let startup = await db.startup.findFirst({ where: { website }, select: { id: true } });

  const newStartup = !startup;
  if (!startup) {
    const slug = await ensureUniqueSlug(repo.name);
    const short =
      (repo.description ?? "").slice(0, 150) || `Open-source: ${repo.full_name}`;
    startup = await db.startup.create({
      data: {
        slug,
        name: repo.name,
        shortDescription: short,
        description: repo.description ?? `GitHub repository: ${repo.full_name}`,
        website,
        status: "ACTIVE",
        pricingModel: "OPEN_SOURCE",
        trendingScore: 0,
      },
      select: { id: true },
    });
  }

  // Don't flood a startup with repeated star signals — one per 7-day window
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentSignal = await db.signal.findFirst({
    where: {
      startupId: startup.id,
      type: "GITHUB_STARS_SPIKE",
      occurredAt: { gte: sevenDaysAgo },
    },
    select: { id: true },
  });
  if (recentSignal) return { newStartup, newSignal: false };

  await db.signal.create({
    data: {
      startupId: startup.id,
      type: "GITHUB_STARS_SPIKE",
      title: `${repo.stargazers_count.toLocaleString()} stars on GitHub`,
      description:
        `${repo.full_name} has accumulated ${repo.stargazers_count.toLocaleString()} stars ` +
        `and is tagged with AI / LLM topics.`,
      sourceUrl: repo.html_url,
      weight: SIGNAL_WEIGHTS.GITHUB_STARS_SPIKE,
      occurredAt: new Date(),
    },
  });

  await recalculateTrendingScore(startup.id);
  return { newStartup, newSignal: true };
}

// ─── Product Hunt ─────────────────────────────────────────────────────────────

export async function processProductHuntPost(
  post: RawProductHuntPost
): Promise<{ newStartup: boolean; newSignal: boolean }> {
  if (!post.title) return { newStartup: false, newSignal: false };

  // Prefer the product's own website; fall back to the PH post URL
  const website = post.website ?? post.link;
  let startup = await db.startup.findFirst({ where: { website }, select: { id: true } });

  const newStartup = !startup;
  if (!startup) {
    const slug = await ensureUniqueSlug(post.title);
    startup = await db.startup.create({
      data: {
        slug,
        name: post.title,
        shortDescription: post.tagline.slice(0, 150) || post.title,
        description: post.tagline || post.title,
        website,
        status: "ACTIVE",
        pricingModel: "UNKNOWN",
        launchDate: new Date(post.isoDate),
        trendingScore: 0,
      },
      select: { id: true },
    });
  }

  // Only one Product Hunt launch signal per startup — it's a one-time event
  const existing = await db.signal.findFirst({
    where: { startupId: startup.id, type: "PRODUCT_HUNT_LAUNCH" },
    select: { id: true },
  });
  if (existing) return { newStartup, newSignal: false };

  await db.signal.create({
    data: {
      startupId: startup.id,
      type: "PRODUCT_HUNT_LAUNCH",
      title: "Launched on Product Hunt",
      description: post.tagline || `${post.title} launched on Product Hunt.`,
      sourceUrl: post.link,
      weight: SIGNAL_WEIGHTS.PRODUCT_HUNT_LAUNCH,
      occurredAt: new Date(post.isoDate),
    },
  });

  await recalculateTrendingScore(startup.id);
  return { newStartup, newSignal: true };
}
