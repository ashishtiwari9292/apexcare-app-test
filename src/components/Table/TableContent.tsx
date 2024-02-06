import { Link, NavLink } from 'react-router-dom';
import { TableRow, TableCell, TableBody, Stack } from '@mui/material';
import ArchiveIcon from '@mui/icons-material/Archive';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import DeleteIcon from '@mui/icons-material/Delete';
import { TableDropDown } from './TableDropDown';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DoneIcon from '@mui/icons-material/Done';
import React, { useEffect } from 'react'

interface TableContentProps {
  rows: any[];
  handleArchive?: (id: string) => void;
  handleEdit?: (id: string) => void;
  handleRemove?: (id: string) => void;
  type?: string;
  rowsPerPage: number;
  page: number;
  hideArchive?: boolean;
  tableName?: string;
  columns: any;
  handleEditDropDown?: (templateObj: any) => void;
  handleRemoveDropDown?: (id: any) => void;
  fetchData?: () => void;
  tableDropDownSort: any;
  pageChangeHandler?: any;
  currentRow: any,
  setCurrentRow: any
}

function TableContentDetails({
  type,
  rowsPerPage,
  rows,
  handleEdit = () => { },
  page,
  handleArchive = () => { },
  handleRemove = (id: any) => { },
  hideArchive,
  tableName,
  handleEditDropDown = () => { },
  handleRemoveDropDown = () => { },
  fetchData = () => { },
  columns,
  tableDropDownSort,
  pageChangeHandler,
  currentRow,
  setCurrentRow
}: TableContentProps): JSX.Element {
  const serverPaginationTypes:any = ['noScheduleReport','careManagerSinglePage',]
  const displayRows = rowsPerPage > 0 && !serverPaginationTypes.includes(type) ? rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) : rows;

  if ((type === 'applicants' || type === 'applicant-status' || type === 'care-manager-activities' || type === 'template' || type === 'userManagement' || type === 'awards-grouped' || tableName === 'awards-grouped' || type === 'referral-partners-detail')) {
    return (
      <>
        {rows.map((obj: any, i: any) => (
          <TableDropDown
            setCurrentRow={setCurrentRow}
            currentRow={currentRow}
            pageChangeHandler={pageChangeHandler}
            page={page}
            tableDropDownSort={tableDropDownSort}
            columns={columns}
            fetchData={fetchData}
            handleRemoveDropDown={handleRemoveDropDown}
            handleEditDropDown={handleEditDropDown}
            handleEdit={handleEdit}
            obj={obj}
            key={i} type={type || ''}
            handleArchive={handleArchive}
            hideArchive={hideArchive}
            handleRemove={handleRemove}
            tableName={tableName} />
        ))}
      </>
    );
  } else return (
    <>
      {displayRows.map((row: any, i: number) => (
        <>
          <TableRow key={row.id} style={{ backgroundColor: i % 2 === 0 ? '#F8F9FA' : 'white', borderBottom: 'none' }}>
   
            {Object.keys(row).map((key) => {
              if (key === 'id' || key === 'state') {
                return ""
              }
              if((key === 'description' || key === 'finalComments')&& (tableName === 'marketingManagement' || tableName === 'Marketing-Activities')){
               return ( <TableCell align="left" style={{...row[key]?.style,  borderBottom: 'none' }|| {}}>
                  <div className={'table-cell'}>{''}</div>
                </TableCell>)
              }
              return (
                <TableCell align="left" style={{...row[key]?.style,  borderBottom: 'none' }|| {}}>
                  <div className={tableName !== 'current-notes' ? "table-cell" : 'current-note-cell'}>{row[key]?.style ? row[key].value : typeof row[key] !== 'object' ? row[key] : null}</div>
                </TableCell>
              )
            })}

            <TableCell size="medium" align="center" style={type === 'current-notes' ? { float: 'right', borderBottom: 'none' } : { borderBottom: 'none' }}>
              <Stack direction="row" spacing={1} alignItems="flex-end" >
                {type === 'list' && (
                  <Link to={`/${row.careManager ? 'client' : 'care-partner'}/${row.id}`}>
                    <IconButton
                      sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        marginX: '2px',
                      }}
                      aria-label="Client Details"
                    >
                      <AccountCircleIcon />
                    </IconButton>
                  </Link>
                )}
                {type !== 'singleApplicant' && type !== 'list' && type !== 'detail' && type !== 'noScheduleReport' && type !== 'batchAdd' && type !== 'applicant-status' && type !== 'referral-partners' && type !== 'referral-partners-detail' && type !== 'companies' && (
                  <IconButton
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                    }}
                    aria-label="Edit Item"
                    onClick={(e) => handleEdit(row)}
                  >
                    <EditIcon />
                  </IconButton>
                )}
                {type !== 'applicantDetails' && tableName !== 'Marketing-Activities' && tableName !== 'marketingManagement' && !hideArchive && type !== 'detail' && tableName !== 'current-notes' && type !== 'noScheduleReport' && type !== 'batchAdd' && tableName !== 'prospects' && (
                  <IconButton
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                    }}
                    aria-label="Move To Archive"
                    onClick={(e) => handleArchive(row)}
                  >
                    {type === 'list' ? <RemoveCircleOutlineIcon /> : <ArchiveIcon />}
                  </IconButton>
                )}
                {hideArchive && tableName !== 'prospects-contacts' && tableName !== 'Marketing-Activities' && tableName !== 'marketingManagement' && tableName !== 'prospects' && type !== 'referral-partners' && type !== 'referral-partners-detail' && type !== 'companies' && tableName !== 'current-notes' && type !== 'singleApplicant' && type !== 'noScheduleReport' && type !== 'template' && type !== 'batchAdd' && type !== 'notes' && (
                  <IconButton
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                    }}
                    onClick={(e) => {
                      handleArchive(row);
                    }}
                  >
                    <UnarchiveIcon />
                  </IconButton>
                )}

                {type === 'current-notes' && (
                  <IconButton
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      visibility: 'hidden'
                    }}
                    onClick={(e) => {
                      handleArchive(row);
                    }}
                  >
                    <UnarchiveIcon />
                  </IconButton>
                )}

                {type === 'singleApplicant' &&
                  <NavLink to={`/recruiting/applicants/${row.state.id}`}>
                    <IconButton
                      sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                      }}
                      aria-label="Edit Item "
                    >
                      <AccountCircleIcon />
                    </IconButton>
                  </NavLink>}

                {type === 'referral-partners' &&
                  <NavLink to={`/marketing/referral-partners/${row?.state?.id}`}>
                    <IconButton
                      sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                      }}
                      aria-label="Edit Item "
                    >
                      <AccountCircleIcon />
                    </IconButton>
                  </NavLink>}

                {type === 'companies' &&
                  <NavLink to={`/marketing/company/${row?.state?.id}`}>
                    <IconButton
                      sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                      }}
                      aria-label="Edit Item "
                    >
                      <AccountCircleIcon />
                    </IconButton>
                  </NavLink>}
                {(tableName === 'Marketing-Activities' || tableName === 'marketingManagement' || type === 'notes' || tableName === 'prospects-contacts' || tableName === 'care-manager-activity-event') && (
                  <IconButton
                    sx={{
                      bgcolor: 'red',
                      color: 'white',
                      marginX: '2px',
                    }}
                    onClick={() => {
                      handleRemove && handleRemove(row)
                    }}
                    aria-label="Client Details"
                  >
                    <DeleteOutlineIcon />
                  </IconButton>
                )}

                {type !== 'list' && type !== 'detail' && type !== 'noScheduleReport' && type !== 'batchAdd' && type !== 'applicant-status' && row?.state?.hireDate && (
                  <IconButton
                    sx={{
                      background: 'green',
                      color: 'white',
                      cursor: "default"
                    }}
                    disableRipple
                    disableFocusRipple
                    className="hired"
                    aria-label="Hired"
                  >
                    <DoneIcon />
                  </IconButton>
                )}
              </Stack>
            </TableCell>
          </TableRow>
          {(tableName === 'prospects' && type === 'applicants') && <TableRow style={{ backgroundColor: i % 2 === 0 ? '#F8F9FA' : 'white', borderTop: 'none' }}>
            <TableCell></TableCell>
            <TableCell colSpan={8}>
              {row?.comments?.value}
            </TableCell>
            <TableCell colSpan={2}></TableCell>
          </TableRow>}
          {((tableName === 'marketingManagement')) && <TableRow style={{ backgroundColor: i % 2 === 0 ? '#F8F9FA' : 'white', borderTop: 'none' }}>
            <TableCell></TableCell>
            <TableCell colSpan={8}  >
              {row?.description?.value}
            </TableCell>
            <TableCell colSpan={2}></TableCell>
          </TableRow>}


          {((tableName === 'Marketing-Activities')) && <TableRow style={{ backgroundColor: i % 2 === 0 ? '#F8F9FA' : 'white', borderTop: 'none' }}>
            <TableCell></TableCell>
            <TableCell colSpan={7} >
              {row?.finalComments?.value}
            </TableCell >
            <TableCell colSpan={2}></TableCell>
          </TableRow>}
        </>
      ))}
    </>
  );
}
export function TableContent({
  type,
  rowsPerPage,
  rows,
  handleEdit,
  page,
  handleArchive,
  hideArchive = false,
  tableName,
  handleRemove,
  handleEditDropDown,
  handleRemoveDropDown,
  fetchData,
  columns,
  tableDropDownSort,
  pageChangeHandler,
  currentRow,
  setCurrentRow
}: TableContentProps) {
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  return (
    <TableBody>
      <TableContentDetails
        rows={rows}
        handleArchive={handleArchive}
        handleEdit={handleEdit}
        type={type}
        rowsPerPage={rowsPerPage}
        page={page}
        hideArchive={hideArchive}
        tableName={tableName}
        handleRemove={handleRemove}
        handleEditDropDown={handleEditDropDown}
        handleRemoveDropDown={handleRemoveDropDown}
        fetchData={fetchData}
        columns={columns}
        tableDropDownSort={tableDropDownSort}
        pageChangeHandler={pageChangeHandler}
        currentRow={currentRow}
        setCurrentRow={setCurrentRow}
      />
    </TableBody>
  );
}
