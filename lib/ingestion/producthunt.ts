import Parser from "rss-parser";
import type { RawProductHuntPost } from "./types";

const FEED_URL = "https://www.producthunt.com/feed";
// Only ingest posts from the last N days to avoid backfilling old history
const MAX_AGE_DAYS = 7;

export async function fetchProductHuntPosts(): Promise<RawProductHuntPost[]> {
  const parser = new Parser({ timeout: 15_000 });
  const feed = await parser.parseURL(FEED_URL);

  const cutoff = Date.now() - MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

  return (feed.items ?? [])
    .filter((item) => {
      const date = item.isoDate ?? item.pubDate;
      if (!date) return true; // include if no date
      return new Date(date).getTime() >= cutoff;
    })
    .map((item) => ({
      title: (item.title ?? "").trim(),
      tagline: extractTagline(item.contentSnippet ?? item.content ?? ""),
      link: item.link ?? "",
      website: extractExternalUrl(item.content ?? ""),
      isoDate: item.isoDate ?? item.pubDate ?? new Date().toISOString(),
    }))
    .filter((p) => p.title.length > 0 && p.link.length > 0);
}

// Pull the first non-Product Hunt URL from the item's HTML content.
// PH embeds the product's external website as a link in the description.
function extractExternalUrl(html: string): string | null {
  const matches = html.matchAll(/href="(https?:\/\/[^"]+)"/g);
  for (const [, url] of matches) {
    if (!url.includes("producthunt.com")) return url;
  }
  return null;
}

// Strip HTML tags and trim the tagline to a reasonable length
function extractTagline(raw: string): string {
  return raw
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 300);
}
