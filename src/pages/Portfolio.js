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
      label: "Avg. Cost / Unit",
      getData: rowData => rowData.currentInvested ? (rowData.currentInvested / rowData.currentUnits).toFixed(4) : "-",
      align: "right"
    },
    {
      label: "Current Units",
      getData: rowData => rowData.currentInvested ? rowData.currentUnits.toFixed(3) : "-",
      align: "right"
    },
    {
      label: "% of Portfolio",
      getData: rowData => rowData.currentInvested ? `${rowData.percentage.toFixed(2)}%` : "-",
      align: "right",
      getTotalData: data => `${data.reduce((a, b) => a + b.percentage, 0).toFixed(2)}%`
    },
    {
      label: "Total cost",
      getData: rowData => rowData.currentInvested ? getRupeesString(rowData.currentInvested) : '-',
      align: "right",
      getTotalData: data => getRupeesString(data.reduce((a, b) => a + b.currentInvested, 0))
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
