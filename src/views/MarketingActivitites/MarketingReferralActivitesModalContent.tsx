import { useFormik } from 'formik';
import * as yup from 'yup';
import { Box, Button, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Autocomplete as MuiAutocomplete, IconButton, Fab, FormHelperText, } from '@mui/material';
import { toast } from 'react-toastify';
import moment from 'moment-timezone';
import API from 'services/AxiosConfig';
import { FormAutocomplete, FormInput, ActionButtons, Checkbox, FormDatePicker, FormTimePicker, Modal, ArchiveModal, PersonAutocomplete, CompanyAutocomplete, Spinner } from 'components';
import { useAuth, useCompany } from 'hooks';
import AddIcon from '@mui/icons-material/Add';
import { dateCalulator, fetchActivities, formatCMDate, formatName } from 'lib';
import { useContext, useEffect, useState } from 'react';
import RecurrenceModal from 'views/CareManagerActivities/RecurrenceModal';
import { ClientsModalContent } from 'views/CarePlanning/Clients/ClientsModalContent';
import Autocomplete from 'components/Form/Autocomplete';
import { Autocomplete as MUIAutocomplete } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CompaniesModalContent from 'views/ReferralPartners/CompaniesModalContent';
import { useParams } from 'react-router-dom';
import { DataContext } from 'views/Prospects/ProspectDetail';
import { PartnerContext } from 'pages/ReferralPartnerDetail/ReferralPartnerDetail';
import { MarketingManagementContext } from 'pages/Marketing/MarketingManagement';
import usePrevious from './UsePrevious';
import ReferralPartnersModal from 'views/ReferralPartners/ReferralPartnersModal';
import ProspectsModal from 'views/Prospects/ProspectsModal';

interface CareManagerActivitiesInputProps {
  flag: boolean;
  location: any;
  careManager: any;
  client: any;
  carePartner: any;
  date: any;
  time: string;
  activity: string;
  additionalComments: string;
  recurrence: string;
  recurrenceOptions: string;
  days: any;
  endDate: any;
  finalComments?: string;
  stepper: boolean;
}


