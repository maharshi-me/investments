import { Card } from '@mui/material'

import getRupeesString from 'utils/functions/getRupeesString'

const CustomTooltipContent = ({ active, payload, nameKey, hideLabel }) => {
  if (active && payload && payload.length) {
    return (
      <Card raised style={{opacity: '85%'}}>
        <div style={{margin: 10}}>
          {!hideLabel && <span>{payload[0].payload[nameKey]} : </span>}
          <span style={{fontWeight:"bolder"}}>{getRupeesString(payload[0].value)}</span>
        </div>
      </Card>
    )
  }

  return null
}

export default CustomTooltipContent
