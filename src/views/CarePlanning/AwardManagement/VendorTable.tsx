import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import API from 'services/AxiosConfig';
import { Card, CardHeader, Modal, Spinner, NoData, Table, CardContent, ArchiveModal, ActionButtons } from 'components';
import { formatName, formatDate, generateUrl, sort } from 'lib';
import AwardManagementModalContent from './AwardManagementModalContent';
import { useCompany } from 'hooks';
import { Box, Container } from '@material-ui/core';
import VendorsModalContent from './VendorsModalContent';

export function VendorTable({ filter, data, type, awards, vendors, fetchVendors }: any) {
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
            vendor: { value: rowObj.vendor, style: { width: '75%' } },
        }));


    useEffect(() => {
        setLoading(true)
        setRows(generateRows(vendors))
        setLoading(false)
    }, [vendors]);
    
    useEffect(()=>{
        fetchVendors(currentType)
    },[currentType])

    const handleCloseModal = () => {
        fetchVendors();
        setOpenModal(false);
    };

    const editHandleCloseModal = () => {
        fetchVendors();
        setEditOpenModal(false);
    };

    const handleEdit = (row: any) => {
        setEditOpenModal(true);
        setSelectedRow(row);
    };

    const handleRemove = (id: any) => {
        setSelectedRow(id.id)
        setDeleteModal(true)
    }
    const handleCloseDeleteModal = () => {
        setDeleteModal(false)
    }
    const handleConfirmClose = async () =>{
        try{
            let deleted = await API.put(`vendors/${currentType === "Active" ? "Archive": "Unarchive"}/${selectedRow}`,{})
            deleted && toast.success(`Successfully ${currentType === "Active" ? "archived": "unarchived"} vendor`)
            setDeleteModal(false)
            fetchVendors(currentType)
        }catch(err){
            toast.error(`failed to ${currentType === "Active" ? "Archive": "Unarchive"}delete vendor`)
            fetchVendors(currentType)
        }
    }
    const handleSort = (sortVal: string, type: string, ascending: boolean) => {
        setRows(sort(rows, sortVal, type, ascending, 'awardManagement'));
    };

    return (
        <Container maxWidth="md" sx={{ pt: 20 }}>
             <Card style={{ minWidth: 345, border: 0, float: 'left' }}> <CardHeader title="Award Vendors" radioGroup ={true} radioGroupLabel1 ='Active' radioGroupLabel2='Inactive' renderAll ={false} type = {currentType} setType = {setCurrentType} setOpenModal={setOpenModal} expanded={expanded} setExpanded={setExpanded} />
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
                    open={deleteModal} closeHandler={handleCloseDeleteModal} title={`Confirm ${currentType === "Active" ? "Archive": "Unarchive"}`}>
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
                    open={openModal} closeHandler={handleCloseModal} title="Add Vendor">
                    <VendorsModalContent closeHandler={handleCloseModal} showType={type} data={data} options={{ awards, vendors }} />
                </Modal>
                {loading && <Spinner />}
                {!loading && rows.length === 0 || locations.length === 0 && <NoData />}
                {!loading && rows.length > 0 && locations.length > 0 && (
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
                            <VendorsModalContent
                                closeHandler={editHandleCloseModal}
                                selected={selectedRow}
                                showType={type}
                                data={data}
                                options={{ awards, vendors }}
                            />
                        </Modal>
                        <Table
                            columns={[
                                'Vendor',
                                '',
                            ]}
                            rows={rows}
                            handleEdit={handleEdit}
                            tableName="sensitive-issue"
                            hideArchive={currentType === 'Inactive'}
                            handleSort={handleSort}
                            handleArchive={handleRemove}
                            type={type}
                        />
                    </CardContent>
                )}</Card>
        </Container >

    );
}
