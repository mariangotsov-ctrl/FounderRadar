import { z } from "zod";
import { PricingModel, StartupStatus } from "@prisma/client";

export const startupSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  shortDescription: z.string().min(10, "Short description must be at least 10 characters").max(200),
  description: z.string().min(20, "Description must be at least 20 characters"),
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  logoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  launchDate: z.string().optional(),
  status: z.nativeEnum(StartupStatus),
  pricingModel: z.nativeEnum(PricingModel),
  categoryId: z.string().optional().or(z.literal("")),
  tagIds: z.array(z.string()).optional(),
});

export const signalSchema = z.object({
  startupId: z.string().min(1, "Startup is required"),
  type: z.enum([
    "PRODUCT_HUNT_LAUNCH",
    "GITHUB_STARS_SPIKE",
    "TRAFFIC_SPIKE",
    "FUNDING_DETECTED",
    "PRICING_CHANGE",
    "HIRING_SIGNAL",
    "FEATURE_UPDATE",
    "GROWTH",
  ]),
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().optional(),
  sourceUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  weight: z.number().min(0.1).max(10).default(1.0),
  occurredAt: z.string(),
});

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(80),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color"),
});

export const tagSchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
});

export const competitorSchema = z.object({
  startupAId: z.string().min(1),
  startupBId: z.string().min(1),
  note: z.string().optional(),
});

export type StartupInput = z.infer<typeof startupSchema>;
export type SignalInput = z.infer<typeof signalSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type TagInput = z.infer<typeof tagSchema>;
export type CompetitorInput = z.infer<typeof competitorSchema>;
