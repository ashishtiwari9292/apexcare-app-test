
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Box, Stack } from '@mui/material';
import { toast } from 'react-toastify';
import API from 'services/AxiosConfig';
import {FormInput, ActionButtons } from 'components';
import { useAuth, useCompany } from 'hooks';
import { ModalProps } from 'typings';

interface AwardManagementInputProps {
  vendor: string,
}
const VendorsModalContent = ({ closeHandler, selected, showType, data, addActivity, options }: ModalProps): JSX.Element => {
  const { locations, clients, carePartners, careManagerActivities, users } = useCompany();
  const { user } = useAuth();
  const initialValues: AwardManagementInputProps = {
    vendor: selected ? selected.vendor.value : "",
  };

  const validationSchema = yup.object({
    vendor:yup.string().typeError('invalid vendor').required('vendor is required')
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
    API.put(`/vendors/${selected.id}`, { ...values})
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
    API.post('/vendors', { ...values, userId: user?._id })
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
            name="vendor"
            label="Vendor"
            value={formik.values.vendor}
            onChange={formik.handleChange}
            error={formik.touched.vendor && Boolean(formik.errors.vendor)}
            helperText={formik.touched.vendor && formik.errors.vendor}
          />
        </Box>
      </Stack>
      <ActionButtons closeHandler={closeHandler} />
    </form>
  );
};

export default VendorsModalContent;
