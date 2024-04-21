import { Grid, Paper } from '@mui/material'
import DataTable from 'components/DataTable'

const Profile = ({ cas }) => {
  const { holder = {} } = cas || {}

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
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <DataTable noBorders data={data} keyColumn='label' columns={columns} title="Profile Details" />
        </Paper>
      </Grid>
    </Grid>
  )
}

export default Profile
