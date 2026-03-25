"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Category } from "@prisma/client";
import { PricingModel } from "@prisma/client";
import { PRICING_MODEL_LABELS } from "@/lib/utils";

interface StartupFiltersProps {
  categories: Category[];
}

export function StartupFilters({ categories }: StartupFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const q = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? "";
  const pricingModel = searchParams.get("pricingModel") ?? "";
  const sort = searchParams.get("sort") ?? "trendingScore";

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [router, pathname, searchParams]
  );

  const clearAll = () => {
    startTransition(() => {
      router.push(pathname);
    });
  };

  const hasFilters = q || category || pricingModel || sort !== "trendingScore";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search startups..."
          className="pl-9"
          defaultValue={q}
          onChange={(e) => {
            const val = e.target.value;
            const timeout = setTimeout(() => updateParam("q", val), 350);
            return () => clearTimeout(timeout);
          }}
        />
      </div>

      {/* Category */}
      <Select value={category || "all"} onValueChange={(v) => updateParam("category", v === "all" ? "" : v)}>
        <SelectTrigger className="w-full sm:w-44">
          <SelectValue placeholder="All categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All categories</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Pricing */}
      <Select value={pricingModel || "all"} onValueChange={(v) => updateParam("pricingModel", v === "all" ? "" : v)}>
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder="All pricing" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All pricing</SelectItem>
          {Object.entries(PRICING_MODEL_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>{label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Sort */}
      <Select value={sort} onValueChange={(v) => updateParam("sort", v)}>
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="trendingScore">Trending</SelectItem>
          <SelectItem value="createdAt">Newest</SelectItem>
          <SelectItem value="name">Name A–Z</SelectItem>
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearAll} className="flex-shrink-0">
          <X className="h-4 w-4 mr-1" /> Clear
        </Button>
      )}

      {isPending && (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent flex-shrink-0" />
      )}
    </div>
  );
}
