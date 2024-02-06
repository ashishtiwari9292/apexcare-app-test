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
} from '@mui/material';
import API from '../../services/AxiosConfig';
import { toast } from 'react-toastify';
import { useAuth, useCompany } from 'hooks';
import { ArchiveModal, Checkbox, FormAutocomplete, FormDatePicker, FormInput, Spinner } from 'components';

import Autocomplete from '@mui/material/Autocomplete';
import { stateList, stateMap } from './statesList';
import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { date } from 'yup/lib/locale';
import { useNavigate } from 'react-router-dom';
import { useFilter } from 'pages/Marketing/ReferralPartners/ReferralFilterContext';


interface editReferralPartnerProps {
    closeMe: () => void;
    currentRow?: any;
    detail?: boolean
    type: any
}

const CompaniesModalContent = ({ closeMe, currentRow, detail = false, type, fetchClient }: any) => {
    const { locations, users } = useCompany();
    const navigate = useNavigate()
    const { user } = useAuth();
    const [openHireModal, toggleOpenHiredModal] = useState(false)
    const [archiveOpenModal, setArchiveOpenModal] = useState(false)
    const [companies, setCompanies] = useState([])
    const [types, setTypes] = useState([])
    const [referral, setReferral] = useState({ id: '', companyType: '' })
    const [loading,setLoading] = useState(false)
    const [typesLoading,setTypesLoading] = useState(false)
    const params = useParams()
    const { referralPartnerId } = params
    const {toggleUpdateComponent} = useFilter()

    const fetchCompanies = async () => {
        setLoading(true)
        try {
            const comp = await API.get('referral-partners/companies/listing')
            comp && (setCompanies(comp.data.data))
            setLoading(false)
        } catch (err) {
            console.log(err)
            setLoading(false)
        }

    }
    const fetchCompaniesTypes = async () => {
        setTypesLoading(true)
        try {
            const comp = await API.get('referral-partners/types/listing')
            comp && (setTypes(comp.data.data))
            setTypesLoading(false)
        } catch (err) {
            console.log(err)
            setTypesLoading(false)
        }

    }
    const editApplicant = async (values: any, setSubmitting: any, sensitiveId: any) => {
        const DataRsp = await API.put('referral-partners/company/' + referralPartnerId, values)
            .then((rsp) => {
                if (rsp.data.success) {
                    toggleUpdateComponent()
                    toast.success('Successfully Updated Company!');
                    closeMe();
                }
            })
            .catch((err) => {
                toast.error('Failed to edit company.');
                console.error(err);
            });
    };

    const createApplicant = (values: any) => {
        API.post('/referral-partners/company', { ...values, createdBy: user._id })
            .then((rsp) => {
                if (rsp.data.success) {
                    toggleUpdateComponent()
                    toast.success('Successfully Created Company.');
                    closeMe(rsp.data.data);
                }
            })
            .catch((error) => {
                toast.error('Failed to add company.');
                console.error(error);
            });
    };

    const archiveCompany = async () => {
        setArchiveOpenModal(true)
    }
    const fetch = () => {
        fetchClient()
    }

    useEffect(() => {
        fetchCompanies()
        fetchCompaniesTypes()
    }, [])

    useEffect(() => {
        currentRow && formik.setFieldValue('status', currentRow?.status ? 'Active' : 'Inactive')
        currentRow && formik.setFieldValue('inactiveDate', currentRow?.inactiveDate)
    }, [currentRow])

    const validationSchema = yup.object({
        location: yup.string().required('Location is required').nullable(),
        companyName: yup.string().required('Company Name is required'),
        referralType: yup.string().required('Company Type is required'),
        marketingManager: yup.object().typeError('Marketing Manager is required').required('Marketing Manager is required'),
        activeDate: yup.date().when('status', { is: 'Active', then: yup.date().required('Active date is required') }),
        status: yup.string().required('status is required'),
        mobilePhone: yup
            .string()
            .min(12, "Invalid format must be xxx-xxx-xxxx")
            .test(
                'len',
                'Invalid format must be xxx-xxx-xxxx',
                (val: any) => {
                    if (val == undefined) {
                        return true;
                    }
                    return !!val.match(/^\d{3}-\d{3}-\d{4}/)
                }
            )

    });

    const formik = useFormik({
        initialValues: {
            flag: currentRow?.flag || false,
            location: currentRow?.location?.location || null,
            firstName: currentRow?.state?.firstName || '',
            lastName: currentRow?.state?.lastName || "",
            activeDate: currentRow?.activeDate || new Date(),
            inactiveDate: currentRow?.inactiveDate || '',
            comments: currentRow?.comments || null,
            mobilePhone: currentRow?.phoneNumber || '',
            status: currentRow ? (currentRow?.status ? "Active" : "Inactive") : "Active",
            address1: currentRow?.address1 || '',
            address2: currentRow?.address2 || '',
            city: currentRow?.city || '',
            state: currentRow?.state || '',
            zipcode: currentRow?.zipCode || '',
            title: currentRow?.title || '',
            companyName: currentRow?.companyName || '',
            referralType: currentRow?.companyType ? currentRow?.companyType?.companyType : '',
            website: currentRow?.website || '',
            marketingManager: currentRow?.accountOwner?.firstName ? currentRow.accountOwner : user
        },
        validationSchema: validationSchema,
        onSubmit: (values, { setSubmitting }) => {
            currentRow ? editApplicant(values, setSubmitting, currentRow?.state?.id) : createApplicant(values);
            closeMe();
        },
    });
    return (
        <>
            <Box sx={{ padding: detail ? '0px 5vw 50px 5vw' : '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <h2 className="fs-30 pt">{detail ? "" : (currentRow ? 'Edit' : 'Add')} Company  {detail ? `- ${formik?.values?.companyName}` : ''} </h2>
                </div>
        {loading || typesLoading ? <Spinner></Spinner> :
                <form onSubmit={formik.handleSubmit}>
                    <Stack>

                        <Box
                            sx={{
                                paddingTop: '20px',
                                display: 'grid',
                                gridTemplateColumns: '50% 50%',
                                gap: '15px',
                            }}
                        >
                            <ArchiveModal
                                open={archiveOpenModal}
                                closeHandler={() => {
                                    setArchiveOpenModal(false)
                                    fetch()
                                }}
                                collectionName="referral-partners/company"
                                selected={{ ...currentRow, id: referralPartnerId }}
                                label="Company"
                            />
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
                            <FormControl sx={{ width: '100%' }}>
                                <Autocomplete
                                    disablePortal
                                    id="combo-box-demo"
                                    sx={{ width: '100%' }}
                                    value={formik.values.marketingManager}
                                    renderInput={(params) => <TextField {...params} error={formik.touched.marketingManager && Boolean(formik.errors.marketingManager)} helperText={formik.touched.marketingManager && formik.errors.marketingManager} label="Marketing Manager*" />}
                                    options={
                                        [
                                            { id: '', firstName: '', lastName: '' },
                                            ...users
                                        ]
                                    }
                                    getOptionLabel={(option: any) => `${option.firstName} ${option.lastName}`}
                                    onChange={(event: any, newValue: any | null) => {
                                        if (null || !newValue) {
                                            formik.setFieldValue('marketingManager', { id: '', firstName: '', lastName: '' });
                                        }
                                        else {
                                            formik.setFieldValue('marketingManager', { _id: newValue._id, firstName: newValue.firstName, lastName: newValue.lastName });
                                        }
                                    }}
                                />
                            </FormControl>
                            <FormControl sx={{ width: '100%' }}>
                                <TextField
                                    type="text"
                                    id="my-input"
                                    aria-describedby="my-helper-text"
                                    name="companyName"
                                    multiline
                                    maxRows={4}
                                    label="Company Name*"
                                    value={formik?.values?.companyName ? formik.values?.companyName : ''}
                                    onChange={(e) => {
                                        formik.setFieldValue('companyName', e.target.value)
                                    }}
                                    error={formik.touched.companyName && Boolean(formik.errors.companyName)}
                                    helperText={formik.touched.companyName && formik.errors?.companyName}
                                />
                            </FormControl>
                            <FormControl sx={{ width: '100%' }}>
                                <Autocomplete
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
                                    name="mobilePhone"
                                    multiline
                                    maxRows={4}
                                    label="Main Phone"
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
                                    name="website"
                                    multiline
                                    maxRows={4}
                                    label="Website"
                                    value={formik.values.website ? formik.values.website : ''}
                                    onChange={(e) => {

                                        formik.setFieldValue('website', e.target.value)

                                    }}
                                    error={formik.touched.website && Boolean(formik.errors?.website)}
                                    helperText={formik.touched.website && formik.errors.website}
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
                                {/* <FormAutocomplete
                                    margin="0px"
                                    name="state"
                                    label="State"
                                    value={'Florida'}
                                    onChange={formik.handleChange}
                                    error={formik.touched.state&& Boolean(formik.errors.state)}
                                    helperText={formik.touched.state && formik.errors.state}
                                    autocompleteValue={'Florida'}
                                    options={stateList}
                                    autocompleteOnChange={(event: any, newValue: any) => {
                                        formik.setFieldValue('state', newValue);
                                    }}
                                    required
                                /> */}
                                <Autocomplete
                                    disablePortal
                                    id="combo-box-demo"
                                    options={stateList}
                                    sx={{ width: '100%' }}
                                    value={formik.values.state}
                                    renderInput={(params) => <TextField {...params} label="State" />}
                                    onChange={(event: any, newValue: any) => {
                                        formik.setFieldValue('state', newValue)
                                    }}
                                />
                            </FormControl>
                            <FormControl sx={{ width: '100%' }}>
                                <TextField
                                    type="text"
                                    id="my-input"
                                    aria-describedby="my-helper-text"
                                    name="zipcode"
                                    multiline
                                    maxRows={4}
                                    label="Zip"
                                    value={formik?.values?.zipcode ? formik.values?.zipcode : ''}
                                    onChange={(e) => {
                                        const re = /^[0-9-( )]+$/gm
                                        if (e.target.value === '' || re.test(e.target.value)) {
                                            formik.setFieldValue('zipcode', e.target.value)
                                        }
                                    }}
                                    error={formik.touched.zipcode && Boolean(formik.errors.zipcode)}
                                    helperText={formik.touched.zipcode && formik.errors.zipcode}
                                />
                            </FormControl>
                            <div></div>
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
                                label={formik.values.status === 'Inactive' ? 'Inactive Date*' : "Inactive Date"}
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
                            <div style={{ marginTop: '-10px' }}>
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
                            <Button onClick={() =>navigate('/marketing/referral-partners?type=Companies')} variant="contained" sx={{ bgcolor: 'var(--primary-color)', color: 'white' }} type="button">
                                Back
                            </Button>
                            :
                            <Button onClick={() => closeMe()} variant="contained" sx={{ bgcolor: '#a3a3ab' }} type="button">
                                Cancel
                            </Button>
                        }
                            {detail && <Button onClick={() => archiveCompany()} variant="contained" sx={{ bgcolor: 'var(--primary-color)' }} type="button" style={{ marginLeft: '10px' }}>
                                {currentRow.status ? 'Archive' : "Unarchive"}
                            </Button>}

                        </div>

                        <Button variant="contained" sx={{ bgcolor: 'var(--primary-color)' }} type="submit">
                            {detail ? 'Update' : 'Submit'}
                        </Button>

                    </Box>
                </form>}
            </Box>
        </>
    );
};

export default CompaniesModalContent;
