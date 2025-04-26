import { useState } from "react";

import { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/ui/data-table";
import { formatCurrency, getSummary, renderProfit, formatDate } from "@/utils/functions";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { TableCell, TableBody, TableHead, TableHeader, TableRow, Table } from "@/components/ui/table";

import { Portfolio as PortfolioType, PortfolioRow } from "@/types/investments";

const formatUnits = (units: number) => {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 3,
  }).format(units);
};

const withZeroUnitsColumns: ColumnDef<PortfolioRow>[] = [
  {
    accessorKey: "mfName",
    header: "Fund Name",
    id: "Fund Name",
    enableHiding: false,
  },
  {
    accessorKey: "currentUnits",
    header: () => <div className="text-right">Current Units</div>,
    id: "Current Units",
    cell: ({ row }) => <div className="text-right">{formatUnits(row.original.currentUnits)}</div>,
  },
  {
    accessorKey: "currentInvested",
    header: () => <div className="text-right">Current Invested</div>,
    id: "Current Invested",
    cell: ({ row }) => <div className="text-right">{formatCurrency(row.original.currentInvested)}</div>,
    enableHiding: false,
  },
  {
    accessorKey: "profit",
    header: () => <div className="text-right">Current Returns</div>,
    id: "Current Returns",
    cell: ({ row }) => renderProfit(row.original.profit),
  },
  {
    accessorKey: "realisedProfit",
    header: () => <div className="text-right">Realised Returns</div>,
    id: "Realised Returns",
    cell: ({ row }) => renderProfit(row.original.realisedProfit),
  },
  {
    accessorKey: "currentValue",
    header: () => <div className="text-right">Current Value</div>,
    id: "Current Value",
    cell: ({ row }) => <div className="text-right">{formatCurrency(row.original.currentValue)}</div>,
    enableHiding: false,
  },
];

const withoutZeroUnitsColumns: ColumnDef<PortfolioRow>[] = [
  {
    accessorKey: "mfName",
    header: "Fund Name",
    id: "Fund Name",
    enableHiding: false,
  },
  {
    accessorKey: "currentUnits",
    header: () => <div className="text-right">Current Units</div>,
    id: "Current Units",
    cell: ({ row }) => <div className="text-right">{formatUnits(row.original.currentUnits)}</div>,
  },
  {
    accessorKey: "currentInvested",
    header: () => <div className="text-right">Current Invested</div>,
    id: "Current Invested",
    cell: ({ row }) => <div className="text-right">{formatCurrency(row.original.currentInvested)}</div>,
    enableHiding: false,
  },
  {
    accessorKey: "profit",
    header: () => <div className="text-right">Current Returns</div>,
    id: "Current Returns",
    cell: ({ row }) => renderProfit(row.original.profit),
  },
  {
    accessorKey: "currentValue",
    header: () => <div className="text-right">Current Value</div>,
    id: "Current Value",
    cell: ({ row }) => <div className="text-right">{formatCurrency(row.original.currentValue)}</div>,
    enableHiding: false,
  },
];

export default function Portfolio({ portfolio }: { portfolio: PortfolioType }) {
  const [fundFilter, setFundFilter] = useState("");
  const [showZeroUnits, setShowZeroUnits] = useState(false);

  const { totalValue, invested, currentProfit, realisedProfit } = getSummary(portfolio);

  const filteredPortfolio = Object.values(portfolio)
    .filter((row) => row.mfName.toLowerCase().includes(fundFilter.toLowerCase()))
    .filter((row) => (showZeroUnits ? true : Math.abs(row.currentUnits) > 0.001));

  const renderSubComponent = ({ rowData }: { rowData: PortfolioRow }) => {
    return (
      <div className="p-4">
        <h4 className="font-medium mb-2">Current Holdings</h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Units</TableHead>
              <TableHead className="text-right">Invested</TableHead>
              <TableHead className="text-right">Returns</TableHead>
              <TableHead className="text-right">Gain</TableHead>
              <TableHead className="text-right">Current Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rowData.existingFunds.map((transaction, i) => (
              <TableRow key={i}>
                <TableCell>{formatDate(transaction.date)}</TableCell>
                <TableCell className="text-right">{formatUnits(transaction.units)}</TableCell>
                <TableCell className="text-right">{formatCurrency(transaction.invested)}</TableCell>
                <TableCell className="text-right">{renderProfit(transaction.profit)}</TableCell>
                <TableCell className="text-right">{renderProfit(transaction.gain, "percentage")}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(transaction.invested + transaction.profit)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Switch id="show-zero" checked={showZeroUnits} onCheckedChange={setShowZeroUnits} />
          <Label htmlFor="show-zero">Show redeemed funds</Label>
        </div>
      </div>
      <DataTable
        columns={showZeroUnits ? withZeroUnitsColumns : withoutZeroUnitsColumns}
        data={filteredPortfolio}
        searchValue={fundFilter}
        setSearchValue={setFundFilter}
        renderSubComponent={renderSubComponent}
        showCollapsableRows
        footer={
          showZeroUnits
            ? [
                {
                  value: "Total",
                  colSpan: 3,
                },
                {
                  value: formatCurrency(invested),
                  colSpan: 1,
                  align: "right",
                },
                {
                  value: currentProfit,
                  colSpan: 1,
                  align: "right",
                  render: () => renderProfit(currentProfit),
                },
                {
                  value: realisedProfit,
                  colSpan: 1,
                  align: "right",
                  render: () => renderProfit(realisedProfit),
                },
                {
                  value: formatCurrency(totalValue),
                  colSpan: 1,
                  align: "right",
                },
              ]
            : [
                {
                  value: "Total",
                  colSpan: 3,
                },
                {
                  value: formatCurrency(invested),
                  colSpan: 1,
                  align: "right",
                },
                {
                  value: currentProfit,
                  colSpan: 1,
                  align: "right",
                  render: () => renderProfit(currentProfit),
                },
                {
                  value: formatCurrency(totalValue),
                  colSpan: 1,
                  align: "right",
                },
              ]
        }
      />
    </div>
  );
}
