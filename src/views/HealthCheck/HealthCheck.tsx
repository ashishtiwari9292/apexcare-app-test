import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { GrFlagFill } from 'react-icons/gr';
import API from 'services/AxiosConfig';
import { Card, CardHeader, Modal, Spinner, NoData, Table, CardContent, ArchiveModal } from 'components';
import { SectionProps } from 'typings';
import { formatName, formatDate, generateUrl, renderColor, sort, colorCode } from 'lib';
import HealthCheckModalContent from './HealthCheckModalContent';
import { useCompany } from 'hooks'
import { Link } from 'react-router-dom';
import parse from 'html-react-parser';

type TypeObj = {
  client?: any;
  carePartner?: any;
};

export function HealthCheck({ filter, data, showType, detail }: SectionProps) {
  const { locations } = useCompany()
  const [loading, setLoading] = useState<boolean>(true);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [expanded, setExpanded] = useState<boolean>(true);
  const [rows, setRows]: any[] = useState([]);
  const [archiveOpenModal, setArchiveOpenModal] = useState<boolean>(false);
  const [editOpenModal, setEditOpenModal] = useState<boolean>(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [type, setType] = useState('All');


  const createTypeObject = (rowObj: any) => {
    let typeObj: TypeObj = {
      client: {
        value: rowObj.client ? <Link className='applicant-name-link' to={`/client/${rowObj.client._id}`}>{formatName(rowObj.client.firstName, rowObj.client.lastName)}</Link> : '',
        style: { width: '12%', color: colorCode(rowObj.followupDate) },
      },

     
      carePartner: {
        value: rowObj.carePartner ? <Link className='applicant-name-link' to={`/care-partner/${rowObj.carePartner._id}`}>{formatName(rowObj.carePartner.firstName, rowObj.carePartner.lastName)}</Link> : '',
        style: { width: '12%', color: colorCode(rowObj.followupDate) },
      },
    };
    if (type === 'Client') {
      delete typeObj.carePartner;
    }
    if (type === 'Care Partner') {
      delete typeObj.client;
    }
    return typeObj;
  };

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
        style: { width: '5%', color: colorCode(rowObj.followupDate) },
      },
      location: { value: rowObj.location.location, style: { width: '5%', color: colorCode(rowObj.followupDate) } },
      followupDate: {
        value: formatDate(rowObj.followupDate),
        style: { width: '12%', color: colorCode(rowObj.followupDate) },
      },
      createdAt: {
        value: formatDate(rowObj.createdAt),
        style: { width: '10%', color: colorCode(rowObj.followupDate) },
      },
      ...createTypeObject(rowObj),
      healthSummary: {
        value: parse(rowObj.healthSummary || ''),
        style: { width: type === 'All' ? '25%' : '30%', color: colorCode(rowObj.followupDate) },
      },
      comments: {
        value: parse(rowObj.comments || ''),
        style: {
          width: type === 'All' ? '25%' : '30%',
          color: colorCode(rowObj.followupDate),
          whiteSpace: "pre-wrap"
        },
      },
      state: {
        value: {
          flag:rowObj.flag,
          followUpDate:rowObj.followupDate,
          completedBy: rowObj.completedBy,
          completedAt: rowObj.completedAt,
          healthSummary:rowObj.healthSummary,
          comments:rowObj.comments,
          closingComments: rowObj.closingComments,
          render: !rowObj.active,
          clientObj: rowObj.client,
          carePartnerObj: rowObj.carePartner,
          location: rowObj.location,
        },
        style: {},
      },
    }));

    const generateDetailRows = (data: any) =>
    data.map((rowObj: any) => ({
      id: rowObj._id,
      createdBy: {
        value: rowObj.createdBy ? formatName(rowObj.createdBy.firstName, rowObj.createdBy.lastName) : '',
        style: { width: '12%', color: colorCode(rowObj.followupDate) },
      },
      followupDate: {
        value: formatDate(rowObj.followupDate),
        style: { width: '12%', color: colorCode(rowObj.followupDate) },
      },
      createdAt: {
        value: formatDate(rowObj.createdAt),
        style: { width: '10%', color: colorCode(rowObj.followupDate) },
      },
      dateCompleted: {
        value: '',
        style: { width: '10%', color: colorCode(rowObj.completedAt) },
      },
      completedBy: {
        value: rowObj.completedBy ? formatName(rowObj.completedBy.firstName, rowObj.completedBy.lastName) : '',
        style: { width: '12%', color: colorCode(rowObj.followupDate) },
      },
      healthSummary: {
        value: parse(rowObj.healthSummary || ''),
        style: { width: type === 'All' ? '25%' : '30%', color: colorCode(rowObj.followupDate) },
      },
 

      comments: {
        value: rowObj.comments,
        style: {
          width: type === 'All' ? '25%' : '30%',
          color: colorCode(rowObj.followupDate),
          whiteSpace: "pre-wrap"
        },
      },
      status: {
        value: rowObj.active === true ? 'Open' : 'Closed',
        style: { width: '5%', color: colorCode(rowObj.followupDate) },
      },
      state: {
        value: {
          flag:rowObj.flag,
          followUpDate:rowObj.followupDate,
          completedBy: rowObj.completedBy,
          completedAt: rowObj.completedAt,
          healthSummary:rowObj.healthSummary,
          comments:rowObj.comments,
          closingComments: rowObj.closingComments,
          render: !rowObj.active,
          clientObj: rowObj.client,
          carePartnerObj: rowObj.carePartner,
          location: rowObj.location,
        },
        style: {},
      },
    }));
  const generateTypeColumns = () => {
    let typeArr = ['Client', 'Care Partner'];
    if (type === 'Client') {
      typeArr.pop();
    }
    if (type === 'Care Partner') {
      typeArr.shift();
    }
    return typeArr;
  };

  const fetchData = useCallback(() => {
    setLoading(true);
    setRows([]);
    let queryString = '&type=';
    if (type !== 'All') {
      const lowercase = type.toLowerCase();
      queryString += lowercase.split(' ').length > 1 ? lowercase.split(' ')[1] : lowercase;
    }
    const url = showType
      ? `health-check?showType=${showType}&id=${data._id}`
      : generateUrl('health-check', filter, undefined, queryString, locations);
    API.get(url)
      .then((rsp: any) => {
        const data = rsp.data.data;
        detail ? setRows(generateDetailRows(data)) :setRows(generateRows(data));
        setLoading(false);
      })
      .catch((error: any) => {
        toast.error('Failed to load Health Check.');
        console.error(error);
        setLoading(false);
      });
  }, [filter, type, locations]);

  useEffect(() => {
    fetchData();
  }, [filter,type, locations]);

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
    setRows(sort(rows, sortVal, type, ascending, 'healthCheck'));
  };

