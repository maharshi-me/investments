import * as React from 'react'

import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from '@mui/material'


function byDateDesc(a, b) {
  var keyA = new Date(a.date),
    keyB = new Date(b.date)
  if (keyA < keyB) return 1
  if (keyA > keyB) return -1

  return 0
}

export default function Transactions({ cas }) {
  let { transactions = [] } = cas || {}

  transactions.sort(byDateDesc)

  return (
    <Paper sx={{ p: 3 }}>
      <Typography component="h2" variant="h6" color="primary" gutterBottom>
        Transactions
      </Typography>
      <Table size="small" aria-label="transactions">
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Scheme Name</TableCell>
            <TableCell>Folio No.</TableCell>
            <TableCell>Type</TableCell>
            <TableCell align="right">Price / Unit</TableCell>
            <TableCell align="right">Units</TableCell>
            <TableCell align="right">Amount</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {transactions.map(transaction => 
            <TableRow key={transaction.key}>
              <TableCell>{transaction.date.toLocaleDateString('en-IN',{ year:"numeric", month:"short", day:"2-digit"})}</TableCell>
              <TableCell>{transaction.mfName}</TableCell>
              <TableCell>{transaction.folio}</TableCell>
              <TableCell>{transaction.type}</TableCell>
              <TableCell align="right">{transaction.price.toFixed(4)}</TableCell>
              <TableCell align="right">{transaction.units.toFixed(3)}</TableCell>
              <TableCell align="right" sx={{ color: transaction.type === 'Investment' ? '#2e7d32' : '#d32f2f' }}>{transaction.type === 'Investment' ? '+' : '-'}{transaction.amount.toLocaleString('en-IN', { style: "currency", currency: "INR", maximumFractionDigits: 0 })}</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Paper>
  )
}
