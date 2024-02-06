import { useState } from 'react'
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


interface HealthCheckInputProps {
  type: string;
  flag: boolean;
  location: any;
  followupDate: string;
  client: any;
  carePartner: any;
  healthSummary: string;
  comments: string;
}

const HealthCheckModalContent = ({ closeHandler, selected, showType, data }: ModalProps): JSX.Element => {
  const { locations, clients, carePartners } = useCompany();
  const { user } = useAuth();
  const [clientModal, setClientModal] = useState(false)
  const [archiveOpenModal, setArchiveOpenModal] = useState<boolean>(false);
  const [openModal, setOpenModal] = useState(false)
  const [healthSummary, setHealthSummary] = useState(selected?.state?.value?.healthSummary || '')
  const [comment, setComment] = useState(selected?.state?.value?.comments || '')
  const [openEmailModal, setOpenEmailModal] = useState(false);


  const initialValues: HealthCheckInputProps = {
    type: selected?.carePartner?.value || showType === 'Care Partner' ? 'Care Partner' : 'Client',
    flag: selected ? selected.state.value.flag : false,
    location: selected ? selected.state.value.location : user.location,
    followupDate: selected ? selected.state.value.followUpDate : '',
    client: selected?.state?.value?.clientObj ? selected?.state?.value?.clientObj : { firstName: '', lastName: '' },
    carePartner: selected?.state?.value?.carePartnerObj ? selected?.state?.value?.carePartnerObj : { firstName: '', lastName: '' },
    healthSummary: selected ? selected.state.value.healthSummary : '',
    comments: selected ? selected.state.value.comments : '',
  };

  const validationSchema = yup.object({
    type: yup.string().typeError('Select a type').required('Type is required'),
    location: yup.object().typeError('Select location').required('Location is required'),
    followupDate: yup.date().typeError('Invalid format').required('Follow-up date is required'),
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

  const editFormHandler = (values: any) => {
    toast.loading('Updating health check...');
  
    API.put(`/health-check/${selected.id}`, { ...values, healthSummary: healthSummary, comments: comment, userId: user?._id })
      .then((rsp) => {
        toast.dismiss();
        if (rsp.data.success) {
          toast.success('Successfully updated health check.');
          closeHandler();
        }
      })
      .catch((error) => {
        toast.dismiss();
        toast.error('Failed to edit health check.');
        console.error(error);
      });
  };

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

  const handleCloseEmailModal = () => {
    setOpenEmailModal(false)
  }


  const handleAddCP = (cp: any) => {
    if (cp) {
      const { firstName, lastName, _id } = cp
      formik.setFieldValue('carePartner', { _id: _id, firstName: firstName, lastName: lastName });
    } else {
      formik.setFieldValue('carePartner', { _id: '', firstName: '', lastName: '' });
    }
    setOpenModal(false);

  }

  const createNewData = (values: any) => {
      API.post('/health-check', { ...values, userId: user?._id, healthSummary: healthSummary, comments: comment })
      .then((rsp) => {
        if (rsp.data.success) {
          toast.success('Successfully added health check.');
          closeHandler();
        }
      })
      .catch((error) => {
        toast.error('Failed to add health check.');
        console.error(error);
      });
  };

  return (
    <form onSubmit={formik.handleSubmit}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'auto auto',
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
          <AddEmailModal closeHandler={handleCloseEmailModal} data = {formik.values} title = "health-check"/>
        </Modal >
        <ArchiveModal
          open={archiveOpenModal}
          closeHandler={() => {
            setArchiveOpenModal(false)
            closeHandler()
          }}
          collectionName="health-check"
          selected={selected}
          label="Health Check"
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
          name="healthSummary"
          label="Health Summary"
          value={formik.values.healthSummary}
          onChange={formik.handleChange}
          error={formik.touched.healthSummary && Boolean(formik.errors.healthSummary)}
          helperText={formik.touched.healthSummary && formik.errors.healthSummary}
          textarea
          required
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
        <TextBox value={healthSummary} setValue={setHealthSummary} label="Health Summary" />
        <TextBox value={comment} setValue={setComment} label="Comments" />
      </Box>
      <Checkbox checked={!!formik.values.flag} onChange={formik.handleChange} name="flag" label="Flag" />
      <ActionButtons  emailHandler = {()=>setOpenEmailModal(true)}  archiveHandler = {() => setArchiveOpenModal(true)} closeHandler={closeHandler} archiveText = {selected?.state?.value?.render ? 'Unarchive ' : 'Archive'} renderArchive = {true}/>

    </form>
  );
};

export default HealthCheckModalContent;
