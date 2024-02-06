import { useFormik } from 'formik';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { Stack } from '@mui/material';
import moment from 'moment';
import API from 'services/AxiosConfig';
import { Modal } from './../../components/Modal';
import { ActionButtons, FormDatePicker} from '../../components/Form';
import { useAuth, useCompany} from 'hooks';

interface HiredApplicantModalProps {
    open: boolean;
    closeHandler: () => void;
    initialValues: any;
    id: any;
    closeMe: () => void;
    update: () => void;
}

interface HireInputProps {
    hiredDate: string;
}

export const HiredApplicantModalContent = ({
    open,
    closeHandler,
    initialValues,
    id,
    closeMe,
     update
}: HiredApplicantModalProps): JSX.Element => {
    const { user } = useAuth();
    const {setCarePartners,carePartners} = useCompany()
    const hireHandler = async (values: HireInputProps) => {
        API.put(`applicants/hire/${id}`, { ...values, userId: user?._id })
            .then((rsp) => {
                if (rsp.data.success) {
                    toast.success('Successfully hired applicant');
                }
            })
            .then(()=>{
                return API.get('care-partner');
            })
            .then(({data:carePartnerList}) => {
                setCarePartners(carePartnerList.data)
                toast.success('Successfully added care partner')
            })
            .then(()=>{
                update()
            })
            .catch((error) => {
                console.error(error);
                toast.error('Failed to hire applicant.');
            });
    };

    const validationSchema = yup.object({
        hiredDate: yup.string().typeError('Select closed by').required('Closed by is required'),
    });

    const formik = useFormik({
        initialValues: {
            hiredDate: new Date()
        },
        enableReinitialize: true,
        validationSchema: validationSchema,
        onSubmit: (values) => {
            hireHandler({...initialValues, hireDate:values.hiredDate})
            closeHandler();
            closeMe()
        },
    });

    return (
        <Modal
            open={open}
            closeHandler={closeHandler}
            title={
                'Confirm Add to Care Partners'
            }
            styles={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '30%',
                bgcolor: 'background.paper',
                border: '2px solid #000',
                boxShadow: 24,
                p: 4,
            }}
        >
            <form onSubmit={formik.handleSubmit}>
                <Stack spacing={2}>
                    <FormDatePicker
                        name="hiredDate"
                        label="Hired Date"
                        value={formik.values.hiredDate}
                        onChange={formik.handleChange}
                        error={formik.touched.hiredDate && Boolean(formik.errors.hiredDate)}
                        helperText={formik.touched.hiredDate && formik.errors.hiredDate}
                        pickerOnChange={(newValue: String | null) => {
                            if (newValue) {
                                formik.setFieldValue('hiredDate', newValue);
                            }
                        }}
                        required
                    />
                </Stack>
                <ActionButtons
                    closeHandler={closeHandler}
                    actionText={"Confirm"}
                />
            </form>
        </Modal>
    );
};
