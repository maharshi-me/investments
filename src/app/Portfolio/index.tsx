import { useEffect, useState } from "react"
import { TypographySmall } from "@/components/ui/typography-small"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Loader2Icon } from "lucide-react"
import { setPageTitle } from "@/utils/page-title"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

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

interface PortfolioRow {
  mfName: string
  invested: number
  redemption: number
  netInvestment: number
  units: number
  currentNav?: number
  currentValue?: number
  folio: string
}

export default function Portfolio() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [fundFilter, setFundFilter] = useState("")
  const [showZeroUnits, setShowZeroUnits] = useState(true)

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
    setPageTitle("Portfolio")
  }, [])

  // Modify portfolio summary calculation to ignore folios
  const portfolioSummary = transactions.reduce((acc: { [key: string]: PortfolioRow }, curr) => {
    const key = curr.mfName // Remove folio from key
    if (!acc[key]) {
      acc[key] = {
        mfName: curr.mfName,
        invested: 0,
        redemption: 0,
        netInvestment: 0,
        units: 0,
        folio: '-' // Set a default value since we're not using folios
      }
    }

    if (curr.type === "Investment") {
      acc[key].invested += curr.amount
      acc[key].units += curr.units
    } else {
      acc[key].redemption += curr.amount
      acc[key].units -= curr.units
    }

    acc[key].netInvestment = acc[key].invested - acc[key].redemption

    return acc
  }, {})

  const filteredPortfolioSummary = Object.values(portfolioSummary).filter(row =>
    row.mfName.toLowerCase().includes(fundFilter.toLowerCase())
  )

  const portfolioData = filteredPortfolioSummary
    .filter(row => showZeroUnits ? true : Math.abs(row.units) > 0.001) // Filter based on toggle
    .sort((a, b) => b.invested - a.invested)

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

  const formatUnits = (units: number) => {
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 3
    }).format(units)
  }

  const columns: ColumnDef<PortfolioRow>[] = [
    {
      accessorKey: "mfName",
      header: "Fund Name",
      id: "Fund Name",
    },
    {
      accessorKey: "invested",
      header: "Total Invested",
      id: "Total Invested",
      cell: ({ row }) => (
        <div className="text-right text-green-600 dark:text-green-400">
          {formatCurrency(row.original.invested)}
        </div>
      ),
    },
    {
      accessorKey: "units",
      header: "Current Units",
      id: "Current Units",
      cell: ({ row }) => (
        <div className="text-right">
          {formatUnits(row.original.units)}
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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Switch
            id="show-zero"
            checked={showZeroUnits}
            onCheckedChange={setShowZeroUnits}
          />
          <Label htmlFor="show-zero">Show redeemed funds</Label>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={portfolioData}
        searchValue={fundFilter}
        setSearchValue={setFundFilter}
      />
    </div>
  )
}
