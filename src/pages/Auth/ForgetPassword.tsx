import React from 'react';
import { useFormik } from 'formik';
import { Link } from 'react-router-dom';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { Box } from '@mui/material';
import API from 'services/AxiosConfig';
import { Auth, AuthCard, FormInput, SubmitButton } from 'components';

interface MyFormValues {
  email: string;
}

export const ForgetPassword = (): JSX.Element => {
  const validationSchema = yup.object({
    email: yup.string().typeError('Enter Email').email('Enter a valid email').required('Email is required'),
  });

  const loginFormHandler = async (values: MyFormValues, setSubmitting: any) => {
    await API.post('/auth/forgot-password', values)
      .then((rsp) => {
        toast.success('Email Sent.');
      })
      .catch((err) => {
        const errors:any = {
          'No email could not be sent': 'Email not found. Please enter a valid email address' 
        }
        toast.error(errors[err.response.data.error]);
      });
  };

  const formik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema: validationSchema,
    onSubmit: (values, { setSubmitting }) => {
      loginFormHandler(values, setSubmitting);
    },
  });

  return (
    <Auth>
      <AuthCard title="Reset Password" description="Enter email to reset password">
        <form onSubmit={formik.handleSubmit}>
          <FormInput
            name="email"
            label="Email"
            value={formik.values.email}
            onChange={formik.handleChange}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />
          <Box
            sx={{
              padding: '20px 0px 10px 0px',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <p className="st fs-14 m-0">
              Remember it ? <Link to="/">Login</Link>
            </p>
            <SubmitButton text="Submit" />
          </Box>
        </form>
      </AuthCard>
    </Auth>
  );
};
