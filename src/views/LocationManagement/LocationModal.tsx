
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Box, Stack } from '@mui/material';
import { toast } from 'react-toastify';
import API from 'services/AxiosConfig';
import { FormInput, ActionButtons } from 'components';
import { useAuth, useCompany } from 'hooks';
import { ModalProps } from 'typings';
import { useEffect } from 'react';

interface LocationInputProps {
    location: string,
}
const LocationModal = ({ closeHandler, selected, showType, data, addActivity, options, fetchLocations }: any): JSX.Element => {
    const { locations , setLocations, clients, carePartners, careManagerActivities, users } = useCompany();
    const { user } = useAuth();
    const initialValues: LocationInputProps = {
        location: selected ? selected.location.value : "",
    };

    const validationSchema = yup.object({
        location: yup.string().typeError('invalid location').required('location is required')
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
        toast.loading('Updating Location...');
        API.put(`/location/${selected.id}`, { ...values })
            .then((rsp) => {
                toast.dismiss();
                if (rsp.data.success) {
                    setLocations([...rsp.data.data])
                    toast.success('Successfully updated location.');
                    closeHandler();
                }
            })
            .catch((error) => {
                toast.dismiss();
                toast.error('Failed to edit location.');
                console.error(error);
            });
    };

    const createNewData = (values: any) => {
        API.post('/location', { ...values})
            .then((rsp) => {
                if (rsp.data.success) {
                    fetchLocations()
                    setLocations(rsp.data.data)
                    toast.success('Successfully added location.');
                    closeHandler();
                }
            })
            .catch((error) => {
                toast.error('Failed to add location.');
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
                        name="location"
                        label="Location"
                        value={formik.values.location}
                        onChange={formik.handleChange}
                        error={formik.touched.location && Boolean(formik.errors.location)}
                        helperText={formik.touched.location && formik.errors.location}
                    />
                </Box>
            </Stack>
            <ActionButtons closeHandler={closeHandler} />
        </form>
    );
};

export default LocationModal;
