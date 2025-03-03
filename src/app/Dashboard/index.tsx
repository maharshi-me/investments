import { Transaction, Portfolio } from "@/types/investments";

import Cards from "./components/Cards";
import ChartCard from "./components/ChartCard";
import { getLastTwelveMonthsData, getAnnualData, getAllMonthsData, getAllTimePerformance, getOneYearPerformance, getOneMonthPerformance } from "./utils/chartData";
import LineChartRenderer from "./components/LineChartRenderer";
import BarChartRenderer from "./components/BarChartRenderer";

const transactionsOptions: {
  label: string;
  value: string;
  type: string;
}[] = [
  {
    label: "Last 12 Months",
    value: "last_12_months",
    type: "monthly",
  },
  {
    label: "Annually",
    value: "annually",
    type: "yearly",
  },
  {
    label: "All Time",
    value: "all_time",
    type: "monthly",
  },
];

const lineChartDataMock = [
  { name: "25 Aug 2024", valueOne: 186, valueTwo: 80 },
  { name: "26 Aug 2024", valueOne: 305, valueTwo: 200 },
  { name: "27 Aug 2024", valueOne: 237, valueTwo: 120 },
  { name: "28 Aug 2024", valueOne: 73, valueTwo: 190 },
  { name: "29 Aug 2024", valueOne: 209, valueTwo: 130 },
  { name: "30 Aug 2024", valueOne: 214, valueTwo: 140 },
];

const performanceOptions: {
  label: string;
  value: string;
}[] = [
  {
    label: "1 Month",
    value: "one_month",
  },
  {
    label: "1 Year",
    value: "one_year",
  },
  {
    label: "All Time",
    value: "all_time",
  },
];

const barChartDataMap: {
  [key: string]: (transactions: Transaction[]) => { name: string; value: number }[];
} = {
  last_12_months: getLastTwelveMonthsData,
  annually: getAnnualData,
  all_time: getAllMonthsData,
};

const lineChartDataMap: {
  [key: string]: (transactions: Transaction[]) => { name: string; valueOne: number; valueTwo?: number }[];
} = {
  one_month: getOneMonthPerformance,
  one_year: getOneYearPerformance,
  all_time: getAllTimePerformance,
};

export default function Dashboard({ transactions, portfolio }: { transactions: Transaction[]; portfolio: Portfolio }) {
  console.log("getAllTimePerformance", getAllTimePerformance(transactions));
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <Cards portfolio={portfolio} />
      <div className="grid auto-rows-min gap-4 xl:grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
        <ChartCard
          chartOptions={performanceOptions}
          className="col-span-2"
          footer="Invested value vs Current value over time"
          title="Performance"
          renderChart={({ selectedChart }) => {
            const lineChartData = lineChartDataMap[selectedChart.value](transactions);

            return <LineChartRenderer chartData={lineChartData} labelOne="Invested" labelTwo="Current Value" />;
          }}
        />
        <ChartCard
          chartOptions={transactionsOptions}
          footer={({ selectedChart }) => `Amount invested ${selectedChart.type}, net of withdrawals`}
          title="Transactions"
          renderChart={({ selectedChart }) => {
            const barChartData = barChartDataMap[selectedChart.value](transactions);

            return <BarChartRenderer chartData={barChartData} label="Transactions" />;
          }}
        />
      </div>
    </div>
  );
}
