
import React, { useState ,useEffect} from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Stack } from '@mui/material';
import { toast } from 'react-toastify';
import API from '../../services/AxiosConfig';
import { FormAutocomplete, FormInput, ActionButtons, Modal } from 'components';
import { ModalProps } from 'typings';
import { useAuth, useCompany } from 'hooks';
import TextBox from 'components/Form/TextBox';
import { formatName, formatDate, emailHandler } from 'lib';
import AddEmailModal from 'components/Modal/AddEmailModal';

interface CurrentNotesInputProps {
  location: string;
  notes: string;
  closingComments: string;
  completedAt: string;
  completedBy: string;
}

const CurrentNotesModalContent = ({ closeHandler, selected }: ModalProps): JSX.Element => {
  const { locations } = useCompany();
  const { user } = useAuth();
  const [note, setNote] = useState(selected ? selected.state.value.notes : '')
  const [openEmailModal, setOpenEmailModal] = useState(false)

  const initialValues: CurrentNotesInputProps = {
    location: selected ? selected.state.value.location : user.location,
    notes: selected ? selected.state.value.notes  : '',
    closingComments: selected ? selected?.state?.value?.closingComments : '',
    completedAt: selected ? (selected?.state?.value ? formatDate(selected.state.value.completedAt) : '') : '',
    completedBy: selected?.state?.value?.completedBy?.firstName
      ? formatName(selected?.state?.value?.completedBy?.firstName, selected?.state?.value?.completedBy.lastName)
      : '',
  };

  useEffect(()=>{
    formik.setFieldValue('notes', note)
  },[note])

  const validationSchema = yup.object({
    location: yup.object().typeError('Select Location').required('Location is required'),
    notes:yup.string().typeError('').required('notes are requires')
  });

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema: validationSchema,
    onSubmit: (values) => {
      selected ? editCurrentNotesFormHandler(values) : createCurrentNotes(values);
      closeHandler();
    },
  });

  const deleteCurrentNote = () => {
    toast.loading('Deleting note...');
    API.delete(`current-notes/${selected.id}`)
      .then((rsp => {
        toast.dismiss()
        if (rsp.data.success) {
          toast.success('Successfully deleted note.');
          closeHandler();
        }
      }))
      .catch((error) => {
        toast.dismiss();
        toast.error('Failed to delete noteq.');
        console.error(error);
      });
  }

  const handleCloseEmailModal = () => {
    setOpenEmailModal(false)
  }

  const editCurrentNotesFormHandler = (values: any) => {
    toast.loading('Updating current notes...');
    API.put(`/current-notes/${selected.id}`, { ...values, notes: note, userId: user?._id })
      .then((rsp) => {
        toast.dismiss();
        if (rsp.data.success) {
          toast.success('Successfully updated current notes.');
          closeHandler();
        }
      })
      .catch((error) => {
        toast.dismiss();
        toast.error('Failed to edit current notes.');
        console.error(error);
      });
  };

  const createCurrentNotes = (values: any) => {
    API.post('/current-notes', { ...values, userId: user?._id })
      .then((rsp) => {
        if (rsp.data.success) {
          toast.success('Successfully added current notes.');
          closeHandler();
        }
      })
      .catch((error) => {
        toast.error('Failed to add current notes.');
        console.error(error);
      });
  };

  return (
    <form onSubmit={formik.handleSubmit}>
      <Stack spacing={2}>
      <Modal open={openEmailModal} closeHandler={handleCloseEmailModal} title=" Add Recipients"  >
          <AddEmailModal closeHandler={handleCloseEmailModal} data = {formik.values} title = "sensitive-issue"/>
        </Modal >
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
        <TextBox value={note} setValue={setNote} label = 'Notes' />
        {selected?.state?.value?.render && (
          <>
            <FormInput
              labelProps={{
                shrink: true,
              }}
              type="text"
              name="completedAt"
              label="Date Closed"
              value={formik.values.completedAt}
              onChange={formik.handleChange}
              error={formik.touched.completedAt && Boolean(formik.errors.completedAt)}
              helperText={formik.touched.completedAt && formik.errors.completedAt}
              disabled
            />
            <FormInput
              labelProps={{
                shrink: true,
              }}
              type="text"
              name="completedBy"
              label="Closed By"
              value={formik.values.completedBy}
              onChange={formik.handleChange}
              error={formik.touched.completedBy && Boolean(formik.errors.completedBy)}
              helperText={formik.touched.completedBy && formik.errors.completedBy}
              disabled
            />
            <FormInput
              labelProps={{
                shrink: true,
              }}
              type="text"
              name="closingComments"
              label="Closing Comments"
              value={formik.values.closingComments}
              onChange={formik.handleChange}
              error={formik.touched.closingComments && Boolean(formik.errors.closingComments)}
              helperText={formik.touched.closingComments && formik.errors.closingComments}
              disabled
              textarea
            />
          </>
        )}
      </Stack>
      <ActionButtons emailHandler={() => setOpenEmailModal(true)} closeHandler={closeHandler} actionText="Submit" renderDelete={selected} deleteHandler={deleteCurrentNote} />
    </form>
  );
};

export default CurrentNotesModalContent;
