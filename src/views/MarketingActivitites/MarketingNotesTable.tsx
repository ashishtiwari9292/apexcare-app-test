
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import CardContent from '@mui/material/CardContent';
import { Card, CardHeader, Modal, Spinner, NoData, Table, ArchiveModal } from 'components';
import API from 'services/AxiosConfig';
import { generateUrl, formatCMDate, sort, applicantSort, formatDateTime, formatName, numberToMonth } from 'lib';
import { useCompany } from 'hooks';
import { GrFlagFill } from 'react-icons/gr';
import moment, { Moment } from 'moment';
import { act } from 'react-dom/test-utils';
import MarketingActivitiesModalContent from './MarketingActivitiesModalContent';
import { useParams } from 'react-router-dom';
import MarketingNotesModalContent from './MarketingNotesModalContent';
import { Button } from '@mui/material';


interface Props { }

function MarketingNotesTable({ source, renderPartners, title, filter, inline, currentActivity, setOpenModal, openModal }: any) {
    const { referralPartnerId, prospectId } = useParams()
    const [loading, setLoading] = useState(false)
    const [rows, setRows] = useState<any>([])
    const [confirmDelete,setConfirmDelete] = useState(false)

    const [openEditModal, setOpenEditModal] = useState(false)
    const [archiveOpenModal, setArchiveOpenModal] = useState(false)
    const [expanded, setExpanded] = useState(true)
    const [currentRow, setCurrentRow] = useState<any>({})


    const handleCloseModal = () => {
        setOpenModal(false)
        fetchActivities()
    }
    const handleCloseEditModal = () => {
        setOpenEditModal(false)
        fetchActivities()
    }


    const handleEditModal = (row: any) => {
        setOpenEditModal(true);
        setCurrentRow(row);

    }
    const getISOString = (date: string | Moment) => {
        if (!moment.isMoment(date)) {
            return moment(date).endOf('day').toISOString();
        }
        return date.endOf('day').toISOString();
    };

    const fetchActivities = async () => {
        try {
            const rsp = await API.get(`/marketing-notes/${referralPartnerId || prospectId || ''}`)
            setRows(generateRows(rsp?.data?.data))
        } catch (err) {
            console.error(err)
        }
    }

    const handleRemove = (row:any) => {
        setCurrentRow(row)
        setConfirmDelete(true)
    }
    const deleteHandler = () => {
        const id = currentRow?.state?._id 
        toast.loading('Deleting...');
        API.delete(`marketing-notes/${id}`)
          .then((rsp => {
            toast.dismiss()
            if (rsp.data.success) {
             toast.success('Successfully deleted.');
             fetchActivities();
            setConfirmDelete(false)
            }
          }))
          .catch((error) => {
            toast.dismiss();
            toast.error('Failed to delete.');
            fetchActivities();
            setConfirmDelete(false)
            
            console.error(error);
          });
      }

    const archiveHandleCloseModal = () => {
        fetchActivities();
        setArchiveOpenModal(false);
    };

    const handleArchive = (row: any) => {
        setArchiveOpenModal(true);
        setCurrentRow(row);
    };

    const generateRows = (rows: any) => {
        return rows.map((item: any) => {

            return {
                flag: {
                    value: item.flag ? <GrFlagFill color="red" /> : <></>,
                    style: { width: '5%' },
                    selected: item.flag === true,
                },
                date: { value: formatCMDate(item?.date), style: { width: '10%' } },
                careManager: { value: formatName(item.careManager.firstName, item.careManager.lastName), style: { width: '12%' } },
                subject: { value: item.subject, style: { width: '12%' } },
                Note: { value: item.note, style: { width: '60%' } },
                state: item
            }

        })
    }


    useEffect(() => {
        fetchActivities()
    }, [])

    return (
        <Card>

            <Modal open={openModal} closeHandler={handleCloseModal} title={`Add ${title || 'Note'}`}>
                <MarketingNotesModalContent currentRow={null} closeHandler={handleCloseModal} />
            </Modal>
            <Modal currentRow={currentRow} open={openEditModal} closeHandler={handleCloseEditModal} title={`Edit ${title || 'Note'}`}  >
                <MarketingNotesModalContent currentRow={currentRow} closeHandler={handleCloseEditModal} />
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
            
            {loading && <Spinner />}
            {!loading && rows.length > 0 && (
                <Table
                    columns={['Flag', 'Date','Created By', 'Subject',  'Notes', '']}
                    rows={rows}
                    type={'notes'}
                    hideArchive={true}
                    handleEdit={handleEditModal}
                    handleArchive={handleArchive}
                    handleRemove = {handleRemove}
                />
            )}
            {!loading && rows.length === 0 && <NoData />}
        </Card>
    );
}

export default MarketingNotesTable
