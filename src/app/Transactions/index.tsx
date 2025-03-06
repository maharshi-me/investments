import { useState } from "react"

import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"
import { formatCurrency, formatDate } from "@/utils/functions"

import { Transaction } from "@/types/investments"

export default function Transactions({ transactions }: { transactions: Transaction[] }) {
  const [fundFilter, setFundFilter] = useState("")

  const sortedTransactions = transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const filteredTransactions = sortedTransactions.filter(transaction =>
    transaction.mfName.toLowerCase().includes(fundFilter.toLowerCase())
  )

  const columns: ColumnDef<Transaction>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => formatDate(row.original.date),
      id: "Date",
    },
    {
      accessorKey: "mfName",
      header: "Fund Name",
      id: "Fund Name",
    },
    {
      accessorKey: "folio",
      header: "Folio",
      id: "Folio",
    },
    {
      accessorKey: "price",
      header: "Price / Unit",
      id: "Price / Unit",
    },
    {
      accessorKey: "units",
      header: "Units",
      id: "Units",
    },
    {
      accessorKey: "type",
      header: "Type",
      id: "Type",
      cell: ({ row }) => (
        <div className={row.original.type === "Investment" ? "text-green-600 dark:text-green-400 font-medium" : "text-red-600 dark:text-red-400 font-medium"}>
          {row.original.type}
        </div>
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      id: "Amount",
      cell: ({ row }) => (
        <div className={`text-right ${row.original.type === "Investment" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
          {formatCurrency(row.original.amount)}
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <DataTable columns={columns} data={filteredTransactions} searchValue={fundFilter} setSearchValue={setFundFilter} />
    </div>
  )
}
