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
import { Checkbox, FormDatePicker, FormInput } from 'components';
import { HiredApplicantModalContent } from './HiredApplicantModalContent';
import { useState, useEffect } from 'react';
import TextBox from 'components/Form/TextBox';


interface editApplicantsProps {
  closeMe: () => void;
  currentRow?: any;
  options: any;
  detail?: boolean
}

const ApplicantsModalContent = ({ closeMe, currentRow, options, detail = false }: editApplicantsProps) => {
  const { locations } = useCompany();
  const { user } = useAuth();
  const [openHireModal, toggleOpenHiredModal] = useState(false)
  const [comments, setComments] = useState(currentRow?.state?.comments)
  const editApplicant = async (values: any, setSubmitting: any, sensitiveId: any) => {
    const DataRsp = await API.put('applicants/' + sensitiveId, { ...values, comments: comments })
      .then((rsp) => {
        if (rsp.data.success) {
          toast.success('Successfully Updated Applicant!');
          closeMe();
        }
      })
      .catch((err) => { });
  };

  const createApplicant = (values: any) => {
    API.post('/applicants', { ...values, comments: comments })
      .then((rsp) => {
        if (rsp.data.success) {
          toast.success('Successfully Added Applicant.');
          closeMe();
        }
      })
      .catch((error) => {
        toast.error('Failed to add applicant.');
        console.error(error);
      });
  };

  const validationSchema = yup.object({
    location: yup.string().required('Location is required'),
    stage: yup.string().required('Stage is required'),
    email: yup.string().required('Email is required'),
    source: yup.string().required('Source is required'),
    firstName: yup.string().required('Full Name is required'),
    lastName: yup.string().required('Full Name is required'),
    phone: yup
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
    activeDate: yup.date().when('status', { is: 'Active', then: yup.date().required('Active date is required') }),
    inactiveDate: yup.date().nullable().when('status', { is: 'Inactive', then: yup.date().typeError('Invalid Date').required('Inactive date is required') })
  });

  const formik = useFormik({
    initialValues: {
      image: currentRow?.image || null,
      hired: currentRow?.hired?.selected || false,
      flag: currentRow?.flag?.value || false,
      location: currentRow?.state?.location || user.location,
      firstName: currentRow?.state?.firstName || '',
      lastName: currentRow?.state?.lastName || "",
      activeDate: currentRow?.activeDate.value || '',
      lastActivityAt: currentRow?.lastActivity?.value || '',
      stage: currentRow?.stage?.value || '',
      source: currentRow?.state?.source?.source || '',
      email: currentRow?.email?.value || '',
      comments: currentRow?.state?.value?.comments || null,
      phone: currentRow?.phone?.value || '',
      user: user,
      status: currentRow ? (currentRow?.status === "Active" ? "Active" : "Inactive") : "Active",
      hireDate: currentRow?.state?.hireDate || '',
      inactiveDate: currentRow?.state?.inactiveDate || '',
      frontEnd: currentRow ? currentRow.state.frontEnd : true
    },
    enableReinitialize: true,
    validationSchema: validationSchema,
    onSubmit: (values, { setSubmitting }) => {
      currentRow ? editApplicant(values, setSubmitting, currentRow?.state?.id) : createApplicant(values);
      closeMe();
    },
  });


  const fetchFirstStage = () => {
    API.get(`/applicants/progress`)
      .then(rsp => {
        formik.setFieldValue('stage', rsp.data.data.progress[0].cardName.stage)
      })
      .catch(err => {
        console.log(err)
      })
  }

  useEffect(() => {
    !currentRow?.activeDate.value && formik.setFieldValue('activeDate', new Date())
    !currentRow && fetchFirstStage()
    currentRow && setComments(currentRow?.comments?.value)
  }, [currentRow])

  return (
    <>
      <Box sx={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="fs-30 pt">{currentRow ? 'Edit' : 'Add'} Applicant {currentRow && detail ? currentRow?.name?.value : ''}</h2>
          <FormControl>
            <RadioGroup
              aria-labelledby="demo-controlled-radio-buttons-group"
              name="controlled-radio-buttons-group"
              row
              value={formik.values.frontEnd}
              onChange={(e: any) => formik.setFieldValue('frontEnd', e.target.value)}
            >
              <FormControlLabel value={true} control={<Radio />} label={'Front-End'} />
              <FormControlLabel value={false} control={<Radio />} label={'Back-End'} />
            </RadioGroup>
          </FormControl>
        </div>

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
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Location</InputLabel>
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
              <FormControl fullWidth>
                <InputLabel style={{ color: formik.touched.source && formik.errors.source ? 'red' : '' }} id="demo-simple-select-label">Source*</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={formik.values.source}
                  label="Source"
                  name="source"
                  error={formik.touched.source && Boolean(formik.errors.source)}
                  onChange={formik.handleChange}
                >
                  {options.sources.map(({ source }: any) => (
                    <MenuItem value={source}>{source}</MenuItem>
                  ))}
                </Select>
                <FormHelperText style={{ color: "red" }}>
                  {formik.touched.source && formik.errors.source}
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
                  name="phone"
                  multiline
                  maxRows={4}
                  label="Phone"
                  inputProps={{ inputmode: 'numeric', pattern: '[0-9]*', maxLength: 12 }}
                  value={formik.values.phone ? formik.values.phone : ''}
                  onChange={(e) => {
                    const re = /^[0-9-( )]+$/gm
                    if (e.target.value === '' || re.test(e.target.value)) {
                      formik.setFieldValue('phone', e.target.value)
                    }
                  }}
                  error={formik.touched.phone && Boolean(formik.errors.phone)}
                  helperText={formik.touched.phone && formik.errors.phone}
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
                  label="Email*"
                  value={formik.values.email ? formik.values.email : ''}
                  onChange={formik.handleChange}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                />
              </FormControl>

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
                <HiredApplicantModalContent update={() => editApplicant(formik.values, null, currentRow?.state?.id)} closeHandler={() => toggleOpenHiredModal(false)} open={openHireModal} initialValues={formik.values} id={currentRow?.state?.id} closeMe={closeMe} />
              </div>
              <FormControl fullWidth>
                <InputLabel style={{ color: formik.touched.stage && formik.errors.stage ? 'red' : '' }} id="demo-simple-select-label">Stage*</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={formik.values.stage}
                  label="Stage"
                  name="stage"
                  error={formik.touched.stage && Boolean(formik.errors.stage)}
                  onChange={formik.handleChange}
                >
                  {options.stages.map(({ stage, status }: any) => {
                    if ((formik.values.status === '' || formik.values.status === 'Active') && status) return <MenuItem value={stage}>{stage}</MenuItem>
                    if (formik.values.status === 'Inactive' && !status) return <MenuItem value={stage}>{stage}</MenuItem>
                    return null
                  })}
                </Select>
                <FormHelperText style={{ color: "red" }}>{formik.touched.stage && formik.errors.stage}</FormHelperText>
              </FormControl>
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
              {/* <div style={{ marginTop: '-10px' }}>
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
              </div> */}
              <div style={{ marginTop: '-15px' }}>
                <TextBox value={comments} setValue={setComments} label='Comments' />
              </div>
              {detail && <div style={{ width: '100%', height: 'max-content', display: 'flex', alignItems: 'center', justifyContent: 'space-evenly' }}>
                <Button disabled={currentRow?.state?.hireDate} variant="contained" sx={{ bgcolor: 'var(--primary-color)', width: '350px', height: '40px' }} onClick={() => toggleOpenHiredModal(true)}>
                  {!formik.values.hireDate ? "ADD TO CARE PARTNERS" : "HIRED"}
                </Button>
                {currentRow?.state?.hireDate && <FormControl sx={{ width: '60%', float: 'right' }}>
                  <FormDatePicker
                    disabled={true}
                    name="hireDate"
                    label={`Hire Date`}
                    value={formik.values.hireDate}
                    onChange={formik.handleChange}
                    error={formik.touched.hireDate && Boolean(formik.errors.hireDate)}
                    helperText={formik.touched.hireDate && formik.errors.hireDate}
                    pickerOnChange={(newValue: String | null) => {
                      if (newValue) {
                        formik.setFieldValue('hireDate', newValue);
                      }
                    }}
                  />
                </FormControl>}
                <Checkbox checked={!!formik.values.flag} onChange={() => formik.setFieldValue('flag', !formik.values.flag)} />
              </div>}
              {!detail && <div></div>}
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
            {detail ?
              <Button onClick={() => window.location.href = '/recruiting/applicants'} variant="contained" sx={{ bgcolor: 'var(--primary-color)', color: 'white' }} type="button">
                Back
              </Button>
              :
              <Button onClick={() => closeMe()} variant="contained" sx={{ bgcolor: '#a3a3ab' }} type="button">
                Cancel
              </Button>
            }
            <Button variant="contained" sx={{ bgcolor: 'var(--primary-color)' }} type="submit">
              {detail ? 'Update' : 'Submit'}
            </Button>

          </Box>
        </form>
      </Box>
    </>
  );
};

export default ApplicantsModalContent;
