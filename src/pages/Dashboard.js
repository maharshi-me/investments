import { useState } from 'react'
import { Grid, Paper, Typography } from '@mui/material'

import byDateAsc from 'utils/functions/byDateAsc'
import CustomAreaChart from 'components/CustomAreaChart'
import CustomBarChart from 'components/CustomBarChart'
import CustomNavTab from 'components/CustomNavTab'
import CustomPieChart from 'components/CustomPieChart'
import getCachedInvestmentsValue from 'utils/functions/getInvestmentsValue'
import getPortfolio from 'utils/functions/getPortfolio'
import getRupeesString from 'utils/functions/getRupeesString'
import getSummary from 'utils/functions/getSummary'
import getTypePortfolio from 'utils/functions/getTypePortfolio'

const getYearlyBarChart = transactions => {
  let ts = transactions.slice()
  ts.sort(byDateAsc)

  let data = []
  const dt = new Date()
  const currentYear = Number(dt.getFullYear())
  const firstYear = ts.length > 0 ? Number(new Date(ts[0].date).toLocaleDateString("en-IN", {year: 'numeric'})) : currentYear

  for (let y = firstYear; y <= currentYear; y++) {
    data.push({
      year: y.toString(),
      amount: 0
    })
  }

  ts.forEach(t => {
    const y_index = data.findIndex(d => d.year === new Date(t.date).toLocaleDateString("en-IN", { year: 'numeric' }))

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
  const startDate = ts.length > 0 ? new Date(ts[0].date) : endDate

  const allMonthsList = getMonthsBetweenDates(startDate, endDate)

  let data = []

  allMonthsList.forEach(month => {
    data.push({
      month: month,
      amount: 0
    })
  })

  ts.forEach(t => {
    const m_index = data.findIndex(d => d.month === new Date(t.date).toLocaleDateString('en-IN',{ year:"numeric", month:"short"}))

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

  return investments.filter(i => new Date(i.dateObj) >= day)
}

const getThreeMonthsInvestments = investments => {
  let day = new Date()
  day.setMonth(day.getMonth() - 3)

  return investments.filter(i => new Date(i.dateObj) >= day)
}

const getSixMonthsInvestments = investments => {
  let day = new Date()
  day.setMonth(day.getMonth() - 6)

  return investments.filter(i => new Date(i.dateObj) >= day)
}

const getOneYearInvestments = investments => {
  let day = new Date()
  day.setFullYear(day.getFullYear() - 1)

  return investments.filter(i => new Date(i.dateObj) >= day)
}

const Dashboard = ({ cas }) => {
  const [ value, setValue ] = useState("Type")
  const [ transactionsValue, setTransactionsValue ] = useState('Anually')
  const [ performanceValue, setPerformanceValue ] = useState('All time')

  let { transactions = [] } = cas || {}

  const investmentsValue = getCachedInvestmentsValue(transactions)
  const { totalValue, invested, allTimeProfit } = getSummary(transactions)

  const getAdditionalPerformanceChartProps = v => {
    switch (v) {
      case "All time":
        return {
          data: investmentsValue
        }
      case "1 month":
        return {
          data: getMonthInvestments(investmentsValue),
          dataMin: "auto"
        }
      case "3 months":
        return {
          data: getThreeMonthsInvestments(investmentsValue),
          dataMin: "auto"
        }
      case "6 months":
        return {
          data: getSixMonthsInvestments(investmentsValue),
          dataMin: "auto"
        }
      case "1 year":
        return {
          data: getOneYearInvestments(investmentsValue),
          dataMin: "auto"
        }
      default:
        return {
          data: investmentsValue
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
      <Grid item xs={6} md={6} lg={4}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ pb: 1 }} color="primary">
            Total Value
          </Typography>
          <Typography variant="h4" color="#0f0f0f">
            {getRupeesString(totalValue)}
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={6} md={6} lg={4}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ pb: 1 }} color="primary">
            Invested
          </Typography>
          <Typography variant="h4" color="#0f0f0f">
            {getRupeesString(invested)}
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={6} md={6} lg={4}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ pb: 1 }} color="primary">
            All-time Returns
          </Typography>
          <Typography variant="h4" color={(allTimeProfit >= 0) ? "#2e7d32" : "#d32f2f"}>
            {getRupeesString(allTimeProfit)}
          </Typography>
        </Paper>
      </Grid>
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
          <CustomAreaChart key={performanceValue} dataKey="value" nameKey="date" color="#1976d2" {...getAdditionalPerformanceChartProps(performanceValue)} />
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
          <CustomPieChart key={value} dataKey="currentValue" {...getAdditionalValueProps(value)} />
        </Paper>
      </Grid>
    </Grid>
  )
}

export default Dashboard
