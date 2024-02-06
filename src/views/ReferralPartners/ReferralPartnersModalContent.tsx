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
    Backdrop
} from '@mui/material';
import API from '../../services/AxiosConfig';
import { toast } from 'react-toastify';
import { useAuth, useCompany } from 'hooks';
import { ArchiveModal, Checkbox, FormAutocomplete, FormDatePicker, FormInput, Modal, Spinner } from 'components';
import { stateList, stateMap } from './statesList';
import { useState, useEffect, useMemo } from 'react';
import Autocomplete from 'components/Form/Autocomplete';
import { useParams } from 'react-router-dom';
import CompaniesModalContent from './CompaniesModalContent';
import { useNavigate } from 'react-router-dom';
import { useFilter } from 'pages/Marketing/ReferralPartners/ReferralFilterContext';



interface editReferralPartnerProps {
    closeMe: () => void;
    currentRow?: any;
    detail?: boolean;
    type: any;
}

const ReferralPartnersModalContent = ({ closeMe, currentRow, detail = false, fetch }: any) => {
    const { locations, users } = useCompany();
    const { user } = useAuth();
    const [companies, setCompanies] = useState([])
    const [loading, setLoading] = useState(false)
    const [types, setTypes] = useState([])
    const [referral, setReferral] = useState({ id: '', companyType: '' })
    const [companyAddressInfo, setCompanyAddressInfo] = useState<any>({})
    const [archiveOpenModal, setArchiveOpenModal] = useState(false)
    const [companyModal, setCompanyModal] = useState(false)
    const [submitClicked,setSubmitClicked]= useState(false)
    const params = useParams()
    const { referralPartnerId, companyId } = params
    const {toggleUpdateComponent}= useFilter()
    const navigate = useNavigate();

    const fetchCompanies = async () => {
        try {
            const comp = await API.get('referral-partners/companies/listing');
            comp && (setCompanies(comp.data.data.filter((company:any)=>{
               return company.location.location === formik.values.location
            })))
            let dict: any = {}
            if (comp) {
                const mappedData = comp.data.data.map((company: any) => {
                    const { city, state, address1, address2, zipCode, companyType } = company;
                    let key: any = company.companyName
                    dict[key] = { city, state, address1, address2, zipCode, companyType };
                    return company
                });
                setCompanyAddressInfo(dict);
            }
        } catch (err) {
            console.log(err);
        }
    };
    const fetchCompaniesTypes = async () => {
        try {
            const comp:any = await API.get('referral-partners/types/listing')
           
            comp && (setTypes(comp.data.data))
        } catch (err) {
            console.log(err)
        }
    }

    const handleCloseModal = () => {
        setCompanyModal(false);
    };

    const editApplicant = async (values: any, setSubmitting: any,) => {
        const DataRsp = await API.put('referral-partners/' + referralPartnerId, values)
            .then((rsp) => {
                if (rsp.data) {
                    toast.success('Successfully Updated Applicant!');
                    closeMe();
                }
            })
            .catch((err) => { });
    };
    const archiveReferralPartner = async () => {
        setArchiveOpenModal(true)
    }

    const createApplicant = (values: any) => {
        API.post('/referral-partners', { ...values, createdBy: user._id })
            .then((rsp) => {
                if (rsp.data) {
                    toggleUpdateComponent()
                    toast.success('Successfully Added Referral Partner.');
                    closeMe(rsp.data);
                }
            })
            .catch((error) => {
                toggleUpdateComponent()
                toast.error('Failed to add referral partner.');
                console.error(error);
            });
    };

    const handleAddComp = (comp?: any) => {

        if (comp) {
            const { companyName } = comp
            formik.setFieldValue('company', companyName);
        } else {
            formik.setFieldValue('company', '');
        }
        setCompanyModal(false);
    }




    useEffect(() => {
        currentRow && formik.setFieldValue('status', currentRow?.status ? 'Active' : 'Inactive')
        currentRow && formik.setFieldValue('inactiveDate', currentRow?.inactiveDate)
    }, [currentRow])



    const validationSchema = yup.object({
        location: yup.string().required('Location is required').nullable(),
        firstName: yup.string().required('Full Name is required'),
        lastName: yup.string().required('Full Name is required'),
        company: yup.string().required('Company is required').typeError('Company is required'),
        referralType: yup.string().required('Company Type is required').typeError('Company Type is required'),
        title: yup.string().required('Title is required'),
        activeDate: yup.date().when('status', { is: 'Active', then: yup.date().required('Active date is required') }),
        inactiveDate: yup.date().nullable().when('status', { is: 'Inactive', then: yup.date().typeError('Invalid Date').required('Inactive date is required') }),
        referringStatus: yup.string().required('Referring Status is required'),
        referralPotential: yup.string().required('Referral Potential is required'),
        activityGoal: yup.string().required('Activity Goal is required'),
        mobilePhone: yup
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
            ),
        officePhone: yup
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
            ),
    });

    useEffect(() => {
        referralPartnerId && fetchCompany()
    }, [referralPartnerId])





    const formik = useFormik({
        initialValues: {
            flag: currentRow?.flagged || false,
            location: currentRow?.location?.location || user?.location?.location,
            firstName: currentRow?.firstName || '',
            lastName: currentRow?.lastName || "",
            activeDate: currentRow?.activeDate || new Date(),
            primaryEmail: currentRow?.primaryEmail || '',
            secondaryEmail: currentRow?.secondaryEmail || '',
            comments: currentRow?.comments || null,
            companyType:'',
            mobilePhone: currentRow?.mobilePhone || '',
            officePhone: currentRow?.officePhone || '',
            status: currentRow ? (currentRow?.status ? "Active" : "Inactive") : "Active",
            inactiveDate: currentRow?.inactiveDate || '',
            address1: currentRow?.address1 || '',
            address2: currentRow?.address2 || '',
            city: currentRow?.city || '',
            state: currentRow?.state || '',
            zip: currentRow?.zipcode || '',
            title: currentRow?.title || '',
            company: currentRow?.companyName ? currentRow.companyName.companyName : '',
            referralType: currentRow?.referralType ?  currentRow?.referralType?.companyType  : '',
            referringStatus: currentRow ? currentRow?.referringStatus : '',
            referralPotential: currentRow ? currentRow?.referralPotential : '',
            activityGoal: currentRow ? currentRow?.activityGoal : '',
            marketingManager: currentRow ? currentRow.accountOwner : user,
            careManager: currentRow ? currentRow?.careManager : { id: '', firstName: '', lastName: '' }

        },
        validationSchema: validationSchema,
        onSubmit: (values, { setSubmitting }) => {
            currentRow ? editApplicant(values, setSubmitting) : createApplicant(values);
            closeMe();
        },
    });
    useEffect(() => {
        if (submitClicked && !formik.isValid && Object.keys(formik.errors).length > 0) {
          const errorCount = Object.keys(formik.errors).length;
          toast.error(`${errorCount} validation error${errorCount > 1 ? 's' : ''} found`);
          setSubmitClicked(false); 
        }
      }, [formik.isValid, formik.errors,submitClicked]);

    useEffect(() => {
        fetchCompanies()
        fetchCompaniesTypes()
    }, [formik?.values?.location])



    const fetchCompany = async () => {
        try {
            setLoading(true)
            const comp = await API.get(`referral-partners/company/${referralPartnerId}`)
   
            if (comp && !currentRow) {
                formik.setFieldValue('company', comp?.data?.data?.companyName)
                formik.setFieldValue('address1', comp?.data?.data?.address1)
                formik.setFieldValue('address2', comp?.data?.data?.address2)
                formik.setFieldValue('city', comp?.data?.data?.city)
                formik.setFieldValue('state', comp?.data?.data?.state)
                formik.setFieldValue('zip', comp?.data?.data?.zipCode)
                formik.setFieldValue('officePhone', comp?.data?.data?.phoneNumber)
                formik.setFieldValue('companyType', comp?.data?.data?.companyType)
            }
            setLoading(false)
        } catch (err) {
            console.log(err)
            setLoading(false)
        }
    }
    return (
        <>
            <Box sx={{ padding: detail ? '30px 5vw 50px 5vw' : '20px', }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <h2 className="fs-30 pt">{currentRow ? detail ? '' : 'Edit' : 'Add'} Referral Partner {detail ? `- ${formik?.values?.firstName} ${formik?.values?.lastName}` : ''} </h2>
                </div>
                {loading && <div><Backdrop
                    sx={{ color: '#fff', zIndex: (theme:any) => theme.zIndex.drawer + 1 }}
                    open={true}
                > <Spinner  
                    color={'white'}
                /></Backdrop></div>}
                <form onSubmit={formik.handleSubmit}>
                    <Stack>
                        <ArchiveModal
                            open={archiveOpenModal}
                            closeHandler={() => {
                                fetch()
                                setArchiveOpenModal(false)


                            }}
                            collectionName="referral-partners"
                            selected={{ ...currentRow, id: referralPartnerId }}
                            label="Referral Partner"
                        />
                        <Modal open={companyModal} closeHandler={handleCloseModal} >
                            <CompaniesModalContent closeMe={handleAddComp} />
                        </Modal>
                        <Box
                            sx={{
                                paddingTop: '20px',
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
                                value={formik?.values?.marketingManager || user}
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
                                label='Marketing Manager*'
                                marginTop='0px'
                            />
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
                                <MuiAutocomplete
                                    disablePortal
                                    id="combo-box-demo"
                                    options={[
                                        'ADD COMPANY',
                                        ...companies.map((company: any) => {
                                            return company.companyName
                                        })]}
                                    sx={{ width: '100%' }}
                                    value={formik.values.company}
                                    renderInput={(params) => <TextField {...params} label="Company*" error={formik.touched.company && Boolean(formik.errors.company)} />}
                                    isOptionEqualToValue={(option, value) => {
                                        return option === value
                                    }}
                                    onChange={(event: any, newValue: any) => {
                                        if (newValue === null || !newValue) {
                                            formik.setValues({
                                                ...formik.values,
                                                company: '',
                                                address1: '',
                                                address2: '',
                                                city: '',
                                                state: '',
                                                zip: ''
                                            });
                                        } else if (newValue === 'ADD COMPANY') {
                                            setCompanyModal(true);
                                        } else {
                                            const addressInformation: any = companyAddressInfo[newValue];
                                            const { address1, address2, city, state, zipCode, companyType } = addressInformation;
                                            const stateKey = state ? (state.toUpperCase() as keyof typeof stateMap) : '';
                                            const s = stateKey ? stateMap[stateKey] : null;
                                            formik.setValues({
                                                ...formik.values,
                                                company: newValue,
                                                address1: address1,
                                                address2: address2,
                                                city: city,
                                                state: s,
                                                zip: zipCode,
                                                referralType:companyType.companyType
                                            });
                                        }
                                    }}



                                />
                                {formik.touched.company && Boolean(formik.errors.company) && (<FormHelperText
                                    error={formik.touched.company && Boolean(formik.errors.company)}
                                >Company is required</FormHelperText>)}
                            </FormControl>
                            <FormControl sx={{ width: '100%' }}>
                                <MuiAutocomplete
                                    disablePortal
                                    id="combo-box-demo"
                                    options={types.map((type: any) => type?.companyType)}
                                    getOptionLabel={(type: any) => type}
                                    sx={{ width: '100%' }}
                                    value={formik?.values?.referralType || ''}
                                    renderInput={(params) => <TextField {...params} error={formik.touched.referralType && Boolean(formik.errors.referralType)} helperText={formik.touched.referralType && formik.errors.referralType} label="Company Type*" />}
                                    isOptionEqualToValue={(option, value) => {
                                        return option === value
                                    }}
                                    onChange={(event: any, newValue: any) => {
                                        formik.setFieldValue('referralType', newValue)
                                    }}
                              
                                

                                />
                            </FormControl>
                            <FormControl sx={{ width: '100%' }}>
                                <TextField
                                    type="text"
                                    id="my-input"
                                    aria-describedby="my-helper-text"
                                    name="title"
                                    multiline
                                    maxRows={4}
                                    label="Title*"
                                    value={formik?.values?.title || ''}
                                    onChange={(e) => {

                                        formik.setFieldValue('title', e.target.value)
                                    }}
                                    error={formik.touched.title && Boolean(formik.errors.title)}
                                    helperText={formik.touched.title && formik.errors.title}
                                />
                            </FormControl>
                            <div></div>
                            <FormControl sx={{ width: '100%' }}>
                                <TextField
                                    type="text"
                                    id="my-input"
                                    aria-describedby="my-helper-text"
                                    name="mobilePhone"
                                    multiline
                                    maxRows={4}
                                    label="Mobile Phone"
                                    inputProps={{ inputmode: 'numeric', pattern: '[0-9]*', maxLength: 12 }}
                                    value={formik.values.mobilePhone ? formik.values.mobilePhone : ''}
                                    onChange={(e) => {
                                        const re = /^[0-9-( )]+$/gm
                                        if (e.target.value === '' || re.test(e.target.value)) {
                                            formik.setFieldValue('mobilePhone', e.target.value)
                                        }
                                    }}
                                    error={formik.touched.mobilePhone && Boolean(formik.errors.mobilePhone)}
                                    helperText={formik.touched.mobilePhone && formik.errors.mobilePhone}
                                />
                            </FormControl>
                            <FormControl sx={{ width: '100%' }}>
                                <TextField
                                    type="text"
                                    id="my-input"
                                    aria-describedby="my-helper-text"
                                    name="officePhone"
                                    multiline
                                    maxRows={4}
                                    label="Office Phone"
                                    inputProps={{ inputmode: 'numeric', pattern: '[0-9]*', maxLength: 12 }}
                                    value={formik.values.officePhone ? formik.values.officePhone : ''}
                                    onChange={(e) => {
                                        const re = /^[0-9-( )]+$/gm
                                        if (e.target.value === '' || re.test(e.target.value)) {
                                            formik.setFieldValue('officePhone', e.target.value)
                                        }
                                    }}
                                    error={formik.touched.officePhone && Boolean(formik.errors.officePhone)}
                                    helperText={formik.touched.officePhone && formik.errors.officePhone}
                                />
                            </FormControl>
                            <FormControl sx={{ width: '100%' }}>
                                <TextField
                                    type="text"
                                    id="my-input"
                                    aria-describedby="my-helper-text"
                                    name="primaryEmail"
                                    multiline
                                    maxRows={4}
                                    label="Primary Email"
                                    value={formik.values.primaryEmail ? formik.values.primaryEmail : ''}
                                    onChange={formik.handleChange}
                                    error={formik.touched.primaryEmail && Boolean(formik.errors.primaryEmail)}
                                    helperText={formik.touched.primaryEmail && formik.errors.primaryEmail}
                                />
                            </FormControl>
                            <div></div>
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
                                    renderInput={(params: any) => <TextField {...params} value={formik.values.state} label="State" />}
                                    value={formik?.values?.state || null}
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
                                    label="Zip Code"
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
                            <div></div>
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
                                                formik.setFieldValue('stage', '')
                                            }
                                            if (e.target.value === 'Inactive') {
                                                formik.setFieldValue('inactiveDate', new Date())
                                            } else {
                                                formik.setFieldValue('inactiveDate', null)
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
                                <InputLabel style={{ color: formik.touched.referringStatus && formik.errors.referringStatus ? 'red' : '' }} id="demo-simple-select-label">{"Referring Status"}</InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={formik.values.referringStatus}
                                    label="Referring Status"
                                    name="referringStatus"
                                    error={formik.touched.referringStatus && Boolean(formik.errors.referringStatus)}

                                    onChange={(e) => {
                                        if (e.target.value) {
                                            formik.setFieldValue('referringStatus', e.target.value)
                                        }
                                    }}
                                >
                                    {['Potential', 'Referring'].map((status: any) => (
                                        <MenuItem value={status}>{status}</MenuItem>
                                    ))}
                                </Select>
                                {formik.touched.referringStatus && Boolean(formik.errors.referringStatus) && (<FormHelperText error={formik.touched.referringStatus && Boolean(formik.errors.referringStatus)}>Referring Status Required</FormHelperText>)}
                            </FormControl>
                            <div></div>
                            {/* <FormControl fullWidth >
                                <InputLabel style={{ color: formik.touched.referralPotential && formik.errors.referralPotential ? 'red' : '' }} id="demo-sireferringStatusple-select-label">Refferal Potential*</InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={formik.values.referralPotential}
                                    label="Referral Potential *"
                                    name="referralPotential"
                                    error={formik.touched.referralPotential && Boolean(formik.errors.referralPotential)}

                                    onChange={(e) => {
                                        if (e.target.value) {
                                            formik.setFieldValue('referralPotential', e.target.value)
                                        }
                                    }}
                                >
                                    {['Refer weekly', 'Refer monthly', 'Refers multiple times per year', 'Does not refer. Contact only'].map((status: any) => (
                                        <MenuItem value={status}>{status}</MenuItem>
                                    ))}
                                </Select>
                                {formik.touched.referralPotential && Boolean(formik.errors.referralPotential) && (<FormHelperText error={formik.touched.referralPotential && Boolean(formik.errors.referralPotential)}>Referral Potential Required</FormHelperText>)}
                            </FormControl> */}

                            <FormControl sx={{ width: '100%' }}>
                                <TextField
                                    type="text"
                                    id="my-input"
                                    aria-describedby="my-helper-text"
                                    name="referralPotential"
                                    multiline
                                    maxRows={4}
                                    label="Referral Potential (per year)*"
                                    value={formik.values.referralPotential}
                                    onChange={(e) => {
                                        const re = /^\d+$/;
                                        if ((e.target.value === '' || (re.test(e.target.value) && (Number(e.target.value) >= 0 && Number(e.target.value) <= 999)))) {
                                            formik.setFieldValue('referralPotential', e.target.value);
                                        }
                                    }}
                                    error={formik.touched.referralPotential && Boolean(formik.errors.referralPotential)}
                                    helperText={formik.touched.referralPotential && formik.errors.referralPotential}
                                />
                            </FormControl>
                            {/* <FormControl fullWidth >
                                <InputLabel style={{ color: formik.touched.activityGoal && formik.errors.activityGoal ? 'red' : '' }} id="demo-simple-select-label">Activity Goal*</InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={formik.values.activityGoal}
                                    label="Activity Goal *"
                                    name="activityGoal"
                                    error={formik.touched.activityGoal && Boolean(formik.errors.activityGoal)}

                                    onChange={(e) => {
                                        if (e.target.value) {
                                            formik.setFieldValue('activityGoal', e.target.value)
                                        }
                                    }}
                                >
                                    {['Contact weekly', 'Contact every few weeks', 'Contact Monthly', 'Contact few times per year'].map((status: any) => (
                                        <MenuItem value={status}>{status}</MenuItem>
                                    ))}
                                </Select>
                                {formik.touched.activityGoal && Boolean(formik.errors.activityGoal) && (<FormHelperText error={formik.touched.activityGoal && Boolean(formik.errors.activityGoal)}>Activity Goal Required</FormHelperText>)}
                            </FormControl> */}
                            <FormControl sx={{ width: '100%' }}>
                                <TextField
                                    type="text"
                                    id="my-input"
                                    aria-describedby="my-helper-text"
                                    multiline
                                    maxRows={4}
                                    value={formik.values.activityGoal}
                                    label="Visit Frequency (every X weeks)*"
                                    name="activityGoal"
                                    onChange={(e) => {
                                        const re = /^\d+$/;
                                        if ((e.target.value === '' || (re.test(e.target.value) && (Number(e.target.value) >= 0 && Number(e.target.value) <= 999)))) {
                                            formik.setFieldValue('activityGoal', e.target.value);
                                        }
                                    }}
                                    error={formik.touched.activityGoal && Boolean(formik.errors.activityGoal)}
                                    helperText={formik.touched.activityGoal && formik.errors.activityGoal}
                                />
                            </FormControl>
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
                            <Checkbox checked={!!formik.values.flag} onChange={() => formik.setFieldValue('flag', !formik.values.flag)} />
                        </Box>
                    </Stack>
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
                            <Button onClick={() => navigate('/marketing/referral-partners')}  variant="contained" sx={{ bgcolor: 'var(--primary-color)', color: 'white' }} type="button">
                                Back
                            </Button>
                            :
                            <Button onClick={() => closeMe()} variant="contained" sx={{ bgcolor: '#a3a3ab' }} type="button">
                                Cancel
                            </Button>
                        }
                            {detail && <Button onClick={() => archiveReferralPartner()} variant="contained" sx={{ bgcolor: 'var(--primary-color)' }} type="button" style={{ marginLeft: '10px' }}>
                                {currentRow.status ? 'Archive' : "Unarchive"}
                            </Button>}
                        </div>

                        <Button variant="contained" sx={{ bgcolor: 'var(--primary-color)' }} type="submit" onClick={() => setSubmitClicked(true)} >
                            {detail ? 'Update' : 'Submit'}
                        </Button>

                    </Box>
                </form>
            </Box>
        </>
    );
};

export default ReferralPartnersModalContent;
