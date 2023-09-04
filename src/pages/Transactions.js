import byDateDesc from 'utils/functions/byDateDesc'
import DataTable from 'components/DataTable'
import getRupeesString from 'utils/functions/getRupeesString'

const Transactions = ({ cas }) => {
  let { transactions = [] } = cas || {}

  transactions.sort(byDateDesc)

  const columns = [
    {
      label: "Date",
      getData: rowData => rowData.date.toLocaleDateString('en-IN',{ year:"numeric", month:"short", day:"2-digit"}),
      getTotalData: () => "Total"
    },
    {
      label: "Scheme Name",
      getData: rowData => rowData.mfName
    },
    {
      label: "Type",
      getData: rowData => rowData.type
    },
    {
      label: "Folio No.",
      getData: rowData => rowData.folio
    },
    {
      label: "Units",
      getData: rowData => rowData.units.toFixed(3),
      align: "right"
    },
    {
      label: "Price / Unit",
      getData: rowData => rowData.price.toFixed(4),
      align: "right"
    },
    {
      label: "Amount",
      getData: rowData => `${rowData.type === 'Investment' ? '+' : '-'}${getRupeesString(rowData.amount)}`,
      align: "right",
      sx: rowData => ({ color: rowData.type === 'Investment' ? '#2e7d32' : '#d32f2f' }),
      getTotalData: data => getRupeesString(data.reduce((a, b) => (b.type === 'Investment') ? a + b.amount : a - b.amount, 0))
    }
  ]

  return (
    <DataTable
      data={transactions}
      columns={columns}
      showTotal
    />
  )
}

export default Transactions
