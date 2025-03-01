import { Bar, BarChart, CartesianGrid, XAxis, Cell } from 'recharts'

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { formatCurrency } from '@/utils/functions'

interface SingleChartData {
  name: string
  value: number
}

interface BarChartRendererProps {
  chartData: SingleChartData[]
  label: string
}

export default function BarChartRenderer({
  chartData,
  label,
}: BarChartRendererProps) {
  const chartConfig = {
    value: {
      label,
    },
  } satisfies ChartConfig

  return (
    <ChartContainer config={chartConfig}>
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="name"
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
              hideIndicator
              formatter={(value, name) => (
                <div className="flex w-[100%] gap-3 justify-between items-center text-xs text-muted-foreground">
                  {chartConfig[name as keyof typeof chartConfig]?.label || name}
                  <div className="flex text-foreground font-medium">
                    {formatCurrency(value as number)}
                  </div>
                </div>
              )}
            />
          }
        />
        <Bar dataKey="value" radius={8}>
          {chartData.map((item) => (
            <Cell
              key={item.name}
              fill={
                item.value > 0 ? 'hsl(var(--chart-1))' : 'hsl(var(--chart-2))'
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}
