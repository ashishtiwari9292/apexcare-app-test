import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import API from 'services/AxiosConfig';
import { Card, CardHeader, Modal, Spinner, NoData, Table, CardContent, ArchiveModal } from 'components';
import { formatName, formatCMDate, generateUrl, sort } from 'lib';
import AwardManagementModalContent from './AwardManagementModalContent';
import { useCompany } from 'hooks';

export function AwardManagementTable({ filter, data, type, awards, vendors, carePartner }: any) {
  const { locations } = useCompany()
  const [loading, setLoading] = useState<boolean>(true);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [expanded, setExpanded] = useState<boolean>(true);
  const [rows, setRows]: any[] = useState([]);
const [archiveOpenModal, setArchiveOpenModal] = useState<boolean>(false);
  const [editOpenModal, setEditOpenModal] = useState<boolean>(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [tableName, setTableName] = useState('')

  const generateRows = (data: any) =>
    data.map((rowObj: any) => ({
      id: rowObj._id,
      location: { value: rowObj.location.location, style: { width: '10%' } },
      date: { value: formatCMDate(rowObj.date), style: { width: '10%' } },
      carePartner: {
        value: rowObj.carePartner ? formatName(rowObj.carePartner.firstName, rowObj.carePartner.lastName) : '',
        style: { width: '10%' },
      },
      careManager: {
        value: rowObj.careManager ? formatName(rowObj.careManager.firstName, rowObj.careManager.lastName) : '',
        style: { width: '10%' },
      },
      award: { value: rowObj.award?.awardName || 'REMOVED', style: { width: '15%' } },
      vendor: { value: rowObj?.vendor?.vendor || 'REMOVED', style: { width: '10%' } },
      value: { value: Number(rowObj?.value).toFixed(2).toString(), style: { width: '30%' } },
      state: {
        value: {
          completedBy: rowObj.completedBy,
          completedAt: rowObj.completedAt,
          comments: rowObj.comments,
          render: !rowObj.dataStatus,
          carePartnerObj: rowObj.carePartner,
          careManager: rowObj.careManager,
          location: rowObj?.location,
        },
        style: {},
      },
    }));

  const generateDetailRows = (data: any) =>
    data.map((rowObj: any) => ({
      id: rowObj._id,
      createdBy:{value:formatName(rowObj.createdBy.firstName, rowObj.createdBy.lastName), style:{width:'10%'}},
      date: { value: formatCMDate(rowObj.date), style: { width: '10%' } },
      award: { value: rowObj.award?.awardName || 'REMOVED', style: { width: '15%' } },
      value: { value: Number(rowObj?.value).toFixed(2).toString(), style: { width: '10%' } },
      vendor: { value: rowObj?.vendor?.vendor || 'REMOVED', style: { width: '10%' } },
      comments:{value:rowObj.comments, style:{width:'50%'}},
      state: {
        value: {
          completedBy: rowObj.completedBy,
          completedAt: rowObj.completedAt,
          comments: rowObj.comments,
          render: !rowObj.dataStatus,
          carePartnerObj: rowObj.carePartner,
          careManager: rowObj.careManager,
          location: rowObj?.location,
        },
        style: {},
      },
    }));

  const generateGroupedRows = (data: any) => {

    return data.filter((item: any) => item !== null).map((groupObj: any) => {
      return {
        location: groupObj.location,
        data: groupObj?.data.map((rowObj: any) => ({
          id: rowObj._id,
          location: { value: rowObj.location.location, style: { width: '10%' } },
          date: { value: formatCMDate(rowObj.date), style: { width: '10%' } },
          carePartner: {
            value: rowObj.carePartner ? formatName(rowObj.carePartner.firstName, rowObj.carePartner.lastName) : '',
            style: { width: '10%' },
          },
          careManager: {
            value: rowObj.careManager ? formatName(rowObj.careManager.firstName, rowObj.careManager.lastName) : '',
            style: { width: '10%' },
          },
          award: { value: rowObj.award?.awardName || 'REMOVED', style: { width: '15%' } },
          vendor: { value: rowObj?.vendor?.vendor || 'REMOVED', style: { width: '10%' } },
          value: { value: Number(rowObj?.value).toFixed(2).toString(), style: {} },
          state: {
            value: {
              completedBy: rowObj.completedBy,
              completedAt: rowObj.completedAt,
              comments: rowObj.comments,
              render: !rowObj.dataStatus,
              carePartnerObj: rowObj.carePartner,
              careManager: rowObj.careManager,
              location: rowObj?.location,
            },
            style: {},
          },
        }))
      }
    })
  }


  const fetchData = useCallback((filter: any) => {
    setLoading(true);
    setRows([]);

    const url = generateUrl('award-management', filter, '', '', locations)

    API.get(url)
      .then((rsp: any) => {
        const data = rsp.data.data;
        if (filter.groupBy.id === 'None') {
          carePartner ? setRows(generateDetailRows(data)) : setRows(generateRows(data))
          setTableName('')
        } else {
          setRows(generateGroupedRows(data))
          setTableName('awards-grouped')
        }
        setLoading(false);
      })
      .catch((error: any) => {
        toast.error('Failed to load sensitive issues.');
        console.error(error);
        setLoading(false);
      });
  }, [filter]);


  useEffect(() => {
    fetchData(filter);
  }, [filter]);

  const handleCloseModal = () => {
    fetchData(filter);
    setOpenModal(false);
  };

  const editHandleCloseModal = () => {
    fetchData(filter);
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
    fetchData(filter);
  };
  const archiveHandleCloseModal = () => {
    fetchData(filter);
    setArchiveOpenModal(false);
  };
  const handleSort = (sortVal: string, type: string, ascending: boolean) => {
    setRows(sort(rows, sortVal, type, ascending, 'awardManagement'));
  };

  return (
    <Card>
      <CardHeader title="Award Management" setOpenModal={setOpenModal} expanded={expanded} setExpanded={setExpanded} />
      <Modal open={openModal} closeHandler={handleCloseModal} title="Add Award">
        <AwardManagementModalContent closeHandler={handleCloseModal} showType={type} data={data} options={{ awards, vendors }} />
      </Modal>
      {loading && <Spinner />}
      {!loading && rows.length === 0 || locations.length === 0 && <NoData />}
      {!loading && rows.length > 0 && locations.length > 0 && (
        <CardContent expanded={expanded}>
          <Modal open={editOpenModal} closeHandler={editHandleCloseModal} title="Edit Award">
            <AwardManagementModalContent
              closeHandler={editHandleCloseModal}
              selected={selectedRow}
              showType={type}
              data={data}
              options={{ awards, vendors }}
            />
          </Modal>
          <ArchiveModal
            open={archiveOpenModal}
            closeHandler={archiveHandleCloseModal}
            collectionName="award-management"
            selected={selectedRow}
            label="Award Management"
          />
          <Table
            columns={carePartner ? [
              'Created By',
              'Date Given',
              'Award Reason',
              'Award Value',
              'Value',
              'Comments',
              '',
            ]:[
              'Location',
              'Date',
              'Care Partner',
              'Care Manager',
              'Award Type',
              'Vendor',
              'Value',
              '',
            ]}
            rows={rows}
            handleArchive={handleArchive}
            handleReactivate={handleReactivate}
            handleEdit={handleEdit}
            tableName={tableName}
            hideArchive={filter.status && filter.status.value === 'Inactive'}
            handleSort={handleSort}
            type={type}
          />
        </CardContent>
      )}
    </Card>
  );
}