
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Box, Stack } from '@mui/material';
import { toast } from 'react-toastify';
import API from 'services/AxiosConfig';
import {FormInput, ActionButtons } from 'components';
import { useAuth, useCompany } from 'hooks';
import { ModalProps } from 'typings';

interface AwardManagementInputProps {
  awardName: string,
}
const AwardTypeModal = ({ closeHandler, selected, showType, data, addActivity, options }: ModalProps): JSX.Element => {
  const { locations, clients, carePartners, careManagerActivities, users } = useCompany();
  const { user } = useAuth();
  const initialValues: AwardManagementInputProps = {
    awardName: selected ? selected.award.value : "",
  };

  const validationSchema = yup.object({
    awardName:yup.string().typeError('invalid vendor').required('vendor is required')
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
    API.put(`/awards/${selected.id}`, { ...values})
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
    API.post('/awards', { ...values, userId: user?._id })
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
            name="awardName"
            label="Award Type"
            value={formik.values.awardName}
            onChange={formik.handleChange}
            error={formik.touched.awardName && Boolean(formik.errors.awardName)}
            helperText={formik.touched.awardName && formik.errors.awardName}
          />
        </Box>
      </Stack>
      <ActionButtons closeHandler={closeHandler} />
    </form>
  );
};

export default AwardTypeModal;
