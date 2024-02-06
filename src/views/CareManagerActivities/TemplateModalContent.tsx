import { useState, useEffect } from 'react'
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Box, Stack } from '@mui/material';
import { toast } from 'react-toastify';
import API from 'services/AxiosConfig';
import { FormAutocomplete, FormInput, ActionButtons, Select } from 'components';
import { useCompany } from 'hooks';

const TemplateModalContent = ({ closeHandler, templates, selected, addActivity, management = false }: any): JSX.Element => {
    const { careManagerActivities } = useCompany();
    const [activities, setActivities] = useState([])

    const fetchActivitiesTypes = async () => {
        const act = await API.get('marketing/types?referral=true')
        setActivities(act.data.data)
    }

    const splitTimeBetween = (timeBetween: any) => {
        let splitTime = timeBetween.split(" ")
        const selector: any = {
            'Months': 'm',
            'Days': 'd'
        }
        return [splitTime[0], selector[splitTime[1]]]
    }

    const initialValues: any = {
        activity: selected ? selected?.activity?.value || '' : '',
        daysOrMonths: selected?.timeToNextActivity ? splitTimeBetween(selected.timeToNextActivity.value)[1] : 'd',
        timeBetween: selected?.timeToNextActivity ? splitTimeBetween(selected.timeToNextActivity.value)[0] : ''
    };

    const validationSchema = (selected && selected?.timeToNextActivity || templates?.length > 0 ) ? yup.object({
        activity: yup.string().typeError('activity is required').required('Activity is required'),
        timeBetween: yup.number().min(1, 'Must be greater than 0').max(365, 'cannot exceed 365').typeError('invalid type').required('Time between activities is required')
    }) : yup.object({
        activity: yup.string().required('Activity is required'),
    })

    const formik = useFormik({
        initialValues,
        validationSchema: validationSchema,
        onSubmit: (values) => {
            if (selected?.state?._id) {
                editFormHandler(values)
                closeHandler()
            } else {
                addActivity && addActivity(values)
                closeHandler()
            }
        },
    });

    const editFormHandler = (values: any) => {
      
        toast.loading('Updating care manager activity...');
        const url = management ? `/management-activity-template`:`/activity-template`
        API.put(url, { _id: selected.state._id, idx: selected.state.idx, values })
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

    useEffect(() => {
        management && fetchActivitiesTypes()
    }, [management])
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
                    <FormAutocomplete
                        name="activity"
                        label="Activity"
                        value={formik.values.activity}
                        onChange={formik.handleChange}
                        error={formik.touched.activity && Boolean(formik.errors.activity)}
                        helperText={formik.touched.activity && formik.errors.activity}
                        autocompleteValue={formik.values.activity}
                        options={management ? activities?.map((a:any)=>a.type):careManagerActivities.map((a: any) => a.activity)}
                        autocompleteOnChange={(event: any, newValue: String | null) => {
                            formik.setFieldValue('activity', newValue);
                        }}
                        required
                    />
                    <div></div>
                    {(selected && selected?.timeToNextActivity?.value || templates?.length > 0) && <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <FormInput
                            name='timeBetween'
                            label='Time between activities'
                            value={formik.values.timeBetween}
                            onChange={formik.handleChange}
                            error={formik.touched.timeBetween && Boolean(formik.errors.timeBetween)}
                            helperText={formik.touched.timeBetween && formik.errors.timeBetween}
                            width='50%'
                        />
                        <Select
                            name='daysOrMonths'
                            onChange={formik.handleChange}
                            value={formik.values.daysOrMonths}
                            items={[{ key: 'd', label: 'Days' }, { key: 'm', label: 'Months' }]}
                            size='large'
                        />
                    </div>}
                </Box>
            </Stack>
            <ActionButtons closeHandler={closeHandler} />
        </form>
    );
};

export default TemplateModalContent;