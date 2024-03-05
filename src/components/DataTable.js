import { 
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from '@mui/material'

import { useState, Fragment } from 'react';

import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

const DataTable = ({
  columns = [],
  data = [],
  keyColumn = '',
  noBorders = false,
  showTotal = false,
  collapseable = false,
  collapseableColumns = [],
  collapseableDataKey = '',
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
          {collapseable ? <TableCell /> : null}
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
        {data.map((d) => (
          <Row
            key={d[keyColumn]}
            d={d}
            columns={columns}
            noBorders={noBorders}
            collapseable={collapseable}
            collapseableColumns={collapseableColumns}
            collapseableDataKey={collapseableDataKey}
          />
        ))}
        {showTotal && 
          <TableRow>
            {collapseable ? <TableCell /> : null}
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

function Row(props) {
  const { d, columns, noBorders, collapseable, collapseableColumns, collapseableDataKey } = props;
  const [open, setOpen] = useState(false);

  return (
    <Fragment>
      <TableRow>
        {collapseable ? 
          <TableCell
            style={{
              borderColor: noBorders ? 'white' : `rgba(224, 224, 224, 1)`
            }}>
            <IconButton
              aria-label="expand row"
              size="small"
              onClick={() => setOpen(!open)}
            >
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </TableCell>
        : null}
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
      {collapseable ? 
        <TableRow>
          <TableCell style={{
            padding: 0,
            borderColor: 'white'
          }} colSpan={columns.length + 1}>
            <Collapse in={open} timeout="auto" unmountOnExit>
                <Table size="small" aria-label="purchases">
                  <TableHead>
                    <TableRow>
                      <TableCell></TableCell>
                      {collapseableColumns.map(c => 
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
                    {d[collapseableDataKey].map (cd =>
                      <TableRow>
                        <TableCell></TableCell>
                        {collapseableColumns.map(c => 
                          <TableCell
                            style={{
                              fontWeight: c.bold ? "bold" : "normal",
                              borderColor: noBorders ? 'white' : `rgba(224, 224, 224, 1)`
                            }}
                            align={c.align || 'inherit'}
                            sx={c.sx && c.sx(cd)}
                          >
                            {c.getData(cd)}
                          </TableCell>
                        )}
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
            </Collapse>
          </TableCell>
        </TableRow>
      : null}
    </Fragment>
  );
}

export default DataTable
