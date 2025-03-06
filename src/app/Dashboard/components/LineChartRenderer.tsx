import { CartesianGrid, XAxis, Line, LineChart, YAxis } from "recharts";

import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { formatCurrency } from "@/utils/functions";

export interface LineChartData {
  name: string;
  valueOne: number;
  valueTwo: number;
}

interface LineChartRendererProps {
  chartData: LineChartData[];
  labelOne: string;
  labelTwo: string;
}

export default function LineChartRenderer({ chartData, labelOne, labelTwo }: LineChartRendererProps) {
  const chartConfig = {
    valueOne: {
      label: labelOne,
      color: "hsl(var(--chart-1))",
    },
    valueTwo: {
      label: labelTwo,
      color: "hsl(var(--chart-4))",
    },
  } satisfies ChartConfig;

  return (
    <ChartContainer config={chartConfig}>
      <LineChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={10} />
        <YAxis tickLine={false} axisLine={false} hide domain={['auto', 'auto']} />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, name) => (
                <div className="flex w-[100%] gap-3 justify-between items-center text-xs text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-2.5 w-2.5 shrink-0 rounded-[2px] bg-[--color-bg]"
                      style={
                        {
                          "--color-bg": `var(--color-${name})`,
                        } as React.CSSProperties
                      }
                    />
                    {chartConfig[name as keyof typeof chartConfig]?.label || name}
                  </div>
                  <div className="flex text-foreground font-medium">{formatCurrency(value as number)}</div>
                </div>
              )}
            />
          }
        />
        <Line dataKey="valueOne" type="monotone" stroke="var(--color-valueOne)" strokeWidth={2} dot={false} animationDuration={400} />
        <Line dataKey="valueTwo" type="monotone" stroke="var(--color-valueTwo)" strokeWidth={2} dot={false} animationDuration={400} />
      </LineChart>
    </ChartContainer>
  );
}
