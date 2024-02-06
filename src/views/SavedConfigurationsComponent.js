

import React, { useState, useEffect } from 'react';
import { makeStyles } from '@mui/styles';
import { Card, CardContent, Typography, Grid, Button, IconButton } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import API from 'services/AxiosConfig';
import ChecklistComponent from './Checklist';
import { useAuth } from 'hooks';
import { toast } from 'react-toastify'

const useStyles = makeStyles((theme) => ({
    checklist: {
        minHeight: '350px',
        marginTop: '10px',
        display: 'flex',
        justifyContent: 'space-between',
    },
    columnsList: {
        minHeight: '300px',
        padding: '20px',
        border: '1px solid #ddd',
        borderRadius: '10px',
        backgroundColor: '#f9f9f9',
        maxHeight: '400px',
        overflowY: 'auto',
    },
    configTitle: {
        fontSize: '20px',
        color: 'black',
    },
    cardContent: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    columnCard: {
        marginBottom: '10px',
        border: '1px solid #ddd',
        borderRadius: '5px',
        backgroundColor: '#fff',
        width: '90%',
        boxSizing: 'border-box',
        display: 'flex',
        height: '30px',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 'auto',
        flexDirection: 'column',
        paddingTop: '10px',
    },
}));

const SavedConfigurationsComponent = ({ selectedConfigCallback,closeHandler, url, options }) => {
    const { user } = useAuth()
    const [configs, setConfigs] = useState([]);
    const [selectedConfig, setSelectedConfig] = useState(null);
    const [editMode, setEditMode] = useState(false);

    useEffect(() => {
        fetchConfigs()
    }, []);

    const handleSelectConfig = (config) => {
        setSelectedConfig(config);
        selectedConfigCallback(config);
    };



    const handleEditConfig = (e, config) => {
        e.stopPropagation()
        setSelectedConfig(config);
        setEditMode(true);
    };

    const fetchConfigs = () => {
        API.get(`/${url}/configs/all/${user._id}`)
            .then(response => {
                setConfigs(response.data)
                setSelectedConfig(response.data.find(item => item.selected === true))
            })
            .catch(error => console.error(error));
    }

    const handleSaveCreate = (updatedColumns) => {
        API.put(`/${url}/configs/${selectedConfig._id}`, { columns: updatedColumns })
            .then(response => {
                setConfigs(configs.map(c => c._id === response.data._id ? response.data : c));
                setEditMode(false);
            })
            .catch(error => console.error(error));
    };

    const handleSaveEdit = (updatedColumns, title) => {

        API.put(`/${url}/configs/${selectedConfig._id}`, { columns: updatedColumns, name: title })
            .then(response => {
                fetchConfigs()
                setEditMode(false);
                API.get(`/${url}/configs/all/${user._id}`)
                    .then(response => {
                        setConfigs(response.data)

                    })
                    .catch(error => console.error(error));
            })
            .catch(error => console.error(error));
    };

    const handleSelect = (id) => {

        API.put(`/${url}/configs/selected/${id}`, {user:user})
            .then(response => {
                fetchConfigs()
            })
            .catch(error => console.error(error));
    }

    const handleRemove = (config) => {
        if (config.selected) {
            toast.error('Cannot remove selected config')
            return
        }
        API.delete(`/${url}/configs/${config._id}`, {})
            .then(response => {
                fetchConfigs()
                setEditMode(false);
            })
            .catch(error => console.error(error));
    }


    const handleCancelEdit = () => setEditMode(false);

    return editMode ? (
        <ChecklistComponent
            configToEdit={selectedConfig}
            callback={handleSaveEdit}
            closeHandler={handleCancelEdit}
            handleSaveEdit={handleSaveEdit}
            handleSaveCreate={handleSaveCreate}
            options = {options}
        />
    ) : (
        <div>
        <div className="checklist" style={{ minHeight: '350px', marginTop: '10px', marginBottom:'10px' }}>
            <div className="columns-list" style={{ minHeight: '300px' }}>
                <h2>Saved Configurations</h2>
                {configs.map((config) => (
                    <Card key={config._id} className="column-card draggable" style={{ display: 'flex' }} onClick={() => handleSelect(config._id)}>
                        <CardContent className='card-content'>
                            <Grid container>
                                <Grid item xs={4} style={{ textAlign: 'left' }}>
                                    {config.selected === true &&
                                        <IconButton
                                            color="primary"
                                            aria-label="select configuration"
                                            component="span"
                                            onClick={() => handleSelectConfig(config)}
                                        >
                                            <CheckCircleIcon style={{ color: 'green' }} />
                                        </IconButton>
                                    }
                                </Grid>
                                <Grid item xs={4} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <Typography className="config-title">{config.name}</Typography>
                                </Grid>
                              {config?.name?.toLowerCase() !== 'default' && <Grid item xs={4} style={{ textAlign: 'right' }}>
                                    <IconButton
                                        color="primary"
                                        aria-label="edit configuration"
                                        component="span"
                                        onClick={(e) => handleEditConfig(e, config)}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        color="primary"
                                        aria-label="edit configuration"
                                        component="span"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemove(config);
                                        }}
                                    >
                                        <DeleteOutlineIcon style={{ color: 'red' }} />

                                    </IconButton>

                                </Grid>}
                            </Grid>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
            <Button 
            variant = 'contained'
            sx={{ bgcolor: '#a3a3ab' }}
            onClick={() => {
                closeHandler()
            }}>Close</Button>
                
        </div>
    );
};

export default SavedConfigurationsComponent;

