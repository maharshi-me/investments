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
      label: "Avg. NAV",
      getData: rowData => rowData.currentInvested ? (rowData.currentInvested / rowData.currentUnits).toFixed(4) : "-",
      align: "right"
    },
    {
      label: "Curr. NAV",
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
      label: "Value",
      getData: rowData => rowData.currentValue ? getRupeesString(rowData.currentValue) : '-',
      align: "right",
      getTotalData: data => getRupeesString(data.reduce((a, b) => a + b.currentValue, 0))
    },
    {
      label: "Curr. Returns",
      getData: rowData => rowData.profit ? getRupeesString(rowData.profit) : "-",
      sx: rowData => rowData.profit ? ({ color: rowData.profit > 0 ? '#2e7d32' : '#d32f2f' }) : null,
      align: "right",
      getTotalData: data => getRupeesString(data.reduce((a, b) => a + b.profit, 0))
    }
  ]

  return (
    <DataTable
      data={portfolio}
      columns={columns}
      keyColumn="mfName"
      showTotal
    />
  )
}

export default Portfolio
