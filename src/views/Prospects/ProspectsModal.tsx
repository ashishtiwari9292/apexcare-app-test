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
    Autocomplete as MuiAutocomplete,
    Divider,
} from '@mui/material';
import API from '../../services/AxiosConfig';
import { toast } from 'react-toastify';
import { useAuth, useCompany } from 'hooks';
import { ArchiveModal, Checkbox, FormAutocomplete, FormDatePicker, FormInput, Modal } from 'components';
import { useState, useEffect, useMemo } from 'react';
import Autocomplete from 'components/Form/Autocomplete';
import { useNavigate, useParams } from 'react-router-dom';
import { stateList } from '../../views/ReferralPartners/statesList';
import InitialCallCarePlan from './InitialCallCarePlan';
import { useFilter } from 'pages/Marketing/ReferralPartners/ReferralFilterContext';


function ProspectsModal({ closeMe, currentRow, detail = false, type, fetchProspectData }: any) {
    const { user } = useAuth();
    const { locations, users, setClients, clients } = useCompany();
    const navigate = useNavigate()
    const [partners, setPartners] = useState([])
    const [stageOptions, setStageOptions] = useState([])
    const [inactiveStageOptions, setInactiveStageOptions] = useState([])
    const [leadSourceOptions, setLeadSourceOptions] = useState([])
    const [lostClientReasons, setLostClientReasons] = useState([])
    const [companies, setCompanies] = useState([])
    const [archiveOpenModal, setArchiveOpenModal] = useState(false)
    const [openClientModal, setOpenClientModal] = useState(false)
    const [contactTypes, setContactTypes] = useState([])
    const [contactRelationships, setContactRelationships] = useState([])
    const [openModal, setOpenModal] = useState(false)
    const [initialCarePlan, setInitialCarePlan] = useState(null)
    const { prospectId, referralPartnerId } = useParams()
    const [radio, setRadio] = useState('Outside Sales')
    const {toggleUpdateComponent} = useFilter()

    const validationSchema = yup.object({
        location: yup.string().required('Location is required'),
        marketingManager: yup.object().typeError('Marketing Manager is required').required('Marketing Manager is required'),
        firstName: yup.string().required('first name is required').typeError('first name is required'),
        lastName: yup.string().required('last name is required').typeError('last name is required'),
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
        lostClientReason: yup.string().when('stage', { is: 'Closed Lost', then: yup.string().required('Lost Client Reason is required') }),
        status: yup.string().required('Status is required'),
        activeDate: yup.string().when('status', { is: 'Active', then: yup.string().required('Active date is required') }),
        inactiveDate: yup.date().nullable().when('status', { is: 'Inactive', then: yup.date().required('Inactive date is required') }),
        stage: yup.string().required('Stage is required'),
        leadSource: yup.string().required('Source is required'),
        referralPartner: yup.object().nullable().when('leadSource', { is: 'Referral Partner', then: yup.object().typeError('Referral Partner is required').required('Referral Partner is required') })
    });

    const toggleOpenClientModal = () => {
        setOpenClientModal(!openClientModal)
    }
    const editProspect = async (values: any) => {
        const DataRsp = await API.put('prospects/prospect/' + prospectId, { ...values, salesType: radio })
            .then((rsp) => {
                if (rsp.data) {
                    toast.success('Successfully edit Prospect!');
                    closeMe && closeMe();
                }
            })
            .catch((err) => {
                toast.error('Failed to edit Prospect')
            });
    };

    const fetchStageOptions = async (bool?: any) => {
        const options: any = await API.get('/stage-options/activity/search/Active')
        if (bool === true) {
            setInactiveStageOptions(options.data.data.filter((item: any) => item.type === 'Closed Won' || item.type === 'Closed Lost'))
        } else {
            setStageOptions(options.data.data.filter((item: any) => item.type !== 'Closed Won' && item.type !== 'Closed Lost'))
        }
    }

    const fetchLeadSourceOptions = async () => {
        const options: any = await API.get('/lead-source/activity/search/Active')
        setLeadSourceOptions(options.data.data)
    }

    const fetchLostClientReasons = async () => {
        const options: any = await API.get('/lost-client/activity/search/Active')
        setLostClientReasons(options.data.data)
    }

    const createInitialCarePlan = (id: any) => {
        if (id && initialCarePlan) {
            API.post('/initialCarePlan', { initialCarePlan, prospect: id })
                .then(data => {
                    console.log(data)
                })
                .catch(err => {
                    console.log(err)
                })
        }
    }

    const createProspect = (values: any) => {
        API.post('/prospects', { ...values, salesType: radio, createdBy: user._id })
            .then((rsp) => {
                if (rsp.data) {
                    toggleUpdateComponent()
                    createInitialCarePlan(rsp.data._id)
                    toast.success('Successfully added Prospect.');
                    closeMe(rsp.data);
                }
            })
            .catch((error) => {
                toast.error('Failed to add Prospect.');
                console.error(error);
            });
    };

    const getReferralPartners = async () => {
        let partners = await API.get('/referral-partners')
        let data = partners.data.data
        const sorted = data?.filter((partner: any) => {
            if(formik?.values?.companyName){
                return partner?.location?.location === formik?.values?.location && partner?.companyName?.companyName === formik?.values?.companyName
            }
            return partner?.location?.location === formik?.values?.location
        })
        setPartners(sorted)
    }

    const archiveProspect = () => {
        setArchiveOpenModal(true)
    }


    useEffect(() => {
        currentRow && setRadio(currentRow?.salesType)
    }, [currentRow])

    const getReferralPartnerByParam = async (id: any) => {
        try {
            const partner = await API.get(`/referral-partners/${id}`)
            formik.setFieldValue('referralPartner', partner.data.data)
        } catch (err: any) {
            console.error(err)
        }
    }

    const fetchContactTypes = async () => {
        const options: any = await API.get('/contact-type/activity/search/Active')
        setContactTypes(options.data.data)
    }

    const fetchContactRelationships = async () => {
        const options: any = await API.get('/contact-relationships/activity/search/Active')
        setContactRelationships(options.data.data)
    }

    // const convertToClient = async () => {
    //     try {
    //         await formik.handleSubmit()

    //         if (Object.keys(formik.errors).length === 0) {
    //             const converted = await API.put(`/prospects/convert-to-client/${prospectId}`, { user: user })
    //             let client = converted.data.data
    //             let updatedClients = [...clients, client]
    //             setClients(updatedClients)
    //             if (converted) {
    //                 toast.success('Successfully converted Prospect to Client.')
    //             }
    //         } else {
    //             toast.error('Please complete required fields before adding to Clients.')
    //         }
    //         fetchProspectData()
    //     } catch (err: any) {
    //         console.error(err)
    //         toast.error('Failed to convert Prospect to Client.')
    //     }
    // }
    const convertToClient = async () => {
    
        try {
            await formik.handleSubmit()
    
            if (Object.keys(formik.errors).length === 0) {
                const converted = await API.put(`/prospects/convert-to-client/${prospectId}`, { user: user })
    
                let client = converted.data.data;
                let updatedClients = [...clients, client];
                setClients(updatedClients)
    
                if (converted) {
                    toast.success('Successfully converted Prospect to Client.');
                }
            } else {
                toast.error('Please complete required fields before adding to Clients.');
            }
    
            fetchProspectData();
        } catch (err: any) {
            console.error("Error encountered:", err); // Log any errors
            toast.error('Failed to convert Prospect to Client.');
        }
    }
    const fetchCompanies = async () => {
        const company = await API.get('referral-partners/companies/listing')
        let data = company.data.data
        const sorted = data.filter((company: any) => {
            return company.location.location === formik.values.location
        })
        setCompanies(sorted)
    }

    useEffect(() => {
        referralPartnerId && getReferralPartnerByParam(referralPartnerId)
    }, [referralPartnerId])

    const formik = useFormik({
        initialValues: {
            location: currentRow?.location?.location || user?.location.location,
            marketingManager: currentRow?.marketingManager || user,
            referralPartner: currentRow?.referralPartner || null,
            firstName: currentRow?.firstName ? currentRow?.firstName : currentRow?.fullName || '',
            lastName: currentRow?.lastName || '',
            contactFirstName: currentRow?.contactFirstName || '',
            contactLastName: currentRow?.contactLastName || '',
            mainPhone: currentRow?.mainPhone || '',
            contactMainPhone: currentRow?.contactMainPhone || '',
            email: currentRow?.email || '',
            contactEmail: currentRow?.contactEmail || '',
            address1: currentRow?.address1 || '',
            address2: currentRow?.address2 || '',
            city: currentRow?.city || '',
            state: currentRow?.state || '',
            status: currentRow ? currentRow?.status === true ? 'Active' : 'Inactive' : 'Active',
            zip: currentRow?.zip || '',
            stage: currentRow?.stage?.type || 'Inquiry Received',
            flagged: currentRow?.flagged || false,
            lostClientReason: currentRow?.lostClientReason?.type || "",
            leadSource: currentRow?.leadSource?.type || 'Referral Partner',
            activeDate: currentRow?.activeDate || '',
            inactiveDate: currentRow?.inactiveDate || '',
            comments: currentRow?.comments || '',
            companyName: currentRow?.companyName?.companyName || '',
            contactType: currentRow?.contactType?.type || '',
            contactRelationship: currentRow?.contactRelationship?.type || ''
        },
        enableReinitialize: true,
        validationSchema: validationSchema,
        onSubmit: (values, { setSubmitting }) => {

            detail ? editProspect(values) : createProspect(values)
            closeMe && closeMe();
        },
    });
    useEffect(() => {
        currentRow?.state && formik.setFieldValue('state', currentRow?.state)
        currentRow?.activeDate && formik.setFieldValue('activeDate', currentRow?.activeDate)

    }, [currentRow])
    useEffect(() => {
        if (formik.values.leadSource !== 'Referral Partner') {
            formik.setFieldValue('referralPartner', null)
        }
    }, [formik.values])
    useEffect(() => {
        getReferralPartners()
        if (!detail) {
            formik.setFieldValue('activeDate', new Date())
        }
        fetchStageOptions(true)
        fetchCompanies()
        fetchStageOptions(false)
        fetchLeadSourceOptions()
        fetchLostClientReasons()
        fetchContactTypes()
        fetchContactRelationships()

    }, [formik.values.companyName, formik.values.location])


    
    return (
        <>
            <form onSubmit={formik.handleSubmit}>
                <Stack style={{ padding: detail ? '30px 5vw 50px 5vw' : '20px', }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <h2 className="fs-30 pt">{detail ? "Prospect " : 'Add Prospect'}{detail ? `- ${formik?.values?.firstName} ${formik?.values?.lastName}` : ''}</h2>

                        <RadioGroup
                            aria-labelledby="demo-controlled-radio-buttons-group"
                            name="controlled-radio-buttons-group"
                            row
                            value={radio}
                            onChange={(e) => setRadio(e.target.value)}
                        >
                            <FormControlLabel value={'Outside Sales'} control={<Radio />} label={'Outside Sales'} />
                            <FormControlLabel value={'Inside Sales'} control={<Radio />} label={'Inside Sales'} />
                            {/* <FormControlLabel defaultChecked={true} value="All" control={<Radio />} label="All" /> */}
                        </RadioGroup>
                    </div>
                    <ArchiveModal
                        open={archiveOpenModal}
                        closeHandler={() => {
                            setArchiveOpenModal(false)
                            fetchProspectData()
                        }}
                        collectionName="prospects"
                        selected={{ ...currentRow, id: prospectId }}
                        label="Prospect"
                        lostClientReasons={lostClientReasons}
                        stageOptions={inactiveStageOptions}
                    />
                    <Box
                        sx={{

                            display: 'grid',
                            gridTemplateColumns: '50% 50%',
                            gap: '15px',
                        }}
                    >
                        <FormControl fullWidth>
                            <InputLabel id="demo-simple-select-label">Location*</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                error={formik.touched.location && Boolean(formik.errors.location)}
                                id="demo-simple-select"
                                value={formik.values.location}
                                label="Location"
                                name="location"
                                onChange={formik.handleChange}
                            >
                                {locations.map((l: any) => (
                                    <MenuItem value={l.location}>{l.location}</MenuItem>
                                ))}
                            </Select>
                            <FormHelperText className='red'>
                                {formik.touched.location && formik.errors.location}
                            </FormHelperText>
                        </FormControl>
                        <Autocomplete
                            value={formik?.values?.marketingManager}
                            options={
                                [
                                    { id: '', firstName: '', lastName: '' },
                                    ...users
                                ]
                            }
                            onChange={(event: any, newValue: any | null) => {
                                if (null || !newValue) {
                                    formik.setFieldValue('marketingManager', { id: '', firstName: '', lastName: '' });
                                }
                                else {
                                    formik.setFieldValue('marketingManager', { _id: newValue._id, firstName: newValue.firstName, lastName: newValue.lastName });
                                }
                            }}
                            label='Created By*'
                            marginTop='0px'
                            error={formik.touched.marketingManager && Boolean(formik.errors.marketingManager)}
                            helperText={formik.touched.marketingManager && formik.errors.marketingManager}
                        />


                        <FormControl sx={{ width: '100%' }}>
                            <TextField
                                type="text"
                                id="my-input"
                                aria-describedby="my-helper-text"
                                name="contactFirstName"
                                multiline
                                maxRows={4}
                                label="Contact First Name"
                                value={formik.values.contactFirstName ? formik.values.contactFirstName : ''}
                                onChange={formik.handleChange}
                                error={formik.touched.contactFirstName && Boolean(formik.errors.contactFirstName)}
                                helperText={formik.touched.contactFirstName && formik.errors.contactFirstName}
                            />
                        </FormControl>
                        <FormControl sx={{ width: '100%' }}>
                            <TextField
                                type="text"
                                id="my-input"
                                aria-describedby="my-helper-text"
                                name="contactLastName"
                                multiline
                                maxRows={4}
                                label="Contact Last Name"
                                value={formik.values.contactLastName ? formik.values.contactLastName : ''}
                                onChange={formik.handleChange}
                                error={formik.touched.contactLastName && Boolean(formik.errors.contactLastName)}
                                helperText={formik.touched.contactLastName && formik.errors.contactLastName}
                            />
                        </FormControl>
                        <FormControl sx={{ width: '100%' }}>
                            <TextField
                                type="text"
                                id="my-input"
                                aria-describedby="my-helper-text"
                                name="contactMainPhone"
                                multiline
                                maxRows={4}
                                label="Contact Primary Phone"
                                inputProps={{ inputmode: 'numeric', pattern: '[0-9]*', maxLength: 12 }}
                                value={formik.values.contactMainPhone ? formik.values.contactMainPhone : ''}
                                onChange={(e) => {
                                    const re = /^[0-9-( )]+$/gm
                                    if (e.target.value === '' || re.test(e.target.value)) {
                                        formik.setFieldValue('contactMainPhone', e.target.value)
                                    }
                                }}
                                error={formik.touched.contactMainPhone && Boolean(formik.errors.contactMainPhone)}
                                helperText={formik.touched.contactMainPhone && formik.errors.contactMainPhone}
                            />
                        </FormControl>
                        <FormControl sx={{ width: '100%' }}>
                            <TextField
                                type="text"
                                id="my-input"
                                aria-describedby="my-helper-text"
                                name="contactEmail"
                                multiline
                                maxRows={4}
                                label="Contact Primary Email"
                                value={formik.values.contactEmail ? formik.values.contactEmail : ''}
                                onChange={formik.handleChange}
                                error={formik.touched.contactEmail && Boolean(formik.errors.contactEmail)}
                                helperText={formik.touched.contactEmail && formik.errors.contactEmail}
                            />
                        </FormControl>
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
                                    if (e.target.value === 'Self') {
                                        formik.setFieldValue('firstName', formik.values.contactFirstName)
                                        formik.setFieldValue('lastName', formik.values.contactLastName)
                                        formik.setFieldValue('mainPhone', formik.values.contactMainPhone)
                                        formik.setFieldValue('email', formik.values.contactEmail)
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
                            <InputLabel id="demo-simple-select-label">Contact Relationship{formik.values.contactType === 'Family' ? '*' : ''}</InputLabel>
                            <Select
                                disabled={formik.values.contactType !== 'Family'}
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
                        <Divider style={{ display: 'grid', gridColumn: '1/3', marginTop: '30px', marginBottom: '30px' }} />
                        <FormControl sx={{ width: '100%' }}>
                            <TextField
                                type="text"
                                id="my-input"
                                aria-describedby="my-helper-text"
                                name="firstName"
                                multiline
                                maxRows={4}
                                label="Prospect First Name*"
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
                                label="Prospect Last Name*"
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
                                label="Prospect Primary Phone*"
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
                                label="Prospect Primary Email"
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
                                label="Prospect Address 1"
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
                                label="Prospect Address 2"
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
                                label="Prospect City"
                                value={formik?.values?.city ? formik.values?.city : ''}
                                onChange={(e) => {
                                    formik.setFieldValue('city', e.target.value)
                                }}
                                error={formik.touched.city && Boolean(formik.errors.city)}
                                helperText={formik.touched.city && formik.errors.city}
                            />
                        </FormControl>
                        {/* <FormControl sx={{ width: '100%' }}>
                            <FormAutocomplete
                                margin="0px"
                                name="state"
                                label="State"
                                value={formik?.values?.state}
                                onChange={formik.handleChange}
                                error={formik.touched.state && Boolean(formik.errors.state)}
                                helperText={formik.touched.state && formik.errors.state}
                                autocompleteValue={formik.values.state}
                                options={stateList}
                                autocompleteOnChange={(event: any, newValue: any) => {
                                    formik.setFieldValue('state', newValue);
                                }}
                                required
                            />
                        </FormControl> */}
                        <FormControl sx={{ width: '100%' }}>
                            <MuiAutocomplete

                                style={{ width: '100%' }}
                                disablePortal
                                id="combo-box-demo"
                                options={stateList}
                                sx={{ width: 300 }}
                                renderInput={(params: any) => <TextField {...params} label="Prospect State" />}
                                value={formik.values.state}
                                defaultValue={formik.values.state}
                                onChange={(event: any, newValue: any) => {
                                    formik.setFieldValue('state', newValue);
                                }}

                            />
                        </FormControl>
                        <FormControl sx={{ width: '100%' }}>
                            <TextField
                                type="text"
                                id="my-input"
                                aria-describedby="my-helper-text"
                                name="zip"
                                multiline
                                maxRows={4}
                                label="Prospect Zip"
                                value={formik?.values?.zip ? formik.values?.zip : ''}
                                onChange={(e) => {
                                    const re = /^[0-9-( )]+$/gm
                                    if (e.target.value === '' || re.test(e.target.value)) {
                                        formik.setFieldValue('zip', e.target.value)
                                    }
                                }}
                                error={formik.touched.zip && Boolean(formik.errors.zip)}
                                helperText={formik.touched.zip && formik.errors.zip}
                            />
                        </FormControl>


                        <Divider style={{ display: 'grid', gridColumn: '1/3', marginTop: '30px', marginBottom: '30px' }} />
                        <FormControl fullWidth >
                            <InputLabel style={{ color: formik.touched.status && formik.errors.status ? 'red' : '' }} id="demo-simple-select-label">Status*</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={formik.values.status}
                                label="Status"
                                name="status"
                                error={formik.touched.status && Boolean(formik.errors.status)}

                                onChange={(e) => {
                                    if (e.target.value) {
                                        if (formik.values.status !== '') {
                                            formik.setFieldValue('status', '')
                                        }
                                        if (e.target.value === 'Inactive') {
                                            formik.setFieldValue('inactiveDate', new Date().toISOString())
                                            formik.setFieldValue('stage', '')
                                        } else {
                                            formik.setFieldValue('inactiveDate', '')
                                            formik.setFieldValue('stage', '')
                                        }
                                   

                                        formik.setFieldValue('status', e.target.value)
                                    }
                                }}
                            >
                                {['Active', 'Inactive'].map((status: any) => (
                                    <MenuItem value={status}>{status}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <div></div>

                        <div>
                            <FormDatePicker
                                name="activeDate"
                                label={formik.values.status === 'Active' ? `Active Date*` : 'Active Date'}
                                value={formik.values.activeDate}
                                onChange={formik.handleChange}
                                error={formik.touched.activeDate && Boolean(formik.errors.activeDate)}
                                helperText={formik.touched.activeDate && formik.errors.activeDate}
                                pickerOnChange={(newValue: String | null) => {
                                    if (newValue) {
                                        formik.setFieldValue('activeDate', newValue);
                                    }
                                }}
                            />
                        </div>
                        <FormDatePicker
                            name="inactiveDate"
                            disabled={formik?.values?.status === "Active"}
                            label={formik.values.status === 'Inactive' ? `Inactive Date*` : 'Inactive Date'}
                            value={formik.values.inactiveDate}
                            onChange={formik.handleChange}
                            error={formik.touched.inactiveDate && Boolean(formik.errors.inactiveDate)}
                            helperText={formik.touched.inactiveDate && formik.errors.inactiveDate}
                            pickerOnChange={(newValue: String | null) => {
                                if (newValue) {
                                    formik.setFieldValue('inactiveDate', newValue);
                                }
                            }}
                        />
                        <Divider style={{ display: 'grid', gridColumn: '1/3', marginTop: '30px', marginBottom: '30px' }} />
                        <FormControl fullWidth >
                            <InputLabel style={{ color: formik.touched.stage && formik.errors.stage ? 'red' : '' }} id="demo-simple-select-label">Stage*</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={formik.values.stage}
                                label="Stage"
                                name="stage"
                                error={formik.touched.stage && Boolean(formik.errors.stage)}

                                onChange={(e) => { formik.setFieldValue('stage', e.target.value) }}
                            >
                                {formik.values.status === 'Active' ? stageOptions.map((stage: any) => (
                                    <MenuItem value={stage.type}>{stage.type}</MenuItem>
                                )) : inactiveStageOptions.map((stage: any) => (
                                    <MenuItem value={stage.type}>{stage.type}</MenuItem>
                                ))}
                            </Select>
                            <FormHelperText style={{ color: 'red' }}>
                                {formik.touched.stage && formik.errors.stage}
                            </FormHelperText>
                        </FormControl>
                        <FormControl fullWidth >
                            <InputLabel style={{ color: formik.touched.lostClientReason && formik.errors.lostClientReason ? 'red' : '' }} id="demo-simple-select-label">Lost Client Reason{formik.values.stage === "Closed Lost" ? "*" : ""}</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                disabled={formik.values.stage !== 'Closed Lost'}
                                id="demo-simple-select"
                                value={formik.values.lostClientReason}
                                label="Lost Client Reason"
                                name="lostClientReason"
                                error={formik.touched.lostClientReason && Boolean(formik.errors.lostClientReason)}
                                onChange={(e) => {
                                    formik.setFieldValue('lostClientReason', e.target.value)
                                }}
                            >
                                {lostClientReasons.map((reason: any) => (
                                    <MenuItem value={reason.type}>{reason.type}</MenuItem>
                                ))}
                            </Select>
                            <FormHelperText style={{ color: 'red' }}>
                                {formik.touched.lostClientReason && formik.errors.lostClientReason}
                            </FormHelperText>
                        </FormControl>
                        <FormControl fullWidth >
                            <InputLabel style={{ color: formik.touched.leadSource && formik.errors.leadSource ? 'red' : '' }} id="demo-simple-select-label">Lead Source*</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={formik.values.leadSource}
                                label="leadSource"
                                name="Lead Source"
                                error={formik.touched.leadSource && Boolean(formik.errors.leadSource)}

                                onChange={(e) => {
                                    formik.setFieldValue('leadSource', e.target.value)
                                }}
                            >
                                {leadSourceOptions.map((source: any) => (
                                    <MenuItem value={source.type}>{source.type}</MenuItem>
                                ))}
                            </Select>
                            <FormHelperText style={{ color: 'red' }}>
                                {formik.touched.leadSource && formik.errors.leadSource}
                            </FormHelperText>
                        </FormControl>
                        <div></div>
                        {formik?.values?.leadSource === 'Referral Partner' && <> <Autocomplete
                            value={formik?.values?.referralPartner}
                            options={
                                [
                                    { id: '', firstName: '', lastName: '' },
                                    ...partners
                                ]
                            }
                            onChange={(event: any, newValue: any | null) => {
                                if (null || !newValue) {
                                    formik.setFieldValue('referralPartner', { id: '', firstName: '', lastName: '' });
                                }
                                else {
                                    formik.setFieldValue('referralPartner', { _id: newValue._id, firstName: newValue.firstName, lastName: newValue.lastName });
                                }
                            }}
                            label='Referral Partner*'
                            marginTop='0px'
                            error={formik.touched.referralPartner && Boolean(formik.errors.referralPartner)}
                            helperText={formik.touched.referralPartner && formik.errors.referralPartner}
                        />
                            <FormControl sx={{ width: '80%' }}>
                                <MuiAutocomplete
                                    disablePortal
                                    id="combo-box-demo"
                                    options={companies.map((company: any) => {
                                        return company.companyName
                                    })}
                                    sx={{ width: '100%' }}
                                    value={formik?.values?.companyName}
                                    renderInput={(params: any) => <TextField {...params} label="Company" error={formik.touched.companyName && Boolean(formik.errors.companyName)} />}
                                    isOptionEqualToValue={(option: any, value: any) => {
                                        return option === value
                                    }}
                                    onChange={(event: any, newValue: any) => {
                                        formik.setFieldValue(`companyName`, newValue)
                                    }}
                                />
                            </FormControl>
                        </>
                        }
                        <div style={{ marginTop: '-10px', }}>
                            <FormInput
                                labelProps={{
                                    shrink: true,
                                }}
                                type="text"
                                name="comments"
                                label="Comments"
                                value={formik.values.comments}
                                onChange={formik.handleChange}
                                error={formik.touched.comments && Boolean(formik.errors.comments)}
                                helperText={formik.touched.comments && formik.errors.comments}
                                textarea
                            />
                        </div>
                        <span >

                            <Button disabled={currentRow?.converted} variant="contained" sx={{ bgcolor: 'var(--primary-color)', width: '350px', height: '40px', marginBottom: '20px' }} onClick={() => setOpenModal(true)}>
                                {"INITIAL CALL CARE PLAN"}
                            </Button>

                            {formik.values.stage === 'Closed Won' ? <Button disabled={currentRow?.converted} variant="contained" sx={{ bgcolor: 'var(--primary-color)', width: '350px', height: '40px' }} onClick={() => convertToClient()}>
                                {"ADD TO CLIENTS"}
                            </Button> : <div style={{ marginTop: '' }}></div>}

                            <Checkbox checked={!!formik.values.flagged} onChange={() => formik.setFieldValue('flagged', !formik.values.flagged)} />
                        </span>
                    </Box>

                    <Modal open={openModal}
                        closeHandler={() => setOpenModal(false)} styles={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '50%',
                            bgcolor: 'background.paper',
                            border: '2px solid #000',
                            boxShadow: 24,
                            p: 4,
                            height: '90%',
                            overflowY: 'scroll'
                        }}


                    >
                        {/* <ProspectsModal closeMe={handleCloseModal} /> */}
                        <InitialCallCarePlan
                            closeMe={() => setOpenModal(false)}
                            prospectId={prospectId}
                            callback={(values: any) => {
                                setInitialCarePlan(values)
                                setOpenModal(false)
                            }} />
                    </Modal>
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
                        <div>                        {detail ?
                            <Button onClick={() => navigate('/marketing/prospects')} variant="contained" sx={{ bgcolor: 'var(--primary-color)', color: 'white' }} type="button">
                                Back
                            </Button>
                            :
                            <Button onClick={() => closeMe()} variant="contained" sx={{ bgcolor: '#a3a3ab' }} type="button">
                                Cancel
                            </Button>
                        }
                            {detail && <Button onClick={() => archiveProspect()} variant="contained" sx={{ bgcolor: 'var(--primary-color)' }} type="button" style={{ marginLeft: '10px' }}>
                                {'Archive'}
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

export default ProspectsModal
