import {useState} from 'react';
import { Table, TableSortLabel, TableHead, TableRow, TableCell, TableBody, TableContainer } from '@mui/material';

const FormattedTable = ({data, headers, sortConfig}) => {
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

  const getSortValue = (row, column) => {
    const columnIndex = headers.indexOf(column);
    if (columnIndex === 0) {
      return row[0]; // First column is always the key
    }
    return row[1][columnIndex - 1]; // Other columns are in the array
  };

  const sortData = (a, b) => {
    const aValue = getSortValue(a, orderBy);
    const bValue = getSortValue(b, orderBy);
    
    // Get the sort type for this column
    const sortType = sortConfig[orderBy] || 'string';
    
    if (sortType === 'number') {
      const aNum = parseFloat(aValue) || 0;
      const bNum = parseFloat(bValue) || 0;
      return order === 'asc' ? aNum - bNum : bNum - aNum;
    } else {
      // Default to string sorting
      return order === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    }
  };

  const sortedData = Object.entries(data).sort(sortData);

  // Calculate totals for numeric columns
  const calculateTotals = () => {
    const totals = {};
    headers.forEach((header, index) => {
      if (index === 0) return; // Skip the first column (names/keys)
      
      const values = sortedData.map(([key, value]) => {
        if (Array.isArray(value)) {
          return value[index - 1];
        }
        return value;
      });
      
      // Check if this column contains numeric data
      const numericValues = values.filter(v => !isNaN(parseFloat(v)));
      if (numericValues.length > 0) {
        totals[index] = numericValues.reduce((sum, val) => sum + parseFloat(val), 0);
      }
    });
    return totals;
  };

  const totals = calculateTotals();

  // Check if this is filtered data (workflow table with filters applied)
  const isFiltered = sortedData.length > 0 && sortedData.length < Object.keys(data).length;

  return (
    <TableContainer style={{ maxWidth: '1200px' }}>
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
              {Array.isArray(value) ? (
                value.map((cell, index) => (
                  <TableCell key={index}>{cell}</TableCell>
                ))
              ) : (
                <TableCell>{value}</TableCell>
              )}
            </TableRow>
          ))}
          {/* Totals row */}
          <TableRow style={{backgroundColor: '#f5f5f5', fontWeight: 'bold'}}>
            <TableCell style={{fontWeight: 'bold'}}>
              {isFiltered ? 'FILTERED TOTAL' : 'TOTAL'}
            </TableCell>
            {headers.map((header, index) => {
              if (index === 0) return null; // Skip the first column
              
              if (totals[index] !== undefined) {
                // Format the total based on the column type
                if (header === 'Cost ($)') {
                  return <TableCell key={index} style={{fontWeight: 'bold'}}>${totals[index].toFixed(2)}</TableCell>;
                } else if (header === 'Minutes') {
                  return <TableCell key={index} style={{fontWeight: 'bold'}}>{totals[index].toLocaleString()}</TableCell>;
                } else {
                  return <TableCell key={index} style={{fontWeight: 'bold'}}>{totals[index]}</TableCell>;
                }
              } else {
                return <TableCell key={index} style={{fontWeight: 'bold'}}>-</TableCell>;
              }
            })}
          </TableRow>
          {/* Show overall total if data is filtered */}
          {isFiltered && (
            <TableRow style={{backgroundColor: '#e8f4fd', fontWeight: 'bold', borderTop: '2px solid #ccc'}}>
              <TableCell style={{fontWeight: 'bold', color: '#666'}}>OVERALL TOTAL</TableCell>
              {headers.map((header, index) => {
                if (index === 0) return null; // Skip the first column
                
                // Calculate overall total from all data
                const allValues = Object.values(data).map(value => {
                  if (Array.isArray(value)) {
                    return value[index - 1];
                  }
                  return value;
                });
                
                const numericValues = allValues.filter(v => !isNaN(parseFloat(v)));
                if (numericValues.length > 0) {
                  const overallTotal = numericValues.reduce((sum, val) => sum + parseFloat(val), 0);
                  
                  if (header === 'Cost ($)') {
                    return <TableCell key={index} style={{fontWeight: 'bold', color: '#666'}}>${overallTotal.toFixed(2)}</TableCell>;
                  } else if (header === 'Minutes') {
                    return <TableCell key={index} style={{fontWeight: 'bold', color: '#666'}}>{overallTotal.toLocaleString()}</TableCell>;
                  } else {
                    return <TableCell key={index} style={{fontWeight: 'bold', color: '#666'}}>{overallTotal}</TableCell>;
                  }
                } else {
                  return <TableCell key={index} style={{fontWeight: 'bold', color: '#666'}}>-</TableCell>;
                }
              })}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default FormattedTable;
