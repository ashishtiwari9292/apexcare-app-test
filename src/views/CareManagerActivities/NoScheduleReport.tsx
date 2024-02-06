import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import API from 'services/AxiosConfig';
import { Card, CardHeader, Modal, Spinner, NoData, Table, CardContent } from 'components';
import { formatName, formatDate, sort } from 'lib';
import CareManagerActivitiesModalContent from './CareManagerActivitiesModalContent';
import { useCompany } from 'hooks';
export function NoScheduleReport({ filter, data, type, mainPageFilter }: any) {
  const { locations } = useCompany()
  const [loading, setLoading] = useState<boolean>(false);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [expanded, setExpanded] = useState<boolean>(true);
  const [rows, setRows]: any[] = useState([]);
  const [archiveOpenModal, setArchiveOpenModal] = useState<boolean>(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [page,setPage] = useState(0);
  const [rowsPerPage,setRowsPerPage] = useState(10)
  const [count,setCount] = useState();
  const [sort, setSort] = useState<string>();
  const [ascending, setAscending] = useState<number>();

  const generateRows = (data: any[]) =>
    data.map((rowObj: any) => ({
      id: rowObj?.activityEvent?._id || '',
      location: { value: rowObj?.location?.location || '', style: { width: '10%' } },
      client: {
        value: rowObj ? formatName(rowObj?.firstName, rowObj?.lastName) : '',
        style: { width: '10%' },
      },
      careManager: {
        value: rowObj?.careManager ? formatName(rowObj?.careManager?.firstName, rowObj?.careManager?.lastName) : '',
        style: { width: '12%' },
      },
      lastActivityDate: { value: formatDate(rowObj?.activityEvent?.date), style: { width: '12%' } },
      activity: { value: rowObj?.activity?.activity, style: { width: '10%' } },
      comments: { value: rowObj?.activityEvent?.additionalComments, style: { width: '25%' } },
      state: {
        value: {
          completedBy: rowObj?.completedBy,
          completedAt: rowObj?.activityEvent?.completedAt,
          closingComments: rowObj?.activityEvent?.closingComments,
          render: !rowObj?.activityEvent?.active,
        },
        style: {},
      },
    }));

  const fetchData = (skip:any = null, rowsPerPage:any = null, sort:any = null, ascending:any = null) => {
    let url = "client/noactivities?numberOfMonths=";
    url += filter.numberOfDays.id !== 'Custom' ? filter.numberOfDays.id : filter.numberOfMonths.id
    let loc: any = []
    if (locations) {
      loc = locations.map((locationObj) => {
        return locationObj._id
      })
    }
    loc = loc.join(',')
    url += mainPageFilter.location.id === '0' ? `&locationId=${loc}` : `&locationId=${mainPageFilter.location.id}`
    url += `&limit=${rowsPerPage}&skip=${skip}&sort=${sort}&ascending=${ascending}`
    API.get(url)
      .then((rsp: any) => {
        const data = rsp.data.data;
        setCount(rsp.data.count)
        setRows(generateRows(data));
      });
  };

  useEffect(() => {
    console.log('type',type)
    setLoading(true)
    fetchData()
    setLoading(false)
  }, [filter, mainPageFilter,type]);

  useEffect(()=>{
    fetchData(page, rowsPerPage, sort, ascending);
  },[page, rowsPerPage, sort, ascending])
  
  const handleCloseModal = () => {
    fetchData();
    setOpenModal(false);
  };
  const handleArchive = (row: any) => {
    setArchiveOpenModal(true);
    setSelectedRow(row);
  };
  const handleReactivate = () => {
    fetchData();
  };
  const handleSort = (sortVal: string, type: string, ascending: boolean) => {
    setAscending(ascending ? 1 : -1);
    switch(sortVal) {
      case 'Client':
        setSort('firstName');
        break;
      case 'Care Manager':
        setSort('careManager.firstName');
        break;
      case 'Last Activity Date':
        setSort('activityEvent.date');
        break;
      case 'Activity':
        setSort('activity.activity');
        break;
    }
  };
  return (
    <Card>

      <CardHeader title="Client's No Activity Report" setOpenModal={setOpenModal} expanded={expanded} setExpanded={setExpanded} />
      <Modal open={openModal} closeHandler={handleCloseModal} title="Add Care Manager Activity">
        <CareManagerActivitiesModalContent closeHandler={handleCloseModal} showType={type} data={data} renderButtons />
      </Modal>
      {loading && <Spinner />}
      {((!loading && rows.length === 0) || locations.length === 0)  && <NoData />}
      {!loading && rows.length > 0 && locations.length > 0 && (
        <CardContent expanded={expanded}>
          <Table
            columns={[
              'Location',
              'Client',
              'Care Manager',
              'Last Activity Date',
              'Activity',
              'Comments',
              '',
            ]}
            rows={rows}
            handleArchive={handleArchive}
            handleReactivate={handleReactivate}
            handleEdit={() => { }}
            tableName="sensitive-issue"
            hideArchive={true}
            handleSort={handleSort}
            type={type}
            pageChangeHandler = {setPage}
            currentPage = {page}
            currentRow = {rowsPerPage}
            setRowsPer = {setRowsPerPage}
            currentCount = {count}
          />
        </CardContent>
      )}
    </Card>
  );
}
