import { useState, useEffect } from 'react';
import { TableRow, Stack, TableCell, Tooltip, TableFooter, TablePagination } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';
import { useAuth } from 'hooks';
import { NavLink } from 'react-router-dom';

import ArchiveIcon from '@mui/icons-material/Archive';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import DoneIcon from '@mui/icons-material/Done';
import API from 'services/AxiosConfig';
import { NoData } from 'components/NoData';
import { TableSort } from './TableSort';
import { CareManagerActivities } from 'views';
import { borderBottom } from '@mui/system';

interface dropDownProps {
  obj: any;
  handleEdit: (id: string) => void;
  type: string;
  handleArchive: (id: string) => void;
  hideArchive?: boolean;
  handleRemove?: (item: any) => void
  handleEditDropDown?: (templateObj: any) => void
  handleRemoveDropDown?: (id: any) => void;
  tableName?: string;
  fetchData?: () => void;
  columns: any;
  tableDropDownSort: any;
  page: any;
  pageChangeHandler: (page: any) => void;
  currentRow: any;
  setCurrentRow: any
}

const columnArr = ['daysActive', 'daysOfNoActivity', 'daysOfNoContact', 'daysInStage'];
const sortedColumns = [
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
  'Active Date',
  'Days Active',
  'Days No Activity',
  'Days in Stage',
  'Days No Contact',
  'Inquiry Date',
  'Inactive Date',
  'Stage',
  'Status'
];

