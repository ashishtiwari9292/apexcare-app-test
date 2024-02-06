import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { Card, CardHeader, Modal, Spinner, NoData, Table, CardContent, ArchiveModal, ActionButtons, Layout } from 'components';
import { formatName, formatDate, generateUrl, sort } from 'lib';
import { useCompany } from 'hooks';
import { Box, Container } from '@material-ui/core';
import API from 'services/AxiosConfig'
import AwardTypeModal from './AwardTypeModal';


export function AwardTypeManagement({ filter, data, type, awards, vendors}: any) {
    const { locations } = useCompany()
    const [loading, setLoading] = useState<boolean>(false);
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [deleteModal, setDeleteModal] = useState<boolean>(false);
    const [expanded, setExpanded] = useState<boolean>(true);
    const [rows, setRows]: any[] = useState(vendors);
    const [editOpenModal, setEditOpenModal] = useState<boolean>(false);
    const [selectedRow, setSelectedRow] = useState<any>(null);
    const [currentType, setCurrentType] = useState('Active')

    const generateRows = (data: any) =>
        data.map((rowObj: any) => ({
            id: rowObj._id,
            award: { value: rowObj.awardName, style: { width: '75%' } },
            state:{status:rowObj.dataStatus}
        }));

    
    const fetchAwardTypes = () => {
      API.get(`awards/${currentType}`)
     .then(({data}) => {
      setRows(generateRows(data.data))
     })
    }
    useEffect(()=>{
      fetchAwardTypes()
    },[currentType])

    const handleCloseModal = () => {
      fetchAwardTypes()
      setOpenModal(false);
    };

    const editHandleCloseModal = () => {
        setEditOpenModal(false);
        fetchAwardTypes()
    };

    const handleEdit = (row: any) => {
        setEditOpenModal(true);
        setSelectedRow(row);
    };

    const handleArchive = (row: any) => {
         setSelectedRow(row)
         setDeleteModal(true)
     }
    const handleCloseDeleteModal = () => {
        setDeleteModal(false)
    }
    const handleConfirmClose = async () =>{
        try{
           let archiveSelection = currentType === 'Active' ? 'archive' : 'unarchive'
           let archived= await API.put(`awards/${archiveSelection}/${selectedRow.id}`,{})
           archived && toast.success(`Successfully ${currentType === 'Active' ? 'archived' : 'unarchived'} Award Type`)
            setDeleteModal(false)
            fetchAwardTypes()
        }catch(err){
           toast.error(`failed to ${currentType === 'Active' ? 'archived' : 'unarchived'} award`)
            fetchAwardTypes()
        }
    }
    const handleSort = (sortVal: string, type: string, ascending: boolean) => {
        setRows(sort(rows, sortVal, type, ascending, 'awardManagement'));
    };

    return (
      <Layout>
        <Container maxWidth="md" sx={{ pt: 20 }}>
            <Card style={{ minWidth: 345, border: 0, float: 'left' }}> <CardHeader title="Award Type" radioGroup ={true} radioGroupLabel1 ='Active' radioGroupLabel2='Inactive' renderAll ={false} type = {currentType} setType = {setCurrentType} setOpenModal={setOpenModal} expanded={expanded} setExpanded={setExpanded} />
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
                    open={deleteModal} closeHandler={handleCloseDeleteModal} title={`Confirm ${currentType === 'Active' ? 'Archive' : 'Unarchive' }`}>
                    <ActionButtons renderConfirm  = {true} renderSubmit = {false} closeHandler={handleCloseDeleteModal} confirmHandler = {handleConfirmClose} ></ActionButtons>
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
                    open={openModal} closeHandler={handleCloseModal} title="Add Award Type">
                       <AwardTypeModal closeHandler = {handleCloseModal} />
                    
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
                            open={editOpenModal} closeHandler={editHandleCloseModal} title="Edit Award">
                                     <AwardTypeModal closeHandler = {editHandleCloseModal}  selected = {selectedRow} />
                           
                        </Modal>
                        <Table
                            columns={[
                                'Award Type',
                                '',
                            ]}
                            rows={rows}
                            handleEdit={handleEdit}
                            tableName="sensitive-issue"
                            hideArchive={currentType === 'Inactive'}
                            handleSort={handleSort}
                            handleArchive={handleArchive}
                            type={type}
                        />
                    </CardContent>
                )}</Card>
        </Container >
        </Layout>

    );
}
