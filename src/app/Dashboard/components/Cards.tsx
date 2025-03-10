import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, getSummary, renderProfit } from "@/utils/functions"
import { TypographyH2 } from "@/components/ui/typography/h2"
import { Portfolio } from "@/types/investments"

export default function Cards({ portfolio }: { portfolio: Portfolio }) {
  const { totalValue, invested, allTimeProfit } = getSummary(portfolio)

  const cards = [
    {
      title: "Total Value",
      value: formatCurrency(totalValue),
    },
    {
      title: "Invested",
      value: formatCurrency(invested),
    },
    {
      title: "All Time Returns",
      value: renderProfit(allTimeProfit, 'currency', 'left'),
    },
    {
      title: "Monthly Income if retired",
      value: formatCurrency(totalValue / 25 / 12),
    },
  ]

  return (
    <div className="grid auto-rows-min gap-4 xl:grid-cols-4 md:grid-cols-2 sm:grid-cols-1">
      {cards.map(({ title, value }) =>
        <Card>
          <CardHeader>
            <CardTitle>
              {title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TypographyH2 text={value} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}