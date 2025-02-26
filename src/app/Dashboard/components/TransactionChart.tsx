
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Transaction } from "@/types/investments"
import { useState } from "react"
import { getLastTwelveMonthsData, getAnnualData, getAllMonthsData } from "../utils/chartData"

import { ChartTypeSelect } from "./ChartTypeSelect"
import TransactionBarChart from "./TransactionBarChart"

const transactionsOptions: {
  label: string
  value: string
  type: string
}[] = [
  { label: "Last 12 Months", value: "last_12_months", type: "monthly" },
  { label: "Annually", value: "annually", type: "yearly" },
  { label: "All Time", value: "all_time", type: "monthly" }
]

// Update the Dashboard component to use both functions
export default function TransactionCard({ transactions }: { transactions: Transaction[] }) {
  const [transactionsChartType, setTransactionsChartType] = useState<string>(transactionsOptions[0].value);
  const activeMonthData = transactionsOptions.find(option => option.value === transactionsChartType) || transactionsOptions[0];

  let chartData = getLastTwelveMonthsData(transactions);
  if (activeMonthData.value === "last_12_months") {
    chartData = getLastTwelveMonthsData(transactions);
  } else if (activeMonthData.value === "annually") {
    chartData = getAnnualData(transactions);
  } else if (activeMonthData.value === "all_time") {
    chartData = getAllMonthsData(transactions);
  }

  return (
    <Card>
      <CardHeader className="flex-row items-start space-y-0">
        <div className="grid gap-3">
          <CardTitle>Transactions</CardTitle>
          <CardDescription>Amount invested {activeMonthData.type}, net of withdrawals</CardDescription>
        </div>
        <ChartTypeSelect value={transactionsChartType} onValueChange={setTransactionsChartType} options={transactionsOptions}/>
      </CardHeader>
      <CardContent>
        <TransactionBarChart chartData={chartData} />
      </CardContent>
      <CardFooter className="text-sm">
        <div className="leading-none text-muted-foreground">
          Showing {activeMonthData.type} transactions from {chartData[0].month} to {chartData[chartData.length - 1].month}
        </div>
      </CardFooter>
    </Card>
  )
}
