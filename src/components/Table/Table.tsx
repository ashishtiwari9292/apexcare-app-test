import React, { useEffect, useState } from 'react';
import {
  TableContainer,
  Table as MuiTable,
  TableHead,
  TableRow,
  Paper,
  TableCell,
  TableFooter,
  TablePagination,
} from '@mui/material';
import { TableContent } from './TableContent';
import { TableSort } from './TableSort';
interface TableProps {
  columns: any[];
  rows: any[];
  handleArchive?: (id: string) => void;
  handleReactivate?: () => void;
  handleEdit?: (id: string) => void;
  type?: string;
  hideArchive?: boolean;
  tableName?: string;
  handleSort?: (sortVal: string, type: string, ascending: boolean) => void;
  handleEditDropDown?: (templateObj: any) => void;
  handleRemoveDropDown?: (id: any) => void;
  pageChangeHandler?: (page: any) => void;
  setRowsPer?: (rowsPer: any) => void;
  currentPage?: number;
  currentRow?: number;
  currentCount?: number;
  handleRemove?: (id: any) => void;
  fetchData?: () => void;
  setCurrentRow?: any
  rowsPer?: any
}

const sortedColumns = [
  'Date Due',
  'Due Date',
  'Created',
  'Client',
  'Care Manager',
  'Follow-Up Date',
  'Care Partner',
  'Date',
  'Activity',
  'Name',
  'Last Activity',
  'Full Name',
  'Email',
  'FullName',
  'Active Date',
  'Last Activity Date',
  'Date Created',
  'Date Completed',
  'Completed By',
  'Created By',
  'Inquiry Date',
  'Completed Date',
  'Activity Type'
];

export function Table({
  columns,
  rows,
  handleArchive = () => { },
  handleEdit = () => { },
  handleRemove = (id: any) => { },
  type,
  tableName,
  hideArchive = false,
  handleSort = () => { },
  handleEditDropDown = () => { },
  handleRemoveDropDown = () => { },
  pageChangeHandler = () => { },
  setRowsPer = () => { },
  currentPage,
  currentRow,
  currentCount,
  fetchData = () => { },
  setCurrentRow,
  rowsPer
}: TableProps) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(type === 'list' ? 50 : tableName === 'scheduling-gap' ? -1 : rowsPer || 10);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setRowsPer(parseInt(event.target.value, 10))
    setPage(0);
  };
  const [sortVal, setSortVal] = useState<string>('');
  const [isAscending, setIsAscending] = useState<boolean>(false);

  const handleSortHelper = (sortVal: string, type: string, ascending: boolean) => {
    setSortVal(sortVal);
    setIsAscending(ascending);
    handleSort(sortVal, type, ascending);
  }

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
    pageChangeHandler && pageChangeHandler(newPage)
  };
  
  return (
    <TableContainer component={Paper}>
      <MuiTable size="medium" sx={{ minWidth: 500, fontSize: 12 }} aria-label="custom pagination table">
        {type !== "userManagement" && type !== "applicants" && type !== 'care-manager-activities' && type !== 'applicant-status' && type !== 'referral-partners-detail' && <TableHead>
          <TableRow>
            {columns.map((c: any) => (
              c?.width ? <TableCell align={c?.span ? 'center' : "left"} style={{ width: c?.width, whiteSpace: "nowrap", borderLeft: c?.span ? '1px solid black' : '' }} colSpan={c?.span || 1}><div className='cell'>
                <div>{c.val}</div>
                {sortedColumns.includes(c.val) && type !== 'applicant-status' && <TableSort sort={handleSortHelper} column={c.val} sortVal={sortVal} isAscending={isAscending} />}
              </div> </TableCell> : <TableCell align={c?.span ? 'center' : "left"} colSpan={c?.span || 1} >
                <div className='cell' style={{ justifyContent: c?.span ? 'center' : 'flex-start' }}>
                  <div>{c?.val || c}</div>
                  {sortedColumns.includes(c) && type !== 'applicant-status' && <TableSort sort={handleSortHelper} column={c} sortVal={sortVal} isAscending={isAscending} />}
                </div> </TableCell>
            ))}
          </TableRow>
        </TableHead>}
        <TableContent
          rows={rows}
          handleArchive={handleArchive}
          handleEdit={handleEdit}
          type={type}
          rowsPerPage={rowsPerPage}
          page={currentPage || page}
          hideArchive={hideArchive}
          tableName={tableName}
          handleRemove={handleRemove}
          handleEditDropDown={handleEditDropDown}
          handleRemoveDropDown={handleRemoveDropDown}
          fetchData={fetchData}
          columns={[...columns, ""]}
          tableDropDownSort={{ handleSortHelper: handleSortHelper, sortVal: sortVal, isAscending: isAscending }}
          pageChangeHandler={pageChangeHandler}
          currentRow={currentRow}
          setCurrentRow={setCurrentRow}
        />
        {type !== 'detail' && type !== 'care-manager-activities' && type !== 'applicants' && type != 'applicant-status' && type !== 'batchAdd' && type !== 'userManagement' && (
          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50, { label: 'All', value: -1 }]}
                count={currentCount || rows.length}
                rowsPerPage={type === 'singleApplicant' ? rowsPerPage : currentRow || rowsPerPage}
                page={currentPage || page}
                SelectProps={{
                  inputProps: {
                    'aria-label': 'rows per page',
                  },
                  native: true,
                }}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </TableRow>
          </TableFooter>
        )}
      </MuiTable>
    </TableContainer>
  );
}