export function TableDropDown({ setCurrentRow, currentRow, obj, pageChangeHandler, handleEdit, type, handleArchive, hideArchive, handleRemove, handleEditDropDown, handleRemoveDropDown, fetchData, tableName, columns, tableDropDownSort }: dropDownProps) {
  const { user } = useAuth();
  const [open, toggleOpen] = useState(type === 'applicants' ? (obj?.location === user.location.location) : type !== 'awards-grouped' ? localStorage.getItem('openActivities')?.includes(obj.location) : false);
  const { handleSortHelper, sortVal, isAscending } = tableDropDownSort
  const [page, setPage] = useState(0);
  const [numberOfRows, setNumberOfRows] = useState(10)
  const displayRows = numberOfRows > 0 && type !== 'noScheduleReport' ? obj?.data.slice(page * numberOfRows, page * numberOfRows + numberOfRows) : obj.data;




  const toggleOpenLocalStorage = (open: boolean) => {
    let openArr: any = localStorage.getItem('openActivities')
    openArr = JSON.parse(openArr)
    if (open) {
      !openArr.includes(obj.location) && openArr.push(obj.location)
      localStorage.setItem('openActivities', JSON.stringify(openArr))
      return;
    }
    if (openArr.length === 1) {
      localStorage.setItem('openActivities', JSON.stringify([]))
      return;
    }

    let removeIdx = openArr.indexOf(obj.location)

    openArr.splice(removeIdx, 1)
    localStorage.setItem('openActivities', JSON.stringify(openArr))
  }

  useEffect(() => {
    obj && localStorage.getItem('openActivities')?.includes(obj.location) && toggleOpen(true)
  }, [])

  return (
    <>
      <TableRow onClick={() => {
        if (obj?.data.length) {
          toggleOpenLocalStorage(!open)
          toggleOpen(!open)
        }
      }} className='applicant'>
        <TableCell colSpan={50} className='table-drop-down-cell'>
          <span className='expand-button-container'>
            <span className='expand-button-title'>
              {open ? (
                <ExpandMore className='expand-button' />
              ) : (
                <ExpandLess className='expand-button' />
              )}

              {obj.count ? `${obj?.location} (${obj?.count})` : obj.location}
            </span>
            <span className='template-icons'>
              {type === 'template' && <EditIcon onClick={(e) => {
                e.stopPropagation()
                handleEditDropDown && handleEditDropDown(obj)
              }} />}
              {type === 'template' && <DeleteIcon onClick={(e) => {
                e.stopPropagation()
                handleRemoveDropDown && handleRemoveDropDown(obj)
              }} />}
            </span>
          </span>
        </TableCell>
      </TableRow >
      {open &&
        <>
          {obj?.data.length ? <TableRow>
            {columns.map((c: any) => (
              c?.width ? <TableCell align={c?.span ? 'center' : "left"} style={{ width: c?.width, whiteSpace: "nowrap", borderLeft: c?.span ? '1px solid black' : '' }} colSpan={c?.span || 1}><div className='cell'>
                <div>{c.val}</div>
                {sortedColumns.includes(c.val) && <TableSort sort={handleSortHelper} column={c.val} sortVal={sortVal} isAscending={isAscending} />}
              </div> </TableCell> : <TableCell align={c?.span ? 'center' : "left"} colSpan={c?.span || 1} >
                <div className='cell' style={{ justifyContent: c?.span ? 'center' : 'flex-start' }}>
                  <div>{c?.val || c}</div>
                  {sortedColumns.includes(c) && <TableSort sort={handleSortHelper} column={c} sortVal={sortVal} isAscending={isAscending} />}
                </div> </TableCell>
            ))}          </TableRow> : null
          }

          {displayRows?.map((item: any, i: number) => {
            if (!item) return null
            return (
              <>
                <TableRow style={{ backgroundColor: i % 2 === 0 ? '#F8F9FA' : 'white' }} >
                  {Object.keys(item).map((key: any, ) => {
                    if (key === 'progress' || key === 'state' || key === 'id' ) return null
                    if((tableName === 'prospects' && type === 'applicants') || (tableName === 'marketingManagement' && type === 'care-manager-activities')||(type === 'care-manager-activities' && tableName === 'Marketing-Activities')){
                      if(key === 'finalComments' || key === 'description' || key === 'comments'){
                        return <TableCell colSpan = {2} style ={{borderBottom:'none'  }}></TableCell>
                      }
                    }

                    if (type === 'applicant-status') {
                      if (columnArr.includes(key)) {
                        return (<TableCell size="medium" align="center" style={item[key]?.style || {}}>
                          <span style={{ marginRight: '20%' }}>{item[key]?.style ? item[key].value : item[key]}</span>
                        </TableCell>)
                      }
                    }
                    if (type === 'userManagement' && user.location.location === item[key]) {
                      return (
                        <TableCell size="medium" align="left" style={item[key]?.style || {}}>
                          {item[key]?.style ? item[key].value : item[key]}
                        </TableCell>
                      )
                    }
                    if (type === 'care-manager-activities' && key !== 'finalComments') {
                      return (
                        <TableCell size="medium" align="left" style={{ ...item[key]?.style, borderBottom: 'none' } || {}}>
                          {item[key]?.style ? item[key].value : item[key]}
                        </TableCell>
                      )
                    }
                    if (key === 'fullName' && tableName === 'prospects' && type === 'applicants') {
                      return (
                        <TableCell size="medium" align="left" style={{...item[key]?.style, borderBottom:'none'} || {}}>
                          {item[key]?.style ? item[key].value : item[key]}
                        </TableCell>
                      )
                    }

                    if (key === 'fullName') {
                      return (
                        <TableCell size="medium" align="left" style={item[key]?.style || {}}>
                          {item[key]?.style ? item[key].value : item[key]}
                        </TableCell>
                      )
                    }

                    if (item?.state?.stage) {
                      return (
                        <Tooltip title={key}>
                          <TableCell size="medium" align="left" style={item[key]?.style || {}} >
                            {item[key]?.style ? item[key].value : item[key]}
                          </TableCell>
                        </Tooltip>
                      );
                    }
                    if (tableName === 'prospects' && type === 'applicants') {
                      return (<TableCell size="medium" align="left" style={{...item[key]?.style, borderBottom:'none'} || {}} >
                          {item[key]?.style ? item[key].value : item[key]}
                      </TableCell>
                      )
                    }

                    return (
                      <TableCell size="medium" align="left" style={item[key]?.style || {}}>
                        {item[key]?.style ? item[key].value : item[key]}
                      </TableCell>
                    );
                  })}
                  <TableCell size="medium" width="150px" style={{ borderBottom: 'none' }}>
                    <Stack direction="row" spacing={2} alignItems="flex-end">
                      {type !== 'applicants' && type !== 'userManagement' && type !== 'applicant-status' && type !== 'referral-partners-detail' &&
                        <IconButton
                          sx={{
                            bgcolor: 'primary.main',
                            color: 'white',
                          }}
                          aria-label="Edit   Item "
                        >
                          <EditIcon onClick={(e) => handleEdit(item)} />
                        </IconButton>
                      }
                      {type !== 'applicants' && type !== 'applicant-status' && type !== 'referral-partners-detail' && type !== 'template' && tableName !== 'Marketing-Activities' && tableName !== 'marketingManagement' && tableName !== 'care-manager-activity-event' &&
                        <IconButton
                          sx={{
                            bgcolor: 'primary.main',
                            color: 'white',
                          }}
                          aria-label="Move To Archive"
                          onClick={(e) => handleArchive(item)}
                        >
                          {hideArchive ? <UnarchiveIcon /> : <ArchiveIcon />}
                        </IconButton>
                      }
                      {type !== 'care-manager-activities' && type !== 'referral-partners-detail' && type !== 'userManagement' && type !== 'template' && type !== 'applicant-status' && type !== 'awards-grouped' && type !== 'sensitive-issues' && tableName !== 'recruiting' && tableName !== 'prospects' &&
                        <NavLink to={`/recruiting/applicants/${item.state.id}`}>
                          <IconButton
                            sx={{
                              bgcolor: 'primary.main',
                              color: 'white',
                            }}
                            aria-label="Edit   Item "
                          >
                            <AccountCircleIcon />
                          </IconButton>
                        </NavLink>
                      }
                      {tableName === 'prospects' && <NavLink to={`/marketing/prospects/${item.state.id}`}>
                        <IconButton
                          sx={{
                            bgcolor: 'primary.main',
                            color: 'white',
                          }}
                          aria-label="Edit   Item "
                        >
                          <AccountCircleIcon />
                        </IconButton>
                      </NavLink>
                      }
                      {tableName === 'prospects' && item?.state?.converted === true &&
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
                      }


                      {type !== 'userManagement' && type !== 'applicant-status' && item?.state?.hireDate &&
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
                      }

                      {type === 'userManagement' &&
                        <IconButton
                          sx={{
                            background: item.state.value.userLocation === item.location.value ? 'green' : 'grey',
                            color: item.state.value.userLocation === item.location.value ? 'white' : 'lightgrey',
                            cursor: item.state.value.userLocation === item.location.value ? "default" : 'pointer'
                          }}
                          disableRipple={item.state.value.userLocation === item.location.value}
                          disableFocusRipple={item.state.value.userLocation === item.location.value}
                          className="hired"
                          aria-label="Hired"
                          onClick={() => {
                            if (item.state.value.userLocation !== item.location.value) {
                              API.put(`user/edit/${item.state.value.userId}`, { location: item.state.value.locationId })
                                .then((data) => {
                                  fetchData && fetchData()
                                })

                            }

                          }}
                        >
                          <DoneIcon />
                        </IconButton>
                      }
                      {(type === 'template' || tableName === 'Marketing-Activities' || tableName === 'marketingManagement' || tableName === 'marketingActivities' || tableName === 'care-manager-activity-event') &&

                        <IconButton
                          sx={{
                            bgcolor: 'red',
                            color: 'white',
                            
                          }}
                          aria-label="Remove Item"
                          onClick={(e) => {
                            handleRemove && handleRemove(item)
                          }}
                        >
                          <DeleteOutlineIcon />
                        </IconButton>
                      }
                    </Stack>
                  </TableCell>
        
                </TableRow>
             {(tableName === 'prospects' && type === 'applicants') && <TableRow style={{ backgroundColor: i % 2 === 0 ? '#F8F9FA' : 'white' }}>
                  <TableCell></TableCell>
                  <TableCell colSpan={8}>
                    {item?.comments?.value}
                  </TableCell>
                  <TableCell colSpan = {2}></TableCell>
                </TableRow>}
             {((tableName === 'marketingManagement' && type === 'care-manager-activities') ) && <TableRow style={{ backgroundColor: i % 2 === 0 ? '#F8F9FA' : 'white' }}>
                  <TableCell></TableCell>
                  <TableCell colSpan ={8}  >
                    {item?.description?.value}
                  </TableCell>
                  <TableCell colSpan = {2}></TableCell>
                </TableRow>}


                {((type === 'care-manager-activities' && tableName === 'Marketing-Activities')) && <TableRow style={{ backgroundColor: i % 2 === 0 ? '#F8F9FA' : 'white' }}>
                  <TableCell></TableCell>
                  <TableCell colSpan={7} >
                    {item?.finalComments?.value}
                  </TableCell >
                  <TableCell colSpan = {3}></TableCell>
                </TableRow>}

              </>
            );
          })}

         

          {type !== 'template' && <TableRow>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              count={obj?.data.length}
              rowsPerPage={numberOfRows}
              page={page}
              SelectProps={{
                inputProps: {
                  'aria-label': 'rows per page',
                },
                native: true,
              }}
              onPageChange={(event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => setPage(newPage)}
              onRowsPerPageChange={(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                setNumberOfRows(parseInt(event.target.value, 10))
                setPage(0)
              }}
            />
          </TableRow>}

        </>}
    </>
  );
}