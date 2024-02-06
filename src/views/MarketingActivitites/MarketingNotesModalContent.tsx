import { Box, Stack } from '@mui/material'
import React, { useState } from 'react'
import { useFormik } from 'formik';
import { FormAutocomplete, FormInput, ActionButtons, Checkbox, FormDatePicker, FormTimePicker, Modal, ArchiveModal } from 'components';
import { useCompany, useAuth } from 'hooks';
import Autocomplete from 'components/Form/Autocomplete';
import { useParams } from 'react-router-dom';
import API from 'services/AxiosConfig';
import { toast } from 'react-toastify';

interface Props {
    currentRow: any;
    closeHandler: any;
}

function MarketingNotesModalContent(props: Props) {
    const { referralPartnerId, prospectId } = useParams()
    const { currentRow, closeHandler } = props
    const { locations, clients, carePartners, careManagerActivities, users } = useCompany();
    const { user } = useAuth()
    const [checked,setChecked] = useState(currentRow?.state?.flag || false)
    const initialValues = {
        location: currentRow?.state?.location || user?.location,
        careManager: currentRow?.state?.careManager || user,
        subject: currentRow?.state?.subject || '',
        note: currentRow?.state?.note || '',
        date: currentRow?.state?.date || Date.now()

    }

    const editNote = async (values: any) => {
        let id = currentRow?.state?._id
        try {
            const edited = await API.put(`marketing-notes/`, { ...values,flag:checked, id: id })
            toast.success('Sucessfully edited note')
            closeHandler()
        } catch (err) {
            toast.success('Failed to edit note')
            closeHandler()
        }

    }

    const createNote = async (values: any) => {
        try {
            const created = await API.post(`marketing-notes/`, { ...values, flag:checked, marketingId: referralPartnerId || prospectId || '' })
            toast.success('Sucessfully created note')
            closeHandler()

        } catch (err) {
            console.error(err)
            toast.success('Failed to create note')
            closeHandler()
        }
    }
    const formik = useFormik({
        initialValues,
        onSubmit: (values) => {
            currentRow ? editNote(values) : createNote(values)
        }
    },
    );

    return (
        <form onSubmit={formik.handleSubmit}>
            <Stack>
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: '50% 50%',
                        columnGap: '15px',
                    }}
                >
                    <div className='modal-date-picker'>
                        <FormDatePicker
                            name="followupDate"
                            label="Date"
                            value={formik.values.date}
                            onChange={formik.handleChange}
                            error={formik.touched.date && Boolean(formik.errors.date)}
                            helperText={formik.touched.date && formik.errors.date}
                            pickerOnChange={(newValue: String | null) => {
                                if (newValue) {
                                    formik.setFieldValue('date', newValue);
                                }
                            }}
                            required
                        />
                    </div>
                    <Autocomplete
                        value={formik.values.careManager || undefined}
                        options={
                            [
                                { id: '', firstName: '', lastName: '' },
                                ...users
                            ]
                        }
                        onChange={(event: any, newValue: any | null) => {
                            if (null || !newValue) {
                                formik.setFieldValue('careManager', { id: '', firstName: '', lastName: '' });
                            }
                            else {
                                formik.setFieldValue('careManager', { _id: newValue._id, firstName: newValue.firstName, lastName: newValue.lastName });
                            }
                        }}
                        label='Created By'
                    />
                    <FormInput
                        labelProps={{
                            shrink: true,
                        }}
                        type="text"
                        name="subject"
                        label="Subject"
                        value={formik.values.subject}
                        onChange={formik.handleChange}
                        error={formik.touched.subject && Boolean(formik.errors.subject)}
                        helperText={formik.touched.subject && formik.errors.subject}
                    />

                    <FormInput
                        labelProps={{
                            shrink: true,
                        }}
                        type="text"
                        name="note"
                        label="Note"
                        value={formik.values.note}
                        onChange={formik.handleChange}
                        error={formik.touched.note && Boolean(formik.errors.note)}
                        helperText={formik.touched.note && formik.errors.note}
                        textarea
                    />
                </Box>
                <Checkbox checked={checked} onChange={() => setChecked(!checked)} name="flag" label="Flag" />
            </Stack>
            <ActionButtons renderEmail={false} closeHandler={closeHandler} />
        </form>
    )
}

export default MarketingNotesModalContent
