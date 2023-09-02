import { useState } from 'react'
import { Grid, Box, Tabs, Tab, Paper, Typography } from '@mui/material'

import byDateAsc from 'utils/functions/byDateAsc'
import CustomBarChart from 'components/CustomBarChart'
import CustomPieChart from 'components/CustomPieChart'
import getPortfolio from 'utils/functions/getPortfolio'
import getTypePortfolio from 'utils/functions/getTypePortfolio'

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

const Dashboard = ({ cas }) => {
  const [ value, setValue ] = useState(0)

  const handleChange = (_event, newValue) => setValue(newValue)
  
  let { transactions = [] } = cas || {}

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
          <CustomBarChart data={getYearlyBarChart(transactions)} dataKey="Amount" nameKey="Year" />
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

export default Dashboard
