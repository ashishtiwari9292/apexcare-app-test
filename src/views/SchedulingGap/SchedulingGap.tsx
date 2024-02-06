import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { GrFlagFill } from 'react-icons/gr';
import API from 'services/AxiosConfig';
import { Card, CardHeader, Modal, Spinner, NoData, Table, CardContent, ArchiveModal } from 'components';
import { SectionProps } from 'typings';
import { formatName, formatDate, generateUrl, renderColor, sort, formatCMDate, colorCode } from 'lib';
import SchedulingGapModalContent from './SchedulingGapModalContent';
import { useAuth, useCompany } from 'hooks';
import { Link } from 'react-router-dom';
import parse from 'html-react-parser';


export function SchedulingGap({ filter, data, type, detail }: SectionProps) {
  const { user } = useAuth()
  const { locations } = useCompany()
  const [loading, setLoading] = useState<boolean>(true);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [expanded, setExpanded] = useState<boolean>(true);
  const [rows, setRows]: any[] = useState([]);
  const [archiveOpenModal, setArchiveOpenModal] = useState<boolean>(false);
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
        style: { width: '5%', color: colorCode(rowObj.dueDate) },
      },
      location: { value: rowObj.location.location, style: { width: '5%', color: colorCode(rowObj.dueDate) } },
      dueDate: { value: formatCMDate(rowObj.dueDate), style: { width: '10%', color: colorCode(rowObj.dueDate) } },
      createdAt: { value: formatDate(rowObj.createdAt), style: { width: '10%', color: colorCode(rowObj.dueDate) } },
      client: {
        value: rowObj.client ? <Link className='applicant-name-link' to={`/client/${rowObj.client._id}`}>{formatName(rowObj.client.firstName, rowObj.client.lastName)}</Link> : '',
        style: { width: '10%', color: colorCode(rowObj.dueDate) },
      },
      dateTime: {
        value: parse(rowObj.dateTime||''),
        style: { width: '15%', color: colorCode(rowObj.dueDate) },
      },
      comments: { value: parse(rowObj.comments|| ''), style: { width: '35%', color: colorCode(rowObj.dueDate), whiteSpace: "pre-wrap" } },
      state: {
        value: {
          flag: rowObj.flag,
          dueDate: rowObj.dueDate,
          completedBy: rowObj.completedBy,
          completedAt: rowObj.completedAt,
          dateTime: rowObj.dateTime,
          comments: rowObj.comments,
          closingComments: rowObj.closingComments,
          clientObj: rowObj.client,
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
        value: rowObj.createdBy ? formatName(rowObj.createdBy.firstName, rowObj.createdBy.lastName) : '',
        style: { width: '10%', color: colorCode(rowObj.completedAt) },
      },
      dueDate: { value: formatDate(rowObj.dueDate), style: { width: '10%', color: colorCode(rowObj.dueDate) } },
      createdAt: { value: formatDate(rowObj.createdAt), style: { width: '10%', color: colorCode(rowObj.dueDate) } },
      dateCompleted: {
        value: rowObj.completedAt ? formatDate(rowObj.completedAt) : '',
        style: { width: '10%', color: colorCode(rowObj.completedAt) },
      },
      completedBy: {
        value: rowObj.completedBy ? formatName(rowObj.completedBy.firstName, rowObj.completedBy.lastName) : '',
        style: { width: '10%', color: colorCode(rowObj.completedAt) },
      },
      dateTime: {
        value: parse(rowObj.dateTime || ''),
        style: { width: '15%', color: colorCode(rowObj.dueDate) },
      },
      comments: { value: parse(rowObj.comments || ''), style: { width: '35%', color: colorCode(rowObj.dueDate) } },
      status: {
        value: rowObj.active === true ? 'Open' : 'Closed',
        style: { width: '5%', color: colorCode(rowObj.dueDate), whiteSpace: "pre-wrap" },
      },
      state: {
        value: {
          flag: rowObj.flag,
          dueDate: formatDate(rowObj.dueDate),
          completedBy: rowObj.completedBy,
          completedAt: rowObj.completedAt,
          dateTime: rowObj.dateTime,
          comments: rowObj.comments,
          closingComments: rowObj.closingComments,
          clientObj: rowObj.client,
          location: rowObj.location,
          render: !rowObj.active,
        },
        style: {},
      },
    }));


  const fetchData = useCallback(() => {
    setLoading(true);
    setRows([]);

    const url = type ? `scheduling-gap?${type}Id=${data._id}` : generateUrl('scheduling-gap', filter, user._id, "", locations);
    API.get(url)
      .then((rsp: any) => {
        const data = rsp.data.data;
        detail ? setRows(generateDetailRows(data)) : setRows(generateRows(data));
        setLoading(false);
      })
      .catch((error: any) => {
        toast.error('Failed to load Scheduling Gap.');
        console.error(error);
        setLoading(false);
      });
  }, [filter, locations]);

  useEffect(() => {
    fetchData();
  }, [filter, fetchData]);

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

  const archiveHandleCloseModal = () => {
    fetchData();
    setArchiveOpenModal(false);
  };
  const handleReactivate = () => {
    fetchData();
  };
  const handleSort = (sortVal: string, type: string, ascending: boolean) => {
    setRows(sort(rows, sortVal, type, ascending, 'schdeulingGap'));
  };

  return (
    <Card>
      <CardHeader title="Action Required" setOpenModal={setOpenModal} expanded={expanded} setExpanded={setExpanded} />
      <Modal open={openModal} closeHandler={handleCloseModal} title="Add Action Required">
        <SchedulingGapModalContent closeHandler={handleCloseModal} showType={type} data={data} />
      </Modal>
      {loading && <Spinner />}
      {!loading && (rows.length === 0 || locations.length === 0) && <NoData />}
      {!loading && rows.length > 0 && locations.length > 0 && (
        <CardContent expanded={expanded}>
          <Modal open={editOpenModal} closeHandler={editHandleCloseModal} title="Edit Action Required">
            <SchedulingGapModalContent
              closeHandler={editHandleCloseModal}
              selected={selectedRow}
              showType={type}
              data={data}
            />
          </Modal>
          <ArchiveModal
            open={archiveOpenModal}
            closeHandler={archiveHandleCloseModal}
            collectionName="scheduling-gap"
            selected={selectedRow}
            label="Action Required"
          />
          <Table
            columns={detail ? ['Created By', 'Date Due', 'Date Created', 'Date Completed', 'Completed By', 'Date & Time', 'Comments', 'Status'] : ['Flag', 'Status', 'Location', 'Due Date', 'Created', 'Client', 'Date & Time', 'Comments', '']}
            rows={rows}
            handleArchive={handleArchive}
            handleEdit={handleEdit}
            tableName="scheduling-gap"
            handleReactivate={handleReactivate}
            hideArchive={filter.status && filter.status.value === 'Closed'}
            handleSort={handleSort}
          />
        </CardContent>
      )}
    </Card>
  );
}


