import { useState } from "react"

import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"

interface Transaction {
  date: Date
  mfNameFull: string
  mfName: string
  type: string
  amount: number
  units: number
  price: number
  folio: string
  isin: string
  matchingScheme: {
    schemeName: string
    schemeCode: string
  }
}

export default function Transactions({ transactions }: { transactions: Transaction[] }) {
  const [fundFilter, setFundFilter] = useState("")

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const filteredTransactions = transactions.filter(transaction =>
    transaction.mfName.toLowerCase().includes(fundFilter.toLowerCase())
  )

  // Add columns definition
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
