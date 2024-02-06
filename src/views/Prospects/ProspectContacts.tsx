import { CardHeader, Card, NoData, Modal, Table } from 'components'
import React, { useState, useEffect } from 'react'
import { Button, CardContent, Collapse } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ContactsCard from './ContactsCard';
import ContactsModal from './ContactsModal';
import API from 'services/AxiosConfig';
import { sort } from 'lib/common';
import { toast } from 'react-toastify';
import { GrFlagFill } from 'react-icons/gr';



function ProspectContacts({ prospectId }: any) {
    const [openModal, setOpenModal] = useState<any>(false)
    const [openEditModal, setOpenEditModal] = useState<any>(false)
    const [currentRow, setCurrentRow] = useState<any>({})
    const [rows, setRows] = useState<any>([])
    const [type, setType] = useState('All');
    const [page, setPage] = useState(0);
    const [limit, setLimit] = useState(10);
    const [confirmDelete, setConfirmDelete] = useState(false)

    const generateRows = (rows: any) => {
        return rows.map((row: any) => {
            return {
                flag: {
                    value: row.flag === true ? <GrFlagFill color="red" /> : <></>,
                    style: { width: '5%' },
                    selected: row.flag === true,
                  },
                name: {
                    value: `${row?.firstName} ${row?.lastName}`,
                    style: { width: '15%' },
                },
                contactType: {
                    value: row?.contactType,
                    style: { width: '10%' }
                },
                contactRelationship: {
                    value: row?.contactRelationship?.type,
                    style: { width: '14%' }
                },
                phone: {
                    value: row?.mainPhone,
                    style: { width: '10%' }
                },
                email: {
                    value: row?.email,
                    style: { width: '15%' }
                },
                comments: {
                    value: row?.comments,
                    style: { width: '47%' }
                },
                state: row
            }
        })
    }

    const handleSort = (sortVal: string, type: string, ascending: boolean) => {
        setRows(sort(rows, sortVal, type, ascending, 'contacts'));
    };

    const handleEdit = (currentRow: any) => {
        setCurrentRow(currentRow)
        setOpenEditModal(true)
    }

    const fetchContacts = async () => {
        try {
            const contacts = await API.get(`prospects/contact?id=${prospectId}`)
            setRows(generateRows(contacts.data.data))
        } catch (err) {
            console.log(err)
        }
    }
    const handleRemove = (row: any) => {
        setCurrentRow(row)
        setConfirmDelete(true)
    }

    const deleteHandler= async () => {
        const DataRsp = await API.delete('prospects/contact/' + currentRow?.state?._id)
            .then((rsp) => {
                if (rsp.data.success) {
                    toast.success('Successfully deleted contact!')
                    fetchContacts()
                    setConfirmDelete(false)
                }
            })
            .catch((err) => {
                toast.error('Failed to delete Contact.');
                console.error(err);
                setConfirmDelete(false)
            });
    }

    useEffect(() => {
        fetchContacts()
    }, [])

    return (
        <>
            <Card>
                <Modal open={openModal} closeHandler={() => setOpenModal(false)}>
                    <ContactsModal closeMe={() => setOpenModal(false)} prospectId={prospectId} fetchContacts={fetchContacts} />
                </Modal>
                <Modal open={openEditModal} closeHandler={() => setOpenModal(false)}>
                    <ContactsModal detail={true} currentRow={currentRow} fetchContacts={fetchContacts} closeMe={() => setOpenEditModal(false)} />
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

                <CardHeader title="Contacts" setOpenModal={setOpenModal} expandable={false} expanded={true} setExpanded={() => { }} />
                {!rows.length && <NoData />}
                {!!rows.length &&
                    <div style={{ width: '96%', marginLeft: '2%' }}>
                        <CardContent>
                            <Table
                                columns={['Flag','Name', 'Contact Type', 'Contact Relationship', 'Phone', 'Email', 'Notes', '']}
                                rows={rows}
                                handleEdit={handleEdit}
                                type={type}
                                handleSort={handleSort}
                                hideArchive={true}
                                currentPage={0}
                                pageChangeHandler={(page) => { }}
                                currentRow={limit}
                                handleRemove={handleRemove}
                                tableName='prospects-contacts'
                            /></CardContent></div>}
            </Card>
        </>
    )
}

export default ProspectContacts
