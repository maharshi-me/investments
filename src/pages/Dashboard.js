import { useNavigate } from 'react-router-dom'

import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
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
import { Button, Grid } from '@mui/material'


function byDateAsc(a, b) {
  var keyA = new Date(a.date),
    keyB = new Date(b.date)
  if (keyA < keyB) return -1
  if (keyA > keyB) return 1

  return 0
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

export default function Dashboard({ cas }) {
  const COLORS = [
    '#d21919',
    '#1976d2',
    '#3ed219',
    '#b619d2',
    '#ccd219',
    '#19d2d2',
    '#d27919',
    '#6919d2'
  ]
  
  const navigate = useNavigate()

  let { transactions = [], summary: { mutualFunds = [] } = {} } = cas || {}

  mutualFunds = mutualFunds.filter(mf => mf.currentValue > 0)
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
              <Tooltip />
              <Bar dataKey="Amount" fill="#1976d2" maxBarSize={40} />
              <ReferenceLine y={0} stroke="#000" />
            </BarChart>
          </ResponsiveContainer>
          <Button color="primary" size="small" variant="text" onClick={() => navigate('transactions')}>See full transactions</Button>
        </Paper>
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" color="primary">
            Allocation
          </Typography>
          <Typography variant="caption" gutterBottom>
            By Fund house
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={mutualFunds} dataKey="currentValue" nameKey="fundHouse" cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={3}>
                {mutualFunds.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <Button color="primary" size="small" variant="text">See Detailed breakdown</Button>
        </Paper>
      </Grid>
    </Grid>
  )
}
