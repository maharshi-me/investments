import { Grid, Paper, Typography } from '@mui/material'
import DataTable from 'components/DataTable'

const Profile = ({ cas }) => {
  const { holder = {}, meta = {} } = cas || {}

  const data = [
    {
      label: "Name",
      value: holder.name
    },
    {
      label: "Email",
      value: holder.email
    },
    {
      label: "Mobile",
      value: holder.mobile
    },
    {
      label: "Address",
      value: holder.address
    }
  ]

  const importData = [
    {
      label: "Exported at",
      value: new Date(meta.exportedAt).toLocaleDateString('en-IN', { year:"numeric", month:"short", day:"2-digit", hour:"2-digit", minute:"2-digit"})
    },
    {
      label: "Statement from date",
      value: new Date(meta.from).toLocaleDateString('en-IN', { year:"numeric", month:"short", day:"2-digit"})
    },
    {
      label: "Statement to date",
      value: new Date(meta.to).toLocaleDateString('en-IN', { year:"numeric", month:"short", day:"2-digit"})
    }
  ]

  const columns = [
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

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6} lg={6}>
        <DataTable noBorders data={data} keyColumn='label' columns={columns} title="Profile Details" />
      </Grid>
      <Grid item xs={12} md={6} lg={6}>
        <DataTable noBorders data={importData} keyColumn='label' columns={columns} title="Statement Details" />
      </Grid>
    </Grid>
  )
}

export default Profile
