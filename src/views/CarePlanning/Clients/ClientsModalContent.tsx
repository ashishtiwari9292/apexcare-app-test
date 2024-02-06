import { useFormik } from 'formik';
import * as yup from 'yup';
import { Box, Button } from '@mui/material';
import { toast } from 'react-toastify';
import API from 'services/AxiosConfig';
import { FormAutocomplete, FormInput, ActionButtons, FormDatePicker, Modal } from 'components';
import { useAuth, useCompany } from 'hooks';
import { formatDate, formatName } from 'lib';
import moment from 'moment';
import React, { useEffect, useState } from 'react'
import TextBox from 'components/Form/TextBox';
import { useFilter } from 'pages/Marketing/ReferralPartners/ReferralFilterContext';

interface ClientInputProps {
  firstName: string;
  lastName: string;
  location: string;
  careManager: string;
  comments: string;
  activateDate: any;
  closingComments: string;
  deactivateDate: string;
  deactivateBy: string;
}

export const ClientsModalContent = ({ closeHandler, selected, detail, setClientAdded }: any): JSX.Element => {
  const { locations, users, clients, setClients } = useCompany();
  const { user } = useAuth();
  const [unarchiveModal, setUnarchiveModal] = useState(false)
  const [currentId, setCurrentId] = useState(null)
  const [comments, setComments] = useState( selected?.state?.value?.comments || '')
  const {toggleUpdateComponent} = useFilter()

  const initialValues: ClientInputProps = {
    firstName: selected ? selected.firstName : '',
    lastName: selected ? selected.lastName : '',
    location: selected ? selected.location.value : user.location.location,
    careManager: selected
      ? selected.careManager.value
      : formatName(user.firstName, user.lastName),
    comments: selected ? selected.value : '',
    activateDate: selected ? selected.activeDate : '',
    closingComments: selected?.closingComments ? selected?.closingComments : '',
    deactivateDate: selected?.deactivateDate ? formatDate(selected?.deactivateDate?.value) : '',
    deactivateBy: selected?.deactivateBy?.value
      ? selected?.deactivateBy?.value
      : '',
  };

  const validationSchema = yup.object({
    firstName: yup.string().typeError('Enter first name').required('First name is required'),
    lastName: yup.string().typeError('Enter last name').required('Last name is required'),
    location: yup.string().typeError('Select location').required('Location is required'),
    careManager: yup.string().typeError('Select care manager'),
    comments: yup.string().typeError('Enter comments'),
    activateDate: yup.date().typeError('Invalid format').required('Start of care date is required'),
  });

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema: validationSchema,
    onSubmit: (values) => {
      selected ? editFormHandler(values) : createClient(values);
    },
  });

  const editFormHandler = (values: any) => {
    toast.loading('Updating client...');
    API.put(`/client/${selected.id}`, { ...values, comments: comments, userId: user?._id })
      .then((rsp) => {
        toast.dismiss();
        if (rsp.data.success) {
          toggleUpdateComponent()
          toast.success('Successfully updated client.');
          closeHandler();
          
        }
      })
      .catch((error) => {
        toast.dismiss();
        toast.error('Failed to edit client.');
        console.error(error);
      });
  };

  const createClient = (values: any) => {
    API.post('/client', { ...values, comments: comments, userId: user?._id })
      .then(({ data }) => {

        if (data.success) {
          API.get('client')
            .then((rsp) => {
              toggleUpdateComponent()
              setClients(rsp.data.data)
              toast.success('Successfully added client.')
              closeHandler(data.data)
            })

        }
      })
      .catch((error) => {
        if (error.response.data.error.includes('Cannot add duplicate clients:')) {
          const splitError = error.response.data.error.split(":")
          setCurrentId(splitError[1])
          setUnarchiveModal(true)
        } else {
          toast.error(error.response.data.error);
          closeHandler();
        }
      });
  };

  const unarchive = async () => {
    const cp = await API.put(`/client/unarchive/${currentId}`, {})
    if (cp) {
      toast.success("Successfully unarchived Care partner")
    }
  }

  useEffect(() => {
    if (!formik.values.activateDate) formik.setFieldValue('activateDate', moment())
  }, [])

  return (
    <form onSubmit={formik.handleSubmit}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '49% 49%',
          columnGap: '15px',
        }}
      >

        <Modal open={unarchiveModal} closeHandler={() => { setUnarchiveModal(false) }} title={`This Client currently exists. Would you like to Unarchive?`} styles={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '30%',
          bgcolor: 'background.paper',
          border: '2px solid #000',
          boxShadow: 24,
          p: 4,
        }}>
          <ActionButtons renderConfirm renderSubmit={false} confirmHandler={() => {
            unarchive()
            setUnarchiveModal(false)
            closeHandler()
          }} closeHandler={() => setUnarchiveModal(false)} />

        </Modal>
        <FormAutocomplete
          name="location"
          label="Location"
          value={formik.values.location}
          onChange={formik.handleChange}
          error={formik.touched.location && Boolean(formik.errors.location)}
          helperText={formik.touched.location && formik.errors.location}
          autocompleteValue={formik.values.location}
          options={locations.map((l: any) => l.location)}
          autocompleteOnChange={(event: any, newValue: String | null) => {
            formik.setFieldValue('location', newValue);
          }}
          required
        />
        <FormAutocomplete
          name="careManager"
          label="Care Manager"
          value={formik.values.careManager}
          onChange={formik.handleChange}
          error={formik.touched.careManager && Boolean(formik.errors.careManager)}
          helperText={formik.touched.careManager && formik.errors.careManager}
          autocompleteValue={formik.values.careManager}
          options={users.map((c: any) => formatName(c.firstName, c.lastName))}
          autocompleteOnChange={(event: any, newValue: String | null) => {
            formik.setFieldValue('careManager', newValue);
          }}
        />
        <FormInput
          labelProps={{
            shrink: true,
          }}
          type="text"
          name="firstName"
          label="First Name"
          value={formik.values.firstName}
          onChange={formik.handleChange}
          error={formik.touched.firstName && Boolean(formik.errors.firstName)}
          helperText={formik.touched.firstName && formik.errors.firstName}
          required
        />
        <FormInput
          labelProps={{
            shrink: true,
          }}
          type="text"
          name="lastName"
          label="Last Name"
          value={formik.values.lastName}
          onChange={formik.handleChange}
          error={formik.touched.lastName && Boolean(formik.errors.lastName)}
          helperText={formik.touched.lastName && formik.errors.lastName}
          required
        />
        <div>
          <div className='modal-date-picker'>
            <FormDatePicker
              name="activateDate"
              label="Start of Care Date"
              value={formik.values.activateDate}
              onChange={formik.handleChange}
              error={formik.touched.activateDate && Boolean(formik.errors.activateDate)}
              helperText={formik.touched.activateDate && formik.errors.activateDate}
              pickerOnChange={(newValue: String | null) => {
                if (newValue) {
                  formik.setFieldValue('activateDate', newValue);
                }
              }}
              required
            />
          </div>

        </div>
        {selected && selected.status.value !== "Active" &&
          <>
            <FormInput
              labelProps={{
                shrink: true,
              }}
              type="text"
              name="deactivateDate"
              label="Deactivated At"
              value={formik.values.deactivateDate}
              onChange={formik.handleChange}
              error={formik.touched.deactivateDate && Boolean(formik.errors.deactivateDate)}
              helperText={formik.touched.deactivateDate && formik.errors.deactivateDate}
              disabled
            />
          </>
        }
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
        <div style = {{marginTop:'-15px'}}>
        <TextBox value={comments} setValue={setComments} label='Comments' />
        </div>
        {selected && selected.status.value !== 'Active' && (
          <>
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
              textarea
              disabled
            />
          </>
        )}
        {selected && selected.status.value !== "Active" &&
          <>
            <div></div>
            <FormInput
              labelProps={{
                shrink: true,
              }}
              type="text"
              name="completedBy"
              label="Closed By"
              value={formik.values.deactivateBy}
              onChange={formik.handleChange}
              error={formik.touched.deactivateBy && Boolean(formik.errors.deactivateBy)}
              helperText={formik.touched.deactivateBy && formik.errors.deactivateBy}
              disabled
            />
          </>
        }
      </Box>
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
          <Button onClick={() => window.location.href = '/clients'} variant="contained" sx={{ bgcolor: 'var(--primary-color)', color: 'white' }} type="button">
            Back
          </Button>
          :
          <Button onClick={closeHandler} variant="contained" sx={{ bgcolor: '#a3a3ab' }} type="button">
            Cancel
          </Button>
        }
        <Button variant="contained" sx={{ bgcolor: 'var(--primary-color)' }} type="submit">
          {detail ? 'Update' : 'Submit'}
        </Button>
      </Box>
    </form>
  );
};
