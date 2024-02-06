import { useFormik } from 'formik';
import * as yup from 'yup';
import {

    Box,
    InputLabel,
    Button,
    TextField,
    Select,
    MenuItem,
    FormHelperText,
    CardHeader as MuiCardHeader,
    Fab,
    FormControl,
    FormControlLabel,
    Radio,
    RadioGroup,
    Stack,
    Autocomplete,
} from '@mui/material';
import { useState } from 'react'
import API from '../../services/AxiosConfig';
import { toast } from 'react-toastify';
import { useAuth, useCompany } from 'hooks';
import { Checkbox, FormAutocomplete, FormInput } from 'components';
import { stateList } from '../../views/ReferralPartners/statesList';
import { useEffect } from 'react';
const contactTypeOptions = ['Family', 'Friend', 'Neighbor', 'Medical Professional', 'Other']
const contactRelationshipOptions = ['Spouse', 'Son', 'Daughter', 'Grandson', 'Granddaughter', 'Son-in-Law', 'Daughter-in-Law', 'Father', 'Mother', 'Father-in-Law', 'Mother-in-Law', 'Other']

function ContactsModal({ closeMe, currentRow, detail = false, type, prospectId, fetchContacts }: any) {
    const { user } = useAuth();
    const { locations, users } = useCompany();
    const [contactTypes, setContactTypes] = useState([])
    const [contactRelationships, setContactRelationships] = useState([])
    const [checked,setChecked] = useState(currentRow?.state?.flag || false)
    const validationSchema = yup.object({
        contactType: yup.string().required('Contact Type is required'),
        contactRelationship: yup.string().when('contactType', {
            is: 'Family',
            then: yup.string().required('Contact Relationship is required'),
            otherwise: yup.string()
          }),
        firstName: yup.string().required('Full Name is required'),
        lastName: yup.string().required('Full Name is required'),
        mainPhone: yup
            .string()
            .min(12, "Invalid format must be xxx-xxx-xxxx")
            .test(
                'len',
                'Invalid format must be xxx-xxx-xxxx',
                (val) => {
                    if (val == undefined) {
                        return true;
                    }
                    return !!val.match(/^\d{3}-\d{3}-\d{4}/)
                }
            ).required('Main Phone is required'),
    });
    const editContact = async (values: any) => {
        const DataRsp = await API.put('prospects/contact/' + currentRow?.state._id,{...values,flag:checked})
            .then((rsp) => {
                if (rsp.data.success) {
                    toast.success('Successfully Updated Contact!')
                    fetchContacts()
                }
            })
            .catch((err) => {
                toast.error('Failed to edit company.');
                console.error(err);
            });
    };

    const createContact = (values: any) => {
        API.post('/prospects/contact', { ...values, prospectId: prospectId,flag:checked, createdBy: user._id })
            .then((rsp) => {
                if (rsp.data.success) {
                    toast.success('Successfully Created Contact');
                    fetchContacts()
                }
            })
            .catch((error) => {
                toast.error('Failed to add contact.');
                console.error(error);
            });
    };


    const fetchContactTypes = async () => {
        const options: any = await API.get('/contact-type/activity/search/Active')
        setContactTypes(options.data.data)
    }

    const fetchContactRelationships = async () => {
        const options: any = await API.get('/contact-relationships/activity/search/Active')
        setContactRelationships(options.data.data)
    }

    const deleteContact = async () => {
        const DataRsp = await API.delete('prospects/contact/' + currentRow?.state?._id)
            .then((rsp) => {
                if (rsp.data.success) {
                    toast.success('Successfully deleted contact!')
                    fetchContacts()
                    closeMe()
                }
            })
            .catch((err) => {
                toast.error('Failed to delete Contact.');
                console.error(err);
                closeMe()
            });
    }

    const formik = useFormik({
        initialValues: {
            contactType: currentRow ? currentRow?.state?.contactType : '',
            contactRelationship: currentRow ? currentRow?.state?.contactRelationship?.type : '',
            firstName: currentRow ? currentRow?.state?.firstName : '',
            lastName: currentRow ? currentRow?.state?.lastName : '',
            mainPhone: currentRow ? currentRow?.state?.mainPhone : '',
            email: currentRow ? currentRow?.state?.email : '',
            address1: currentRow ? currentRow?.state?.address1 : '',
            address2: currentRow ? currentRow?.state?.address2 : '',
            city: currentRow ? currentRow?.state?.city : '',
            state: currentRow ? currentRow?.state?.state : '',
            zipCode: currentRow ? currentRow?.state?.zipCode : '',
            comments: currentRow ? currentRow?.state?.comments : ''
        },
        enableReinitialize: true,
        validationSchema: validationSchema,
        onSubmit: (values, { setSubmitting }) => {
            detail ? editContact(values) : createContact(values)
            closeMe();
        },
    });

    useEffect(() => {
        fetchContactTypes()
        fetchContactRelationships()
    }, [])

    return (
        <>
            <form onSubmit={formik.handleSubmit}>

                <Stack style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <h2 className="fs-30 pt">{detail ? 'Edit' : 'Add'} Contact</h2>
                    </div>
                    <Box
                        sx={{

                            display: 'grid',
                            gridTemplateColumns: '50% 50%',
                            gap: '15px',

                        }}
                    >
                        <FormControl fullWidth>
                            <InputLabel id="demo-simple-select-label">Contact Type*</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                error={formik.touched.contactType && Boolean(formik.errors.contactType)}
                                id="demo-simple-select"
                                value={formik.values.contactType}
                                label="Contact Type"
                                name="contactType"
                                onChange={(e) => {
                                    formik.handleChange(e);
                                    if (e.target.value !== 'Family') {
                                      formik.setFieldValue('contactRelationship', '');
                                    }
                                  }}
                            >
                                {contactTypes.map((option: any) => (
                                    <MenuItem value={option.type}>{option.type}</MenuItem>
                                ))}
                            </Select>
                            <FormHelperText style={{ color: 'red' }}>
                                {formik.touched.contactType && formik.errors.contactType}
                            </FormHelperText>
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel id="demo-simple-select-label">Contact Relationship{formik.values.contactType === 'Family' ? '*': ''}</InputLabel>
                            <Select
                                disabled = {formik.values.contactType !== 'Family'}
                                labelId="demo-simple-select-label"
                                error={formik.touched.contactRelationship && Boolean(formik.errors.contactRelationship)}
                                id="demo-simple-select"
                                value={formik.values.contactRelationship}
                                label="contactRelationship"
                                name="contactRelationship"
                                onChange={formik.handleChange}
                            >
                                {contactRelationships.map((option: any) => (
                                    <MenuItem value={option.type}>{option.type}</MenuItem>
                                ))}
                            </Select>
                            <FormHelperText style={{ color: 'red' }}>
                                {formik.touched.contactRelationship && formik.errors.contactRelationship}
                            </FormHelperText>
                        </FormControl>


                        <FormControl sx={{ width: '100%' }}>
                            <TextField
                                type="text"
                                id="my-input"
                                aria-describedby="my-helper-text"
                                name="firstName"
                                multiline
                                maxRows={4}
                                label="First Name*"
                                value={formik.values.firstName ? formik.values.firstName : ''}
                                onChange={formik.handleChange}
                                error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                                helperText={formik.touched.firstName && formik.errors.firstName}
                            />
                        </FormControl>
                        <FormControl sx={{ width: '100%' }}>
                            <TextField
                                type="text"
                                id="my-input"
                                aria-describedby="my-helper-text"
                                name="lastName"
                                multiline
                                maxRows={4}
                                label="Last Name*"
                                value={formik.values.lastName ? formik.values.lastName : ''}
                                onChange={formik.handleChange}
                                error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                                helperText={formik.touched.lastName && formik.errors.lastName}
                            />
                        </FormControl>
                        <FormControl sx={{ width: '100%' }}>
                            <TextField
                                type="text"
                                id="my-input"
                                aria-describedby="my-helper-text"
                                name="mainPhone"
                                multiline
                                maxRows={4}
                                label="Main Phone*"
                                inputProps={{ inputmode: 'numeric', pattern: '[0-9]*', maxLength: 12 }}
                                value={formik.values.mainPhone ? formik.values.mainPhone : ''}
                                onChange={(e) => {
                                    const re = /^[0-9-( )]+$/gm
                                    if (e.target.value === '' || re.test(e.target.value)) {
                                        formik.setFieldValue('mainPhone', e.target.value)
                                    }
                                }}
                                error={formik.touched.mainPhone && Boolean(formik.errors.mainPhone)}
                                helperText={formik.touched.mainPhone && formik.errors.mainPhone}
                            />
                        </FormControl>
                        <FormControl sx={{ width: '100%' }}>
                            <TextField
                                type="text"
                                id="my-input"
                                aria-describedby="my-helper-text"
                                name="email"
                                multiline
                                maxRows={4}
                                label="Email"
                                value={formik.values.email ? formik.values.email : ''}
                                onChange={formik.handleChange}
                                error={formik.touched.email && Boolean(formik.errors.email)}
                                helperText={formik.touched.email && formik.errors.email}
                            />
                        </FormControl>
                        <FormControl sx={{ width: '100%' }}>
                            <TextField
                                type="text"
                                id="my-input"
                                aria-describedby="my-helper-text"
                                name="address1"
                                multiline
                                maxRows={4}
                                label="Address 1"
                                value={formik?.values?.address1 ? formik.values?.address1 : ''}
                                onChange={(e) => {
                                    formik.setFieldValue('address1', e.target.value)
                                }}
                                error={formik.touched.address1 && Boolean(formik.errors.address1)}
                                helperText={formik.touched.address1 && formik.errors.address1}
                            />
                        </FormControl>
                        <FormControl sx={{ width: '100%' }}>
                            <TextField
                                type="text"
                                id="my-input"
                                aria-describedby="my-helper-text"
                                name="address2"
                                multiline
                                maxRows={4}
                                label="Address 2"
                                value={formik?.values?.address2 ? formik.values?.address2 : ''}
                                onChange={(e) => {
                                    formik.setFieldValue('address2', e.target.value)
                                }}
                                error={formik.touched.address2 && Boolean(formik.errors.address2)}
                                helperText={formik.touched.address2 && formik.errors.address2}
                            />
                        </FormControl>
                        <FormControl sx={{ width: '100%' }}>
                            <TextField
                                type="text"
                                id="my-input"
                                aria-describedby="my-helper-text"
                                name="city"
                                multiline
                                maxRows={4}
                                label="City"
                                value={formik?.values?.city ? formik.values?.city : ''}
                                onChange={(e) => {
                                    formik.setFieldValue('city', e.target.value)
                                }}
                                error={formik.touched.city && Boolean(formik.errors.city)}
                                helperText={formik.touched.city && formik.errors.city}
                            />
                        </FormControl>
                        <FormControl sx={{ width: '100%' }}>
                            <Autocomplete
                                style={{ width: '100%' }}
                                disablePortal
                                id="combo-box-demo"
                                options={stateList}
                                sx={{ width: 300 }}
                                renderInput={(params) => <TextField {...params} value={formik.values.state} label="State" />}
                                defaultValue={formik.values.state}
                                onChange={(event: any, newValue: any) => {
                                    formik.setFieldValue('state', newValue);
                                }}

                            />
                        </FormControl>
                        <div style={{ marginTop: '-10px', }}>
                            <FormInput
                                labelProps={{
                                    shrink: true,
                                }}
                                type="text"
                                name="comments"
                                label="Notes"
                                value={formik.values.comments}
                                onChange={formik.handleChange}
                                error={formik.touched.comments && Boolean(formik.errors.comments)}
                                helperText={formik.touched.comments && formik.errors.comments}
                                textarea
                            />
                        </div>
                        <FormControl sx={{ width: '100%' }}>
                            <TextField
                                type="text"
                                id="my-input"
                                aria-describedby="my-helper-text"
                                name="zipCode"
                                multiline
                                maxRows={4}
                                label="Zip Code"
                                value={formik?.values?.zipCode ? formik.values?.zipCode : ''}
                                onChange={(e) => {
                                    const re = /^[0-9-( )]+$/gm
                                    if (e.target.value === '' || re.test(e.target.value)) {
                                        formik.setFieldValue('zipCode', e.target.value)
                                    }
                                }}
                                error={formik.touched.zipCode && Boolean(formik.errors.zipCode)}
                                helperText={formik.touched.zipCode && formik.errors.zipCode}
                            />
                        </FormControl>
                   
                    </Box>
                    <Checkbox checked={checked} onChange={()=>setChecked(!checked)} />
                    <Box
                        sx={{
                            padding: '20px 0px 10px 0px',
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '15px',

                        }}
                    >
                        <div>
                            { <Button onClick={() => closeMe()} variant="contained" sx={{ bgcolor: '#a3a3ab' }} type="button">
                                Cancel
                            </Button>}

                            {detail && <Button onClick={() => deleteContact()} variant="contained" sx={{ bgcolor: 'red' }} type="button" style={{ marginLeft: '10px' }}>
                                {'Delete'}
                            </Button>}
                        </div>

                        <Button variant="contained" sx={{ bgcolor: 'var(--primary-color)' }} type="submit">
                            {detail ? 'Update' : 'Submit'}
                        </Button>

                    </Box>
                </Stack>

            </form>
        </>
    )
}

export default ContactsModal
