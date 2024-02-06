import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import API from 'services/AxiosConfig';
import { Card, CardHeader, Modal, Spinner, NoData, Table, CardContent, ArchiveModal, ActionButtons } from 'components';
import { SectionProps } from 'typings';
import { careManagerSort, generateUrl, sort, colorCode } from 'lib';
import CareManagerActivitiesModalContent from './CareManagerActivitiesModalContent';
import { generateRows, generateDetailRows, mutipleManagerRowFormat } from './generateRows';
import BatchAddActivitesModalContent from './BatchAddActivitiesModalContent';
import ActivityTemplateModalContent from './ActivityTemplateModalContent';
import { useCompany } from 'hooks'
import { Button } from '@mui/material';

export function CareManagerActivities({ filter, data, type, setActivities, detail }: SectionProps) {
  const { locations } = useCompany()
  const [loading, setLoading] = useState<boolean>(true);
  const [templates, setTemplates] = useState<any>([])
  const [openBatchModal, setOpenBatchModal] = useState<boolean>(false);
  const [openSelectionModal, setSelectionModal] = useState<boolean>(false)
  const [openTemplateModal, setTemplateModal] = useState<boolean>(false)
  const [expanded, setExpanded] = useState<boolean>(true);
  const [rows, setRows]: any[] = useState([]);
  const [archiveOpenModal, setArchiveOpenModal] = useState<boolean>(false);
  const [editOpenModal, setEditOpenModal] = useState<boolean>(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10)
  const [count,setCount] = useState();
  const [tableType, setTableType] = useState('All')
  const [confirmDelete, setConfirmDelete] = useState(false)

  const fetchData = useCallback(() => {
    setLoading(true);
    setRows([]);
    const url = type
      ? `care-manager-activity-event?${type}Id=${data._id}`
      : `${generateUrl('care-manager-activity-event', filter, '', '', locations, limit, page)}`;


    API.get(url)
      .then((rsp: any) => {
        const data = rsp.data.data;
        detail ? setRows(generateDetailRows(data, tableType)) : setRows(generateRows(data))
        setActivities && setActivities(data)
        setCount(rsp.data.count)
        setLoading(false);
      })
      .catch((error: any) => {
        toast.error('Failed to load Care Manager Tasks.');
        console.error(error);
        setLoading(false);
      })
  }, [filter, locations, tableType,limit,page]);

  useEffect(() => {
    fetchData();
  }, [filter, locations, tableType,limit,page]);

  const handleCloseSelectionModal = () => {
    setSelectionModal(false)
  }
  const handleRemove = (row: any) => {
    setSelectedRow(row)
    setConfirmDelete(true)
  }
  const handleCloseBatchModal = () => {
    fetchData();
    setOpenBatchModal(false);
  };
  const handleCloseTemplateModal = () => {
    fetchData();
    setTemplateModal(false);
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
    setRows(careManagerSort(rows, sortVal, type, ascending, 'careManagerActivities', filter?.careManager?.value === 'All' || filter?.careManager?.value === '',filter?.groupBy?.value))
  };

  const deleteHandler = () => {
    const id = selectedRow.id
    toast.loading('Deleting...');
    API.delete(`care-manager-activity-event/${id}`)
      .then((rsp => {
        toast.dismiss()
        if (rsp.data.success) {
          toast.success('Successfully deleted.');
          fetchData();
          setConfirmDelete(false)
        }
      }))
      .catch((error) => {
        toast.dismiss();
        toast.error('Failed to delete.');
        fetchData();
        setConfirmDelete(false)
        console.error(error);
      });
  
  }
  const renderRow = (detail: any, tableType: any) => {
    let tableStructure = detail ? [
      { val: 'Flag', width: '5px' },
      { val: 'Due Date', width: '5%' },
      { val: 'Client', width: '20px' },
      { val: 'Care Partner', width: '50px' },
      { val: 'Time', width: '10px' },
      { val: 'Assigned To', width: '50px' },
      { val: 'Activity', width: '5%' },
      { val: 'Description', width: '50%' },
      { val: 'Status', width: '10px' },

    ] : [
      { val: 'Flag', width: '5px' },
      { val: 'Status', width: '10px' },
      { val: 'Due Date', width: '5%' },
      { val: 'Time', width: '10px' },
      { val: 'Location', width: '20px' },
      { val: 'Client', width: '20px' },
      { val: 'Care Manager', width: '50px' },
      { val: 'Care Partner', width: '50px' },
      { val: 'Activity', width: '5%' },
      { val: 'Description', width: '20%' },

    ];

    if (tableType === 'Care Partner') {
      tableStructure = tableStructure.filter((column: any) => column.val !== 'Client');
    } else if (tableType === 'Client') {
      tableStructure = tableStructure.filter((column: any) => column.val !== 'Care Partner');
    }
    return tableStructure;
  }

  useEffect(() => {
    API.get('activity-template/new hire')
      .then(rsp => {
        setTemplates(rsp.data.data)
      })
      .catch(err => {
        console.log(err)
      })
  }, [])

  return (
    <Card>
      <CardHeader
        title="Care Manager Tasks"
        setOpenModal={setSelectionModal}
        expanded={expanded}
        setExpanded={setExpanded}
        radioGroup
        radioGroupLabel1='Client'
        radioGroupLabel2='Care Partner'
        type={tableType}
        setType={setTableType}
      />
      <Modal open={openSelectionModal} closeHandler={handleCloseBatchModal} title=" Add Care Management Tasks">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '30px', width: '80%' }}>
          <Button variant="contained" sx={{ bgcolor: 'var(--primary-color)' }} onClick={() => setOpenBatchModal(true)}>Add Tasks</Button>
          <Button variant="contained" sx={{ bgcolor: 'var(--primary-color)' }} onClick={() => setTemplateModal(true)}>Apply Template</Button>
        </div>
        <ActionButtons closeHandler={() => setSelectionModal(false)} renderSubmit={false} />
      </Modal >
      <Modal open={openBatchModal} closeHandler={handleCloseBatchModal} title="Batch Add Task">
        <BatchAddActivitesModalContent closeHandler={handleCloseBatchModal} closeSelectionModal={handleCloseSelectionModal} showType={type} data={data} />
      </Modal>
      <Modal open={openTemplateModal} closeHandler={handleCloseTemplateModal} title="Apply Task Template">
        <ActivityTemplateModalContent closeHandler={handleCloseTemplateModal} closeSelectionModal={handleCloseSelectionModal} showType={type} data={data} />
      </Modal>
      {loading && <Spinner />}
      {!loading && (rows.length === 0 || locations.length === 0) && <NoData />}
      {!loading && rows.length > 0 && locations.length > 0 && (
        <CardContent expanded={expanded}>
          <Modal open={editOpenModal}
            closeHandler={editHandleCloseModal}
            title="Edit Care Manager Task"
            radioGroup={true}
            radioGroupLabel1='Completed'
            radioGroupLabel2='Incomplete'
            currentRow = {selectedRow}

          >
            <CareManagerActivitiesModalContent
              closeHandler={editHandleCloseModal}
              selected={selectedRow}
              showType={type}
              data={data}
              renderButtons={true}
              deleteHandler={deleteHandler}
              radioGroup={true}
              radioGroupLabel1='Completed'
              radioGroupLabel2='Incomplete'
              currentRow={selectedRow}
            />
          </Modal>
          <Modal
            open={confirmDelete}
            closeHandler={() => setConfirmDelete(false)}
            title='Confirm Delete'
            styles={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '20%',
              bgcolor: 'background.paper',
              border: '2px solid #000',
              boxShadow: 24,
              p: 4,
            }}
          >
            <div>
              <Button
                type='submit'
                variant="contained"
                sx={{ mt: 1, mr: 1, backgroundColor: 'red' }}
                onClick={deleteHandler}
              >
                Delete
              </Button>
              <Button
                variant="contained"
                onClick={() => setConfirmDelete(false)}
                sx={{ mt: 1, mr: 1 }}
              >
                Cancel
              </Button>
            </div>
          </Modal>
          <ArchiveModal
            open={archiveOpenModal}
            closeHandler={archiveHandleCloseModal}
            collectionName="care-manager-activity-event"
            selected={selectedRow}
            label="Care Manager Tasks"

          />
          <Table
            columns={renderRow(detail, tableType)}
            tableName="care-manager-activity-event"
            rows={(filter?.careManager?.value === 'All' || filter?.careManager?.value === '')&& filter?.groupBy?.value &&  filter?.groupBy?.value !== 'None'  ? mutipleManagerRowFormat(rows,filter?.groupBy) : rows}
            handleArchive={handleArchive}
            handleEdit={handleEdit}
            hideArchive={filter?.status && filter?.status?.value === 'Closed'}
            handleSort={handleSort}
            handleReactivate={handleReactivate}
            type={(filter?.careManager?.value === 'All' || filter?.careManager?.value === '') && filter?.groupBy?.value && filter?.groupBy?.value !== 'None' ? 'care-manager-activities' : 'careManagerSinglePage'}
            pageChangeHandler={(page: any) => setPage(page)}
            currentRow={limit}
            currentCount = {count}
            setRowsPer={(limit: any) => setLimit(limit)}
            handleRemove={handleRemove}
            currentPage = {page}
          />
        </CardContent>
      )}
    </Card>
  );
}
