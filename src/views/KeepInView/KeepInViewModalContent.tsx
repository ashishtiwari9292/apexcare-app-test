import React, { useEffect, useState } from 'react'
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Box } from '@mui/material';
import { toast } from 'react-toastify';
import API from 'services/AxiosConfig';
import { FormAutocomplete, FormInput, ActionButtons, Checkbox, FormDatePicker, Modal, ArchiveModal } from 'components';
import { useAuth, useCompany } from 'hooks';
import { quickHitsTypes, emailHandler } from 'lib';
import { ModalProps } from 'typings';
import { ClientsModalContent } from 'views/CarePlanning/Clients/ClientsModalContent';
import { CarePartnersModalContent } from 'views/CarePlanning/CarePartners/CarePartnersModalContent';
import Autocomplete from 'components/Form/Autocomplete';
import TextBox from 'components/Form/TextBox';
import AddEmailModal from 'components/Modal/AddEmailModal';


interface KeepInViewInputProps {
  type: string;
  flag: boolean;
  location: any;
  followupDate: string;
  client: any;
  carePartner: any;
  comments: string;
}

const KeepInViewModalContent = ({ closeHandler, selected, showType, data }: ModalProps): JSX.Element => {
  const { locations, clients, carePartners } = useCompany();
  const { user } = useAuth();
  const [clientModal, setClientModal] = useState(false)
  const [archiveOpenModal, setArchiveOpenModal] = useState(false)
  const [openModal, setOpenModal] = useState(false)
  const [comments, setComments] = useState(selected?.state?.value?.comments || '')
  const [openEmailModal, setOpenEmailModal] = useState(false);


  const initialValues: KeepInViewInputProps = {
    type: selected?.carePartner?.value || showType === 'Care Partner' ? 'Care Partner' : 'Client',
    flag: selected ? selected.state.value.flag : false,
    location: selected ? selected.state.value.location : user.location,
    followupDate: selected ? selected.state.value.followupDate : '',
    client: selected?.state?.value?.clientObj ? selected?.state?.value?.clientObj : { firstName: '', lastName: '' },
    carePartner: selected?.state?.value?.carePartnerObj ? selected?.state?.value?.carePartnerObj : { firstName: '', lastName: '' },
    comments: selected ? selected?.state?.value?.comments : '',
  };

  const validationSchema = yup.object({
    type: yup.string().typeError('Select a type').required('Type is required'),
    location: yup.object().typeError('Select location').required('Location is required'),
    // followupDate: yup.date().typeError('Invalid format').required('Follow-up date is required'),
    // comments: yup.string().typeError('Enter comments'),
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

  const handleAddCP = (cp: any) => {
    if (cp) {
      const { firstName, lastName, _id } = cp
      formik.setFieldValue('carePartner', { _id: _id, firstName: firstName, lastName: lastName });
    } else {
      formik.setFieldValue('carePartner', { _id: '', firstName: '', lastName: '' });
    }
    setOpenModal(false);
  }

  const handleCloseEmailModal = () => {
    setOpenEmailModal(false)

  }

  const editFormHandler = (values: any) => {
    toast.loading('Updating keep in view...');
    API.put(`/keep-in-view/${selected.id}`, { ...values, comments:comments, userId: user?._id })
      .then((rsp) => {
        toast.dismiss();
        if (rsp.data.success) {
          toast.success('Successfully updated keep in view.');
          closeHandler();
        }
      })
      .catch((error) => {
        toast.dismiss();
        toast.error('Failed to edit keep in view.');
        console.error(error);
      });
  };

  const createNewData = (values: any) => {
    API.post('/keep-in-view', { ...values,comments:comments,userId: user?._id })
      .then((rsp) => {
        if (rsp.data.success) {
          toast.success('Successfully added keep in view.');
          closeHandler();
        }
      })
      .catch((error) => {
        toast.error('Failed to add keep in view.');
        console.error(error);
      });
  };


  return (
    <form onSubmit={formik.handleSubmit}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '49% 49%',
          columnGap: '15px',
        }}
      >
        <Modal open={clientModal} closeHandler={handleCloseModal} title="Add Client">
          <ClientsModalContent closeHandler={handleAddClient} />
        </Modal>
        <Modal open={openModal} closeHandler={handleClose} title="Add Care Partner">
          <CarePartnersModalContent closeHandler={handleAddCP} />
        </Modal>
        <Modal open={openEmailModal} closeHandler={handleCloseEmailModal} title=" Add Recipients"  >
          <AddEmailModal closeHandler={handleCloseEmailModal} data = {formik.values} title = "keep-in-view"/>
        </Modal >
        <ArchiveModal
            open={archiveOpenModal}
            closeHandler={()=>{
              setArchiveOpenModal(false)
              closeHandler()
            }}
            collectionName="keep-in-view"
            selected={selected}
            label="Keep in View"
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
        <FormAutocomplete
          name="type"
          label="Type"
          value={formik.values.type}
          onChange={formik.handleChange}
          error={formik.touched.type && Boolean(formik.errors.type)}
          helperText={formik.touched.type && formik.errors.type}
          autocompleteValue={formik.values.type}
          options={quickHitsTypes}
          autocompleteOnChange={(event: any, newValue: String | null) => {
            formik.setFieldValue('type', newValue);
          }}
          required
        />
        {formik.values.type === 'Client' && (
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
                console.log()
                setClientModal(true)
              }
              else {
                formik.setFieldValue('client', { _id: newValue._id, firstName: newValue.firstName, lastName: newValue.lastName });
              }
            }}
            label='Client'
          />
        )}
        {formik.values.type === 'Care Partner' && (
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
        )}
        <div className='modal-date-picker'>
          <FormDatePicker
            name="followupDate"
            label="Follow-Up Date"
            value={formik.values.followupDate}
            onChange={formik.handleChange}
            error={formik.touched.followupDate && Boolean(formik.errors.followupDate)}
            helperText={formik.touched.followupDate && formik.errors.followupDate}
            pickerOnChange={(newValue: String | null) => {
              if (newValue) {
                formik.setFieldValue('followupDate', newValue);
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
          name="comments"
          label="Comments"
          value={formik.values.comments}
          onChange={formik.handleChange}
          error={formik.touched.comments && Boolean(formik.errors.comments)}
          helperText={formik.touched.comments && formik.errors.comments}
          textarea
        /> */}
        <TextBox value = {comments} setValue = {setComments} label = 'Comments'/>
      </Box>
      <Checkbox checked={!!formik.values.flag} onChange={formik.handleChange} name="flag" label="Flag" />
      <ActionButtons emailHandler = {()=>setOpenEmailModal(true)}  archiveHandler = {() => setArchiveOpenModal(true)} closeHandler={closeHandler} archiveText = {selected?.state?.value?.render ? 'Unarchive ' : 'Archive'} renderArchive = {true}/>
    </form>
  );
};

export default KeepInViewModalContent;
