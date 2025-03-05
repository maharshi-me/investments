import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useEffect, useState } from "react";

import { ChartTypeSelect } from "./ChartTypeSelect";

interface ChartOption {
  label: string;
  value: string;
  type?: string;
}

interface BarChartData {
  name: string;
  value: number;
}

interface LineChartData {
  name: string;
  valueOne: number;
  valueTwo?: number;
}

type ChartData = BarChartData[] | LineChartData[];

export default function ChartCard({
  className,
  title,
  chartOptions,
  footer,
  renderChart,
  getData,
}: {
  className?: string;
  title: string;
  chartOptions: ChartOption[];
  footer: (({ selectedChart }: { selectedChart: ChartOption }) => string) | string;
  renderChart: ({ lineChartData }: { lineChartData: ChartData }) => React.ReactNode;
  getData: ({ selectedChart }: { selectedChart: ChartOption }) => Promise<ChartData>;
}) {
  const [selectedChartOption, setSelectedChartOption] = useState<string>(chartOptions[0].value);
  const selectedChart = chartOptions.find((option) => option.value === selectedChartOption) || chartOptions[0];
  const [ data, setData ] = useState<ChartData>([]);

  useEffect(() => {
    async function fetchData() {
      const response = await getData({selectedChart});
      setData(response);
    }
    fetchData();
  }, [getData, selectedChart]);

  return (
    <Card className={className}>
      <CardHeader className="flex-row items-center space-y-0 gap-2">
        <CardTitle>{title}</CardTitle>
        <ChartTypeSelect value={selectedChartOption} onValueChange={setSelectedChartOption} options={chartOptions} />
      </CardHeader>
      <CardContent>{renderChart({ lineChartData: data })}</CardContent>
      <CardFooter className="text-sm">
        <div className="text-muted-foreground">{typeof footer === "function" ? footer({ selectedChart }) : footer}</div>
      </CardFooter>
    </Card>
  );
}
