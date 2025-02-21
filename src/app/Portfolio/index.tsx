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

import getPortfolio from '@/utils/get-portfolio'


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
  const currentDate = new Date()

  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(currentDate.getFullYear() - 1)

  const threeYearsAgo = new Date();
  threeYearsAgo.setFullYear(currentDate.getFullYear() - 3)


  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [portfolio, setPortfolio] = useState<PortfolioRow[]>([])
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [fundFilter, setFundFilter] = useState("")
  const [showZeroUnits, setShowZeroUnits] = useState(true)

  console.log('portfolio', portfolio)

  useEffect(() => {
    const fetchData = async () => {
      const data = localStorage.getItem('investmentsData')
      if (data) {
        const parsedData = JSON.parse(data)
      const sortedTransactions = [...parsedData.transactions].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )
      setTransactions(sortedTransactions)
        const portfolio = await getPortfolio(sortedTransactions)
        setPortfolio(portfolio)
      }
      setIsLoading(false)
    }
    fetchData()
  }, [])

  useEffect(() => {
    setPageTitle("Portfolio")
  }, [])


  const filteredPortfolio = Object.values(portfolio).filter(row =>
    row.mfName.toLowerCase().includes(fundFilter.toLowerCase())
  ).filter(row => showZeroUnits ? true : Math.abs(row.currentUnits) > 0.001)


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
      accessorKey: "currentUnits",
      header: ({ column }) => (
        <div className="text-right">Current Units</div>
      ),
      id: "Current Units",
      cell: ({ row }) => (
        <div className="text-right">
          {formatUnits(row.original.currentUnits)}
        </div>
      ),
    },
    {
      accessorKey: "currentInvested",
      header: ({ column }) => (
        <div className="text-right">Average Cost Price</div>
      ),
      id: "Average Cost Price",
      cell: ({ row }) => (
        <div className="text-right">
          {formatCurrency(row.original.currentInvested ? (row.original.currentInvested / row.original.currentUnits) : 0)}
        </div>
      ),
    },
    {
      accessorKey: "latestPrice",
      header: ({ column }) => (
        <div className="text-right">Current Price</div>
      ),
      id: "Current Price",
      cell: ({ row }) => (
        <div className="text-right">
          {formatCurrency(row.original.latestPrice)}
        </div>
      ),
    },
    {
      accessorKey: "currentInvested",
      header: ({ column }) => (
        <div className="text-right">Invested</div>
      ),
      id: "Invested",
      cell: ({ row }) => (
        <div className="text-right">
          {formatCurrency(row.original.currentInvested)}
        </div>
      ),
    },
    {
      accessorKey: "profit",
      header: ({ column }) => (
        <div className="text-right">Current Returns</div>
      ),
      id: "Current Returns",
      cell: ({ row }) => (
        <div className={`text-right ${row.original.profit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {formatCurrency(row.original.profit)}
        </div>
      ),
    },
    ...(showZeroUnits ? [
      {
        accessorKey: "realisedProfit",
        header: ({ column }) => (
          <div className="text-right">Realised Returns</div>
        ),
        id: "Realised Returns",
        cell: ({ row }) => (
          <div className={`text-right ${row.original.realisedProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {formatCurrency(row.original.realisedProfit)}
          </div>
        ),
      },
      {
        accessorKey: "currentValue",
        header: ({ column }) => (
          <div className="text-right">Current Value</div>
        ),
        id: "Current Value",
        cell: ({ row }) => (
          <div className="text-right">
            {formatCurrency(row.original.currentValue)}
          </div>
        ),
      }
    ] : [
      {
        accessorKey: "currentValue",
        header: ({ column }) => (
          <div className="text-right">Current Value</div>
        ),
        id: "Current Value",
        cell: ({ row }) => (
          <div className="text-right">
            {formatCurrency(row.original.currentValue)}
          </div>
        ),
      }
    ])
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
        data={filteredPortfolio}
        searchValue={fundFilter}
        setSearchValue={setFundFilter}
      />
    </div>
  )
}
