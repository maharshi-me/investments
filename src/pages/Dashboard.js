import { useState } from 'react'
import { Grid, Box, Tabs, Tab, Paper, Typography } from '@mui/material'

import byDateAsc from 'utils/functions/byDateAsc'
import CustomAreaChart from 'components/CustomAreaChart'
import CustomBarChart from 'components/CustomBarChart'
import CustomPieChart from 'components/CustomPieChart'
import getInvestments from 'utils/functions/getInvestments'
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
      year: y.toString(),
      amount: 0
    })
  }

  ts.forEach(t => {
    const y_index = data.findIndex(d => d.year === t.date.toLocaleDateString("en-IN", { year: 'numeric' }))

    if (t.type === 'Investment') {
      data[y_index].amount += t.amount
    }
    else {
      data[y_index].amount -= t.amount
    }
  })

  return data
}

function getMonthsBetweenDates(startDate, endDate) {
  const months = []
  let currentDate = new Date(startDate)

  while (currentDate <= endDate) {
    months.push(currentDate.toLocaleDateString('en-IN',{ year:"numeric", month:"short"}))
    currentDate.setMonth(currentDate.getMonth() + 1)
  }

  return months
}

const getMonthlyBarChart = transactions => {
  let ts = transactions.slice()
  ts.sort(byDateAsc)

  const endDate = new Date()
  const startDate = ts.length > 0 ? ts[0].date : endDate

  const allMonthsList = getMonthsBetweenDates(startDate, endDate)

  let data = []

  allMonthsList.forEach(month => {
    data.push({
      month: month,
      amount: 0
    })
  })

  ts.forEach(t => {
    const m_index = data.findIndex(d => d.month === t.date.toLocaleDateString('en-IN',{ year:"numeric", month:"short"}))

    if (t.type === 'Investment') {
      data[m_index].amount += t.amount
    }
    else {
      data[m_index].amount -= t.amount
    }
  })

  return data
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  }
}

const getMonthInvestments = investments => {
  let day = new Date()
  day.setMonth(day.getMonth() - 1)

  return investments.filter(i => i.dateObj >= day)
}

const getThreeMonthsInvestments = investments => {
  let day = new Date()
  day.setMonth(day.getMonth() - 3)

  return investments.filter(i => i.dateObj >= day)
}

const getSixMonthsInvestments = investments => {
  let day = new Date()
  day.setMonth(day.getMonth() - 6)

  return investments.filter(i => i.dateObj >= day)
}

const getOneYearInvestments = investments => {
  let day = new Date()
  day.setFullYear(day.getFullYear() - 1)

  return investments.filter(i => i.dateObj >= day)
}

const Dashboard = ({ cas }) => {
  const [ value, setValue ] = useState(0)
  const [ transactionsValue, setTransactionsValue ] = useState(0)
  const [ performanceValue, setPerformanceValue ] = useState(0)

  const handleChange = (_event, newValue) => setValue(newValue)
  const handleTransactionChange = (_event, newValue) => setTransactionsValue(newValue)
  const handlePerformanceChange = (_event, newValue) => setPerformanceValue(newValue)
  
  let { transactions = [] } = cas || {}

  const investments = getInvestments(transactions)

  const monthInvestments = getMonthInvestments(investments)
  const threeMonthsInvestments = getThreeMonthsInvestments(investments)
  const sixMonthsInvestments = getSixMonthsInvestments(investments)
  const oneYearInvestments = getOneYearInvestments(investments)

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={12} lg={12}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" color="primary">
            Performance
          </Typography>
          <Box sx={{ borderColor: 'divider' }}>
            <Tabs value={performanceValue} onChange={handlePerformanceChange} >
              <Tab label="All time" {...a11yProps(0)} />
              <Tab label="1 month" {...a11yProps(1)} />
              <Tab label="3 months" {...a11yProps(2)} />
              <Tab label="6 months" {...a11yProps(3)} />
              <Tab label="1 year" {...a11yProps(4)} />
            </Tabs>
          </Box>
          {(performanceValue === 0) && 
            <CustomAreaChart data={investments} dataKey="invested" nameKey="date" color="#00bcd4" />
          }
          {(performanceValue === 1) && 
            <CustomAreaChart data={monthInvestments} dataKey="invested" nameKey="date" color="#00bcd4" dataMin="auto" />
          }
          {(performanceValue === 2) && 
            <CustomAreaChart data={threeMonthsInvestments} dataKey="invested" nameKey="date" color="#00bcd4" dataMin="auto" />
          }
          {(performanceValue === 3) && 
            <CustomAreaChart data={sixMonthsInvestments} dataKey="invested" nameKey="date" color="#00bcd4" dataMin="auto" />
          }
          {(performanceValue === 4) && 
            <CustomAreaChart data={oneYearInvestments} dataKey="invested" nameKey="date" color="#00bcd4" dataMin="auto" />
          }
        </Paper>
      </Grid>
      <Grid item xs={12} md={6} lg={6}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" color="primary">
            Transactions
          </Typography>
          <Box sx={{ borderColor: 'divider' }}>
            <Tabs value={transactionsValue} onChange={handleTransactionChange} >
              <Tab label="Anually" {...a11yProps(0)} />
              <Tab label="Last 12 months" {...a11yProps(1)} />
              <Tab label="All months" {...a11yProps(1)} />
            </Tabs>
          </Box>
          {(transactionsValue === 0) && 
            <CustomBarChart data={getYearlyBarChart(transactions)} dataKey="amount" nameKey="year" />
          }
          {(transactionsValue === 1) && 
            <CustomBarChart data={getMonthlyBarChart(transactions).slice(-12)} dataKey="amount" nameKey="month" />
          }
          {(transactionsValue === 2) && 
            <CustomBarChart data={getMonthlyBarChart(transactions)} dataKey="amount" nameKey="month" />
          }
        </Paper>
      </Grid>
      <Grid item xs={12} md={6} lg={6}>
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
