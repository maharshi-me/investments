import { 
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from '@mui/material'

const DataTable = ({ data = [], columns = [], keyColumn = '', showTotal = false }) => (
  <Paper sx={{ p: 3 }}>
    <Table size="small">
      <TableHead>
        <TableRow>
          {columns.map(c => 
            <TableCell
              style={{
                fontWeight: 'bold'
              }}
              align={c.align || 'inherit'}
            >
              {c.label}
            </TableCell>
          )}
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map(d => 
          <TableRow key={d[keyColumn]}>
            {columns.map(c => 
              <TableCell
                align={c.align || 'inherit'}
                sx={c.sx && c.sx(d)}
              >
                {c.getData(d)}
              </TableCell>
            )}
          </TableRow>
        )}
        {showTotal && 
          <TableRow>
            {columns.map(c => 
              <TableCell style={{ fontWeight: "bold" }} align={c.align || 'inherit'}>
                {c.getTotalData ? c.getTotalData(data) : ''}
              </TableCell>
            )}
          </TableRow>
        }
      </TableBody>
    </Table>
  </Paper>
)

export default DataTable
