import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { SignalType, PricingModel, StartupStatus } from "@prisma/client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatDate(date: Date | string | null): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function formatRelativeDate(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

export function formatScore(score: number): string {
  return score.toFixed(1);
}

export const SIGNAL_TYPE_LABELS: Record<SignalType, string> = {
  PRODUCT_HUNT_LAUNCH: "Product Hunt Launch",
  GITHUB_STARS_SPIKE: "GitHub Stars Spike",
  TRAFFIC_SPIKE: "Traffic Spike",
  FUNDING_DETECTED: "Funding Detected",
  PRICING_CHANGE: "Pricing Change",
  HIRING_SIGNAL: "Hiring Signal",
  FEATURE_UPDATE: "Feature Update",
  GROWTH: "Growth Signal",
};

export const SIGNAL_TYPE_COLORS: Record<SignalType, string> = {
  PRODUCT_HUNT_LAUNCH: "bg-orange-100 text-orange-800",
  GITHUB_STARS_SPIKE: "bg-yellow-100 text-yellow-800",
  TRAFFIC_SPIKE: "bg-blue-100 text-blue-800",
  FUNDING_DETECTED: "bg-green-100 text-green-800",
  PRICING_CHANGE: "bg-purple-100 text-purple-800",
  HIRING_SIGNAL: "bg-cyan-100 text-cyan-800",
  FEATURE_UPDATE: "bg-indigo-100 text-indigo-800",
  GROWTH: "bg-emerald-100 text-emerald-800",
};

export const PRICING_MODEL_LABELS: Record<PricingModel, string> = {
  FREE: "Free",
  FREEMIUM: "Freemium",
  PAID: "Paid",
  OPEN_SOURCE: "Open Source",
  ENTERPRISE: "Enterprise",
  UNKNOWN: "Unknown",
};

export const STATUS_LABELS: Record<StartupStatus, string> = {
  ACTIVE: "Active",
  ACQUIRED: "Acquired",
  DEAD: "Shut Down",
  STEALTH: "Stealth",
};

export const STATUS_COLORS: Record<StartupStatus, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  ACQUIRED: "bg-blue-100 text-blue-800",
  DEAD: "bg-red-100 text-red-800",
  STEALTH: "bg-gray-100 text-gray-800",
};

export const SIGNAL_WEIGHTS: Record<SignalType, number> = {
  FUNDING_DETECTED: 10.0,
  PRODUCT_HUNT_LAUNCH: 7.0,
  GITHUB_STARS_SPIKE: 6.0,
  TRAFFIC_SPIKE: 8.0,
  FEATURE_UPDATE: 4.0,
  PRICING_CHANGE: 4.0,
  HIRING_SIGNAL: 3.0,
  GROWTH: 8.0,
};
