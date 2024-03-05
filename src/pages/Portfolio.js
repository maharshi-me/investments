import DataTable from 'components/DataTable'
import getPortfolio from 'utils/functions/getPortfolio'
import getRupeesString from 'utils/functions/getRupeesString'

const Portfolio = ({ cas }) => {
  const { transactions = [] } = cas || {}

  const portfolio = getPortfolio(transactions)

  const columns = [
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
      label: "Avg. Cost Price",
      getData: rowData => rowData.currentInvested ? (rowData.currentInvested / rowData.currentUnits).toFixed(4) : "-",
      align: "right"
    },
    {
      label: "Curr. Price",
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
      label: "Curr. Returns",
      getData: rowData => rowData.profit ? getRupeesString(rowData.profit) : "-",
      sx: rowData => rowData.profit ? ({ color: rowData.profit > 0 ? '#2e7d32' : '#d32f2f' }) : null,
      align: "right",
      getTotalData: data => getRupeesString(data.reduce((a, b) => a + b.profit, 0))
    },
    {
      label: "Value",
      getData: rowData => rowData.currentValue ? getRupeesString(rowData.currentValue) : '-',
      align: "right",
      getTotalData: data => getRupeesString(data.reduce((a, b) => a + b.currentValue, 0))
    }
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

  return (
    <DataTable
      data={portfolio}
      columns={columns}
      keyColumn="mfName"
      showTotal
      collapseable
      collapseableColumns={collapseableColumns}
      collapseableDataKey="existingFunds"
    />
  )
}

export default Portfolio
