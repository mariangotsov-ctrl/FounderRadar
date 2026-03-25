"use client";

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import Link from "next/link";
import Image from "next/image";
import type { StartupWithRelations } from "@/types";
import { Badge } from "@/components/ui/badge";
import { SignalBadge } from "@/components/signals/SignalBadge";
import {
  PRICING_MODEL_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
  formatScore,
  formatDate,
  scoreColor,
  scoreBarColor,
} from "@/lib/utils";
import { TrendingUp, ExternalLink } from "lucide-react";

const columnHelper = createColumnHelper<StartupWithRelations>();

const columns = [
  columnHelper.accessor("name", {
    header: "Startup",
    cell: (info) => {
      const row = info.row.original;
      return (
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-8 w-8 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {row.logoUrl ? (
              <Image src={row.logoUrl} alt={row.name} width={32} height={32} className="object-contain" />
            ) : (
              <span className="text-xs font-bold text-gray-500">{row.name[0]}</span>
            )}
          </div>
          <div className="min-w-0">
            <Link
              href={`/startups/${row.slug}`}
              className="font-medium text-gray-900 hover:text-indigo-600 truncate block"
            >
              {row.name}
            </Link>
            <p className="text-xs text-gray-400 truncate">{row.shortDescription}</p>
          </div>
        </div>
      );
    },
  }),
  columnHelper.accessor("category", {
    header: "Category",
    cell: (info) => {
      const cat = info.getValue();
      return cat ? (
        <Link href={`/categories/${cat.slug}`} className="text-sm text-gray-600 hover:text-indigo-600">
          {cat.name}
        </Link>
      ) : (
        <span className="text-sm text-gray-400">—</span>
      );
    },
  }),
  columnHelper.accessor("pricingModel", {
    header: "Pricing",
    cell: (info) => (
      <Badge variant="outline" className="text-xs">
        {PRICING_MODEL_LABELS[info.getValue()]}
      </Badge>
    ),
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => {
      const v = info.getValue();
      return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[v]}`}>
          {STATUS_LABELS[v]}
        </span>
      );
    },
  }),
  columnHelper.accessor("trendingScore", {
    header: "Score",
    cell: (info) => {
      const score = info.getValue();
      return (
        <div className="flex items-center gap-2 min-w-[80px]">
          <div className="w-14 h-1.5 bg-gray-100 rounded-full overflow-hidden flex-shrink-0">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min(score, 100)}%`,
                backgroundColor: scoreBarColor(score),
              }}
            />
          </div>
          <span className={`text-xs font-semibold tabular-nums px-1.5 py-0.5 rounded ${scoreColor(score)}`}>
            {formatScore(score)}
          </span>
        </div>
      );
    },
  }),
  columnHelper.accessor("signals", {
    header: "Latest Signal",
    cell: (info) => {
      const signals = info.getValue();
      const latest = signals?.[0];
      return latest ? <SignalBadge type={latest.type} /> : <span className="text-xs text-gray-400">—</span>;
    },
  }),
  columnHelper.accessor("website", {
    header: "",
    cell: (info) => {
      const url = info.getValue();
      return url ? (
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-indigo-600">
          <ExternalLink className="h-4 w-4" />
        </a>
      ) : null;
    },
  }),
];

interface StartupTableProps {
  startups: StartupWithRelations[];
}

export function StartupTable({ startups }: StartupTableProps) {
  const table = useReactTable({
    data: startups,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (startups.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 text-sm">
        No startups match your filters.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="w-full text-sm">
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id} className="border-b border-gray-100 bg-gray-50">
              {hg.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-3">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
