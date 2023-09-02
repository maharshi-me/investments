import { Card } from '@mui/material'

const CustomTooltipContent = ({ active, payload, nameKey, hideLabel }) => {
  if (active && payload && payload.length) {
    return (
      <Card raised style={{opacity: '85%'}}>
        <div style={{margin: 10}}>
          {!hideLabel && <span>{payload[0].payload[nameKey]} : </span>}
          <span style={{fontWeight:"bolder"}}>{payload[0].value.toLocaleString('en-IN', { style: "currency", currency: "INR", maximumFractionDigits: 0 })}</span>
        </div>
      </Card>
    )
  }

  return null
}

export default CustomTooltipContent
