import { useFormik } from 'formik';
import { Box, FormControl, Stack, TextField, ToggleButton, ToggleButtonGroup } from '@mui/material';
import moment from 'moment';
import { ActionButtons, FormDatePicker, Select } from 'components';
import { formatDate } from 'lib';
import { useState } from 'react';
import { ModalProps } from 'typings';

const DAYS = [
    {
        key: "monday",
        label: "M"
    },
    {
        key: "tuesday",
        label: "T"
    },
    {
        key: "wednesday",
        label: "W"
    },
    {
        key: "thursday",
        label: "T"
    },
    {
        key: "friday",
        label: "F"
    },
    {
        key: "saturday",
        label: "S"
    },
    {
        key: "sunday",
        label: "S"
    },
];

const RecurrenceModal = ({ closeHandler, setFormValue, formValues, yearInTheFuture }: ModalProps) => {
    const [days, setDays] = useState(formValues.recurrence !== 'No Recurrence' ? formValues.days : [])
    const initialValues: any = {
        recurrenceOptions: formValues.recurrence !== 'No Recurrence' ? formValues.recurrenceOptions : '1',
        recurrence: formValues.recurrence !== 'No Recurrence' ? formValues.recurrence : 'Weekly',
        endDate: formValues.recurrence !== 'No Recurrence' ? formValues.endDate : yearInTheFuture
    };

    const formik = useFormik({
        initialValues,
        enableReinitialize: true,
        onSubmit: (values) => {
            if (setFormValue) {
                values.recurrence && setFormValue('recurrence', values.recurrence)
                values.recurrenceOptions && setFormValue('recurrenceOptions', values.recurrenceOptions)
                days && setFormValue('days', days)
                values.startDate && setFormValue('date', values.startDate)
                values.endDate && setFormValue('endDate', moment(values.endDate))
               
            }
            closeHandler()
        },
    });

    return (
        <form onSubmit={formik.handleSubmit}>
            <Stack>
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: 'auto',
                        columnGap: '15px',
                        rowGap: '15px',
                    }}
                >
                    <div className='modal-date-picker' style={{ display: 'flex', justifyContent: 'center', margin: '0' }}>
                    </div>
                    <div className='repeat-container'>
                        <p>Repeat every</p>
                        <FormControl sx={{ width: '5%', margin: '10px 0px', outline: 'none' }} variant='standard'>
                            <TextField
                                variant='standard'
                                InputLabelProps={{ shrink: true }}
                                id={'recurrenceOptions'}
                                type={'text'}
                                aria-describedby="my-helper-text"
                                value={formik.values.recurrenceOptions}
                                onChange={(formik.handleChange)}
                                error={formik.touched.recurrenceOptions && Boolean(formik.errors.recurrenceOptions)}
                                helperText={formik.touched.recurrenceOptions && formik.errors.recurrenceOptions}
                                minRows={1}
                                maxRows={1}
                                multiline={false}
                            />
                        </FormControl>
                        <FormControl variant='standard'>
                            <Select
                                value={formik.values.recurrence}
                                defaultValue='Weekly'
                                onChange={formik.handleChange}
                                name='recurrence'
                                items={[{ label: 'Weeks', key: 'Weekly' }, { label: 'Months', key: 'Monthly' }]}
                                label=''
                            />
                        </FormControl>
                    </div>
                    <FormControl sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px' }}>
                        <ToggleButtonGroup
                            size="large"
                            arial-label="Days of the week"
                            value={formik.values.recurrence === "Weekly" ? days : []}
                            onChange={(event, value) => setDays(value)}
                            disabled={formik.values.recurrence !== 'Weekly'}
                        >
                            {DAYS.map((day, index) => (
                                <ToggleButton
                                    sx={{}}
                                    key={day.key}
                                    value={index}
                                    aria-label={day.key}>
                                    {day.label}
                                </ToggleButton>
                            ))}
                        </ToggleButtonGroup>
                    </FormControl>
                    <div className='modal-date-picker' style={{ display: 'flex', justifyContent: 'center' }}>
                        <div style={{ width: '80%' }}>
                            <FormDatePicker
                                name="endDate"
                                label="End Date"
                                value={formik.values.endDate}
                                onChange={formik.handleChange}
                                error={formik.touched.endDate && Boolean(formik.errors.endDate)}
                                helperText={formik.touched.endDate && formik.errors.endDate}
                                pickerOnChange={(newValue: String | null) => {
                                    if (newValue) {
                                        formik.setFieldValue('endDate', newValue);
                                    }
                                }}
                                required
                            />
                            {formik.values.endDate !== yearInTheFuture && <p onClick={() => formik.setFieldValue('endDate', yearInTheFuture)} className='reset-date'> Reset end date</p>}
                        </div>
                    </div>
                </Box>
            </Stack>
            <ActionButtons closeHandler={closeHandler} renderEmail = {false} />
        </form>
    );
};
export default RecurrenceModal;
