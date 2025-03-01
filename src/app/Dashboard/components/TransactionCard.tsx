import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Transaction } from "@/types/investments";
import { useState } from "react";
import { getLastTwelveMonthsData, getAnnualData, getAllMonthsData } from "../utils/chartData";

import { ChartTypeSelect } from "./ChartTypeSelect";
import BarChartRenderer from "./BarChartRenderer";

const transactionsOptions: {
  label: string;
  value: string;
  type: string;
  dataFn: (transactions: Transaction[]) => { name: string; value: number }[];
}[] = [
  {
    label: "Last 12 Months",
    value: "last_12_months",
    type: "monthly",
    dataFn: getLastTwelveMonthsData,
  },
  {
    label: "Annually",
    value: "annually",
    type: "yearly",
    dataFn: getAnnualData,
  },
  {
    label: "All Time",
    value: "all_time",
    type: "monthly",
    dataFn: getAllMonthsData,
  },
];

export default function TransactionCard({ transactions }: { transactions: Transaction[] }) {
  const [transactionsChartType, setTransactionsChartType] = useState<string>(transactionsOptions[0].value);
  const activeMonthData =
    transactionsOptions.find((option) => option.value === transactionsChartType) || transactionsOptions[0];

  const chartData = activeMonthData.dataFn(transactions);

  return (
    <Card>
      <CardHeader className="flex-row items-start space-y-0">
        <div className="grid gap-3">
          <CardTitle>Transactions</CardTitle>
          <CardDescription>Amount invested {activeMonthData.type}, net of withdrawals</CardDescription>
        </div>
        <ChartTypeSelect
          value={transactionsChartType}
          onValueChange={setTransactionsChartType}
          options={transactionsOptions}
        />
      </CardHeader>
      <CardContent>
        <BarChartRenderer chartData={chartData} label="Transactions" />
      </CardContent>
      <CardFooter className="text-sm">
        <div className="leading-none text-muted-foreground">
          Showing {activeMonthData.type} transactions from {chartData[0].name} to {chartData[chartData.length - 1].name}
        </div>
      </CardFooter>
    </Card>
  );
}
