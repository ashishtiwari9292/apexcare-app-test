import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { GrFlagFill } from 'react-icons/gr';
import API from 'services/AxiosConfig';
import { Card, CardHeader, Modal, Spinner, NoData, Table, CardContent, ArchiveModal } from 'components';
import { SectionProps } from 'typings';
import { formatName, formatDate, generateUrl, sort } from 'lib';
import SensitiveIssuesModalContent from './SensitiveIssuesModalContent';
import { useAuth, useCompany } from 'hooks';
import { Link } from 'react-router-dom';
import parse from 'html-react-parser';

export function SensitiveIssues({ filter, data, type ,detail}: SectionProps) {
  const { locations } = useCompany()
  const { user } = useAuth()
  const [loading, setLoading] = useState<boolean>(true);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [expanded, setExpanded] = useState<boolean>(true);
  const [rows, setRows]: any[] = useState([]);
  const [archiveOpenModal, setArchiveOpenModal] = useState<boolean>(false)
  const [editOpenModal, setEditOpenModal] = useState<boolean>(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);

  const generateRows = (data: any) =>
    data.map((rowObj: any) => ({
      id: rowObj._id,
      flag: {
        value: rowObj.flag === true ? <GrFlagFill color="red" /> : <></>,
        style: { width: '5%' },
        selected: rowObj.flag === true,
      },
      status: {
        value: rowObj.active === true ? 'Open' : 'Closed',
        style: { width: '5%' },
      },
      location: { value: rowObj.location.location, style: { width: '5%' } },
      client: {
        value: rowObj.client ? <Link className='applicant-name-link' to={`/client/${rowObj.client._id}`}>{formatName(rowObj.client.firstName, rowObj.client.lastName)}</Link> : '',
        style: { width: '10%' },
      },
      carePartner: {
        value: rowObj.carePartner ? <Link className='applicant-name-link' to={`/care-partner/${rowObj.carePartner._id}`}>{formatName(rowObj.carePartner.firstName, rowObj.carePartner.lastName)}</Link> : '',
        style: { width: '10%' },
      },
      createdAt: { value: formatDate(rowObj.createdAt), style: { width: '10%' } },
      issue: { value: parse(rowObj.issue|| ''), style: { width: '25%' } },
      comments: { value: parse(rowObj.comments||''), style: { width: '25%',whiteSpace: "pre-wrap" } },
      state: {
        value: {
          flag:rowObj.flag,
          status:rowObj.active === true ? 'Open' : 'Closed',
          issue:rowObj.issue,
          comments:rowObj.comments,
          completedBy: rowObj.completedBy,
          completedAt: rowObj.completedAt,
          closingComments: rowObj.closingComments,
          clientObj: rowObj.client,
          carePartnerObj: rowObj.carePartner,
          location: rowObj.location,
          render: !rowObj.active,
        },
        style: {},
      },
    }));
    const generateDetailRows = (data: any) =>
    
    data.map((rowObj: any) => ({
      id: rowObj._id,
      createdBy: {
        value: rowObj.careManager? formatName(rowObj.careManager.firstName, rowObj.careManager.lastName) : '',
        style: { width: '15%' },
      },

      createdAt: { value: formatDate(rowObj.createdAt), style: { width: '15%' } },
      carePartner: {
        value: rowObj.carePartner ? formatName(rowObj.carePartner.firstName, rowObj.carePartner.lastName) : '',
        style: { width: '15%' },
      },

      issue: { value: parse(rowObj.issue || ''), style: { width: '40%' } },
      status: {
        value: rowObj.active === true ? 'Open' : 'Closed',
        style: { width: '30%' },
      },
      state: {
        value: {
          completedBy: rowObj.completedBy,
          completedAt: rowObj.completedAt,
          issue:rowObj.issue,
          comments:rowObj.comments,
          closingComments: rowObj.closingComments,
          clientObj: rowObj.client,
          carePartnerObj: rowObj.carePartner,
          location: rowObj.location,
          render: !rowObj.active,
  
        },
        style: {},
      },
    }));

  const fetchData = useCallback(() => {
    setLoading(true);
    setRows([]);
    const url = type ? `sensitive-issue?${type}Id=${data._id}` : generateUrl('sensitive-issue', filter, user._id, '', locations);
    API.get(url)
      .then((rsp: any) => {
        const data = rsp.data.data;
        detail ? setRows(generateDetailRows(data)) : setRows(generateRows(data));
        setLoading(false);
      })
      .catch((error: any) => {
        toast.error('Failed to load sensitive issues.');
        console.error(error);
        setLoading(false);
      });
  }, [filter,locations]);

  useEffect(() => {
    fetchData();
  }, [filter, fetchData]);
  useEffect(()=>{

  })

  const handleCloseModal = () => {
    fetchData();
    setOpenModal(false);
  };

  const editHandleCloseModal = () => {
    fetchData();
    setEditOpenModal(false);
  };

  const handleEdit = (row: any) => {
    setEditOpenModal(true);
    setSelectedRow(row);
  };

  const handleArchive = (row: any) => {
    setArchiveOpenModal(true);
    setSelectedRow(row);
  };

  const handleReactivate = () => {
    fetchData();
  };
  const archiveHandleCloseModal = () => {
    fetchData();
    setArchiveOpenModal(false);
  };
  const handleSort = (sortVal: string, type: string, ascending: boolean) => {
    setRows(sort(rows, sortVal, type, ascending, 'sensitiveIssues'));
  };

  return (
    <Card>
      <CardHeader title="Sensitive Issues" setOpenModal={setOpenModal} expanded={expanded} setExpanded={setExpanded} />
      <Modal open={openModal} closeHandler={handleCloseModal} title="Add Sensitive Issue">
        <SensitiveIssuesModalContent closeHandler={handleCloseModal} showType={type} data={data} />
      </Modal>
      {loading && <Spinner />}
      {!loading && (rows.length === 0 || locations.length === 0) && <NoData />}
      {!loading && rows.length > 0 && locations.length > 0 && (
        <CardContent expanded={expanded}>
          <Modal open={editOpenModal} closeHandler={editHandleCloseModal} title="Edit Sensitive Issue">
            <SensitiveIssuesModalContent
              closeHandler={editHandleCloseModal}
              selected={selectedRow}
              showType={type}
              data={data}
            />
          </Modal>
          <ArchiveModal
            open={archiveOpenModal}
            closeHandler={archiveHandleCloseModal}
            collectionName="sensitive-issue"
            selected={selectedRow}
            label="Sensitive Issue"
          />
          <Table
            columns={detail ? [
              'Created By',
              'Date Created',
              'Care Partner',
              'Issues & Concerns',
               'Status',
              '',
            ]:[
              'Flag',
              'Status',
              'Location',
              'Client',
              'Care Partner',
              'Created',
              'Issues & Concerns',
              'Comments',
              '',
            ]}
            rows={rows}
            handleArchive={handleArchive}
            handleReactivate={handleReactivate}
            handleEdit={handleEdit}
            tableName="sensitive-issue"
            hideArchive={filter.status && filter.status.value === 'Closed'}
            handleSort={handleSort}
            type={type}
          />
        </CardContent>
      )}
    </Card>
  );
}


