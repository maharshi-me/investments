import { useState } from 'react'
import { Grid, Box, Tabs, Tab, Card, CardContent } from '@mui/material'
import {
  Bar,
  BarChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis
} from 'recharts'

import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { getPortfolio, byDateAsc, getTypePortfolio } from '../utils/helperFunctions'
import CustomPieChart from '../components/CustomPieChart'
import { CustomTooltip } from '../utils/helperFunctions'

const getYearlyBarChart = transactions => {
  let ts = transactions.slice()
  ts.sort(byDateAsc)

  let data = []
  const dt = new Date()
  const currentYear = Number(dt.getFullYear())
  const firstYear = ts.length > 0 ? Number(ts[0].date.toLocaleDateString("en-IN", {year: 'numeric'})) : currentYear

  for (let y = firstYear; y <= currentYear; y++) {
    data.push({
      Year: y.toString(),
      Amount: 0
    })
  }

  ts.forEach(t => {
    const y_index = data.findIndex(d => d.Year === t.date.toLocaleDateString("en-IN", { year: 'numeric' }))

    if (t.type === 'Investment') {
      data[y_index].Amount += t.amount
    }
    else {
      data[y_index].Amount -= t.amount
    }
  })

  return data
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function Dashboard({ cas }) {
  const [ value, setValue ] = useState(0)

  const handleChange = (_event, newValue) => setValue(newValue)
  
  let { transactions = [] } = cas || {}

  const yearlyBarChart = getYearlyBarChart(transactions)

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6} lg={4}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" color="primary">
            Transactions
          </Typography>
          <Typography variant="caption" gutterBottom>
            Net Amount invested anually
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={yearlyBarChart} 
              margin={{
                top: 15,
                right: 0,
                left: 0,
                bottom: 0,
              }}
            >
              <XAxis dataKey="Year" scale="point" padding={{ left: 40, right: 40 }} />
              <Tooltip content={<CustomTooltip nameKey="Year" hideLabel />}/>
              <Bar dataKey="Amount" fill="#1976d2" maxBarSize={50} />
              <ReferenceLine y={0} stroke="#000" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
      <Grid item xs={12} md={6} lg={8}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" color="primary">
            Allocation
          </Typography>
          <Box sx={{ borderColor: 'divider' }}>
            <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
              <Tab label="Type" {...a11yProps(0)} />
              <Tab label="Funds" {...a11yProps(1)} />
            </Tabs>
          </Box>
          {(value === 0) && 
            <CustomPieChart data={getTypePortfolio(transactions)} dataKey="currentInvested" nameKey="type" />
          }
          {(value === 1) && 
            <CustomPieChart data={getPortfolio(transactions)} dataKey="currentInvested" nameKey="mfName" />
          }
        </Paper>
      </Grid>
    </Grid>
  )
}
