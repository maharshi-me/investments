import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Bar, BarChart, CartesianGrid, XAxis, Cell } from "recharts"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import Cards from "./Cards"
import { Transaction, Portfolio } from "@/types/investments"

const chartData = [
  { month: "Jan 2025", transactions: 186 },
  { month: "Feb 2025", transactions: 305 },
  { month: "Mar 2025", transactions: -237 },
  { month: "Apr 2025", transactions: 73 },
  { month: "May 2025", transactions: 209 },
  { month: "Jun 2025", transactions: 214 },
  { month: "Jul 2025", transactions: 214 },
  { month: "Aug 2025", transactions: 214 },
  { month: "Sep 2025", transactions: 214 },
  { month: "Oct 2025", transactions: 214 },
  { month: "Nov 2025", transactions: 214 },
  { month: "Dec 2025", transactions: 214 },
]

const chartConfig = {
  transactions: {
    label: "Transactions",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

type TransactionsChartType = "last_12_months" | "annually" | "all_time"

const transactionsOptions: {
  label: string
  value: TransactionsChartType
  description: string
}[] = [
  {
    label: "Last 12 Months",
    value: "last_12_months",
    description: "Showing total transactions for last 12 months",
  },
  {
    label: "Annually",
    value: "annually",
    description: "Showing total transactions for each year",
  },
  {
    label: "All Time",
    value: "all_time",
    description: "Showing total transactions for all time",
  }
]

function findOrThrow<T>(array: T[], predicate: (item: T) => boolean): T {
  const result = array.find(predicate);
  if (!result) throw new Error("Item not found");
  return result;
}

export default function Dashboard({ portfolio }: { transactions: Transaction[], portfolio: Portfolio }) {
  const [transactionsChartType, setTransactionsChartType] = useState<TransactionsChartType>(transactionsOptions[0].value)

  const activeMonthData = findOrThrow(transactionsOptions, (option) => option.value === transactionsChartType)

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <Cards portfolio={portfolio} />
      <div className="grid auto-rows-min gap-4 xl:grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
        <Card>
          <CardHeader className="flex-row items-start space-y-0 pb-0">
            <div className="grid gap-1">
              <CardTitle>Transactions</CardTitle>
              <CardDescription>{activeMonthData.description}</CardDescription>
            </div>
            <Select value={transactionsChartType} onValueChange={(value) => setTransactionsChartType(value as TransactionsChartType)}>
              <SelectTrigger
                className="ml-auto h-7 w-[130px] rounded-lg pl-2.5"
                aria-label="Select a value"
              >
                <SelectValue placeholder="Select a value" />
              </SelectTrigger>
              <SelectContent align="end" className="rounded-xl">
                {transactionsOptions.map(({ label, value }) =>
                  <SelectItem
                    key={value}
                    value={value}
                    className="rounded-lg [&_span]:flex"
                  >
                    <div className="flex items-center gap-2 text-xs">
                      {label}
                    </div>
                  </SelectItem>
                  )}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <BarChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 3)}
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
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="leading-none text-muted-foreground">
              {activeMonthData.description}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
