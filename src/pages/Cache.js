import DataTable from 'components/DataTable'

const byteSize = str => new Blob([str]).size;

const Cache = () => {
  let data = []
  let totalSize = 0

  for ( var i = 0; i < localStorage.length; i++ ) {
    const key = localStorage.key(i)
    const value = localStorage.getItem(key)
    const size = byteSize(value)
    const content = JSON.parse(value)
    const lastSyncedAt = content.lastSyncedAt

    data.push({
      key: key,
      value: value,
      lastSyncedAt: lastSyncedAt,
      size: size
    })

    totalSize = totalSize + size
  }

  data.sort((a,b) => b.size - a.size)

  const columns = [
    {
      label: "Key",
      getData: rowData => rowData.key
    },
    {
      label: "Last synced at",
      getData: rowData => new Date(rowData.lastSyncedAt).toLocaleDateString('en-IN', { year:"numeric", month:"short", day:"2-digit", hour:"2-digit", minute:"2-digit"}),
      getTotalData: () => "Total"
    },
    {
      label: "Data",
      getData: rowData => (rowData.size / 1024).toFixed(0) + " KB",
      getTotalData: () => (totalSize / 1024).toFixed(0) + " KB",
    }
  ]

  return (
    <DataTable
      data={data}
      columns={columns}
      showTotal
    />
  )
}

export default Cache
