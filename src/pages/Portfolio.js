import { Paper, Checkbox } from '@mui/material'

import DataTable from 'components/DataTable'
import { useState } from 'react'
import getPortfolio from 'utils/functions/getPortfolio'
import getRupeesString from 'utils/functions/getRupeesString'

const getTypeFromMFName = (mfName) => {
  let OldConstantsData = localStorage.getItem('constants_' + mfName)

  if (OldConstantsData) {
    return JSON.parse(OldConstantsData)?.type || null
  }

  return null
}

const Portfolio = ({ cas }) => {
  const [ hideZeroHoldings, setHideZeroHoldings ] = useState(true)

  const { transactions = [] } = cas || {}

  const portfolio = getPortfolio(transactions)

  const columns = [...[
    {
      label: "Scheme Name",
      getData: rowData => rowData.mfName,
      getTotalData: () => "Total"
    },
    {
      label: "Units",
      getData: rowData => rowData.currentInvested ? rowData.currentUnits.toFixed(3) : "-",
      align: "right"
    },
    {
      label: "Average Cost Price",
      getData: rowData => rowData.currentInvested ? (rowData.currentInvested / rowData.currentUnits).toFixed(4) : "-",
      align: "right"
    },
    {
      label: "Current Price",
      getData: rowData => rowData.latestPrice ? rowData.latestPrice.toFixed(4) : "-",
      align: "right"
    },
    {
      label: "Invested",
      getData: rowData => rowData.currentInvested ? getRupeesString(rowData.currentInvested) : '-',
      align: "right",
      getTotalData: data => getRupeesString(data.reduce((a, b) => a + b.currentInvested, 0))
    },
    {
      label: "Current Returns",
      getData: rowData => rowData.profit ? getRupeesString(rowData.profit) : "-",
      sx: rowData => rowData.profit ? ({ color: rowData.profit > 0 ? '#2e7d32' : '#d32f2f' }) : null,
      align: "right",
      getTotalData: data => getRupeesString(data.reduce((a, b) => a + b.profit, 0))
    }
  ], ...(hideZeroHoldings ?  [
    {
      label: "Value",
      getData: rowData => rowData.currentValue ? getRupeesString(rowData.currentValue) : '-',
      align: "right",
      getTotalData: data => getRupeesString(data.reduce((a, b) => a + b.currentValue, 0))
    }
  ] : [
    {
      label: "Realised Returns",
      getData: rowData => rowData.realisedProfit ? getRupeesString(rowData.realisedProfit) : "-",
      sx: rowData => rowData.realisedProfit ? ({ color: rowData.realisedProfit > 0 ? '#2e7d32' : '#d32f2f' }) : null,
      align: "right",
      getTotalData: data => getRupeesString(data.reduce((a, b) => a + b.realisedProfit, 0))
    },
    {
      label: "Value",
      getData: rowData => rowData.currentValue ? getRupeesString(rowData.currentValue) : '-',
      align: "right",
      getTotalData: data => getRupeesString(data.reduce((a, b) => a + b.currentValue, 0))
    }
  ])
  ]

  const collapseableColumns = [
    {
      label: "Purchase Date",
      getData: rowData => new Date(rowData.date).toLocaleDateString('en-IN',{ year:"numeric", month:"short", day:"2-digit"}),
    },
    {
      label: "Units",
      getData: rowData => rowData.units ? rowData.units.toFixed(3) : "-",
      align: "right"
    },
    {
      label: "Purchase Price",
      getData: rowData => rowData.price ? rowData.price.toFixed(4) : "-",
      align: "right"
    },
    {
      label: "Invested",
      getData: rowData => rowData.price ? getRupeesString(rowData.invested) : "-",
      align: "right"
    },
    {
      label: "Curr. Returns",
      getData: rowData => rowData.profit ? getRupeesString(rowData.profit) : "-",
      sx: rowData => rowData.profit ? ({ color: rowData.profit > 0 ? '#2e7d32' : '#d32f2f' }) : null,
      align: "right"
    },
    {
      label: "Gain",
      getData: rowData => rowData.gain.toFixed(2) + "%",
      sx: rowData => rowData.gain ? ({ color: rowData.gain > 0 ? '#2e7d32' : '#d32f2f' }) : null,
      align: "right"
    },
    {
      label: "Curr. Value",
      getData: rowData => rowData.currentValue ? getRupeesString(rowData.currentValue) : "-",
      align: "right"
    }
  ]

  const currentDate = new Date()

  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(currentDate.getFullYear() - 1)

  const threeYearsAgo = new Date();
  threeYearsAgo.setFullYear(currentDate.getFullYear() - 3)

  return (
    <Paper sx={{ p: 3 }}>
      <Checkbox checked={hideZeroHoldings} size='small' onChange={() => setHideZeroHoldings(!hideZeroHoldings)} />
      Hide zero holdings
      <DataTable
        data={hideZeroHoldings ? portfolio.filter(p => p.currentInvested > 0) : portfolio}
        columns={columns}
        keyColumn="mfName"
        showTotalRow
        collapseable
        collapseableColumns={collapseableColumns}
        collapseableDataKey="existingFunds"
        showCollapseableRowBackgroundColor={(collapsibleRowData, rowData) => {
          let type = getTypeFromMFName(rowData.mfName)

          if (type === 'Debt') {
            return collapsibleRowData.date < threeYearsAgo
          }

          if (rowData.mfName.includes('ELSS') || rowData.mfName.includes('Tax')) {
            return collapsibleRowData.date < threeYearsAgo
          }

          return collapsibleRowData.date < oneYearAgo
        }}
      />
    </Paper>
  )
}

export default Portfolio
