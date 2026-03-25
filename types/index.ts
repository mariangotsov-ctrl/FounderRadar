import type {
  User,
  Startup,
  Category,
  Tag,
  Signal,
  WatchlistItem,
  CompetitorRelation,
  PricingSnapshot,
  StartupStatus,
  PricingModel,
  SignalType,
  Role,
} from "@prisma/client";

export type {
  User,
  Startup,
  Category,
  Tag,
  Signal,
  WatchlistItem,
  CompetitorRelation,
  PricingSnapshot,
  StartupStatus,
  PricingModel,
  SignalType,
  Role,
};

export type StartupWithRelations = Startup & {
  category: Category | null;
  tags: Array<{ tag: Tag }>;
  signals: Signal[];
  _count: { watchlistItems: number };
};

export type StartupWithCompetitors = StartupWithRelations & {
  competitorsA: Array<{ startupB: StartupWithRelations }>;
  competitorsB: Array<{ startupA: StartupWithRelations }>;
};

export type SignalWithStartup = Signal & {
  startup: Pick<Startup, "id" | "name" | "slug" | "logoUrl">;
};

export type WatchlistItemWithStartup = WatchlistItem & {
  startup: StartupWithRelations;
};

export type DashboardStats = {
  totalStartups: number;
  newThisWeek: number;
  totalSignals: number;
  totalCategories: number;
};

export type PaginatedResult<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type StartupFilters = {
  q?: string;
  category?: string;
  pricingModel?: PricingModel | "";
  status?: StartupStatus | "";
  sort?: "trendingScore" | "createdAt" | "name";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
};

// Augment next-auth session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: string;
    };
  }
}
