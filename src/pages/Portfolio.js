import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'

import { getPortfolio } from '../utils/helperFunctions'

export default function Portfolio({ cas }) {
  let { transactions = [] } = cas || {}

  const portfolio = getPortfolio(transactions)

  return (
    <Paper sx={{ p: 3 }}>
      <Typography component="h2" variant="h6" color="primary" gutterBottom>
        Portfolio
      </Typography>
      <Table size="small" aria-label="transactions">
        <TableHead>
          <TableRow>
            <TableCell>Scheme Name</TableCell>
            <TableCell align="right">Avg. Cost / Unit</TableCell>
            <TableCell align="right">Current Units</TableCell>
            <TableCell align="right">Total cost</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {portfolio.map(p => 
            <TableRow key={p.mfName}>
              <TableCell>{p.mfName}</TableCell>
              <TableCell align="right">{p.currentUnits ? (p.currentInvested / p.currentUnits).toFixed(4) : "-"}</TableCell>
              <TableCell align="right">{p.currentUnits ? p.currentUnits.toFixed(3) : "-"}</TableCell>
              <TableCell align="right">{p.currentInvested ? p.currentInvested.toLocaleString('en-IN', { style: "currency", currency: "INR", maximumFractionDigits: 0 }) : '-'}</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Paper>
  )
}
