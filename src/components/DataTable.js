import { 
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from '@mui/material'

const DataTable = ({
  columns = [],
  data = [],
  keyColumn = '',
  noBorders = false,
  showTotal = false,
  title = null
}) => (
  <Paper sx={{ p: 3 }}>
    {title && 
      <Typography variant="h6" color="primary">
        {title}
      </Typography>
    }   
    <Table size="small">
      <TableHead>
        <TableRow>
          {columns.map(c => 
            <TableCell
              style={{
                fontWeight: 'bold',
                borderColor: noBorders ? 'white' : `rgba(224, 224, 224, 1)`
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
                style={{
                  fontWeight: c.bold ? "bold" : "normal",
                  borderColor: noBorders ? 'white' : `rgba(224, 224, 224, 1)`
                }}
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
              <TableCell style={{ fontWeight: "bold", borderColor: noBorders ? 'white' : `rgba(224, 224, 224, 1)` }} align={c.align || 'inherit'}>
                {c.getTotalData ? c.getTotalData(data) : '-'}
              </TableCell>
            )}
          </TableRow>
        }
      </TableBody>
    </Table>
  </Paper>
)

export default DataTable
