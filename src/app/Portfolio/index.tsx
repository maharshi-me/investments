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
import {  TableCell, TableBody, TableHead, TableHeader, TableRow, Table } from "@/components/ui/table"

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

  const renderProfit = (profit: number, type: 'currency' | 'percentage' = 'currency') => {
    return <div className={`text-right ${profit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
      {type === 'currency' ? formatCurrency(profit) : `${profit.toFixed(2)}%`}
    </div>
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
      enableHiding: false,
    },
    {
      accessorKey: "currentUnits",
      header: () => (
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
      header: () => (
        <div className="text-right">Current Invested</div>
      ),
      id: "Current Invested",
      cell: ({ row }) => (
        <div className="text-right">
          {formatCurrency(row.original.currentInvested)}
        </div>
      ),
      enableHiding: false,
    },
    {
      accessorKey: "profit",
      header: () => (
        <div className="text-right">Current Returns</div>
      ),
      id: "Current Returns",
      cell: ({ row }) => renderProfit(row.original.profit),
    },
    ...(showZeroUnits ? [
      {
        accessorKey: "realisedProfit",
        header: () => (
          <div className="text-right">Realised Returns</div>
        ),
        id: "Realised Returns",
        cell: ({ row }) => renderProfit(row.original.realisedProfit),
      },
      {
        accessorKey: "currentValue",
        header: () => (
          <div className="text-right">Current Value</div>
        ),
        id: "Current Value",
        cell: ({ row }) => (
          <div className="text-right">
            {formatCurrency(row.original.currentValue)}
          </div>
        ),
        enableHiding: false,
      }
    ] : [
      {
        accessorKey: "currentValue",
        header: () => (
          <div className="text-right">Current Value</div>
        ),
        id: "Current Value",
        cell: ({ row }) => (
          <div className="text-right">
            {formatCurrency(row.original.currentValue)}
          </div>
        ),
        enableHiding: false,
      }
    ])
  ]

  const renderSubComponent = ({ row }: { row: PortfolioRow }) => {
    const fund = row.original
    return (
      <div className="p-4">
        <h4 className="font-medium mb-2">Current Holdings</h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Units</TableHead>
              <TableHead className="text-right">Current Invested</TableHead>
              <TableHead className="text-right">Current Returns</TableHead>
              <TableHead className="text-right">Gain</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fund.existingFunds.map((transaction: any, i: number) => (
              <TableRow key={i}>
                <TableCell>{formatDate(transaction.date)}</TableCell>
                <TableCell className="text-right">{formatUnits(transaction.units)}</TableCell>
                <TableCell className="text-right">{formatCurrency(transaction.invested)}</TableCell>
                <TableCell className="text-right">{renderProfit(transaction.profit)}</TableCell>
                <TableCell className="text-right">{renderProfit(transaction.gain, 'percentage')}</TableCell>
                <TableCell className="text-right">{formatCurrency(transaction.units * transaction.price)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

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
        renderSubComponent={renderSubComponent}
        showCollapsableRows
        footer={[
          {
            value: "Total",
            colSpan: 3
          },
          {
            value: formatCurrency(portfolio.reduce((acc, curr) => acc + curr.currentInvested, 0)),
            colSpan: 1,
            align: "right"
          },
          {
            value: renderProfit(portfolio.reduce((acc, curr) => acc + curr.profit, 0)),
            colSpan: 1,
            align: "right"
          },
          ...(showZeroUnits ? [
            {
              value: renderProfit(portfolio.reduce((acc, curr) => acc + curr.realisedProfit, 0)),
              colSpan: 1,
              align: "right"
            }
          ] : []),
          {
            value: formatCurrency(portfolio.reduce((acc, curr) => acc + curr.currentValue, 0)),
            colSpan: 1,
            align: "right"
          }
        ]}
      />
    </div>
  )
}
