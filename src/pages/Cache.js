import Checkbox from '@mui/material/Checkbox';
import DeleteIcon from "@mui/icons-material/Delete"
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Refresh from "@mui/icons-material/Refresh";
import Select from '@mui/material/Select';
import { Button, Grid, IconButton, Paper, TextField, Typography } from '@mui/material';
import { useEffect, useState } from "react";

import DataTable from 'components/DataTable'
import byDateDesc from "utils/functions/byDateDesc";

const byteSize = str => new Blob([str]).size;

const SchemeSelect = ({ constant }) => {
  const [shouldAddManually, setShowAddManually] = useState(false)
  const [schemeCode, setSchemeCode] = useState('')

  const data = JSON.parse(constant.value)
  const key = constant.key.split('constants_')[1]

  return (
    <Grid item xs={12} md={6} lg={6}>
      <Paper sx={{ p: 3 }}>
        <Typography sx={{mb: 3}} variant="h6" color="primary">
          {key}
        </Typography>
        {data.selectedSchemeCode
        ?
          <>
            {data.searchData?.find(d => d.schemeCode === data.selectedSchemeCode).schemeName || data.selectedSchemeCode}
            <div style={{ textAlign: 'end' }}>
              <IconButton
                sx={{ mt: 2 }}
                size="small"
                color="primary"
                onClick={() => {
                  localStorage.removeItem(constant.key)
                  localStorage.removeItem(key)
                  window.location.reload()
                }}
                aria-label="delete"
              >
                <Refresh />
              </IconButton>
            </div>
          </>
        :
          <>
            {shouldAddManually
            ?
              <>
                <div style={{ textAlign: "left" }}>
                  <TextField
                    id="standard-basic"
                    value={schemeCode}
                    onChange={(e) => setSchemeCode(e.target.value)}
                    label="Schema Code"
                    variant="standard"
                  />
                </div>
                <div style={{ textAlign: "left" }}>
                  <Button
                    sx={{ mt: 3 }}
                    size="regular"
                    onClick={() => {
                      let OldConstantsData = localStorage.getItem('constants_' + key)

                      if (OldConstantsData) {
                        OldConstantsData = JSON.parse(OldConstantsData)
                      }

                      const constantsData = { selectedSchemeCode: schemeCode }

                      localStorage.setItem('constants_' + key, JSON.stringify(constantsData))
                      window.location.reload()
                    }}
                    disabled={!Boolean(schemeCode)}
                    variant="contained"
                  >
                    Save
                  </Button>
                </div>
              </>
            :
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Code</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  onChange={(e) => {
                    const selectedValue = e.target.value
                    let OldConstantsData = localStorage.getItem('constants_' + key)

                    if (OldConstantsData) {
                      OldConstantsData = JSON.parse(OldConstantsData)
                    }

                    const constantsData = {
                      ...OldConstantsData,
                      selectedSchemeCode: selectedValue
                    }

                    localStorage.setItem('constants_' + key, JSON.stringify(constantsData))
                    window.location.reload()
                  }}
                  label="Age"
                >
                  {data.searchData.map(search => (
                    <MenuItem value={search.schemeCode}>({search.schemeCode}) {search.schemeName}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            }

            <div style={{textAlign: "right"}}>
              Add Manually
              <Checkbox
                checked={shouldAddManually}
                onChange={() => setShowAddManually(!shouldAddManually)}
                inputProps={{ 'aria-label': 'controlled' }}
              />
            </div>

            <div style={{ textAlign: 'end' }}>
              <IconButton
                sx={{ mt: 2 }}
                size="small"
                color="primary"
                onClick={() => {
                  localStorage.removeItem(constant.key)
                  localStorage.removeItem(key)
                  window.location.reload()
                }}
                aria-label="delete"
              >
                <Refresh />
              </IconButton>
            </div>

          </>
        }
      </Paper>
    </Grid>
  )
}

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

  const data = cache.filter(({ key }) => key !== 'cas' && !key.includes('constants_'))
  const cas = cache.find(({ key }) => key === 'cas')
  const value = cas ? JSON.parse(cas.value) : {}
  const constants = cache.filter(({ key }) => key.includes('constants_'))

  const { meta = {}, transactions = [] } = value

  transactions.sort(byDateDesc)

  const importData = [
    {
      label: "Exported at",
      value: new Date(meta?.exportedAt).toLocaleDateString('en-IN', { year:"numeric", month:"short", day:"2-digit", hour:"2-digit", minute:"2-digit"})
    },
    {
      label: "Date range",
      value: new Date(meta?.from).toLocaleDateString('en-IN', { year:"numeric", month:"short", day:"2-digit"}) + ' to ' + new Date(meta?.to).toLocaleDateString('en-IN', { year:"numeric", month:"short", day:"2-digit"})
    }
  ]

  const casColumns = [
    {
      label: null,
      getData: rowData => rowData.label,
      bold: true
    },
    {
      label: null,
      getData: rowData => rowData.value
    }
  ]

  useEffect(() => {
    refreshCache()
  }, [])

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6} lg={6}>
        <Paper sx={{ p: 3 }}>
          <DataTable noBorders data={importData} keyColumn='label' columns={casColumns} title="Statement Data" />
          <Button
            sx={{ mt: 3 }}
            size="small"
            onClick={() => {
              localStorage.removeItem('cas')
              refreshCache()
              window.location.reload()
            }}
            disabled={!Boolean(cas)}
            variant="contained"
          >
            Refresh Data
          </Button>
        </Paper>
      </Grid>
      <Grid item xs={12} md={6} lg={6} />
      {constants.map(constant => <SchemeSelect constant={constant} />)}
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <DataTable
            data={data}
            columns={columns}
            showTotalRow
          />
        </Paper>
      </Grid>
    </Grid>
  )
}

export default Cache
