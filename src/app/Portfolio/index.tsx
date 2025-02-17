import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useEffect, useState } from "react"
import { TypographySmall } from "@/components/ui/typography-small"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Loader2Icon } from "lucide-react"
import { setPageTitle } from "@/utils/page-title"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

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
      <div className="relative max-w-sm">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Filter by fund name"
          value={fundFilter}
          onChange={(e) => setFundFilter(e.target.value)}
          className="pl-8"
        />
      </div>
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Fund Name</TableHead>
              <TableHead>Folio</TableHead>
              <TableHead>Scheme</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.map((transaction, index) => (
              <TableRow key={index}>
                <TableCell>{formatDate(transaction.date)}</TableCell>
                <TableCell>{transaction.mfName}</TableCell>
                <TableCell>{transaction.folio}</TableCell>
                <TableCell>{transaction.matchingScheme.schemeCode}</TableCell>
                <TableCell className={transaction.type === "Investment" ? "text-green-600 dark:text-green-400 font-medium" : "text-red-600 dark:text-red-400 font-medium"}>
                  {transaction.type}
                </TableCell>
                <TableCell className={`text-right ${transaction.type === "Investment" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                  {formatCurrency(transaction.amount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