return (
    <Card>
      <CardHeader
        title="Health Check"
        type={type}
        setType={setType}
        setOpenModal={setOpenModal}
        expanded={expanded}
        setExpanded={setExpanded}
        radioGroup={!showType}
      />
      <Modal open={openModal} closeHandler={handleCloseModal} title="Add Health Check">
        <HealthCheckModalContent closeHandler={handleCloseModal} showType={type} data={data} />
      </Modal>
      {loading && <Spinner />}
      {!loading && (rows.length === 0 || locations.length === 0) && <NoData />}
      {!loading && rows.length > 0 && locations.length > 0 && (
        <CardContent expanded={expanded}>
          <Modal open={editOpenModal} closeHandler={editHandleCloseModal} title="Edit Health Check">
            <HealthCheckModalContent
              closeHandler={editHandleCloseModal}
              selected={selectedRow}
              showType={showType}
              data={data}
            />
          </Modal>
          <ArchiveModal
            open={archiveOpenModal}
            closeHandler={archiveHandleCloseModal}
            collectionName="health-check"
            selected={selectedRow}
            label="Health Check"
          />
          <Table
            columns={detail ? [
              'Created By',
              'Follow-Up Date',
              'Date Created',
              'Date Completed',
              'Completed By',
              'Health Summary',
              'Comments',
              'Status',
              '',
            ]:[
              'Flag', 
              'Status',
              'Location',
              'Follow-Up Date',
              'Created',
              ...generateTypeColumns(),
              'Health Summary',
              'Comments',
              '',
            ]}
            tableName="health-check"
            rows={rows}
            handleArchive={handleArchive}
            handleEdit={handleEdit}
            hideArchive={filter.status && filter.status.value === 'Closed'}
            handleSort={handleSort}
            handleReactivate={handleReactivate}
          />
        </CardContent>
      )}
    </Card>
  );
}


