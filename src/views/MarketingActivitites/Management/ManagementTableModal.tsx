
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Box, Stack } from '@mui/material';
import { toast } from 'react-toastify';
import API from 'services/AxiosConfig';
import {FormInput, ActionButtons } from 'components';
import { useAuth, useCompany } from 'hooks';
import { ModalProps } from 'typings';

interface AwardManagementInputProps {
  activity: string,
}
const ManagementTableModal = ({ closeHandler, selected, showType, data, addActivity, options, url,title }: any): JSX.Element => {
  const { locations, clients, carePartners, careManagerActivities, users } = useCompany();
  const { user } = useAuth();
  const initialValues: AwardManagementInputProps = {
    activity: selected ? selected.award.value : "",
  };

  const validationSchema = yup.object({
    activity:yup.string().typeError('invalid vendor').required('vendor is required')
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
    toast.loading('Updating care manager activity...');

    API.put(`${url}/activity-type/${selected.id}`, {...values})
      .then((rsp) => {
        toast.dismiss();
        if (rsp.data.success) {
          toast.success('Successfully updated care manager activity.');
          closeHandler();
        }
      })
      .catch((error) => {
        toast.dismiss();
        toast.error('Failed to edit care manager activity.');
        console.error(error);
      });
  };

  const createNewData = (values: any) => {
  let isReferral = null
  if(title === 'Referral Partners Activity'){
    isReferral = true
  }
  if(title === 'Prospect Activity'){
    isReferral = false
  }
  
    API.post(`${url}/activity-type`, { ...values, userId: user?._id , isReferral :isReferral})
      .then((rsp) => {
        if (rsp.data.success) {
          toast.success('Successfully added care manager activity.');
          closeHandler();
        }
      })
      .catch((error) => {
        toast.error('Failed to add care manager activity.');
        console.error(error);
    });
  };

  return (
    <form onSubmit={formik.handleSubmit}>
      <Stack>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '90%',
            columnGap: '15px',
          }}
        >
          <FormInput
            name="activity"
            label="Type"
            value={formik.values.activity}
            onChange={formik.handleChange}
            error={formik.touched.activity && Boolean(formik.errors.activity)}
            helperText={formik.touched.activity && formik.errors.activity}
          />
        </Box>
      </Stack>
      <ActionButtons renderEmail = {false} closeHandler={closeHandler} />
    </form>
  );
};

export default ManagementTableModal;
