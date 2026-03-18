import { useCallback, useEffect, useMemo, useState } from "react";

import { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/ui/data-table";
import { renderProfit, formatDate } from "@/utils/functions";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Settings2 } from "lucide-react";

import { Portfolio as PortfolioType } from "@/types/investments";
import { RealisedProfitEntry } from "@/utils/get-portfolio";

type FundType = "equity" | "debt";
type FundTypeMap = Record<string, FundType>;

const FUND_TYPES_STORAGE_KEY = "tax-analysis-fund-types";

const loadFundTypes = (): FundTypeMap => {
  try {
    const stored = localStorage.getItem(FUND_TYPES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const saveFundTypes = (map: FundTypeMap) => {
  localStorage.setItem(FUND_TYPES_STORAGE_KEY, JSON.stringify(map));
};

const getDiffDays = (entry: RealisedProfitEntry) => {
  const diff =
    new Date(entry.date).getTime() - new Date(entry.purchaseDate).getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
};

const isLongTerm = (entry: RealisedProfitEntry, fundTypes: FundTypeMap) => {
  const diffDays = getDiffDays(entry);
  const type = fundTypes[entry.mfName] || "equity";
  return type === "equity" ? diffDays >= 365 : diffDays >= 365 * 3;
};

export default function TaxAnalysis({
  realisedProfitByDate,
}: {
  portfolio: PortfolioType;
  realisedProfitByDate: RealisedProfitEntry[];
}) {
  const currentFY = useMemo(() => {
    const now = new Date();
    const y = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
    return `${y}-${String(y + 1).slice(2)}`;
  }, []);
  const [selectedFY, setSelectedFY] = useState(currentFY);
  const [fundTypes, setFundTypes] = useState<FundTypeMap>(loadFundTypes);

  // Persist fund types on change
  useEffect(() => {
    saveFundTypes(fundTypes);
  }, [fundTypes]);

  const setFundType = useCallback((mfName: string, type: FundType) => {
    setFundTypes((prev) => ({ ...prev, [mfName]: type }));
  }, []);

  // Columns (depend on fundTypes for STCG/LTCG logic)
  const realisedProfitColumns: ColumnDef<RealisedProfitEntry>[] = useMemo(
    () => [
      {
        accessorKey: "date",
        header: "Redemption Date",
        id: "Redemption Date",
        cell: ({ row }) => formatDate(row.original.date),
        enableHiding: false,
      },
      {
        accessorKey: "purchaseDate",
        header: "Purchase Date",
        id: "Purchase Date",
        cell: ({ row }) => formatDate(row.original.purchaseDate),
      },
      {
        accessorKey: "mfName",
        header: "Fund Name",
        id: "Fund Name",
        enableHiding: false,
      },
      {
        accessorKey: "fundType",
        header: () => <div className="text-right">Fund Type</div>,
        id: "Fund Type",
        cell: ({ row }) => {
          const type = fundTypes[row.original.mfName] || "equity";
          return (
            <div
              className={`text-right text-xs font-medium uppercase ${type === "equity" ? "text-purple-500" : "text-cyan-500"}`}
            >
              {type}
            </div>
          );
        },
      },
      {
        accessorKey: "holdingPeriod",
        header: () => <div className="text-right">Holding Period</div>,
        id: "Holding Period",
        cell: ({ row }) => {
          const diffDays = getDiffDays(row.original);
          const years = Math.floor(diffDays / 365);
          const months = Math.floor((diffDays % 365) / 30);
          const days = diffDays % 30;
          const parts = [];
          if (years > 0) parts.push(`${years}y`);
          if (months > 0) parts.push(`${months}m`);
          parts.push(`${days}d`);
          return (
            <div className="text-right text-muted-foreground">
              {parts.join(" ")}
            </div>
          );
        },
      },
      {
        accessorKey: "type",
        header: () => <div className="text-right">Type</div>,
        id: "Type",
        cell: ({ row }) => {
          const lt = isLongTerm(row.original, fundTypes);
          return (
            <div
              className={`text-right font-medium ${lt ? "text-blue-500" : "text-orange-500"}`}
            >
              {lt ? "LTCG" : "STCG"}
            </div>
          );
        },
      },
      {
        accessorKey: "profit",
        header: () => <div className="text-right">Profit</div>,
        id: "Profit",
        cell: ({ row }) => renderProfit(row.original.profit),
        enableHiding: false,
      },
    ],
    [fundTypes],
  );

  // Unique fund names for dropdown
  const uniqueFundNames = useMemo(() => {
    const names = new Set(realisedProfitByDate.map((e) => e.mfName));
    return Array.from(names).sort();
  }, [realisedProfitByDate]);

  // Helper: get Indian FY start year for a date (FY runs Apr 1 – Mar 31)
  const getFYStartYear = (date: Date) => {
    return date.getMonth() >= 3 ? date.getFullYear() : date.getFullYear() - 1;
  };

  // Derive available financial years from the data (recent first)
  const financialYears = useMemo(() => {
    if (realisedProfitByDate.length === 0) return [];
    const allDates = realisedProfitByDate.map((e) => new Date(e.date));
    const minFY = getFYStartYear(allDates.reduce((a, b) => (a < b ? a : b)));
    const maxFY = getFYStartYear(new Date());
    const fys: string[] = [];
    for (let y = maxFY; y >= minFY; y--) {
      fys.push(`${y}-${String(y + 1).slice(2)}`);
    }
    return fys;
  }, [realisedProfitByDate]);

  // Filtered data
  const filteredData = useMemo(() => {
    return realisedProfitByDate.filter((entry) => {
      const fyStartYear = parseInt(selectedFY.split("-")[0], 10);
      const fyStart = new Date(fyStartYear, 3, 1);
      const fyEnd = new Date(fyStartYear + 1, 2, 31, 23, 59, 59, 999);
      const entryDate = new Date(entry.date);
      if (entryDate < fyStart || entryDate > fyEnd) return false;
      return true;
    });
  }, [realisedProfitByDate, selectedFY]);

  // Summary stats
  const totalProfit = useMemo(
    () => filteredData.reduce((sum, e) => sum + e.profit, 0),
    [filteredData],
  );

  const summaryBreakdown = useMemo(() => {
    let equitySTCG = 0;
    let equityLTCG = 0;
    let debtSTCG = 0;
    let debtLTCG = 0;

    for (const e of filteredData) {
      const type = fundTypes[e.mfName] || "equity";
      const lt = isLongTerm(e, fundTypes);
      if (type === "equity") {
        if (lt) equityLTCG += e.profit;
        else equitySTCG += e.profit;
      } else {
        if (lt) debtLTCG += e.profit;
        else debtSTCG += e.profit;
      }
    }

    return { equitySTCG, equityLTCG, debtSTCG, debtLTCG };
  }, [filteredData, fundTypes]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Total Realised P&L</p>
          <div className="mt-1 text-xl font-semibold">
            {renderProfit(totalProfit, "currency", "left")}
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">
            <span className="text-purple-500">Equity</span> STCG
          </p>
          <div className="mt-1 text-xl font-semibold">
            {renderProfit(summaryBreakdown.equitySTCG, "currency", "left")}
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">
            <span className="text-purple-500">Equity</span> LTCG
          </p>
          <div className="mt-1 text-xl font-semibold">
            {renderProfit(summaryBreakdown.equityLTCG, "currency", "left")}
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">
            <span className="text-cyan-500">Debt</span> STCG
          </p>
          <div className="mt-1 text-xl font-semibold">
            {renderProfit(summaryBreakdown.debtSTCG, "currency", "left")}
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">
            <span className="text-cyan-500">Debt</span> LTCG
          </p>
          <div className="mt-1 text-xl font-semibold">
            {renderProfit(summaryBreakdown.debtLTCG, "currency", "left")}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="fy-select">Financial Year</Label>
          <Select value={selectedFY} onValueChange={setSelectedFY}>
            <SelectTrigger id="fy-select" className="w-[180px]">
              <SelectValue placeholder="All Years" />
            </SelectTrigger>
            <SelectContent>
              {financialYears.map((fy) => (
                <SelectItem key={fy} value={fy}>
                  FY {fy}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Fund Type Settings Sheet */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Settings2 className="h-4 w-4" />
              Fund Types
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Fund Type Settings</SheetTitle>
              <SheetDescription>
                Classify each fund as Equity or Debt. This affects STCG/LTCG
                thresholds — Equity: 1 year, Debt: 3 years.
              </SheetDescription>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-10rem)] mt-4 pr-4">
              <div className="flex flex-col gap-3">
                {uniqueFundNames.map((name) => (
                  <div
                    key={name}
                    className="flex items-center justify-between gap-4 rounded-lg border p-3"
                  >
                    <span className="text-sm font-medium leading-tight flex-1">
                      {name}
                    </span>
                    <Select
                      value={fundTypes[name] || "equity"}
                      onValueChange={(val) =>
                        setFundType(name, val as FundType)
                      }
                    >
                      <SelectTrigger className="w-[110px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="equity">Equity</SelectItem>
                        <SelectItem value="debt">Debt</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>

      {/* Table */}
      <DataTable
        columns={realisedProfitColumns}
        data={filteredData}
        footer={[
          {
            value: `Total (${filteredData.length} entries)`,
            colSpan: 6,
          },
          {
            value: totalProfit,
            colSpan: 1,
            align: "right" as const,
            render: () => renderProfit(totalProfit),
          },
        ]}
      />
    </div>
  );
}
