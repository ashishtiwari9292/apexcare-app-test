import React, { useState, useEffect, useCallback, Fragment } from 'react';
import Paper from '@mui/material/Paper';
import {
  PagingState,
  IntegratedPaging,
  SortingState,
  IntegratedSorting,
} from '@devexpress/dx-react-grid';
import _ from 'lodash'
import {
  Grid,
  Table,
  TableHeaderRow,
  TableColumnResizing,
  PagingPanel,
} from '@devexpress/dx-react-grid-material-ui';
import { GrFlagFill } from 'react-icons/gr';
import { IconButton } from '@mui/material';
import { NavLink } from 'react-router-dom';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';


function ResizeTable({
  rows,
  columns,
  sorting,
  setSorting,
  currentPage,
  setCurrentPage,
  pageSize,
  setPageSize,
  columnWidths,
  handleColumnWidthsChange,
  pageSizes,
  renderCompanyUrl = false

}) {

  const TableHeaderCell = ({ column, ...restProps }) => (
    <TableHeaderRow.Cell {...restProps}>
      {column.name !== '_id' ? (
        <Fragment>
          {restProps.children}
        </Fragment>
      ) : (
        <></>
      )}
    </TableHeaderRow.Cell>
  );

  const TableRow = ({ row, ...restProps }) => (
    // Access the row data here and customize your row
    <Table.Row {...restProps}
    >
    </Table.Row>
  );

  const TableCell = ({ column, value, ...restProps }) => (

    <Table.Cell {...restProps} style={column.name === '_id' ? { display: 'flex', justifyContent: 'flex-end', } : {}}>
      {((column.name === 'flagged' || column.name === 'flag') && value) ? <GrFlagFill color="red" /> : (column.name === '_id') ? <NavLink to={renderCompanyUrl ? `/marketing/company/${value}`:`/marketing/referral-partners/${value}`}><IconButton
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
        }}
        aria-label="Edit Item "
      >
        <AccountCircleIcon />
      </IconButton></NavLink> : value}
  
    </Table.Cell>
  );

  
  return (
    <Paper>
      <Grid rows={rows} columns={columns}>
        <SortingState
          sorting={sorting}
          onSortingChange={setSorting}
        />
        <IntegratedSorting />
        <PagingState
          currentPage={currentPage}
          onCurrentPageChange={setCurrentPage}
          pageSize={pageSize === 'All' ? rows.length : pageSize}
          onPageSizeChange={(size) => {
            setPageSize(size);
            if (size === 'All') {
              setCurrentPage(0);
            }
          }}
        />
        <IntegratedPaging />
        <Table rowComponent={TableRow} cellComponent={TableCell} />
        <TableColumnResizing
          columnWidths={columnWidths || columns.map((item) => ({ columnName: item.title, width: 100 }))}
          onColumnWidthsChange={handleColumnWidthsChange}
        />
        <TableHeaderRow showSortingControls cellComponent={TableHeaderCell} />
        <PagingPanel pageSizes={pageSizes} />
      </Grid>
    </Paper>
  );
}

export default ResizeTable;