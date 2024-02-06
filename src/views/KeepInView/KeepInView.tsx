import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { GrFlagFill } from 'react-icons/gr';
import API from 'services/AxiosConfig';
import { Card, CardHeader, Modal, Spinner, NoData, Table, CardContent, ArchiveModal } from 'components';
import { SectionProps } from 'typings';
import { formatName, formatDate, generateUrl, renderColor, sort, colorCode } from 'lib';
import KeepInViewModalContent from './KeepInViewModalContent';
import { useCompany } from 'hooks';
import { Link } from 'react-router-dom';
import parse from 'html-react-parser';

type TypeObj = {
  client?: any;
  carePartner?: any;
};

export function KeepInView({ filter, data, showType, detail, carePartner }: SectionProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [expanded, setExpanded] = useState<boolean>(true);
  const [rows, setRows]: any[] = useState([]);
  const [archiveOpenModal, setArchiveOpenModal] = useState<boolean>(false);
  const [editOpenModal, setEditOpenModal] = useState<boolean>(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [type, setType] = useState('All');
  const { locations } = useCompany()



  const createTypeObject = (rowObj: any) => {
    let typeObj: TypeObj = {
      client: {
        value: rowObj.client ? <Link className='applicant-name-link' to={`/client/${rowObj.client._id}`}>{formatName(rowObj.client.firstName, rowObj.client.lastName)}</Link> : '',
        style: { width: '10%', color: colorCode(rowObj.followupDate) },
      },
      carePartner: {
        value: rowObj.carePartner ? <Link className='applicant-name-link' to={`/care-partner/${rowObj.carePartner._id}`}>{formatName(rowObj.carePartner.firstName, rowObj.carePartner.lastName)}</Link> : '',
        style: { width: '10%', color: colorCode(rowObj.followupDate) },
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
      comments: {
        value: parse(rowObj.comments || ''),
        style: {
          width: type === 'All' ? '45%' : '50%',
          color: colorCode(rowObj.followupDate),
          whiteSpace: "pre-wrap"
        },
      },
      state: {
        value: {
          flag: rowObj.flag,
          followupDate: rowObj.followupDate,
          completedBy: rowObj.completedBy,
          completedAt: rowObj.completedAt,
          closingComments: rowObj.closingComments,
          comments: rowObj.comments,
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
        style: { width: '10%', color: colorCode(rowObj.followupDate) },
      },
      followupDate: {
        value: formatDate(rowObj.followupDate),
        style: { width: '12%', color: colorCode(rowObj.followupDate) },
      },
      createdAt: {
        value: formatDate(rowObj.createdAt),
        style: { width: '10%', color: colorCode(rowObj.followupDate) },
      },
      completedAt: {
        value: rowObj.completedAt ? formatDate(rowObj.completedAt) : '',
        style: { width: '10%', color: colorCode(rowObj.followupDate) },
      },
      comments: {
        value: parse(rowObj.comments || ''),
        style: {
          width: type === 'All' ? '45%' : '50%',
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
          completedBy: rowObj.completedBy,
          completedAt: rowObj.completedAt,
          closingComments: rowObj.closingComments,
          comments: rowObj.comments,
          render: !rowObj.active,
          clientObj: rowObj.client,
          carePartnerObj: rowObj.carePartner,
          location: rowObj.location,
        },
        style: {},
      },
    }));

  const generateCarePartnerRows = (data: any) =>
    data.map((rowObj: any) => ({
      id: rowObj._id,
      createdBy: {
        value: rowObj.createdBy ? formatName(rowObj.createdBy.firstName, rowObj.createdBy.lastName) : '',
        style: { width: '10%', color: colorCode(rowObj.followupDate) },
      },
      followupDate: {
        value: formatDate(rowObj.followupDate),
        style: { width: '12%', color: colorCode(rowObj.followupDate) },
      },
      createdAt: {
        value: formatDate(rowObj.createdAt),
        style: { width: '10%', color: colorCode(rowObj.followupDate) },
      },
      completedAt: {
        value: rowObj.completedAt ? formatDate(rowObj.completedAt) : '',
        style: { width: '10%', color: colorCode(rowObj.followupDate) },
      },
      completedBy: {
        value: rowObj.createdBy ? formatName(rowObj.createdBy.firstName, rowObj.createdBy.lastName) : '',
        style: { width: '10%', color: colorCode(rowObj.followupDate) },
      },
      comments: {
        value: rowObj.comments,
        style: {
          width: type === 'All' ? '45%' : '50%',
          color: colorCode(rowObj.followupDate),
        },
      },

      status: {
        value: rowObj.active === true ? 'Open' : 'Closed',
        style: { width: '5%', color: colorCode(rowObj.followupDate) },
      },
      state: {
        value: {
          completedBy: rowObj.completedBy,
          completedAt: rowObj.completedAt,
          closingComments: rowObj.closingComments,
          comments: rowObj.comments,
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
      ? `keep-in-view?${showType}Id=${data._id}`
      : generateUrl('keep-in-view', filter, undefined, queryString, locations);
    API.get(url)
      .then((rsp: any) => {
        const data = rsp.data.data;
        if (detail) {
          if (carePartner) {
            setRows(generateCarePartnerRows(data));
          } else {
            setRows(generateDetailRows(data));
          }
        } else {
          setRows(generateRows(data));
        }
        setLoading(false);
      })
      .catch((error: any) => {
        toast.error('Failed to load Keep in View.');
        console.error(error);
        setLoading(false);
      });
  }, [filter, type, locations]);

  useEffect(() => {
    fetchData();
  }, [filter, type, locations]);

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
    setRows(sort(rows, sortVal, type, ascending, 'keepInView'));
  };

  return (
    <Card>
      <CardHeader
        title="Keep in View"
        type={type}
        setType={setType}
        setOpenModal={setOpenModal}
        expanded={expanded}
        setExpanded={setExpanded}
        radioGroup={!showType}
      />
      <Modal open={openModal} closeHandler={handleCloseModal} title="Add Keep in View">
        <KeepInViewModalContent closeHandler={handleCloseModal} showType={type} data={data} />
      </Modal>
      {loading && <Spinner />}
      {!loading && (rows.length === 0 || locations.length === 0) && <NoData />}
      {!loading && rows.length > 0 && locations.length > 0 && (
        <CardContent expanded={expanded}>
          <Modal open={editOpenModal} closeHandler={editHandleCloseModal} title="Edit Keep in View">
            <KeepInViewModalContent
              closeHandler={editHandleCloseModal}
              selected={selectedRow}
              showType={showType}
              data={data}
            />
          </Modal>
          <ArchiveModal
            open={archiveOpenModal}
            closeHandler={archiveHandleCloseModal}
            collectionName="keep-in-view"
            selected={selectedRow}
            label="Keep in View"
          />
          <Table
            columns={detail ? carePartner ? [
              'Created By',
              'Follow-Up Date',
              'Date Created',
              'Date Completed',
              'Completed By',
              'Comments',
              'Status',
              '',] : [

              'Created By',
              'Follow-Up Date',
              'Date Created',
              'Date Completed',
              'Comments',
              'Status',
              '',
            ] : [
              'Flag',
              'Status',
              'Location',
              'Follow-Up Date',
              'Created',
              ...generateTypeColumns(),
              'Comments',
              '',
            ]}
            tableName="keep-in-view"
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