const MarketingReferralActivitesModalContent = ({ source, renderCompletedDate = false, stepper = false, renderType, renderPartners = true, closeHandler, currentRow, selected, showType, data, addActivity, vals = [], batchAdd, renderButtons, setVals, activeStep = 0, steps, handleNext, handleBack, prefill, submitTemplate, completed, activity = false, activityTypes, activityType, currentLocation }: any): JSX.Element => {
  const { locations, clients, carePartners, careManagerActivities, users } = useCompany();
  const { referralPartnerId, prospectId } = useParams()
  const { handleRefetch } = useContext<any>(referralPartnerId ? PartnerContext : DataContext);
  const { handleRefetchMarketing } = useContext<any>(MarketingManagementContext);
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [checked, setChecked] = useState(selected ? selected?.flag?.selected || false : currentRow?.flag?.selected || false)
  const [recurrenceModal, toggleRecurrenceModal] = useState(false)
  const [openModal, setOpenModal] = useState(false)
  const [archiveOpenModal, setArchiveOpenModal] = useState(false)
  const [partnerModal, setPartnerModal] = useState(false)
  const [clientModal, setClientModal] = useState(false)
  const [prospectModal, setProspectModal] = useState(false)
  const [referralPartners, setReferralPartners] = useState([])
  const [company, setCompany] = useState([])
  const [activities, setActivities] = useState([])
  const [prospectOptions, setProspectOptions] = useState([])
  const [addedRows, setAddedRows] = useState<any>([])
  const [renderP, setRenderP] = useState(renderPartners)
  const previousCompleted = usePrevious(completed)
  const [loading, setLoading] = useState(false)


  useEffect(() => {
    if ((currentRow || selected?.state?.value?.location) && vals?.length === 0) {
      let length = currentRow?.state?.value?.referralPartners?.length || currentRow?.state?.currentRow?.referralPartner?.length
      if (selected) {
        length = selected?.state?.value?.referralPartners?.length
      }
      const arr = new Array(length).fill(null)
      arr.map((item: any, idx) => {
        let { firstName, lastName, _id } = currentRow?.state?.value?.referralPartners[idx] || currentRow?.state?.currentRow?.referralPartner[idx] || selected?.state?.value?.referralPartners[idx] || ''
        let { companyName } = currentRow?.state?.value?.company[idx] || currentRow?.state?.currentRow?.company[idx] || selected?.state?.value?.company[idx] || ''
        let partnerKey = ''
        let companyKey = ''
        if (idx === 0) {
          partnerKey = 'referralPartner'
          companyKey = 'company'
        } else {
          partnerKey = `referralPartner${idx}`
          companyKey = `company${idx}`
        }

        formik.setFieldValue(partnerKey, { firstName: firstName, lastName: lastName, _id: _id })
        formik.setFieldValue(companyKey, companyName)
        return item;
      })
      arr.pop()
      setAddedRows(arr)
    } else {
      if (vals[activeStep]?.company1) {
        let count = 0
        for (let key in vals[activeStep]) {
          if (key.startsWith('carePartner') || key.startsWith('company')) {
            count += 1
          }
        }
        const arr = new Array(count).fill(null)
        arr.map((item: any, idx) => {
          if (idx === 0) return null
          const { firstName, lastName, _id } = vals[activeStep][`referralPartner${idx}`]
          const companyName = vals[activeStep][`company${idx}`]
          let partnerKey = ''
          let companyKey = ''
          if (idx === 0) {
            partnerKey = 'referralPartner'
            companyKey = 'company'
          } else {
            partnerKey = `referralPartner${idx}`
            companyKey = `company${idx}`
          }

          formik.setFieldValue(partnerKey, { firstName: firstName, lastName: lastName, _id: _id })
          formik.setFieldValue(companyKey, companyName)
          return item
        })
        arr.pop()
        setAddedRows(arr)
      }
    }

  }, [currentRow, activeStep, selected])



  const setActivityTypes = () => {
    if (prospectId || activityType === 'Prospect') {
      fetchActivities(false)
    } else if (referralPartnerId || activityType === 'Referral Partner') {
      fetchActivities(true)
    }
  }

  const formatTimeString = (time: any) => {
    if (time === null || time === 'None') return null;
  
    // Attempt to match the time string
    const matchResult = time.match(/(\d{2}):(\d{2})(am|pm)/i);
    
    // If matchResult is null, handle the case appropriately
    if (matchResult === null) {
      console.error('Invalid time format');
      return null;
    }
  
    // Extract hours, minutes, and period
    const [_, hours, minutes, period] = matchResult;
    
    let adjustedHours = parseInt(hours, 10);
  
    if (period.toLowerCase() === "pm" && adjustedHours !== 12) {
      adjustedHours += 12;
    }
    
    if (period.toLowerCase() === "am" && adjustedHours === 12) {
      adjustedHours = 0;
    }
  
    const today = new Date();
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate(), adjustedHours, parseInt(minutes, 10));
  
    return date;
  };
  
  const { user } = useAuth();
  let yearInTheFuture = moment().add(1, 'day');
  let initialValues: any = {
        flag: currentRow.flag.selected || false,
        location: currentRow?.state?.currentRow.location || '',
        date: formatCMDate(currentRow?.state?.currentRow.date) || Date.now(),
        time: currentRow.state.currentRow.time || '',
        completedDate: formatCMDate(currentRow.state.currentRow.completedDate) || null,
        completedTime: currentRow?.state?.currentRow.completedTime|| '',
        careManager: currentRow.state.currentRow.marketingManager,
        client: currentRow.state.currentRow.referralPartner[0] || '',
        carePartner: currentRow.state.currentRow.company[0] || '',
        activity: currentRow.state.currentRow.activity._id,
        additionalComments: currentRow.state.currentRow.comments,
        description: currentRow.state.currentRow.description || '',
        finalComments: currentRow.state.currentRow.finalComments,
        recurrence: currentRow.state.currentRow.recurrence.type || 'No Recurrence',
        recurrenceOptions: currentRow.state.currentRow.recurrence.options || [],
        days: currentRow.state.currentRow.recurrence.days || [],
        prospect: currentRow.state.currentRow.prospect?.fullName || ''
  };


  let createValidationSchema = (stepper: any) => {
    if (stepper) {
      return yup.object({
        location: yup.
          mixed()
          .required('Location is required')
          .test(
            'is-string-or-object',
            'Location is required',
            value => {
              if (typeof value === 'string') {
                return true;  // It's a string, so it passes.
              } else if (typeof value === 'object') {
                return true;  // It's a Date object, so it passes.
              } else {
                return false
              }
            }
          ),
        careManager: yup.object().typeError('Select care manager').required('Care manager is required'),
        carePartner: yup.object().nullable().typeError('Select care partner'),
        client: yup.object().nullable().typeError('Select client'),
        additionalComments: yup.string().typeError('Enter comments'),
        activity: (vals && (source === 'batch' || source === 'template') ? yup.string() : yup.string().required('Activity is required')),
        date: yup
          .mixed()
          .required('Date is required')
          .test(
            'is-date-or-string',
            'Date or String is required',
            value => {
              if (typeof value === 'string') {
                return true;  // It's a string, so it passes.
              } else if (value instanceof Date) {
                return true;  // It's a Date object, so it passes.
              } else {
                // Try parsing it as an ISO date string.
                const parsedDate: any = new Date(value);
                return !isNaN(parsedDate);  // If it's a valid date, it passes.
              }
            }
          )
      })
    } else {
      return yup.object({
        location: yup.
          mixed()
          .required('Location is required')
          .test(
            'is-string-or-object',
            'Location is required',
            value => {
              if (typeof value === 'string') {
                return true;  // It's a string, so it passes.
              } else if (typeof value === 'object') {
                return true;  // It's a Date object, so it passes.
              } else {
                return false
              }
            }
          ),
        careManager: yup.object().typeError('Select care manager').required('Care manager is required'),
        carePartner: yup.object().nullable().typeError('Select care partner'),
        client: yup.object().nullable().typeError('Select client'),
        activity: (vals && (source === 'batch' || source === 'template') ? yup.string() : yup.string().required('Activity is required')),
        date: yup
          .mixed()
          .required('Date is required')
          .test(
            'is-date-or-string',
            'Date or String is required',
            value => {
              if (typeof value === 'string') {
                return true;  // It's a string, so it passes.
              } else if (value instanceof Date) {
                return true;  // It's a Date object, so it passes.
              } else {
                // Try parsing it as an ISO date string.
                const parsedDate: any = new Date(value);
                return !isNaN(parsedDate);  // If it's a valid date, it passes.
              }
            }
          )
      })
    }
  }

  const formik = useFormik({
    initialValues,
    validationSchema: createValidationSchema(stepper),
    onSubmit: (values) => {
      if (!renderButtons) {
        setVals && setVals({ ...values, flag: checked })
        handleNext && handleNext()
      } else {
        selected && !batchAdd || currentRow ? editFormHandler(values) : createNewData(values);
        selected && !batchAdd || currentRow && completed === 'Completed' ? handleRefetch(1) : handleRefetch(0)
        closeHandler();
      }
    },
  });



  const setFormValue: any = (fieldName: string, value: any) => {
    formik.setFieldValue(fieldName, value)
  }
  const handleCloseModal = () => {
    toggleRecurrenceModal(false);
  };

  useEffect(()=>{
    console.log('formikvalues',formik.values)
}
,[formik.values])
  const fetchReferralPartner = async () => {

    const partners = await API.get('referral-partners')
    const sorted = partners?.data?.data.filter((partner: any) => {
      if (formik.values.carePartner) {
        return partner?.location?.location === formik?.values?.location?.location && partner?.companyName?.companyName === formik?.values?.carePartner?.companyName
      }
      return partner?.location?.location === formik?.values?.location?.location
    })
    setReferralPartners(sorted)
  }
  const fetchCompanies = async () => {
    const company = await API.get('referral-partners/companies/listing')
    const sorted = company?.data?.data.filter((company: any) => {
      return company?.location?.location === formik?.values?.location?.location
    })
    setCompany(sorted)
  }
  const fetchActivities = async (type: any) => {
    let t = type
    if (prospectId) {
      t = false
    }
    const act = await API.get(`marketing/types?referral=${t}`)
    setActivities(act.data.data)
  }
  const editFormHandler = (values: any) => {
    values.recurrence = { type: values.recurrence, options: values.recurrenceOptions, days: values.days, startDate: new Date(values.startDate), endDate: new Date(values.endDate) }
    values.recurrenceId = selected?.state.value?.recurrenceId
    delete values.recurrenceOptions
    delete values.startDate
    delete values.endDate
    toast.loading('Updating care manager task...');


    API.put(`/marketing`, { values: { ...values, completed: completed, flag: checked }, _id: selected?.id || currentRow.state.currentRow._id, userId: user?._id })
      .then((rsp) => {
        toast.dismiss();
        if (rsp.data.success) {
          toast.success('Successfully updated care manager task.');
          handleRefetchMarketing && handleRefetchMarketing(0)
          closeHandler();
        }
      })
      .catch((error) => {
        toast.dismiss();
        toast.error('Failed to edit care manager task.');
        console.error(error);
      });
  };
  const handleCloseClient = () => {
    setClientModal(false);
  };
  const handleClose = () => {
    setOpenModal(false);
  };

  const handleAddCompany = (comp: any) => {
    if (comp) {
      formik.setFieldValue('carePartner', { _id: comp._id, companyName: comp.companyName })
    }
    setOpenModal(false)
  }
  const getAllProspects = async () => {
    try {
      const prospects = await API.get('prospects/all')
      const sorted = prospects?.data?.data.filter((prospect: any) => {
        return prospect?.location === formik?.values?.location?._id
      })
      setProspectOptions(sorted.map((item: any) => item?.fullName))
    } catch (err) {
      console.log(err)
    }
  }
  function formatObject(obj: any, type: any) {
    const companyArray: string[] = [];
    const referralArray: string[] = [];

    for (const [key, value] of Object.entries(obj)) {
      if (type === 'company') {
        if ((key === 'carePartner' || key.startsWith('company')) && value) {
          companyArray.push(((value as { companyName?: string }).companyName || value) + '\n');
        }
      } else {
        if ((key === 'client' || key.startsWith('referralPartner')) && value) {
          referralArray.push((value as { firstName?: string, lastName?: string }).firstName + ' ' + (value as { firstName?: string, lastName?: string }).lastName + '\n');
        }
      }
    }
    return type === 'company' ? companyArray.join('') : referralArray.join('')
  }
  const fetchActivity = async (id: string) => {
    try {
      const response = await API.get(`marketing/activity/${id}`)
      const activity = response.data.data.type
      return activity
    } catch (err) {
      console.log(err)
      return null
    }
  }
  const deleteHandler = () => {
    const id = currentRow?.state?.currentRow?._id || currentRow?.id || selected.id
    toast.loading('Deleting...');
    API.delete(`marketing/${id}`)
      .then((rsp => {
        toast.dismiss()
        if (rsp.data.success) {
          toast.success('Successfully deleted.');
          handleRefetchMarketing && handleRefetchMarketing(0)
          closeHandler();
        }
      }))
      .catch((error) => {
        toast.dismiss();
        toast.error('Failed to delete.');
        console.error(error);
      });
  }
  const createNewData = async (values: any) => {
    values.recurrence = { type: values.recurrence, options: values.recurrenceOptions, days: values.days, startDate: values.startDate, endDate: values.endDate }
    delete values.recurrenceOptions
    delete values.startDate
    delete values.endDate

    API.post('/marketing', { ...values, flag: checked, completed: activity ? "Completed" : 'Incomplete', userId: user?._id, source: source })
      .then(async (rsp) => {
        if (rsp.data.success) {
          values._id = rsp.data.data._id
          if (showType === "batchAdd" && addActivity) {
            const act = await fetchActivity(values.activity)
            addActivity({ ...values, flag: checked, type: renderPartners, state: { referralPartners: formatObject(values, 'referralPartners'), company: formatObject(values, 'company') }, activity: act })
          }
          toast.success('Successfully added marketing task.');
          closeHandler();
        }
      })
      .catch((error) => {
        toast.error('Failed to add marketing task.');
        console.error(error);
      });
  };
  useEffect(() => {
    fetchReferralPartner()
    fetchCompanies()
    getAllProspects()
    // fetchActivities(true)
    setActivityTypes()
  }, [formik?.values?.location, formik.values.carePartner])
  useEffect(()=>{console.log('this is the error',formik.errors)},[formik.errors])

  const removeRows = (idx: any) => {
    setAddedRows(addedRows.filter((item: any, indx: any) => indx !== idx))
    const vals: any = formik.values
    vals[`referralPartner${idx + 1}`] = null
    vals[`company${idx + 1}`] = null
    formik.setValues(vals)
  }
  useEffect(() => {
    if (formik.values.careManager === undefined) {
      let { firstName, lastName, _id } = user
      formik.setFieldValue('careManager', { id: _id, firstName, lastName })
    }
  }, [])

  useEffect(() => {
    if (formik.values.careManager === undefined) {
      let { firstName, lastName, _id } = user
      formik.setFieldValue('careManager', { id: _id, firstName, lastName })
    }
    if (formik.values.carePartner === undefined) {
      formik.setFieldValue('carePartner', '')

    }
    if (formik.values.prospect) {
      setRenderP(false)
      fetchActivities(false)


    }
    if (formik.values.client) {
      setRenderP(true)
      fetchActivities(true)
      setLoading(false)

    }
  }, [])


  useEffect(() => {
    if (referralPartnerId && !formik.values.client.firstName) {
      API.get(`referral-partners/${referralPartnerId}`)
        .then(rsp => {
          let { firstName, lastName, _id, companyName: company } = rsp.data.data
          formik.setFieldValue("client", { firstName: firstName, lastName: lastName, _id: _id })
          formik.setFieldValue('carePartner', { _id: company?._id, companyName: company?.companyName })
        })
    }
    if (referralPartnerId) {
      fetchActivities(true)
    }
  }, [referralPartnerId])

  useEffect(() => {
    if (prospectId) {
      API.get(`prospects/prospect/${prospectId}`)
        .then(rsp => {
          let { firstName, lastName, _id } = rsp.data

          formik.setFieldValue('prospect', rsp.data.fullName)
        })
    }
    if (prospectId) {
      fetchActivities(false)
    }
  }, [prospectId])

  useEffect(() => {
    if (completed === 'Referral Partner' || referralPartnerId || activityType === 'Referral Partner') {
      setRenderP(true)
      fetchActivities(true)
    }
    if (completed === 'Prospect' || prospectId || activityType === 'Prospect') {
      setRenderP(false)
      fetchActivities(false)
    }
    if ((completed !== 'Incomplete' || completed !== undefined || activity === '') && !formik.values.completedDate) {
      formik.setFieldValue('completedDate', new Date())
    }

  }, [completed, prospectId, referralPartnerId, activityType, activity])

  useEffect(() => {
    console.log(completed, source, activityType, renderP, referralPartnerId)
  }, [completed, source, activityType, renderP, referralPartnerId])


  if (loading) {
    return <Spinner />
  }
  if (stepper) {
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
            <Modal open={prospectModal} closeHandler={() => { setProspectModal(false) }} styles={{
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
            }}>
              <ProspectsModal
                closeMe={(data?: any) => {
                  data && formik.setFieldValue('prospect', { _id: data._id, firstName: data.firstName, lastName: data.lastName })
                  setProspectModal(false)
                }}
              />
            </Modal>
            <Modal open={clientModal} closeHandler={handleCloseClient} title="Add Client">
              <ClientsModalContent closeHandler={handleCloseClient} />
            </Modal>
            <Modal open={openModal} closeHandler={handleClose} >
              <CompaniesModalContent closeMe={handleAddCompany} />
            </Modal>
            <Modal open={partnerModal} closeHandler={() => setPartnerModal(false)} styles={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '50%',
              bgcolor: 'background.paper',
              border: '2px solid #000',
              boxShadow: 24,
              p: 4,
              height: '90vh',
              overflow: 'scroll'
            }
            }>
              <ReferralPartnersModal type="Referral Partners" closeMe={(data?: any) => {
                data && formik.setFieldValue('client', { _id: data._id, firstName: data.firstName, lastName: data.lastName })
                setPartnerModal(false)
              }} />
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
            <ArchiveModal
              open={archiveOpenModal}
              closeHandler={() => {
                setArchiveOpenModal(false)
                closeHandler()
              }}
              collectionName="care-manager-activity-event"
              selected={selected}
              label="Care Manager Activity"
            />

            <FormAutocomplete
              name="location"
              label="Location"
              value={formik.values.location}
              onChange={formik.handleChange}
              error={formik.touched.location && Boolean(formik.errors.location)}
              helperText={formik.touched.location && formik.errors.location}
              autocompleteValue={formik.values.location}
              options={locations}
              getOptions={(option: any) => option.location}
              autocompleteOnChange={(event: any, newValue: String | null) => {
                formik.setFieldValue('location', newValue);
              }}
              required
            />
            <Autocomplete
              value={formik?.values?.careManager || { id: '', firstName: '', lastName: '' }}
              options={
                [
                  { id: '', firstName: '', lastName: '' },
                  ...users.map((user: any) => ({ id: user._id, firstName: user?.firstName, lastName: user?.lastName }))
                ]
              }
              onChange={(event: any, newValue: any | null) => {
                if (newValue === null || !newValue) {
                  formik.setFieldValue('careManager', { id: '', firstName: '', lastName: '' });
                }
                else {
                  formik.setFieldValue('careManager', { id: newValue._id, firstName: newValue.firstName, lastName: newValue.lastName });
                }
              }}
              label='Created By'
            />


            {(completed === 'Incomplete' || completed === undefined || activity) && <> <div className='modal-date-picker'>
              <FormDatePicker
                name="date"
                label={"Due Date"}
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
              <div className='modal-date-picker'>
                <FormTimePicker
                  name="time"
                  label="Time"
                  value={new Date(formik.values.time)}
                  onChange={formik.handleChange}
                  error={formik.touched.time && Boolean(formik.errors.time)}
                  helperText={formik.touched.time && formik.errors.time}
                  pickerOnChange={(newValue) => {
                    if (newValue) {
                      formik.setFieldValue('time', newValue);
                    }
                  }}
                />
              </div>
            </>}
            {completed !== 'Incomplete' || completed !== undefined || activity === '' &&
              <div>
                <div className='modal-date-picker'>
                  <FormDatePicker
                    name="completedDate"
                    label={"Completed Date"}
                    value={formik.values.date}
                    onChange={formik.handleChange}
                    error={formik.touched.completedDate && Boolean(formik.errors.completedDate)}
                    helperText={formik.touched.completedDate && formik.errors.completedDate}
                    pickerOnChange={(newValue: String | null) => {
                      if (newValue) {
                        formik.setFieldValue('completedDate', newValue);
                      }
                    }}
                    required
                  />
                </div>
                <div className='modal-date-picker'>
                  <FormTimePicker
                    name="completedTime"
                    label="completed Time"
                    value={new Date(formik.values.completedTime)}
                    onChange={formik.handleChange}
                    error={formik.touched.completedTime && Boolean(formik.errors.completedTime)}
                    helperText={formik.touched.completedTime && formik.errors.completedTime}
                    pickerOnChange={(newValue) => {
                      if (newValue) {
                        formik.setFieldValue('completedTime', newValue);
                      }
                    }}
                  />
                </div>
              </div>}
            <FormInput
              labelProps={{
                shrink: true,
              }}
              type="text"
              name="description"
              label="Description"
              value={formik.values.description}
              onChange={formik.handleChange}
              error={formik.touched.description && Boolean(formik.errors.description)}
              helperText={formik.touched.description && formik.errors.description}
              textarea
            />
            {(completed === 'Completed' || activity || source === 'marketing-activities') && <FormInput
              labelProps={{
                shrink: true,
              }}
              type="text"
              name="finalComments"
              label="Final Comments"
              value={formik.values.finalComments}
              onChange={formik.handleChange}
              error={formik.touched.finalComments && Boolean(formik.errors.finalComments)}
              helperText={formik.touched.finalComments && formik.errors.finalComments}
              textarea
            />}
          </Box>

        </Stack>
        {!activity && <Button onClick={() => toggleRecurrenceModal(true)}>{formik.values.recurrence === 'No Recurrence' || formik.values.recurrence === undefined ? "Add Recurrence" : "Update Recurrence"}</Button>}
        {formik.values.recurrence !== "No Recurrence" && <Button style={{ color: 'red' }} onClick={() => formik.setFieldValue('recurrence', 'No Recurrence')}>Remove Recurrence</Button>}
        <Modal open={recurrenceModal} closeHandler={handleCloseModal} title="Repeat" styles={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '25%',
          bgcolor: 'background.paper',
          border: '2px solid #000',
          boxShadow: 24,
          p: 4,
        }}>
          <RecurrenceModal closeHandler={handleCloseModal} setFormValue={setFormValue} formValues={formik.values} yearInTheFuture={yearInTheFuture} />
        </Modal>

        <Checkbox checked={checked} onChange={() => setChecked(!checked)} name="flag" label="Flag" />
        {!renderButtons && <Box sx={{ mb: 2 }}>
          <div>
            <Button
              type='submit'
              variant="contained"
              sx={{ mt: 1, mr: 1 }}
            >
              {steps && activeStep === steps.length - 1 ? 'Submit' : 'Continue'}
            </Button>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mt: 1, mr: 1 }}
            >
              Back
            </Button>
          </div>
        </Box>}
      </form>

    )
  }

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
          <Modal open={prospectModal} closeHandler={() => { setProspectModal(false) }} styles={{
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
          }}>
            <ProspectsModal
              closeMe={(data?: any) => {
                data && formik.setFieldValue('prospect', `${data?.fullName}`)
                setProspectModal(false)
              }}
            />
          </Modal>
          <Modal open={clientModal} closeHandler={handleCloseClient} title="Add Client">
            <ClientsModalContent closeHandler={handleCloseClient} />
          </Modal>
          <Modal open={openModal} closeHandler={handleClose} >
            <CompaniesModalContent closeMe={handleAddCompany} />
          </Modal>
          <Modal open={partnerModal} closeHandler={handleCloseModal} styles={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '50%',
            bgcolor: 'background.paper',
            border: '2px solid #000',
            boxShadow: 24,
            p: 4,
            height: '90vh',
            overflow: 'scroll'
          }
          }>
            <ReferralPartnersModal type="Referral Partners" closeMe={(data?: any) => {
              data && formik.setFieldValue('client', { _id: data._id, firstName: data.firstName, lastName: data.lastName })
              setPartnerModal(false)
            }} />
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
          <ArchiveModal
            open={archiveOpenModal}
            closeHandler={() => {
              setArchiveOpenModal(false)
              closeHandler()
            }}
            collectionName="care-manager-activity-event"
            selected={selected}
            label="Care Manager Activity"
          />

          <FormAutocomplete
            name="location"
            label="Location"
            value={formik.values.location}
            onChange={formik.handleChange}
            error={formik.touched.location && Boolean(formik.errors.location)}
            helperText={formik.touched.location && formik.errors.location}
            autocompleteValue={formik.values.location}
            options={locations}
            getOptions={(option: any) => option.location}
            autocompleteOnChange={(event: any, newValue: String | null) => {
              formik.setFieldValue('location', newValue);
            }}
            required
          />
          <div></div>
          <Autocomplete
            value={formik?.values?.careManager || { id: '', firstName: '', lastName: '' }}
            options={
              [
                { id: '', firstName: '', lastName: '' },
                ...users.map((user: any) => ({ id: user._id, firstName: user?.firstName, lastName: user?.lastName }))
              ]
            }
            onChange={(event: any, newValue: any | null) => {
              if (newValue === null || !newValue) {
                formik.setFieldValue('careManager', { id: '', firstName: '', lastName: '' });
              }
              else {
                formik.setFieldValue('careManager', { id: newValue.id, firstName: newValue.firstName, lastName: newValue.lastName });
              }
            }}
            label='Created By'
          />

          {!steps &&
            <FormControl style={{ marginTop: '10px' }}>
              <InputLabel style={{ color: formik.touched.activity && formik.errors.activity ? 'red' : '' }} id="demo-simple-select-label">Activity*</InputLabel>
              <Select
                id="demo-simple-select"
                value={formik.values.activity}
                label="Activity"
                name="activity"
                onChange={formik.handleChange}
                error={formik.touched.activity && Boolean(formik.errors.activity)}
              >
                {activities.map(({ _id, type }: any) => (
                  <MenuItem value={_id}>{type}</MenuItem>
                ))}
              </Select>
              {formik.touched.activity && formik.errors.activity && <FormHelperText error >Activity is required</FormHelperText>}
            </FormControl>
          }

          {!steps && source !== 'prospects-detail' && renderP &&
            <PersonAutocomplete
              name="client"
              label="Referral Partner"
              value={formik.values.client}
              onChange={formik.handleChange}
              error={formik.touched.client && Boolean(formik.errors.client)}
              helperText={formik.touched.client && formik.errors.client}
              autocompleteValue={formik.values.client}
              getOptions={(option: any) => {
                if (option.firstName) {
                  return `${option.firstName || ''} ${option.lastName || ''}`
                }
                if (typeof option === 'string') {
                  return option
                }
                return ''
              }
              }
              options={
                [
                  '',
                  { id: 'addpartner', firstName: 'ADD REFERRAL PARTNER', lastName: '' },
                  ...referralPartners,
                ]
              }
              autocompleteOnChange={(event: any, newValue: any | null) => {
                if (!newValue) {
                  formik.setFieldValue('client', '')
                  formik.setFieldValue('referralPartner', '')
                }
                if (newValue.id === 'add') {
                  setClientModal(true)
                }
                else if (newValue.id === 'addpartner') {
                  setPartnerModal(true)
                }
                else if (!newValue?._id) {
                  formik.setFieldValue('client', formik.values.client);

                } else {
                  formik.setFieldValue('client', { _id: newValue?._id, firstName: newValue?.firstName, lastName: newValue?.lastName });
                  formik.setFieldValue('carePartner', { _id: newValue?.companyName?._id, companyName: newValue?.companyName?.companyName })
                  formik.setFieldValue('referralPartner', { _id: newValue?._id, firstName: newValue?.firstName, lastName: newValue?.lastName })

                }
              }}
            />
          }
          {renderP && source !== 'prospects-detail' && stepper === false && <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ width: '80%' }}>
              <CompanyAutocomplete
                name="carePartner"
                label="Company"
                value={formik.values.carePartner || ''}
                onChange={formik.handleChange}
                error={formik.touched.carePartner && Boolean(formik.errors.carePartner)}
                helperText={formik.touched.carePartner && formik.errors.carePartner}
                autocompleteValue={formik.values.carePartner}
                getOptions={(option: any) => {
                  if (option.companyName) {
                    return option?.companyName
                  }
                  if (typeof option === 'string') {
                    return option
                  }
                  return ''
                }
                }
                options={
                  [
                    { companyName: '', id: '' },
                    { companyName: 'ADD COMPANY', id: 'add' },
                    ...company
                  ]
                }
                autocompleteOnChange={(event: any, newValue: any | null) => {
                  if (!newValue) {

                    formik.setFieldValue('carePartner', '')
                  }
                  if (newValue.id === 'add') {
                    setOpenModal(true)
                  }
                  else if (!newValue?._id) {
                    formik.setFieldValue('carePartner', formik.values.carePartner);
                  } else {
                    formik.setFieldValue('carePartner', { _id: newValue._id, companyName: newValue.companyName });
                  }
                }}
              />
            </div>
            <Fab
              style={{ float: 'right', height: '40px', width: '40px', marginRight: '5px' }}
              color="primary"
              aria-label="add"
              onClick={() => {
                const len = addedRows.length;
                setAddedRows((addedRows: any) => [...addedRows, null])
                formik.setValues({ ...formik.values, [`referralPartner${len + 1}`]: null, [`company${len + 1}`]: null })
              }}
            >
              <AddIcon />
            </Fab>
          </div>}
          {renderP && source !== 'prospects-detail' && addedRows.map((value: any, idx: number) => (<>
            <div style={{ marginTop: '-10px', marginBottom: '10px' }} >
              <Autocomplete
                value={formik.values[`referralPartner${idx + 1}`]}
                options={
                  [
                    { id: '', firstName: '', lastName: '' },
                    { id: 'add', firstName: 'ADD', lastName: 'REFERRAL PARTNER' },
                    ...referralPartners
                  ]
                }
                onChange={(event: any, newValue: any | null) => {
                  if (null || !newValue) {
                    formik.setFieldValue(`referralPartner${idx + 1}`, { id: '', firstName: '', lastName: '' });
                  } else if (newValue.id === 'add') {
                    // setreferralPartnerModal(true)
                  }
                  else {
                    formik.setFieldValue(`referralPartner${idx + 1}`, { _id: newValue._id, firstName: newValue.firstName, lastName: newValue.lastName })
                    formik.setFieldValue(`company${idx + 1}`, newValue.companyName.companyName)
                  }
                }}
                label='Referral Partner'
              />
            </div>
            <div>
              <FormControl sx={{ width: '80%' }}>
                <MuiAutocomplete
                  disablePortal
                  id="combo-box-demo"
                  options={company.map((company: any) => {
                    return company.companyName
                  })}
                  sx={{ width: '100%' }}
                  value={formik.values[`company${idx + 1}`]}
                  renderInput={(params: any) => <TextField {...params} label="Company" error={formik.touched.company && Boolean(formik.errors.company)} />}
                  isOptionEqualToValue={(option, value) => {
                    return option === value
                  }}
                  onChange={(event: any, newValue: any) => {
                    formik.setFieldValue(`company${idx + 1}`, newValue)
                  }}
                />
              </FormControl>
              <IconButton
                sx={{
                  bgcolor: 'red',
                  color: 'white',
                  float: 'right',
                  height: '35px',
                  width: '35px',
                  marginRight: '8px',
                  marginTop: '10px'
                }}
                aria-label="Remove Item"
                onClick={() => {
                  removeRows(idx)
                }}
              >
                <DeleteOutlineIcon />
              </IconButton>
            </div>
          </>))}
          {(completed === 'Prospect' || !renderP) ?  
            <>
              <div style={{ marginTop: '10px' }}>
                <MUIAutocomplete
                  options={["ADD PROSPECT", ...prospectOptions]}
                  getOptionLabel={(option) => option}
                  renderOption={(props, option, { selected }) => (
                    <li {...props} key={option._id}>
                      {`${option}`}
                    </li>
                  )}
                  filterOptions={(options, { inputValue }) =>
                    options.filter(option => {
                      const label = `${option?.toLowerCase() || ''}`.trim();
                      if (!inputValue) {
                        return true
                      }
                      return label.includes(inputValue.trim().toLowerCase())
                    })
                  }
                  value={formik.values.prospect || ''}
                  onChange={(event, newValue: any) => {
                    if (newValue === 'ADD PROSPECT') {
                      setProspectModal(true)
                    } else {
                      formik.setFieldValue('prospect', newValue)
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Prospect"
                      variant="outlined"
                    />
                  )}
                />
              </div>
              <div></div>
            </>
            :
            null
          }

          {(completed === 'Incomplete' || renderCompletedDate === false) && <> <div className='modal-date-picker'>
            <FormDatePicker
              name="date"
              label={"Due Date"}
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
            <div className='modal-date-picker'>
              <FormTimePicker
                name="time"
                label="Due Time"
                value={new Date(formik.values.time)}
                onChange={formik.handleChange}
                error={formik.touched.time && Boolean(formik.errors.time)}
                helperText={formik.touched.time && formik.errors.time}
                pickerOnChange={(newValue) => {
                  if (newValue) {
                    formik.setFieldValue('time', newValue);
                  }
                }}
              />
            </div>
          </>}
          {(completed === 'Completed' || renderCompletedDate === true) &&
            <>
              <div className='modal-date-picker'>
                <FormDatePicker
                  name="completedDate"
                  label={"Completed Date"}
                  value={formik.values.completedDate || null}
                  onChange={formik.handleChange}
                  error={formik.touched.completedDate && Boolean(formik.errors.completedDate)}
                  helperText={formik.touched.completedDate && formik.errors.completedDate}
                  pickerOnChange={(newValue: String | null) => {
                    if (newValue) {
                      formik.setFieldValue('completedDate', newValue);
                    }
                  }}
                  required
                />
              </div>
              <div className='modal-date-picker'>
                <FormTimePicker
                  name="completedTime"
                  label="Completed Time"
                  value={formik.values.completedTime ? new Date(formik.values.completedTime) : ''}
                  onChange={formik.handleChange}
                  error={formik.touched.completedTime && Boolean(formik.errors.completedTime)}
                  helperText={formik.touched.completedTime && formik.errors.completedTime}
                  pickerOnChange={(newValue) => {
                    if (newValue) {
                      formik.setFieldValue('completedTime', newValue);
                    }
                  }}
                />
              </div>
            </>}
          <FormInput
            labelProps={{
              shrink: true,
            }}
            type="text"
            name="description"
            label="Description"
            value={formik.values.description}
            onChange={formik.handleChange}
            error={formik.touched.description && Boolean(formik.errors.description)}
            helperText={formik.touched.description && formik.errors.description}
            textarea
          />
          {(completed === 'Completed' || renderCompletedDate) && <FormInput
            labelProps={{
              shrink: true,
            }}
            type="text"
            name="finalComments"
            label="Final Comments"
            value={formik.values.finalComments}
            onChange={formik.handleChange}
            error={formik.touched.finalComments && Boolean(formik.errors.finalComments)}
            helperText={formik.touched.finalComments && formik.errors.finalComments}
            textarea
          />}
        </Box>
      </Stack>
      {!activity && <Button onClick={() => toggleRecurrenceModal(true)}>{formik.values.recurrence === 'No Recurrence' || formik.values.recurrence === undefined ? "Add Recurrence" : "Update Recurrence"}</Button>}
      {formik.values.recurrence !== "No Recurrence" && <Button style={{ color: 'red' }} onClick={() => formik.setFieldValue('recurrence', 'No Recurrence')}>Remove Recurrence</Button>}
      <Modal open={recurrenceModal} closeHandler={handleCloseModal} title="Repeat" styles={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '25%',
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
      }}>
        <RecurrenceModal closeHandler={handleCloseModal} setFormValue={setFormValue} formValues={formik.values} yearInTheFuture={yearInTheFuture} />
      </Modal>

      <Checkbox checked={checked} onChange={() => setChecked(!checked)} name="flag" label="Flag" />
      {renderButtons && <ActionButtons deleteHandler={() => setConfirmDelete(true)} renderDelete={true} archiveHandler={() => setArchiveOpenModal(true)} closeHandler={closeHandler} archiveText={selected?.state?.value?.render ? 'Unarchive ' : 'Archive'} renderArchive={false} renderEmail={false} />}
      {!renderButtons && <Box sx={{ mb: 2 }}>
        <div>
          <Button
            type='submit'
            variant="contained"
            sx={{ mt: 1, mr: 1 }}
          >
            {steps && activeStep === steps.length - 1 ? 'Submit' : 'Continue'}
          </Button>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ mt: 1, mr: 1 }}
          >
            Back
          </Button>
        </div>
      </Box>}
    </form>
  );
};

export default MarketingReferralActivitesModalContent;