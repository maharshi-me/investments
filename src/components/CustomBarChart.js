import { useState } from 'react'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  YAxis
} from 'recharts'

import CustomTooltipContent from 'components/CustomTooltipContent'
import getShortRupeesString from 'utils/functions/getShortRupeesString'

const CustomBarChart = ({ data, dataKey, nameKey }) => {
  const [ hoveredItem, setHoveredItem ] = useState(null)

  const onBarEnter = item => setHoveredItem(item[nameKey])
  const onBarExit = () => setHoveredItem(null)

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} >
      <CartesianGrid stroke='grey' opacity={0.2} vertical={false}/>
        <YAxis tickLine={false} axisLine={false} tickFormatter={getShortRupeesString} />
        <Bar
          onMouseEnter={onBarEnter}
          onMouseLeave={onBarExit}
          dataKey={dataKey}
          maxBarSize={50}
        >
          {data.map(entry => {
            if (hoveredItem === entry[nameKey]){
              return <Cell key={`cell-${entry[nameKey]}`} fill={entry[dataKey] > 0 ? "#1976d2" : "#d32f2f"} fillOpacity="80%"/>
            }
            else {
              return <Cell key={`cell-${entry[nameKey]}`} fill={entry[dataKey] > 0 ? "#1976d2" : "#d32f2f"} />
            }
          })}
        </Bar>
        <ReferenceLine y={0} stroke="grey" />
        <Tooltip content={<CustomTooltipContent nameKey={nameKey} />} cursor={false}/>
      </BarChart>
    </ResponsiveContainer>
  )
}

export default CustomBarChart
