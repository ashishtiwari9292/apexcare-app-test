import React from 'react';
import { toast } from 'react-toastify';
import { useFormik } from 'formik';
import { useNavigate, useParams } from 'react-router-dom';
import * as yup from 'yup';
import { Box } from '@mui/material';
import API from 'services/AxiosConfig';
import { Auth, AuthCard, SubmitButton, FormInput } from 'components';

interface MyFormValues {
  password: string;
  confirmPassword: string;
}

export const ResetPassword = (): JSX.Element => {
  let { resetToken } = useParams();
  let navigate = useNavigate();

  const validationSchema = yup.object({
    password: yup
      .string()
      .typeError('Enter password')
      .min(5, 'Password should be of minimum 5 characters length')
      .required('Password is required'),
    confirmPassword: yup.string().oneOf([yup.ref('password'), null], 'Passwords must match'),
  });

  const loginFormHandler = async (values: MyFormValues, setSubmitting: any) => {
    await API.put(`/auth/password-reset/${resetToken}`, values)
      .then((rsp) => {
        localStorage.setItem('apexcare-token', rsp.data.token);
        toast.success('Successfully reset password')
        navigate('/', { replace: true });
      })
      .catch((err) => {
        toast.error("Link has expired");
      });
  };

  const formik = useFormik({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    validationSchema: validationSchema,
    onSubmit: (values, { setSubmitting }) => {
      loginFormHandler(values, setSubmitting);
    },
  });

  return (
    <Auth>
      <AuthCard title="Reset Password" description="Enter new password">
        <form onSubmit={formik.handleSubmit}>
          <FormInput
            type="password"
            name="password"
            label="Password"
            value={formik.values.password}
            onChange={formik.handleChange}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
          />
          <FormInput
            type="password"
            name="confirmPassword"
            label="Confirm Password"
            value={formik.values.confirmPassword}
            onChange={formik.handleChange}
            error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
            helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
          />
          <Box
            sx={{
              padding: '20px 0px 10px 0px',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'flex-end',
            }}
          >
            <SubmitButton text="Submit" />
          </Box>
        </form>
      </AuthCard>
    </Auth>
  );
};
