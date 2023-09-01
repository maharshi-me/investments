import { useState } from 'react'
import { Grid, Box, Tabs, Tab } from '@mui/material'
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis
} from 'recharts'

import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { getAssetType, getAssetColor } from '../constants'
import { getPortfolio, byDateAsc } from '../utils/helperFunctions'


const getTypePortfolio = portfolio => {
  let out = []

  portfolio.forEach(p => {
    const i = out.findIndex(o => o.type === getAssetType(p.mfName))

    if (i >= 0) {
      out[i].currentInvested += p.currentInvested
    }
    else {
      out.push({
        type: getAssetType(p.mfName),
        currentInvested: p.currentInvested,
        color: getAssetColor(p.mfName)
      })
    }
  })

  return out
}

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

  const COLORS = [
    '#d21919',
    '#1976d2',
    '#b619d2',
    '#ccd219',
    '#19d2d2',
    '#d27919',
    '#6919d2',
    '#691919',
    '#3ed219',
  ]

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }
  
  let { transactions = [] } = cas || {}

  const yearlyBarChart = getYearlyBarChart(transactions)

  const portfolio = getPortfolio(transactions)

  const portfolioByType = getTypePortfolio(portfolio)

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
              <Tooltip />
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
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              {(value === 0) &&
              <>
                <Pie data={portfolioByType} dataKey="currentInvested" nameKey="type" cx="50%" cy="50%" innerRadius={50} outerRadius={100} paddingAngle={0} >
                  {portfolioByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </>
              }
              {(value === 1) &&
                <>
                  <Pie data={portfolio} dataKey="currentInvested" nameKey="mfName" cx="50%" cy="50%" innerRadius={50} outerRadius={100} paddingAngle={0} >
                    {portfolio.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </>
              }
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
    </Grid>
  )
}
