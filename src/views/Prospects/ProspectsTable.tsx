import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import CardContent from '@mui/material/CardContent';
import { Card, CardHeader, Modal, Spinner, NoData, Table } from 'components';
import ProspectsModal from './ProspectsModal';
import API from 'services/AxiosConfig';
import { generateUrl, formatCMDate, sort, applicantSort } from 'lib';
import { useCompany } from 'hooks';
import { GrFlagFill } from 'react-icons/gr';
import moment, { Moment } from 'moment';
import { useParams } from 'react-router-dom';
import { useFilter } from 'pages/Marketing/ReferralPartners/ReferralFilterContext';

export const ProspectTable = ({ filter, options, title, referralId }: any) => {
  const { locations } = useCompany()
  const [rows, setRows]: any[] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [editOpenModal, setEditOpenModal] = useState(false);
  const [currentRow, setCurrentRow] = useState({});
  const [type, setType] = useState('All');

  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const { referralPartnerId } = useParams()
  const {toggleUpdateComponent} = useFilter()

  const handleCloseModal = () => {
    referralId ? fetchReferralData(type) : fetchData(type);
    setOpenModal(false);
  };

  const editHandleCloseModel = () => {
    fetchData(type);
    setEditOpenModal(false);
  };

  const editModal = (currentRowVal: any) => {
    setCurrentRow(currentRowVal);
    setEditOpenModal(true);
  };
  const handleSort = (sortVal: string, type: string, ascending: boolean) => {
    setRows(applicantSort(rows, sortVal, type, ascending, 'prospects'));
  };

  const generateRows = (data: any) =>
    data.map((rowObj: any) => ({
      location: rowObj.location,
      count: rowObj.count,
      data: rowObj.data.map((item: any) => ({
        flag: {
          value: item.flagged ? <GrFlagFill color="red" /> : <></>,
          style: { width: '5%' },
          selected: rowObj.flag === true,
        },
        status: { value: item?.status === true ? "Active" : 'Inactive', style: { width: '10%' } },
        fullName: { value: item?.fullName, style: { width: '25%' } },
        inquiryDate: { value: formatCMDate(item?.activeDate), style: { width: '15%' } },
        stage: { value: item?.stage?.type, style: { width: '15%' } },
        lead: { value: item?.leadSource?.type, style: { width: '60%' } },
        comments: { value: item?.comments, style: { width: '1%' } },
        lastActivityAt: { value: formatCMDate(item?.lastActivityAt) || '', style: { width: '30%' } },
        state: { id: item._id, location: rowObj.location, source: item.source, lastActivityAt: formatCMDate(item.lastActivityAt), hired: item.hired, hireDate: item.hireDate, inactiveDate: item.inactiveDate, firstName: item.firstName, lastName: item.lastName, frontEnd: item.frontEnd, converted: item.converted },
      })),
    }));

  function allDataEmpty(rows: any): boolean {
    return rows.every((row: any) => row.data.length === 0);
  }
  const generateDetailRows = (data: any) =>
    data.map((rowObj: any) => ({
      location: rowObj.location,
      count: rowObj.count,
      data: rowObj.data.map((item: any) => ({
        flag: {
          value: item.flagged ? <GrFlagFill color="red" /> : <></>,
          style: { width: '5%' },
          selected: rowObj.flag === true,
        },
        location: { value: item?.location?.location, style: { width: '10%' } },
        fullName: { value: item?.fullName, style: { width: '15%' } },
        inquiryDate: { value: formatCMDate(item?.activeDate), style: { width: '10%' } },
        inactiveDate: { value: formatCMDate(item?.inactiveDate), style: { width: '12%' } },
        stage: { value: item?.stage?.type, style: { width: '90%' } },
        comments: { value: item?.comments, style: { width: '1%' } },
        state: { id: item._id, location: rowObj.location, source: item.source, lastActivityAt: formatCMDate(item.lastActivityAt), hired: item.hired, hireDate: item.hireDate, inactiveDate: item.inactiveDate, firstName: item.firstName, lastName: item.lastName, frontEnd: item.frontEnd, converted: item.converted },
      })),
    }));


  const getISOString = (date: string | Moment) => {
    if (!moment.isMoment(date)) {
      return moment(date).endOf('day').toISOString();
    }
    return date.endOf('day').toISOString();
  };

  const fetchData = (type: any) => {
    toggleUpdateComponent()
    let range: any = { startDate: '', endDate: '' };
    const { startDate, endDate, dateRange, activity } = filter;

    if (dateRange?.value === 'Custom' && startDate?.value && endDate?.value) {
      range = { startDate: getISOString(startDate.value), endDate: getISOString(endDate.value) };
  } else if (dateRange?.value && Number(dateRange?.id)) {
      if (dateRange?.id < 0) {
        const end = moment().subtract(Number(dateRange.id), 'd');
        range = { startDate: getISOString(moment()), endDate: getISOString(end) };
      } else if (filter?.awardType) {
        const start = moment().subtract(Number(dateRange.id), 'month');
        range = { startDate: getISOString(start), endDate: getISOString(moment()) };
      } else {
        const start = moment().subtract(Number(dateRange.id), 'd');
        range = { startDate: getISOString(start), endDate: getISOString(moment()) };
      }
    }
    setLoading(true)
    let loc: any = []
    if (locations && filter?.location?.value === 'All') {
      loc = locations.map((locationObj) => {
        return locationObj._id
      })
      loc = loc.join(',')
    }
    if (filter?.location?.value !== 'All') {
      loc = filter?.location?.id
    }

    API.get(`/prospects?locations=${loc}&type=${type}&page=${page}&limit=${limit}&status=${filter.status.value}&startDate=${range.startDate}&endDate=${range.endDate}&flag=${filter.flag}&prospect=${filter?.prospect?.id}&stage=${filter?.stage?.id}`)
      .then((rsp: any) => {
        const data = rsp.data.data;
        setRows(data)
        setLoading(false);
      })
      .catch((error: any) => {
        toast.error('Failed to load Prospects.');
        console.error(error);
        setLoading(false);
      });
  };

  

  const fetchReferralData = (type: any) => {

    setLoading(true)
    let loc: any = []
    if (locations && filter?.location?.value === 'All') {
      loc = locations.map((locationObj) => {
        return locationObj._id
      })
      loc = loc.join(',')
    }
    if (filter?.location?.value !== 'All') {
      loc = filter?.location?.id
    }

    API.get(`/prospects?locations=${loc}&type=${type}&page=${page}&limit=${limit}&referral=${referralPartnerId}`)
      .then((rsp: any) => {
        const data = rsp.data.data;
        setRows(data)
        setLoading(false);
      })
      .catch((error: any) => {
        toast.error('Failed to load Prospects.');
        console.error(error);
        setLoading(false);
      });
  };



  useEffect(() => {

    referralPartnerId ? fetchReferralData(type) : fetchData(type);
    setLoading(false)
  }, [type, page, limit, referralPartnerId, filter])

  return (
    <Card>
      <CardHeader
        setOpenModal={setOpenModal}
        expanded={expanded}
        setExpanded={setExpanded}
        expandable={false}
        type={type}
        title={title || ''}
        setType={setType}
        radioGroup
        radioGroupLabel1='Outside Sales'
        radioGroupLabel2='Inside Sales'
        renderAll
        
      />
      <Modal open={openModal}
       closeHandler={handleCloseModal} styles={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '50%',
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
        height: '90%',
        overflowY: 'scroll'
      }}

      >
        <ProspectsModal closeMe={handleCloseModal}  />
      </Modal>
      {loading && <Spinner />}
      {!loading && allDataEmpty(rows) && <NoData />}
      {!loading && !allDataEmpty(rows) && (
        <div style={{ width: '96%', marginLeft: '2%' }}>
          <CardContent >
            <Modal open={editOpenModal} closeHandler={editHandleCloseModel}>

            </Modal>
            <Table
              columns={referralId ? ['Flag', 'Location', 'Name', 'Active Date', 'Inactive Date', 'Stage', ] : ['Flag', 'Status', 'Name', 'Active Date', 'Stage', 'Lead Source',  'Last Activity']}
              rows={referralId ? generateDetailRows(rows) : generateRows(rows)}
              handleEdit={editModal}
              type={"applicants"}
              handleSort={handleSort}
              hideArchive={true}
              currentPage={page}
              pageChangeHandler={(page) => setPage(page)}
              currentRow={limit}
              setCurrentRow={(limit: any) => setLimit(limit)}
              tableName='prospects'
            />
          </CardContent>
        </div>
      )}
    </Card>
  );
};
