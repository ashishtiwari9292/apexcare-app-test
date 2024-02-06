import { useFormik } from 'formik';
import * as yup from 'yup';
import { Box, Button, Stack } from '@mui/material';
import { toast } from 'react-toastify';
import moment from 'moment';
import API from 'services/AxiosConfig';
import { FormAutocomplete, FormInput, ActionButtons, Checkbox, FormDatePicker, FormTimePicker, Modal, ArchiveModal, Spinner } from 'components';
import { useAuth, useCompany } from 'hooks';
import { dateCalulator, emailHandler } from 'lib';
import { useEffect, useState } from 'react';
import RecurrenceModal from './RecurrenceModal';
import { ClientsModalContent } from 'views/CarePlanning/Clients/ClientsModalContent';
import { CarePartnersModalContent } from 'views/CarePlanning/CarePartners/CarePartnersModalContent';
import Autocomplete from 'components/Form/Autocomplete';
import TextBox from 'components/Form/TextBox';
import axios from 'axios';

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
}
const CareManagerActivitiesModalContent = ({ closeHandler, selected, showType, data, addActivity, vals = [], batchAdd, renderButtons, setVals, activeStep = 0, steps, handleNext, handleBack, prefill, submitTemplate , deleteHandler,completed}: any): JSX.Element => {
  const { locations, clients, carePartners, users } = useCompany();
  const [recurrenceModal, toggleRecurrenceModal] = useState(false)
  const [openModal, setOpenModal] = useState(false)
  const [archiveOpenModal, setArchiveOpenModal] = useState(false)
  const [clientModal, setClientModal] = useState(false)
  const [additionalComments, setAdditionalComments] = useState( selected?.state?.value?.additionalComments||vals[activeStep]?.additionalComments || '')
  const [closingComments, setClosingComments] = useState( selected?.state?.value?.closingComments||vals[activeStep]?.closingComments || '')
  const [activities,setActivities] = useState([])
  const [loading,setLoading] = useState(false)

  const [confirmDelete,setConfirmDelete] = useState(false)
  const { user } = useAuth();
let yearInTheFuture = moment().add(1, 'day');
  const initialValues: CareManagerActivitiesInputProps = {
    flag: selected ? selected?.flag?.selected || false : false,
    location: selected ? selected.state.value.location || user.location : user.location,
    careManager: selected ? selected?.state.value.careManager : (vals[activeStep]?.careManager?.firstName || vals[activeStep]?.careManager?.lastName) ? { firstName: vals[activeStep]?.careManager?.firstName, lastName: vals[activeStep]?.careManager?.lastName } : undefined,
    client: selected ? selected?.state.value.clientObj : { firstName: vals[activeStep]?.client?.firstName || '', lastName: vals[activeStep]?.client?.lastName || '' },
    carePartner: selected ? selected?.state.value.carePartnerObj : { firstName: vals[activeStep]?.carePartner?.firstName || '', lastName: vals[activeStep]?.carePartner?.lastName || '' },
    date: selected ? selected?.date?.value || null : activeStep > 0 ? dateCalulator(prefill?.dateCalculator, vals[activeStep - 1]?.date) : vals[activeStep]?.date || '',
    time: selected ? selected?.time?.raw || '' : vals[activeStep]?.time || '',
    activity: selected ? selected?.activity?.value || '' : '',
    additionalComments: selected ? selected?.state?.value?.additionalComments || vals[activeStep]?.description|| '' : vals[activeStep]?.description || '',
    recurrence: selected?.state?.value?.recurrence?.type ? selected?.state?.value?.recurrence?.type : (vals[activeStep]?.recurrence || 'No Recurrence'),
    recurrenceOptions: selected ? selected?.state?.value?.recurrence?.options : vals[activeStep]?.recurrenceOptions || '',
    days: selected?.state?.value?.recurrence?.days || (vals[activeStep]?.days || []),
    endDate: selected ? selected?.state?.value?.recurrence?.endDate : yearInTheFuture
  };

  const validationSchema = yup.object({
    location: yup.object().typeError('Select location').required('Location is required'),
    careManager: yup.object().typeError('Select care manager').required('Care manager is required'),
    carePartner: yup.object().nullable().typeError('Select care partner'),
    client: yup.object().nullable().typeError('Select client'),
    date: yup.date().typeError('Invalid format').required('Date is required'),
    time: yup.date().nullable().typeError('Invalid format'),
    additionalComments: yup.string().typeError('Enter comments'),
    activity: (vals && steps ? yup.string() : yup.string().typeError('Activity is required').required('Activity is required'))
  });

  const formik = useFormik({
    initialValues,
    validationSchema: validationSchema,
    onSubmit: (values) => {
      if (!renderButtons) {
        setVals && setVals({...values,additionalComments:additionalComments})
        handleNext && handleNext()
      } else {
        selected && !batchAdd ? editFormHandler({...values,status:completed , additionalComments:additionalComments, closingComments:closingComments}) : createNewData(values);
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
  const editFormHandler = (values: any) => {
    values.recurrence = { type: values.recurrence, options: values.recurrenceOptions, days: values.days, startDate: new Date(values.startDate), endDate: new Date(values.endDate) }
    delete values.recurrenceOptions
    delete values.startDate
    delete values.endDate
    toast.loading('Updating care manager activity...');
    API.put(`/care-manager-activity-event/${selected.id}`, { ...values, additionalComments:additionalComments, userId: user?._id })
      .then((rsp) => {
        toast.dismiss();
        if (rsp.data.success) {
          toast.success('Successfully updated care manager task.');
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
  const handleAddClient = (client: any) => {
    if (client.firstName) {
      const { firstName, lastName, _id } = client
      formik.setFieldValue('client', { _id: _id, firstName: firstName, lastName: lastName });
    } else {
      formik.setFieldValue('client', { _id: '', firstName: '', lastName: '' });
    }
    setClientModal(false);
  }
  const handleClose = () => {
    setOpenModal(false);
  };
  const handleFetchActivities = async () => {
    setLoading(true)
    try{
     let act = await API.get('/care-manager-activity') 
     console.log('act',act)
     act && setActivities(act.data.data)
     setLoading(false)
    }catch(err){
      console.log(err)
      setLoading(false)
    }
  }

  
  const createNewData = (values: any) => {
    values.recurrence = { type: values.recurrence, options: values.recurrenceOptions, days: values.days, startDate: values.startDate, endDate: values.endDate }
    delete values.recurrenceOptions
    delete values.startDate
    delete values.endDate
    API.post('/care-manager-activity-event', { ...values,additionalComments:additionalComments, userId: user?._id })
      .then((rsp) => {
        if (rsp.data.success) {
          values._id = rsp.data.data._id
          showType === "batchAdd" && addActivity && (addActivity(values))
          toast.success('Successfully added care manager task.');
          closeHandler();
        }
      })
      .catch((error) => {
        toast.error('Failed to add care manager task.');
        console.error(error);
      });
  };
  const handleAddCP = (cp: any) => {
    if (cp) {
      const { firstName, lastName, _id } = cp
      formik.setFieldValue('carePartner', { _id: _id, firstName: firstName, lastName: lastName });
    } else {
      formik.setFieldValue('carePartner', { _id: '', firstName: '', lastName: '' });
    }
    setOpenModal(false);
  }

  useEffect(() => {
    if (formik.values.careManager === undefined) {
      let { firstName, lastName, _id } = user
      formik.setFieldValue('careManager', { _id, firstName, lastName })
    }

  }, [formik.values,])
  useEffect(()=>{
    handleFetchActivities()
  },[])


  return (
    <form onSubmit={formik.handleSubmit}>
   { loading ? <Spinner></Spinner> :<>  <Stack>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '50% 50%',
            columnGap: '15px',
          }}
        >
          <Modal open={clientModal} closeHandler={handleCloseClient} title="Add Client">
            <ClientsModalContent closeHandler={handleAddClient} />
          </Modal>
          <Modal open={openModal} closeHandler={handleClose} title="Add Care Partner">
            <CarePartnersModalContent closeHandler={handleAddCP} />
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
          <Modal
            open={confirmDelete}
            closeHandler={() => {
              setConfirmDelete(false)
            }}
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
                onClick={()=>{
                  deleteHandler()
                  closeHandler();
                }}
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
          {formik.values.careManager && <Autocomplete
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
            label='Care Manager'
          />}
          {!steps &&
            <FormAutocomplete
              name="activity"
              label="Activity"
              value={formik.values.activity}
              onChange={formik.handleChange}
              error={formik.touched.activity && Boolean(formik.errors.activity)}
              helperText={formik.touched.activity && formik.errors.activity}
              autocompleteValue={formik.values.activity}
              options={activities.map((a: any) => a?.activity)}
              autocompleteOnChange={(event: any, newValue: String | null) => {
                formik.setFieldValue('activity', newValue);
              }}
              required
            />
          }
          {!steps &&
            <Autocomplete
            value={formik.values.client}
            options={
              [
                { id: '', firstName: '', lastName: '' },
                { id: 'add', firstName: 'ADD', lastName: 'CLIENT' },

                ...clients
              ]
            }
            onChange={(event: any, newValue: any | null) => {

              if (null || !newValue) {
                formik.setFieldValue('client', { id: '', firstName: '', lastName: '' });
              } else if (newValue.id === 'add') {
                setClientModal(true)
              }
              else {
                formik.setFieldValue('client', { _id: newValue._id, firstName: newValue.firstName, lastName: newValue.lastName });
              }
            }}
            label='Client'
          />
          }
          <Autocomplete
            value={formik.values.carePartner}
            options={
              [
                { id: '', firstName: '', lastName: '' },
                { id: 'add', firstName: 'ADD', lastName: 'CARE PARTNER' },

                ...carePartners
              ]
            }
            onChange={(event: any, newValue: any | null) => {
              if (null || !newValue) {
                formik.setFieldValue('carePartner', { id: '', firstName: '', lastName: '' });
              }
              else if (newValue.id === 'add') {
                setOpenModal(true)
              } else {
                formik.setFieldValue('carePartner', { _id: newValue._id, firstName: newValue.firstName, lastName: newValue.lastName });
              }
            }}
            label='Care Partner'
          />
          <div className='modal-date-picker'>
            <FormDatePicker
              name="date"
              label="Due Date"
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
              value={moment(formik.values.time).toDate()}
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
          <TextBox value = {additionalComments} setValue = {setAdditionalComments} label = 'Description'/>
          {completed === 'Completed' && <TextBox value = {closingComments} setValue = {setClosingComments} label = 'Final Comments'/>}
        </Box>
      </Stack>
      <Button onClick={() => toggleRecurrenceModal(true)}>{formik.values.recurrence === 'No Recurrence' || formik.values.recurrence === undefined ? "Add Recurrence" : "Update Recurrence"}</Button>
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
      <Checkbox checked={!!formik.values.flag} onChange={formik.handleChange} name="flag" label="Flag" />
      {renderButtons && <ActionButtons  deleteHandler={() => setConfirmDelete(true)} renderDelete={true}  emailHandler = {()=>emailHandler(formik.values,'care-manager-tasks')}  archiveHandler={() => setArchiveOpenModal(true)} closeHandler={closeHandler} archiveText={selected?.state?.value?.render ? 'Unarchive ' : 'Archive'} renderArchive={false} renderEmail={false} />}
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
      </>}
    </form>
  );
};

export default CareManagerActivitiesModalContent;