import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useEffect, useState } from "react";

import { ChartTypeSelect } from "./ChartTypeSelect";
interface ChartOption {
  label: string;
  value: string;
  type?: string;
}

interface ChartCardProps<T> {
  title: string;
  footer: string | ((props: { selectedChart: ChartOption }) => string);
  chartOptions: ChartOption[];
  className?: string;
  getData: (props: { selectedChart: ChartOption }) => Promise<T[]>;
  renderChart: (props: { data: T[] }) => React.ReactNode;
}

export default function ChartCard<T>({
  className,
  title,
  chartOptions,
  footer,
  renderChart,
  getData,
}: ChartCardProps<T>) {
  const [selectedChartOption, setSelectedChartOption] = useState<string>(chartOptions[0].value);
  const selectedChart = chartOptions.find((option) => option.value === selectedChartOption) || chartOptions[0];
  const [ data, setData ] = useState<T[]>([]);

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
      <CardContent>{renderChart({ data })}</CardContent>
      <CardFooter className="text-sm">
        <div className="text-muted-foreground">{typeof footer === "function" ? footer({ selectedChart }) : footer}</div>
      </CardFooter>
    </Card>
  );
}
