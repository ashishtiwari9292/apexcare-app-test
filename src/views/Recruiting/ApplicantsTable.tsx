import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import CardContent from '@mui/material/CardContent';
import { Card, CardHeader, Modal, Spinner, NoData, Table } from 'components';
import API from 'services/AxiosConfig';
import ApplicantsModalContent from './ApplicantsModalContent';
import { generateUrl, formatDate, sort, applicantSort } from 'lib';
import { useCompany } from 'hooks';
import { GrFlagFill } from 'react-icons/gr';
import parse from 'html-react-parser'
import { useFilter } from 'pages/Marketing/ReferralPartners/ReferralFilterContext';

export const ApplicantsTable = ({ filter, options }: any) => {
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
  const {toggleUpdateComponent} = useFilter()

  const handleCloseModal = () => {
    fetchData(type);
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
    setRows(applicantSort(rows, sortVal, type, ascending, 'applicants'));
  };

  const generateRows = (data: any) =>
    data.map((rowObj: any) => ({
      location: rowObj.location,
      count:rowObj.count,
      data: rowObj.data.map((item: any) => ({
        flag: {
          value: item.flag ? <GrFlagFill color="red" /> : <></>,
          style: { width: '5%' },
          selected: rowObj.flag === true,
        },
        status: item.active ? 'Active' : 'Inactive',
        name: { value: item.fullName, style: { width: '10%' } },
        activeDate: { value: new Date(item?.activeDate).toLocaleDateString(), style: { width: '8%' } },
        stage: { value: item?.stage.stage, style: { width: '8%' } },

        phone: { value: item?.phone, style: { width: '10%' } },
        comments: { value: parse(item?.comments || ""), style: { width: '40%' } },
        lastActivity: { value: item?.lastActivityAt ? formatDate(item.lastActivityAt) : '', style: { width: '15%' } },
        progress: item?.progress,
        state: { id: item._id, location: rowObj.location, source: item.source, lastActivityAt: formatDate(item.lastActivityAt), hired: item.hired, hireDate: item.hireDate, inactiveDate: item.inactiveDate, firstName: item.firstName, lastName: item.lastName, frontEnd: item.frontEnd,comments:item.comments },
      })),
    }));

  const generateSingleLocation = (data: any) =>
    data[0].data.map((item: any) => ({
      flag: {
        value: item.flag ? <GrFlagFill color="red" /> : <></>,
        style: { width: '5%' },
        selected: item.flag === true,
      },
      status: item.active ? 'Active' : 'Inactive',
      name: { value: item.fullName, style: { width: '10%' } },
      activeDate: { value: new Date(item?.activeDate).toLocaleDateString(), style: { width: '8%' } },
      stage: { value: item?.stage.stage, style: { width: '8%' } },
      phone: { value: item?.phone, style: { width: '10%' } },
      comments: { value: parse(item?.comments || ""), style: { width: '40%' } },
      lastActivity: { value: item?.lastActivityAt ? formatDate(item.lastActivityAt) : '', style: { width: '12%' } },
      progress: item?.progress,
      state: { id: item._id, location: data[0].location, source: item.source, hired: item.hired, hireDate: item.hireDate, firstName: item.firstName, lastName: item.lastName , comments:item.comments},
    }))

  const fetchData = (type:any) => {
    toggleUpdateComponent()
    const url = generateUrl('applicants', filter, '', type, locations);
    setLoading(true)
    API.get(`${url}&page=${page}&limit=${limit}`)
      .then((rsp: any) => {
        const data = rsp.data.data;
        setRows(data)
        setLoading(false);
      })
      .catch((error: any) => {
        toast.error('Failed to load Applicants.');
        console.error(error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData(type);
  }, [filter]);

  useEffect(()=>{
    fetchData(type);
    setLoading(false)
  },[type,page,limit])
  return (
    <Card>
      <CardHeader
        setOpenModal={setOpenModal}
        expanded={expanded}
        setExpanded={setExpanded}
        expandable={false}
        type={type}
        radioGroupLabel1='Front-End'
        radioGroupLabel2='Back-End'
        radioGroup={true}
        title="Applicants"
        setType={setType}
      />
      <Modal open={openModal} closeHandler={handleCloseModal}>
        <ApplicantsModalContent closeMe={handleCloseModal} options={options} />
      </Modal>
      {loading && <Spinner />}
      {!loading && rows?.length === 0 && <NoData />}
      {!loading && rows?.length > 0 && (
        <CardContent>
          <Modal open={editOpenModal} closeHandler={editHandleCloseModel}>
            <ApplicantsModalContent closeMe={editHandleCloseModel} currentRow={currentRow} options={options} />
          </Modal>
          <Table
            columns={[ 'Flag', 'Status', 'Name', 'Active', 'Stage', 'Phone', 'Comments', 'Last Activity']}
            rows={filter.location.value === 'All' ? generateRows(rows) : generateSingleLocation(rows)}
            handleEdit={editModal}
            type={filter.location.value === 'All' ? "applicants" : 'singleApplicant'}
            handleSort={handleSort}
            hideArchive={true}
            currentPage={page}
            pageChangeHandler={(page) => setPage(page)}
            currentRow={limit}
            setCurrentRow={(limit: any) => setLimit(limit)}
          />
        </CardContent>
      )}
    </Card>
  );
};
