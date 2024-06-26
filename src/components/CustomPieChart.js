import { useCallback, useEffect, useState } from 'react'
import { Grid } from '@mui/material'
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip
} from 'recharts'

import CustomTooltipContent from 'components/CustomTooltipContent'

const CustomPieChart = ({ data, dataKey, nameKey }) => {
  const [ hoveredItem, setHoveredItem ] = useState(null)
  const [ dataItems, setDataItems ] = useState([])
  const [ hiddenItems, setHiddenItems ] = useState([])

  useEffect(() => setDataItems(data.filter(d => d[dataKey] > 0)), [ data.length ])

  const getItemPercentage = useCallback(name => {
    if (hiddenItems.some(hiddenItem => hiddenItem === name)) return null

    let totalDataItemsSum = 0

    dataItems.forEach(dataItem => {
      if (!hiddenItems.some(hiddenItem => hiddenItem === dataItem[nameKey])) {
        totalDataItemsSum += dataItem[dataKey]
      }
    })

    const currentData = [...dataItems].filter(dataItem => dataItem[nameKey] === name)[0][dataKey]

    return ((currentData / totalDataItemsSum) * 100).toFixed(2)
  }, [ dataItems, hiddenItems ])

  const filteredData = [...dataItems].filter(dataItem => !hiddenItems.some(hiddemItem => hiddemItem === dataItem[nameKey]))

  const onPieEnter = item => setHoveredItem(item[nameKey])
  const onPieExit = () => setHoveredItem(null)

  return (
    <Grid container spacing={0} >
      <Grid item xs={12} md={12} lg={6}>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              onMouseEnter={onPieEnter}
              onMouseLeave={onPieExit}
              data={filteredData}
              dataKey={dataKey}
              nameKey={nameKey}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={100}
              paddingAngle={0}
            >
              {filteredData.map(entry => {
                if (hoveredItem === entry[nameKey]){
                  return <Cell key={`cell-${entry[nameKey]}`} fill={entry.color} />
                }
                else if (hoveredItem) {
                  return <Cell key={`cell-${entry[nameKey]}`} fill={entry.color} fillOpacity="20%" />
                }
                else {
                  return <Cell key={`cell-${entry[nameKey]}`} fill={entry.color} />
                }
              })}
            </Pie>
            <Tooltip content={<CustomTooltipContent nameKey={nameKey}/>} cursor={false} />
          </PieChart>
        </ResponsiveContainer>
      </Grid>
      <Grid item xs={12} md={12} lg={6} marginTop="5px">
        <>
          {dataItems.map(dataItem => {
            const isHidden = hiddenItems.some(hiddenItem => hiddenItem === dataItem[nameKey])

            return (
              <div key={dataItem[nameKey]} style={{ cursor: "pointer", marginBottom: "0.2rem"}}
                onClick={() => {
                  if (isHidden) {
                    setHiddenItems(prevState => [...prevState].filter((item) => item !== dataItem[nameKey]))
                  }
                  else {
                    setHiddenItems(prevState => [...prevState, dataItem[nameKey]])
                  }
                }}>
                <div style={{
                  width: "0.58rem",
                  height: "0.58rem",
                  backgroundColor: dataItem.color,
                  display: "inline-block",
                  marginRight: "0.75rem"
                }}></div>
                <span style={{
                  fontSize: "0.75rem",
                  marginRight: "0.5rem",
                  opacity: isHidden ? 0.5 : 1,
                  textDecoration: isHidden ? "line-through" : "none"
                }}>
                  {dataItem[nameKey]}
                </span>
                {!isHidden && <span style={{fontSize: "0.75rem", fontWeight: "bolder"}}>({getItemPercentage(dataItem[nameKey])}%)</span>}
              </div>
            )
          })}
        </>
      </Grid>
    </Grid>
  )
}

export default CustomPieChart
