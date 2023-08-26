import { useNavigate } from 'react-router-dom'

import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
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
  const navigate = useNavigate()

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
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="Year" scale="point" padding={{ left: 40, right: 40 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="Amount" fill="#1976d2" maxBarSize={30} />
              <ReferenceLine y={0} stroke="#000" />
            </BarChart>
          </ResponsiveContainer>
          <Button color="primary" size="small" variant="text" onClick={() => navigate('transactions')}>See full transactions</Button>
        </Paper>
      </Grid>
    </Grid>
  )
}
