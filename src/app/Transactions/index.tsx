import { useEffect, useState } from "react"
import { TypographySmall } from "@/components/ui/typography-small"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Loader2Icon } from "lucide-react"
import { setPageTitle } from "@/utils/page-title"

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

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [fundFilter, setFundFilter] = useState("")

  useEffect(() => {
    const data = localStorage.getItem('investmentsData')
    if (data) {
      const parsedData = JSON.parse(data)
      const sortedTransactions = [...parsedData.transactions].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )
      setTransactions(sortedTransactions)
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    setPageTitle("Transactions")
  }, [])

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

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <Loader2Icon className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (!transactions.length) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
        <TypographySmall text="No transactions found. Please import your CAS first." />
        <Button onClick={() => navigate('/settings')}>
          Go to Import
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <DataTable columns={columns} data={filteredTransactions} searchValue={fundFilter} setSearchValue={setFundFilter} />
    </div>
  )
}
