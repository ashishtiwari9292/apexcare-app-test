import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { Card, CardHeader, Modal, Spinner, NoData, Table, CardContent, ArchiveModal, ActionButtons, Layout } from 'components';
import { formatName, formatDate, generateUrl, sort } from 'lib';
import { useCompany, useAuth } from 'hooks';
import { Box, Container } from '@material-ui/core';
import API from 'services/AxiosConfig'
import ActivityModal from './ActivityModal';

export function ActivityManagement({ filter, data, awards, vendors}: any) {
    const { locations, setCareManagerActivities } = useCompany()
    const [loading, setLoading] = useState<boolean>(false);
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [deleteModal, setDeleteModal] = useState<boolean>(false);
    const [expanded, setExpanded] = useState<boolean>(true);
    const [rows, setRows]: any[] = useState(vendors);
    const [editOpenModal, setEditOpenModal] = useState<boolean>(false);
    const [selectedRow, setSelectedRow] = useState<any>(null);
    const [type, setType] = useState('Active')
    const { user } = useAuth();

    const generateRows = (data: any) =>
        data.map((rowObj: any) => ({
            id: rowObj._id,
            award: { value: rowObj.activity, style: { width: '75%' } },
        }));

    
    const fetchAwardTypes = () => {
     API.get(`activity/search/${type}`)
     .then(({data}) => {
      setRows(generateRows(data.data))
     })
    }
    
    const updateCareMangerActivities = async() =>{
        API.get(`activity/search/Active`)
        .then((({data})=>{
            setCareManagerActivities(data.data)
        }
        ))
    }
    useEffect(()=>{
        fetchAwardTypes()
      },[type])

    const handleCloseModal = () => {
      fetchAwardTypes()
      updateCareMangerActivities() 
      setOpenModal(false);
    };

    const editHandleCloseModal = () => {
        setEditOpenModal(false);
        updateCareMangerActivities() 
        fetchAwardTypes()
    };

    const handleEdit = (row: any) => {
        setEditOpenModal(true);
        setSelectedRow(row);
    };

    const handleRemove = (id: any) => {
        setSelectedRow(id.id)
        setDeleteModal(true)
    }
    const handleCloseArchiveModal = () => {
        setDeleteModal(false)
    }
    const handleConfirmClose = async () =>{
        try{
            let archived = await API.put(`activity/archive/${selectedRow}`,{status:!(type === 'Active') ,userId:user._id})
            archived && toast.success(`Successfully ${type === 'Active' ? "Archived" : 'Unarchived'} Activity`)
            updateCareMangerActivities() 
            setDeleteModal(false)
            fetchAwardTypes()
        }catch(err){
            toast.error(`Failed to ${type === 'Active' ? "Archived" : 'Unarchived'} Activity`)
            fetchAwardTypes()
        }
    }
    const handleSort = (sortVal: string, type: string, ascending: boolean) => {
        setRows(sort(rows, sortVal, type, ascending, 'awardManagement'));
    };

    return (
      <Layout>
        <Container maxWidth="md" sx={{ pt: 20 }}>
            <Card style={{ minWidth: 345, border: 0, float: 'left' }}> <CardHeader renderAll = {false} radioGroup ={true} radioGroupLabel1 ='Active' radioGroupLabel2='Inactive'  title="Activity" type = {type} setType = {setType} setOpenModal={setOpenModal} expanded={expanded} setExpanded={setExpanded} />
                <Modal
                    styles={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '20%',
                        bgcolor: 'background.paper',
                        border: '2px solid #000',
                        boxShadow: 24,
                        p: 4
                    }}
                    open={deleteModal} closeHandler={handleCloseArchiveModal} title={`Confirm ${type === 'Active'? 'Archive': 'Unarchive'} `}>
                    <ActionButtons renderConfirm  = {true} renderSubmit = {false} closeHandler={handleCloseArchiveModal} confirmHandler = {handleConfirmClose} ></ActionButtons>
                </Modal>
                <Modal
                    styles={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '20%',
                        bgcolor: 'background.paper',
                        border: '2px solid #000',
                        boxShadow: 24,
                        p: 4
                    }}
                    open={openModal} closeHandler={handleCloseModal} title="Add Activity Type">
                     
                     <ActivityModal closeHandler = {handleCloseModal}/>
                </Modal>
                {loading && <Spinner />}
                {!loading && rows?.length === 0 || locations?.length === 0 && <NoData />}
                {!loading && rows?.length > 0 && locations?.length > 0 && (
                    <CardContent expanded={expanded}>
                        <Modal styles={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '20%',
                            bgcolor: 'background.paper',
                            border: '2px solid #000',
                            boxShadow: 24,
                            p: 4
                        }}
                            open={editOpenModal} closeHandler={editHandleCloseModal} title="Edit Activity">
                                   <ActivityModal closeHandler = {editHandleCloseModal} selected = {selectedRow} />
                           
                        </Modal>
                        <Table
                            columns={[
                                'Activity Type',
                                '',
                            ]}
                            rows={rows}
                            handleEdit={handleEdit}
                            tableName="sensitive-issue"
                            hideArchive={type === 'Inactive'}
                            handleSort={handleSort}
                            handleArchive={handleRemove}
                            type={type}
                        />
                    </CardContent>
                )}</Card>
        </Container >
        </Layout>
    );
}
