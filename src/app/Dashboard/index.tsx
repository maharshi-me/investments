import { setPageTitle } from "@/utils/page-title"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/utils/functions/formatCurrency"
import getPortfolio from "@/utils/get-portfolio"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { TypographySmall } from "@/components/ui/typography-small"
import { Loader2Icon } from "lucide-react"
import { TypographyH2 } from "@/components/ui/typography/h2"
import getSummary from "@/utils/functions/getSummary"
import { renderProfit } from "@/utils/functions/renderProfit"

export default function Dashboard() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [portfolio, setPortfolio] = useState<any[]>([])
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)

  const { totalValue, invested, allTimeProfit } = getSummary(portfolio)

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
    setPageTitle("Dashboard")
  }, [])

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
      <div className="grid auto-rows-min gap-4 xl:grid-cols-4 md:grid-cols-2 sm:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>
              <TypographySmall text="Total Value" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TypographyH2 text={formatCurrency(totalValue)} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>
              <TypographySmall text="Invested" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TypographyH2 text={formatCurrency(invested)} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>
              <TypographySmall text="All Time Returns" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TypographyH2 text={renderProfit(allTimeProfit, 'currency', 'left')} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>
              <TypographySmall text="Monthly Income if retired" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TypographyH2 text={formatCurrency(totalValue / 25 / 12)} />
          </CardContent>
        </Card>
      </div>
      <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
    </div>
  )
}
