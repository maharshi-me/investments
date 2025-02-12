import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useEffect, useState } from "react"
import { TypographySmall } from "@/components/ui/typography-small"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"

interface Transaction {
  date: Date
  mfName: string
  type: string
  amount: number
  units: number
  price: number
  folio: string
}

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    const data = localStorage.getItem('investmentsData')
    if (data) {
      const parsedData = JSON.parse(data)
      // Sort transactions by date in descending order (recent first)
      const sortedTransactions = [...parsedData.transactions].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )
      setTransactions(sortedTransactions)
    }
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
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3
    }).format(num)
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
      <Table>
        <TableCaption>A list of your mutual fund transactions.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Fund Name</TableHead>
            <TableHead>Folio</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Units</TableHead>
            <TableHead className="text-right">NAV</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction, index) => (
            <TableRow key={index}>
              <TableCell>{formatDate(transaction.date)}</TableCell>
              <TableCell>{transaction.mfName}</TableCell>
              <TableCell>{transaction.folio}</TableCell>
              <TableCell className={transaction.type === "Investment" ? "text-green-600 dark:text-green-400 font-medium" : "text-red-600 dark:text-red-400 font-medium"}>
                {transaction.type}
              </TableCell>
              <TableCell className={`text-right ${transaction.type === "Investment" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                {formatCurrency(transaction.amount)}
              </TableCell>
              <TableCell className="text-right">{formatNumber(transaction.units)}</TableCell>
              <TableCell className="text-right">{formatNumber(transaction.price)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
