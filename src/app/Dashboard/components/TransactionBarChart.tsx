import { Bar, BarChart, CartesianGrid, XAxis, Cell } from "recharts"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartConfig = {
  transactions: {
    label: "Transactions",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export default function TransactionBarChart({ chartData }: { chartData: { month: string, transactions: number }[] }) {

  return (
    <ChartContainer config={chartConfig}>
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) =>
            value.length === 4 ? value : value.slice(0, 3)
          }
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              hideLabel
              className="w-[200px]"
              nameKey="transactions"
            />
          }
        />
        <Bar dataKey="transactions" radius={8}>
        {chartData.map((item) => (
          <Cell
            key={item.month}
            fill={
              item.transactions > 0
                ? "hsl(var(--chart-1))"
                : "hsl(var(--chart-2))"
            }
          />
        ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}
