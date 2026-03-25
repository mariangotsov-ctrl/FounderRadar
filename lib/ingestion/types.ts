export interface RawGitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  topics: string[];
  created_at: string;
  pushed_at: string;
  language: string | null;
}

export interface RawProductHuntPost {
  title: string;
  tagline: string;
  link: string;
  website: string | null;
  isoDate: string;
}

export interface IngestionResult {
  source: string;
  newStartups: number;
  newSignals: number;
  errors: string[];
  durationMs: number;
}
