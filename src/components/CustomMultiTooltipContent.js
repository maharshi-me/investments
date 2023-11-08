import { Card } from '@mui/material'

import getRupeesString from 'utils/functions/getRupeesString'

const CustomMultiTooltipContent = ({ active, payload, nameKey, hideLabel }) => {
  if (active && payload && payload.length) {
    return (
      <Card raised style={{opacity: '85%'}}>
        <div style={{margin: 10}}>
          {!hideLabel && <p>{payload[0].payload[nameKey]}</p>}
          {payload.map(p => {
            let label = p.dataKey.toLowerCase()
            label = label[0].toUpperCase() + label.slice(1)

            return (
              <div key={label}>
                <span style={{color: p.color}}>{label} : </span>
                <span style={{fontWeight:"bolder", color: p.color}}>{getRupeesString(p.value)}</span>
              </div>
            )
          })}
        </div>
      </Card>
    )
  }

  return null
}

export default CustomMultiTooltipContent
