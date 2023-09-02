import DataTable from 'components/DataTable'
import getPortfolio from 'utils/functions/getPortfolio'

const Portfolio = ({ cas }) => {
  const { transactions = [] } = cas || {}

  const portfolio = getPortfolio(transactions)

  const columns = [
    {
      label: "Scheme Name",
      getData: rowData => rowData.mfName
    },
    {
      label: "Avg. Cost / Unit",
      getData: rowData => rowData.currentUnits ? (rowData.currentInvested / rowData.currentUnits).toFixed(4) : "-",
      align: "right"
    },
    {
      label: "Current Units",
      getData: rowData => rowData.currentUnits ? rowData.currentUnits.toFixed(3) : "-",
      align: "right"
    },
    {
      label: "% of Portfolio",
      getData: rowData => rowData.currentUnits ? `${rowData.percentage.toFixed(2)}%` : "-",
      align: "right",
      getTotalData: () => "Total"
    },
    {
      label: "Total cost",
      getData: rowData => rowData.currentInvested ? rowData.currentInvested.toLocaleString('en-IN', { style: "currency", currency: "INR", maximumFractionDigits: 0 }) : '-',
      align: "right",
      getTotalData: data => data.reduce((a, b) => a + b.currentInvested, 0).toLocaleString('en-IN', { style: "currency", currency: "INR", maximumFractionDigits: 0 })
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
