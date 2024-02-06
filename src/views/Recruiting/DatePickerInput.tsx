// @ts-nocheck
import { FormControl, TextField } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useFormik } from 'formik';

export const DatePickerInput = ({ label, name, initialValue, handelSubmit, handleChange, i, disabled }: any) => {
  const formik = useFormik({
    initialValues: {
      [name]: initialValue,
    },
    enableReinitialize: true,
    onSubmit: (values: any, { setSubmitting }: any) => { },
  });

  return (
    <form>
      <FormControl sx={{ fontWeight: 'bold', height: '70px', display: 'flex', justifyContent: 'center' }}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            disabled={disabled}
            label={label}
            value={formik.values[name] || null}
            onChange={(newValue: String | null) => {
              formik.setFieldValue(name, newValue);
              handleChange(name, newValue, i);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                InputLabelProps={{ style: { color: 'black', fontWeight: 'bold' }, shrink: !disabled }}
                type="text"
                id="my-input"
                aria-describedby="my-helper-text"
                name={name}
                sx={{ svg: { color: 'green' } }}
              />
            )}
          />
        </LocalizationProvider>
      </FormControl>
    </form>
  );
};