import React, { useState, useEffect } from 'react'
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Box, Stack } from '@mui/material';
import { toast } from 'react-toastify';
import API from 'services/AxiosConfig';
import { FormAutocomplete, FormInput, ActionButtons, Checkbox, FormDatePicker, FormTimePicker } from 'components';
import { useAuth, useCompany } from 'hooks';
import { formatDate } from 'lib';
import { ModalProps } from 'typings';
import Autocomplete from 'components/Form/Autocomplete';
import TextBox from 'components/Form/TextBox';

interface AwardManagementInputProps {
  location: any;
  date: string | Date;
  careManager: any;
  carePartner: any;
  award: string;
  comments: string;
  vendor: string,
  value: string
}
const AwardManagementModalContent = ({ closeHandler, selected, showType, data, addActivity, options }: ModalProps): JSX.Element => {
  const { locations, clients, carePartners, careManagerActivities, users } = useCompany();
  const [comments, setComments] = useState(selected?.state?.value?.comments || '')
  const { user } = useAuth();
  const initialValues: AwardManagementInputProps = {
    location: selected ? selected.state.value.location : user.location,
    careManager: selected ? selected.state.value.careManager : { firstName: '', lastName: '' },
    carePartner: selected ? selected.state.value.carePartnerObj : { firstName: '', lastName: '' },
    award: selected ? selected.award.value : '',
    date: selected?.date ? formatDate(selected?.date.value) : '',
    value: selected ? selected.value.value : '',
    vendor: selected ? selected.vendor.value : "",
    comments: selected ? selected.state.value.comments : '',
  };

  const validationSchema = yup.object({
    careManager: yup.object(),
    location: yup.object().typeError('Select your location').required('Location is required'),
    client: yup.object(),
    date: yup.date(),
    award: yup.string().typeError('Enter your award').required('Award is required'),
    value: yup.string().typeError('Enter your value').required('value is required')
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
    toast.loading('Updating award management...');
    API.put(`/award-management/${selected.id}`, { ...values, userId: user?._id })
      .then((rsp) => {
        toast.dismiss();
        if (rsp.data.success) {
          toast.success('Successfully updated award management.');
          closeHandler();
        }
      })
      .catch((error) => {
        toast.dismiss();
        toast.error('Failed to edit award management.');
        console.error(error);
      });
  };

  const createNewData = (values: any) => {
    API.post('/award-management', { ...values, userId: user?._id })
      .then((rsp) => {
        if (rsp.data.success) {
          values._id = rsp.data.data._id
          toast.success('Successfully added care manager activity.');
          closeHandler();
        }
      })
      .catch((error) => {
        toast.error('Failed to add care manager activity.');
        console.error(error);
      });
  };

  useEffect(() => {
    setComments(selected?.state?.value?.comments || '')
  }, [selected])

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
            label="Assigned to Care Manager"
          />

          <Autocomplete
            value={formik.values.carePartner || undefined}
            options={
              [
                { id: '', firstName: '', lastName: '' },
                ...carePartners
              ]
            }
            onChange={(event: any, newValue: any | null) => {
              if (null || !newValue) {
                formik.setFieldValue('carePartner', { id: '', firstName: '', lastName: '' });
              }
              else {
                formik.setFieldValue('carePartner', { _id: newValue._id, firstName: newValue.firstName, lastName: newValue.lastName });
              }
            }}
            label="Care Partner"
          />
          <div className='modal-date-picker'>
            <FormDatePicker
              name="date"
              label="Date"
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
          <FormAutocomplete
            name="award"
            label="Award"
            value={formik.values.award}
            onChange={formik.handleChange}
            error={formik.touched.award && Boolean(formik.errors.award)}
            helperText={formik.touched.award && formik.errors.award}
            autocompleteValue={formik.values.award}
            options={options.awards.map((a: any) => a.awardName)}
            autocompleteOnChange={(event: any, newValue: String | null) => {
              formik.setFieldValue('award', newValue);
            }}
            required
          />
          <FormAutocomplete
            name="vendor"
            label="Vendor"
            value={formik.values.vendor}
            onChange={formik.handleChange}
            error={formik.touched.vendor && Boolean(formik.errors.vendor)}
            helperText={formik.touched.vendor && formik.errors.vendor}
            autocompleteValue={formik.values.vendor}
            options={options.vendors.map((v: any) => v.vendor)}
            autocompleteOnChange={(event: any, newValue: String | null) => {
              formik.setFieldValue('vendor', newValue);
            }}
            required
          />
          <FormInput
            name="value"
            label="Value"
            value={formik.values.value}
            onChange={formik.handleChange}
            error={formik.touched.value && Boolean(formik.errors.value)}
            helperText={formik.touched.value && formik.errors.value}
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
          />
        </Box>
      </Stack>
      <ActionButtons closeHandler={closeHandler} />
    </form>
  );
};

export default AwardManagementModalContent;
