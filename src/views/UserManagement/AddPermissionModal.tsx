import { useFormik } from 'formik';
import * as yup from 'yup';
import { Box, Stack } from '@mui/material';
import { toast } from 'react-toastify';
import API from 'services/AxiosConfig';
import { FormAutocomplete, FormInput, ActionButtons, Checkbox } from 'components';
import { useAuth, useCompany } from 'hooks';
import { ModalProps } from 'typings';

interface UserManagementInputProps {
    user: any;
    location: any;
}

const AddPermissionModal = ({ closeHandler, selected, showType, data }: ModalProps): JSX.Element => {
  const { locations, users } = useCompany();
  const { user } = useAuth();
  const initialValues: UserManagementInputProps = {
        location: null,
        user: { firstName: '', lastName: '' },
    };   
  const validationSchema = yup.object({
        location: yup.object().typeError('Select your location').required('Location is required'),
        user: yup.object(),
    });

  const formik = useFormik({
        initialValues,
        enableReinitialize: true,
        validationSchema: validationSchema,
        onSubmit: (values) => {
            createPermission(values);
            closeHandler();
        },
    });

  const createPermission = (values: any) => {
        API.post(`/permissions/${selected.id}`, { location: values.location._id })
            .then((rsp) => {
                if (rsp.data.success) {
                    toast.success('Successfully added permission.');
                    closeHandler();
                }
            })
            .catch((error) => {
                toast.error('Failed to add permission.');
                console.error(error);
            });
    };

    return (
      <form onSubmit={formik.handleSubmit}>
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: 'auto auto',
                gap: '30px',
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
        </Box>
        <ActionButtons closeHandler={closeHandler} />
        </form>
    );
};
export default AddPermissionModal;