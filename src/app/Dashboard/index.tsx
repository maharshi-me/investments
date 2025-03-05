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
  [key: string]: (transactions: Transaction[]) => Promise<{ name: string; valueOne: number; valueTwo?: number }[]>;
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
          getData={async({selectedChart}) => {
            const lineChartData = await lineChartDataMap[selectedChart.value](transactions);

            return lineChartData
          }}
          renderChart={({ lineChartData }) => {
            return <LineChartRenderer chartData={lineChartData} labelOne="Invested" labelTwo="Current Value" />;
          }}
        />
        <ChartCard
          chartOptions={transactionsOptions}
          footer={({ selectedChart }) => `Amount invested ${selectedChart.type}, net of withdrawals`}
          title="Transactions"
          getData={async({selectedChart}) => {
            const barChartData = barChartDataMap[selectedChart.value](transactions);

            return barChartData
          }}
          renderChart={({ lineChartData }) => {
            return <BarChartRenderer chartData={lineChartData} label="Transactions" />;
          }}
        />
      </div>
    </div>
  );
}
