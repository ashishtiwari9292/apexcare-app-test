import React, { useEffect } from 'react';
import { useFormik } from 'formik';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as yup from 'yup';
import { Box } from '@mui/material';
import { Auth, AuthCard, FormInput, SubmitButton } from 'components';
import { useAuth } from 'hooks';
import API from 'services/AxiosConfig';

interface MyFormValues {
  email: string;
  password: string;
}

export const Login = (): JSX.Element => {
  const { signInWithEmail, user, isLoggedIn } = useAuth();
  let navigate = useNavigate();

  const validationSchema = yup.object({
    email: yup.string().typeError('Enter Email').email('Enter a valid email').required('Email is required'),
    password: yup
      .string()
      .typeError('Enter password')
      .min(5, 'Password should be of minimum 5 characters length')
      .required('Password is required'),
  });

  useEffect(() => {
    if (isLoggedIn && user) {
      navigate('/quick-hits', { replace: true });
    }
  }, [isLoggedIn, navigate, user]);


  const loginFormHandler = async (values: MyFormValues, setSubmitting: any) => {
    try {
      signInWithEmail(values);
    } catch (error: any) {
      toast.error(error);
    }
  };

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: validationSchema,
    onSubmit: (values, { setSubmitting }) => {
      loginFormHandler(values, setSubmitting);
    },
  });

  return (
    <Auth>
      <AuthCard title="Welcome Back!" description="Sign in to continue to ApexCare">
        <form onSubmit={formik.handleSubmit}>
          <FormInput
            name="email"
            label="Email"
            value={formik.values.email}
            onChange={formik.handleChange}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />
          <FormInput
            type="password"
            name="password"
            label="Password"
            value={formik.values.password}
            onChange={formik.handleChange}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
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
            <Link to="/forget-password">
              <span className="pt fs-14">Forget password?</span>
            </Link>
            <SubmitButton text="login" />
          </Box>
        </form>
      </AuthCard>
    </Auth>
  );
};
