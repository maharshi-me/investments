import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useState } from "react";

import { ChartTypeSelect } from "./ChartTypeSelect";

interface ChartOption {
  label: string;
  value: string;
  type?: string;
}

export default function ChartCard({
  className,
  title,
  chartOptions,
  footer,
  renderChart,
}: {
  className?: string;
  title: string;
  chartOptions: ChartOption[];
  footer: (({ selectedChart }: { selectedChart: ChartOption }) => string) | string;
  renderChart: ({ selectedChart }: { selectedChart: ChartOption }) => React.ReactNode;
}) {
  const [selectedChartOption, setSelectedChartOption] = useState<string>(chartOptions[0].value);
  const selectedChart = chartOptions.find((option) => option.value === selectedChartOption) || chartOptions[0];

  return (
    <Card className={className}>
      <CardHeader className="flex-row items-center space-y-0 gap-2">
        <CardTitle>{title}</CardTitle>
        <ChartTypeSelect value={selectedChartOption} onValueChange={setSelectedChartOption} options={chartOptions} />
      </CardHeader>
      <CardContent>{renderChart({ selectedChart })}</CardContent>
      <CardFooter className="text-sm">
        <div className="text-muted-foreground">{typeof footer === "function" ? footer({ selectedChart }) : footer}</div>
      </CardFooter>
    </Card>
  );
}
