import React, { useState } from 'react'
import { useFormik } from 'formik';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { Fab, Grid, Stack, TextField, Tooltip, Button, Card, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { emailHandler } from 'lib';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

interface Props {
    closeHandler: () => void;
    data: any;
    title: string;
}

function AddEmailModal(props: Props) {
    const { closeHandler, data, title } = props
    const [emails, setEmails] = useState<any>([])



    const formik = useFormik({
        initialValues: {
            email: ''
        },
        enableReinitialize: true,

        onSubmit: (values) => {

            closeHandler();
        },
    });

    const validationSchema = yup.object({
        email: yup.string().email()
    });

    const handleSendEmail = () => {
        if (!emails) {
            toast.error('Must include at least one email recipient')
            closeHandler()
        } else {
            emailHandler(data, title, emails)
            toast.success('Successfully sent email')
            closeHandler()
        }
    }

    return (
        <Stack spacing={2}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '30px', marginBottom: '10px' }}>
                <TextField value={formik.values.email} onChange={(e) => formik.setFieldValue('email', e.target.value)} type='email' style={{ width: '70%' }} error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email} />
                <Tooltip title="Add Email" placement="bottom">
                    <Fab
                        color="primary"
                        aria-label="add"
                        onClick={async () => {
                            const isTrue = await validationSchema.isValid(formik.values)
                            if (isTrue) {
                                setEmails([...emails, formik.values.email])
                                formik.setFieldValue('email', '')

                            } else {
                                toast.error('Must be a valid email')
                            }
                        }}
                    >
                        <AddIcon />
                    </Fab>
                </Tooltip>
            </div>
            {emails.map((email: any, idx: number) => {
                return (<Card sx={{ width: '70%', marginBottom: '10px', height: '50px' }}>
                    <Tooltip title="Remove Email" placement="right">
                        <div style={{
                            display: "grid",
                            placeItems: "center start",
                            gridTemplateColumns: '1fr 1fr'
                        }}>
                            <div className='template-activity-label' style={{ fontWeight: '300 !important' }}>{email}</div>
                            <div style={{ justifySelf: 'flex-end' }}>
                                <IconButton
                                    sx={{
                                        bgcolor: 'primary.main',
                                        color: 'white',
                                        marginRight: '8px'
                                    }}
                                    aria-label="Remove Item"
                                    onClick={() => {
                                        const copy = emails.slice()
                                        copy.splice(idx,1)
                                        setEmails(copy)
                                    }}
                                >
                                    <DeleteOutlineIcon />
                                </IconButton>
                            </div>
                        </div>
                    </Tooltip>
                </Card>)
            })}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button onClick={closeHandler} variant="contained" sx={{ bgcolor: '#a3a3ab' }} type="button">
                    Cancel
                </Button>
                <Button onClick={handleSendEmail} variant="contained" sx={{ bgcolor: 'var(--primary-color)' }} type="button">
                    Send
                </Button>

            </div>
        </Stack >



    )
}

export default AddEmailModal
