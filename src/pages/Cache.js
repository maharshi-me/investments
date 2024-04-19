import DeleteIcon from "@mui/icons-material/Delete"
import { IconButton } from '@mui/material';
import { useEffect, useState } from "react";

import DataTable from 'components/DataTable'

const byteSize = str => new Blob([str]).size;

const Cache = () => {
  const [cache, setCache] = useState([])
  const [totalCache, setTotalCache] = useState(0)

  const refreshCache = () => {
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

    setCache(data)
    setTotalCache(totalSize)
  }
  const deleteCache = rowData => {
    localStorage.removeItem(rowData.key)
    refreshCache()
  }

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
      getTotalData: () => (totalCache / 1024).toFixed(0) + " KB",
    },
    {
      label: "",
      renderColumn: rowData => (
        <IconButton aria-label="delete" size="small" color="primary" onClick={() => deleteCache(rowData)}>
          <DeleteIcon fontSize="inherit" />
        </IconButton>
      )
    }
  ]

  useEffect(() => {
    refreshCache()
  }, [])

  return (
    <DataTable
      data={cache}
      columns={columns}
      showTotalRow
    />
  )
}

export default Cache
