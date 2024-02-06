import { useEffect, useState } from 'react'
import { useFormik } from 'formik';
import * as yup from 'yup';
import { FormControl, Box, InputLabel, Button, Stack, Select, MenuItem } from '@mui/material';
import API from '../../services/AxiosConfig';
import { toast } from 'react-toastify';
import { useAuth, useCompany } from 'hooks';
import { FormDatePicker, FormInput, FormTimePicker } from 'components';
import { formatDate, formatName } from 'lib';
import { useParams } from 'react-router-dom';
import { FormHelperText } from '@mui/material';

interface editApplicantsProps {
  closeMe: () => void;
  currentRow?: any;
  options: any;
}

const ReferralPartnerActivityModal = ({ closeMe, currentRow, options }: editApplicantsProps) => {
  const { users } = useCompany();
  const { user } = useAuth();
  const {referralPartnerId} = useParams();
  const [types, setTypes] = useState([])

  const editApplicant = async (values: any, ) => {
    API.put('referral-partners/activity' + currentRow.id, { ...values, modifiedBy: user.id })
      .then((rsp) => {
        if (rsp.data.success) {
          toast.success('Successfully updated activity!');
          closeMe();
        }
      })
      .catch((err) => { });
  };

  const createApplicant = (values: any) => {
    API.post('/referral-partners/activity', { ...values, referralPartner:referralPartnerId, createdBy: user.id })
      .then((rsp) => {
        if (rsp.data.success) {
          toast.success('Successfully added referral partner.');
          closeMe();
        }
      })
      .catch((error) => {
        toast.error('Failed to add referral partner.');
        console.error(error);
      });
  };

  const validationSchema = yup.object({
    date: yup.date().required('Date is required'),
    completedBy: yup.string().required('Completed by is required'),
    activity: yup.string().required('Activity is required'),
  });

  const fetchTypes = async () => {
    try {
      const types = await API.get('referral-partners/activity/types')
      setTypes(types.data.data)
    } catch (err) {
      console.log(err)
    }

  }
  const formik = useFormik({
    initialValues: {
      time: currentRow?.state?.value?.time || '',
      date: currentRow?.date?.value || '',
      activity: currentRow?.activity?.id || '',
      completedBy: currentRow?.completedBy?.id || user._id,
      comments: currentRow?.comments?.value || '',
    },
    enableReinitialize: true,
    validationSchema: validationSchema,
    onSubmit: (values, { setSubmitting }) => {
      currentRow ? editApplicant(values) : createApplicant(values);
      closeMe();
    },
  });
  useEffect(() => {
    const current = new Date()
    !currentRow?.date?.value && formik.setFieldValue('date', current)
    !currentRow?.state?.value?.time && formik.setFieldValue('time', current)
    fetchTypes()
  }, [])
  return (
    <>
      <Box sx={{ paddingTop: '20px' }}>
        <h2 className="fs-30 pt">{currentRow ? 'Edit' : 'Add'} Activity </h2>
        <form onSubmit={formik.handleSubmit}>
          <Stack>
            <Box
              sx={{
                paddingTop: '20px',
                display: 'grid',
                gridTemplateColumns: 'auto auto',
                gap: '15px',
              }}
            >
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Activity</InputLabel>
                <Select
                  id="demo-simple-select"
                  value={formik.values.activity}
                  label="Activity"
                  name="activity"
                  onChange={formik.handleChange}
                  error={formik.touched.activity && Boolean(formik.errors.activity)}
                >
                  {types.map(({ _id, type }: any) => (
                    <MenuItem value={_id}>{type}</MenuItem>
                  ))}
                </Select>
                {formik.touched.activity && formik.errors.activity && <FormHelperText error >Completed By required</FormHelperText>}
              </FormControl>
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Completed By*</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={formik.values.completedBy}
                  label="Completed By"
                  name="completedBy"
                  onChange={formik.handleChange}
                  error={formik.touched.completedBy && Boolean(formik.errors.completedBy)}
                >
                  {users.map((user: any) => (
                    <MenuItem value={user._id}>{formatName(user.firstName, user.lastName)}</MenuItem>
                  ))}
                </Select>
                {formik.touched.completedBy && formik.errors.completedBy && <FormHelperText error >Completed By required</FormHelperText>}
              </FormControl>
              <FormDatePicker
                name="date"
                label="Date"
                value={formik.values.date}
                onChange={formik.handleChange}
                error={formik.touched.date && Boolean(formik.errors.date)}
                helperText={formik.touched.date && formik.errors.date}
                pickerOnChange={(newValue: String | null) => {
                  if (newValue) {
                    formik.setFieldValue('date', formatDate(newValue.toString()));
                  }
                }}
                required
              />
              <FormTimePicker
                name="time"
                label="Time"
                value={formik.values.time}
                onChange={formik.handleChange}
                error={formik.touched.time && Boolean(formik.errors.time)}
                helperText={formik.touched.time && formik.errors.time}
                pickerOnChange={(newValue) => {
                  if (newValue) {
                    formik.setFieldValue('time', newValue);
                  }
                }}
              />
              <div className='activity-modal-comments'>
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
              </div>
            </Box>
          </Stack>
          <Box
            sx={{
              padding: '20px 0px 10px 0px',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Button onClick={closeMe} variant="contained" sx={{ bgcolor: '#a3a3ab' }} type="button">
              Cancel
            </Button>
            <Button variant="contained" sx={{ bgcolor: 'var(--primary-color)', float: 'right' }} type="submit">
              Submit
            </Button>

          </Box>
        </form>
      </Box>
    </>
  );
};

export default ReferralPartnerActivityModal;
