import {
  Bar,
  BarChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis
} from 'recharts'

import { CustomTooltip } from 'utils/helperFunctions'

export default function CustomBarChart({ data, dataKey, nameKey }) {

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} 
        margin={{
          top: 15,
          right: 0,
          left: 0,
          bottom: 0,
        }}
      >
        <XAxis dataKey={nameKey} scale="point" padding={{ left: 40, right: 40 }} />
        <Tooltip content={<CustomTooltip nameKey={nameKey} hideLabel />}/>
        <Bar dataKey={dataKey} fill="#1976d2" maxBarSize={50} />
        <ReferenceLine y={0} stroke="#000" />
      </BarChart>
    </ResponsiveContainer>
  )
}
