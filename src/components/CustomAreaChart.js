import {
  ResponsiveContainer,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts'

import getShortRupeesString from 'utils/functions/getShortRupeesString'
import CustomMultiTooltipContent from 'components/CustomMultiTooltipContent'

const CustomAreaChart = ({ data, color, nameKey, dataKey, dataMin = 0, dataMax = 'auto' }) => {

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart
        width={500}
        height={300}
        data={data}
      >
        <defs>
          <linearGradient id={`colorId-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.5}/>
            <stop offset="95%" stopColor={color} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid stroke='grey' opacity={0.2} vertical={false}/>
        <YAxis tickLine={false} axisLine={false} domain={[ dataMin, dataMax ]} tickFormatter={getShortRupeesString} />
        <Tooltip content={<CustomMultiTooltipContent nameKey={nameKey} />} cursor={false}/>
        <Area type="linear" dot={false} dataKey={dataKey} stroke={color} fillOpacity={1} fill={`url(#colorId-${dataKey}`} strokeWidth={2}/>
      </AreaChart>
    </ResponsiveContainer>
  )
}

export default CustomAreaChart
