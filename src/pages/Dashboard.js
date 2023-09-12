import { useState } from 'react'
import { Grid, Paper, Typography } from '@mui/material'

import byDateAsc from 'utils/functions/byDateAsc'
import CustomAreaChart from 'components/CustomAreaChart'
import CustomBarChart from 'components/CustomBarChart'
import CustomNavTab from 'components/CustomNavTab'
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

  while (
    (currentDate.getFullYear() < endDate.getFullYear()) || 
    ((currentDate.getFullYear() === endDate.getFullYear()) && 
    (currentDate.getMonth() <= endDate.getMonth()))
  ) {
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
  const [ value, setValue ] = useState("Type")
  const [ transactionsValue, setTransactionsValue ] = useState('Anually')
  const [ performanceValue, setPerformanceValue ] = useState('All time')

  
  let { transactions = [] } = cas || {}

  const investments = getInvestments(transactions)

  const getAdditionalPerformanceChartProps = v => {
    switch (v) {
      case "All time":
        return {
          data: investments
        }
      case "1 month":
        return {
          data: getMonthInvestments(investments),
          dataMin: "auto"
        }
      case "3 months":
        return {
          data: getThreeMonthsInvestments(investments),
          dataMin: "auto"
        }
      case "6 months":
        return {
          data: getSixMonthsInvestments(investments),
          dataMin: "auto"
        }
      case "1 year":
        return {
          data: getOneYearInvestments(investments),
          dataMin: "auto"
        }
      default:
        return {
          data: investments
        }
    }
  }

  const getAdditionalTransactionsChartProps = v => {
    switch (v) {
      case "Anually":
        return {
          data: getYearlyBarChart(transactions),
          nameKey: "year"
        }
      case "Last 12 months":
        return {
          data: getMonthlyBarChart(transactions).slice(-12),
          nameKey: "month"
        }
      case "All months":
        return {
          data: getMonthlyBarChart(transactions),
          nameKey: "month"
        }
      default:
        return {
          data: getYearlyBarChart(transactions),
          nameKey: "year"
        }
    }
  }

  const getAdditionalValueProps = v => {
    switch (v) {
      case "Type":
        return {
          data: getTypePortfolio(transactions),
          nameKey: "type"
        }
      case "Funds":
        return {
          data: getPortfolio(transactions),
          nameKey: "mfName"
        }

      default:
        return {
          data: getTypePortfolio(transactions),
          nameKey: "type"
        }
    }
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={12} lg={6}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" color="primary">
            Performance
          </Typography>
          <CustomNavTab
            tabs={[ "All time", "1 month", "3 months", "6 months", "1 year" ]}
            value={performanceValue}
            setValue={setPerformanceValue}
          />
          <CustomAreaChart key={performanceValue} dataKey="invested" nameKey="date" color="#00bcd4" {...getAdditionalPerformanceChartProps(performanceValue)} />
        </Paper>
      </Grid>
      <Grid item xs={12} md={6} lg={6}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" color="primary">
            Transactions
          </Typography>
          <CustomNavTab
            tabs={[ "Anually", "Last 12 months", "All months" ]}
            value={transactionsValue}
            setValue={setTransactionsValue}
          />
          <CustomBarChart key={transactionsValue} dataKey="amount" {...getAdditionalTransactionsChartProps(transactionsValue)} />
        </Paper>
      </Grid>
      <Grid item xs={12} md={6} lg={6}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" color="primary">
            Allocation
          </Typography>
          <CustomNavTab
            tabs={[ "Type", "Funds" ]}
            value={value}
            setValue={setValue}
          />
          <CustomPieChart key={value} dataKey="currentInvested" {...getAdditionalValueProps(value)} />
        </Paper>
      </Grid>
    </Grid>
  )
}

export default Dashboard
