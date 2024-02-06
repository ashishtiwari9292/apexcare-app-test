import { useEffect, useState } from 'react'
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Box, Stack } from '@mui/material';
import Autocomplete from 'components/Form/Autocomplete';
import { toast } from 'react-toastify';
import API from 'services/AxiosConfig';
import { FormAutocomplete, FormInput, ActionButtons, Checkbox, Modal, ArchiveModal } from 'components';
import { useAuth, useCompany } from 'hooks';
import { ModalProps } from 'typings';
import { ClientsModalContent } from 'views/CarePlanning/Clients/ClientsModalContent';
import { CarePartnersModalContent } from 'views/CarePlanning/CarePartners/CarePartnersModalContent';
import TextBox from 'components/Form/TextBox';
import { emailHandler } from 'lib';
import AddEmailModal from 'components/Modal/AddEmailModal';

interface SensitiveIssuesInputProps {
  flag: boolean;
  location: any;
  issue: string;
  client: any;
  carePartner: any;
  comments: string;
}

const SensitiveIssuesModalContent = ({ closeHandler, selected, showType, data }: ModalProps): JSX.Element => {
  const { locations, clients, carePartners } = useCompany();
  const [clientModal, setClientModal] = useState(false)
  const [carePartnerModal, setCarePartnerModal] = useState(false)
  const [archiveOpenModal, setArchiveOpenModal] = useState(false)
  const [issues, setIssues] = useState(selected?.state?.value?.issue || '')
  const [comment, setComment] = useState(selected?.state?.value?.comments || '')
  const [openEmailModal, setOpenEmailModal] = useState(false)

  const { user } = useAuth();

  const initialValues: SensitiveIssuesInputProps = {
    flag: selected ? selected.state.value.flag : false,
    location: selected ? selected.state.value.location : user.location,
    issue: selected ? selected.state.value.issue : '',
    client: selected ? selected.state.value.clientObj : { firstName: '', lastName: '' },
    carePartner: selected ? selected.state.value.carePartnerObj : { firstName: '', lastName: '' },
    comments: selected ? selected.state.value.comments : '',
  };


  const validationSchema = yup.object({
    carePartner: yup.object().nullable(),
    location: yup.object().typeError('Select your location').required('Location is required'),
    client: yup.object().nullable(),
    comments: yup.string().typeError('Enter your comments'),
  });

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema: validationSchema,
    onSubmit: (values) => {
      selected ? editSensitiveFormHandler(values) : createSensitiveIssue(values);
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

  const handleAddCP = (cp: any) => {
    if (cp) {
      const { firstName, lastName, _id } = cp
      formik.setFieldValue('carePartner', { _id: _id, firstName: firstName, lastName: lastName });
    } else {
      formik.setFieldValue('carePartner', { _id: '', firstName: '', lastName: '' });
    }
    setCarePartnerModal(false);

  }

  const handleCloseCPModal = () => {
    setCarePartnerModal(false);
  };

  const handleCloseEmailModal = () => {
    setOpenEmailModal(false)
  }


  const editSensitiveFormHandler = (values: any) => {
    toast.loading('Updating sensitive issue...');
    API.put(`/sensitive-issue/${selected.id}`, { ...values, issue: issues, comments: comment, userId: user?._id })
      .then((rsp) => {
        toast.dismiss();
        if (rsp.data.success) {
          toast.success('Successfully updated sensitive issue.');
          closeHandler();
        }
      })
      .catch((error) => {
        toast.dismiss();
        toast.error('Failed to edit sensitive issue.');
        console.error(error);
      });
  };

  const createSensitiveIssue = (values: any) => {
    API.post('/sensitive-issue', { ...values, issue: issues, comments: comment, userId: user?._id })
      .then((rsp) => {
        if (rsp.data.success) {
          toast.success('Successfully added sensitive issue.');
          closeHandler();
        }
      })
      .catch((error) => {
        toast.error('Failed to add sensitive issue.');
        console.error(error);
      });
  };


  return (
    <form onSubmit={formik.handleSubmit}>
      <Stack>
        <Modal open={clientModal} closeHandler={handleCloseModal} title="Add Client">
          <ClientsModalContent closeHandler={handleAddClient} />
        </Modal>
        <Modal open={carePartnerModal} closeHandler={handleCloseCPModal} title="Add CarePartner">
          <CarePartnersModalContent closeHandler={handleAddCP} />
        </Modal>
        <Modal open={openEmailModal} closeHandler={handleCloseEmailModal} title=" Add Recipients"  >
          <AddEmailModal closeHandler={handleCloseEmailModal} data = {formik.values} title = "sensitive-issue"/>
        </Modal >
        <ArchiveModal
          open={archiveOpenModal}
          closeHandler={() => {
            setArchiveOpenModal(false)
            closeHandler()
          }}
          collectionName="sensitive-issue"
          selected={selected}
          label="Sensitive Issue"
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
          width="49%"
        />
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '50% 50%',
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
                setCarePartnerModal(true)
              } else {
                formik.setFieldValue('carePartner', { _id: newValue._id, firstName: newValue.firstName, lastName: newValue.lastName });
              }
            }}
            label='Care Partner'
          />
          {/*              

          <FormInput
            labelProps={{
              shrink: true,
            }}
            type="text"
            name="issue"
            label="Issues & Concerns"
            value={formik.values.issue}
            onChange={formik.handleChange}
            error={formik.touched.issue && Boolean(formik.errors.issue)}
            helperText={formik.touched.issue && formik.errors.issue}
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
          <TextBox value={issues} setValue={setIssues} label='Issues & Concerns' />
          <TextBox value={comment} setValue={setComment} label='comments' />
        </Box>
        <Checkbox checked={!!formik.values.flag} onChange={formik.handleChange} />
      </Stack>
      <ActionButtons emailHandler={() => setOpenEmailModal(true)} renderArchive={true} archiveHandler={() => setArchiveOpenModal(true)} closeHandler={closeHandler} archiveText={selected?.state?.value?.render ? 'Unarchive ' : 'Archive'} />
    </form>
  );
};

export default SensitiveIssuesModalContent;
