import React, { useState, useEffect, useCallback } from 'react'
import ArchiveIcon from '@mui/icons-material/Archive';
import { Fab, IconButton } from '@material-ui/core';
import { Modal } from 'components';
import { toast } from 'react-toastify';
import API from 'services/AxiosConfig';
import AddIcon from '@mui/icons-material/Add';
import AddPermissionModal from './AddPermissionModal';


const PermissionModal = ({ selected }: any) => {

    const [locations, setLocations] = useState([])
    const [openModal, setOpenModal] = useState(false)

    const fetchData = useCallback(() => {
        API.get(`permissions/${selected.id}`)
            .then((rsp: any) => {
                setLocations(rsp.data.data)
            }).catch(err => {
                console.log(err)
            })
    }, []);

    useEffect(() => {
        selected && fetchData()
    }, [selected])
    const createPermission = (values: any) => {
        API.post(`/permissions/${values.user._id}`, { location: values.location._id })
            .then((rsp) => {
                if (rsp.data.success) {
                    toast.success('Successfully added permission.');

                }
            })
            .catch((error) => {
                toast.error('Failed to add permission.');
                console.error(error);
            });
    };

    const handleCloseModal = () => {
        fetchData();
        setOpenModal(false);
    };

    const handleArchive = (location: any) => {
        API.post(`/permissions/${selected.id}/${location}`, {})
            .then((rsp) => {
                if (rsp.data.success) {
                    toast.success('Successfully archive permission.');
                    fetchData()
                }
            })
            .catch((error) => {
                toast.error('Failed to add permission.');
                console.error(error);
            });

    }

    return (
        <div className='permission-container' >
            <Fab
                color="primary"
                aria-label="add"
                style={{
                    position: "absolute",
                    top: "8%",
                    right: '9%'
                }}
                onClick={() => {
                    setOpenModal(true);
                }}
            >
                <AddIcon />
            </Fab>
            <Modal open={openModal} closeHandler={handleCloseModal} title="Add Permission" styles={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '30%',
                bgcolor: 'background.paper',
                border: '2px solid #000',
                boxShadow: 24,
                p: 4,
            }}>
                <AddPermissionModal closeHandler={handleCloseModal} selected={selected} />
            </Modal>
            {locations.map((locationObj: any) => {
                return <div className='permission'>{locationObj.location.location} <IconButton sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                }} onClick={() => { handleArchive(locationObj.location._id) }}> <ArchiveIcon /></IconButton></div>
            })}
        </div>
    )

}


export default PermissionModal