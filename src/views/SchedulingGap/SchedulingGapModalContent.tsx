import React, { useEffect, useState } from 'react'
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Box, Stack } from '@mui/material';
import { toast } from 'react-toastify';
import moment from 'moment';
import API from 'services/AxiosConfig';
import { FormAutocomplete, FormInput, ActionButtons, Checkbox, FormDatePicker, Modal, ArchiveModal } from 'components';
import { useAuth, useCompany } from 'hooks';
import { ModalProps } from 'typings';
import { ClientsModalContent } from 'views/CarePlanning/Clients/ClientsModalContent';
import Autocomplete from 'components/Form/Autocomplete';
import { formatCMDate } from 'lib';
import TextBox from 'components/Form/TextBox';
import AddEmailModal from 'components/Modal/AddEmailModal';

interface SchedulingGapInputProps {
  flag: boolean;
  location: any;
  dueDate: string | Date;
  client: any;
  dateTime: string;
  comments: string;
}

const SchedulingGapModalContent = ({ closeHandler, selected, showType, data }: ModalProps): JSX.Element => {
  const { locations, clients } = useCompany();
  const { user } = useAuth();
  const [clientModal, setClientModal] = useState(false)
  const [archiveOpenModal, setArchiveOpenModal] = useState(false);
  const [dateTime, setDateTime] = useState( selected?.state?.value?.dateTime || '')
  const [comment , setComment] = useState(selected?.state?.value?.comments || '')
  const [openEmailModal, setOpenEmailModal] = useState(false);

  const initialValues: SchedulingGapInputProps = {
    flag: selected ? selected.state.value.flag : false,
    location: selected ? selected.state.value.location : user.location,
    dueDate: selected ? formatCMDate(selected.state.value.dueDate) : moment().add(1, 'd').format('MM/DD/YYYY'),
    client: selected ? selected.state.value.clientObj : { firstName: '', lastName: '' },
    dateTime: selected ? selected.state.value.dateTime : '',
    comments: selected ? selected.state.value.comments : '',
  };

  const validationSchema = yup.object({
    location: yup.object().typeError('Select location').required('Location is required'),
    dueDate: yup.date().typeError('Invalid format').required('Due date is required'),
    client: yup.object().typeError('Select Client').nullable(),
    comments: yup.string().typeError('Enter comments'),
  });

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema: validationSchema,
    onSubmit: (values) => {
      selected ? editFormHandler(values) : createNewData(values);
      closeHandler();
    },
  });

  const handleCloseModal = () => {
    setClientModal(false);
  };


  const handleAddClient = (client: any) => {
    if (client) {
      const { firstName, lastName, _id } = client
      formik.setFieldValue('client', { _id: _id, firstName: firstName, lastName: lastName });
    } else {
      formik.setFieldValue('client', { _id: '', firstName: '', lastName: '' });
    }
    setClientModal(false);

  }

  const handleCloseEmailModal = () => {
    setOpenEmailModal(false)
  }

  const editFormHandler = (values: any) => {
    toast.loading('Updating scheduling gap...');
    API.put(`/scheduling-gap/${selected.id}`, { ...values,comments:comment, dateTime:dateTime ,userId: user?._id })
      .then((rsp) => {
        toast.dismiss();
        if (rsp.data.success) {
          toast.success('Successfully updated scheduling gap.');
          closeHandler();
        }
      })
      .catch((error) => {
        toast.dismiss();
        toast.error('Failed to edit scheduling gap.');
        console.error(error);
      });
  };

  const createNewData = (values: any) => {
    API.post('/scheduling-gap', { ...values,comments:comment, dateTime:dateTime , userId: user?._id })
      .then((rsp) => {
        if (rsp.data.success) {
          toast.success('Successfully added scheduling gap.');
          closeHandler();
        }
      })
      .catch((error) => {
        toast.error('Failed to add scheduling gap.');
        console.error(error);
      });
  };
  return (
    <form onSubmit={formik.handleSubmit}>
      <Stack>
        <Modal open={clientModal} closeHandler={handleCloseModal} title="Add Client">
          <ClientsModalContent closeHandler={handleAddClient} />
        </Modal>
        <Modal open={openEmailModal} closeHandler={handleCloseEmailModal} title=" Add Recipients"  >
          <AddEmailModal closeHandler={handleCloseEmailModal} data = {formik.values} title = "scheduling-gap"/>
        </Modal >
        <ArchiveModal
            open={archiveOpenModal}
            closeHandler={()=>{
              setArchiveOpenModal(false)
              closeHandler()
            }}
            collectionName="scheduling-gap"
            selected={selected}
            label="Action Required"
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
          width="47.5%"
        />
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '49% 49%',
            columnGap: '15px',
          }}
        >
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
          <div className='modal-date-picker'>
            <FormDatePicker
              name="dueDate"
              label="Due Date"
              value={formik.values.dueDate}
              onChange={formik.handleChange}
              error={formik.touched.dueDate && Boolean(formik.errors.dueDate)}
              helperText={formik.touched.dueDate && formik.errors.dueDate}
              pickerOnChange={(newValue: String | null) => {
                if (newValue) {
                  formik.setFieldValue('dueDate', newValue);
                }
              }}
              required
            />
          </div>
          {/* <FormInput
            labelProps={{
              shrink: true,
            }}
            type="text"
            name="dateTime"
            label="Date & Time / Action Required"
            value={formik.values.dateTime}
            onChange={formik.handleChange}
            error={formik.touched.dateTime && Boolean(formik.errors.dateTime)}
            helperText={formik.touched.dateTime && formik.errors.dateTime}
            required
            textarea
          />
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
          /> */}
          <TextBox value = {dateTime} setValue = {setDateTime}    label="Date & Time / Action Required"/>
          <TextBox value = {comment} setValue = {setComment} label = "Comments"/>
        </Box>
        <Checkbox checked={!!formik.values.flag} onChange={formik.handleChange} />
      </Stack>
      <ActionButtons emailHandler = {()=>setOpenEmailModal(true)}  closeHandler={closeHandler} renderArchive = {true} archiveHandler = {()=> setArchiveOpenModal(true)} archiveText = {selected?.state?.value?.render ? 'Unarchive ' : 'Archive'} />
    </form>
  );
};
export default SchedulingGapModalContent;
