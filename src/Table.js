import {useState} from 'react';
import { Table, TableSortLabel, TableHead, TableRow, TableCell, TableBody, TableContainer } from '@material-ui/core';

const FormattedTable = ({data, headers}) => {
  const [orderBy, setOrderBy] = useState(headers[0]);
  const [order, setOrder] = useState('asc');

  const handleSort = (column) => {
    if (orderBy === column && order === 'asc') {
      setOrder('desc');
    } else {
      setOrder('asc');
    }
    setOrderBy(column);
  };

  const idx = headers.indexOf(orderBy);
  const sortedData = Object.entries(data).sort((a, b) => {
    let aValue = a[idx];
    let bValue = b[idx];
    if (typeof aValue !== "string") {
      return order === 'asc' ? aValue - bValue : bValue - aValue;
    }
    return order === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
  });

  return (
    <TableContainer style={{ maxWidth: '800px' }}>
      <Table>
        <TableHead>
          <TableRow>
            {headers.map((header) => (
              <TableCell key={header}>
                <TableSortLabel
                  active={orderBy === header}
                  direction={order}
                  onClick={() => handleSort(header)}>
                  {header}
                </TableSortLabel>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedData.map(([key, value]) => (
            <TableRow key={key}>
              <TableCell>{key}</TableCell>
              <TableCell>{value}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default FormattedTable;
