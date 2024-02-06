import { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import AddIcon from '@mui/icons-material/Add';
import { FormControl, Box, Button, TextField, Stack, Fab, Tooltip } from '@mui/material';
import API from '../../services/AxiosConfig';
import { toast } from 'react-toastify';

import ClearIcon from '@mui/icons-material/Clear';

interface editApplicantsProgressProps {
  closeMe: () => void;
  currentRow?: any;
  id: any;
  title?: any;
  initialVals?: any;
  fetchData: () => void;
  idx?: number
}

const ApplicantProgressModalContent = ({
  closeMe,
  currentRow,
  id,
  title,
  initialVals = { row1: '' },
  idx,
}: editApplicantsProgressProps) => {
  const [rows, setRows] = useState<any[]>([]);
  const [current, setCurrent] = useState<any>([]);
  const [updatedValidationSchema, setUpdatedValidationSchema] = useState({
    title: yup.string().required('Title is Required'),
  });

  const editApplicantProgress = async (values: any) => {
    API.put(`/applicants/progress/labels/${id}`, { values, oldTitle: title, idx })
      .then((rsp) => {
        if (rsp.data.success) {
          toast.success('Successfully Edited Applicant Progress Card.');
          closeMe();
        }
      })
      .catch((error) => {
        toast.error('Failed to Edit Applicant Progress Card.');
        console.error(error);
      });
  };

  const createApplicantProgress = (values: any) => {
    let title = values.title.trim();
    const doc: any = { title, values: {} };
    delete values.title;

    Object.values(values).map((item: any) => {
      if (item === false) return;
      doc.values[item.trim()] = '';
      return;
    });

    API.post(`/applicants/progress/${id}`, doc)
      .then((rsp) => {
        if (rsp.data.success) {
          toast.success('Successfully Added Applicant Progress Card');
          closeMe();
        }
      })
      .catch((error) => {
        toast.error('Failed to add applicant.');
        console.error(error);
      });
  };

  const removeApplicant = () => {
    API.delete(`/applicants/progress/${title}`)
      .then((rsp) => {
        if (rsp.data.success) {
          toast.success('Successfully Removed Applicant Progress Card.');
          closeMe();
        }
      })
      .catch((error) => {
        if(error.response.data.error === 'Cannot delete stage with active applicants'){
          toast.error('Cannot delete stage with active applicants')
        }else{
        toast.error('Failed To Removed Applicant Progress Card.');
        }
      });
  };

  const formik = useFormik({
    initialValues: {
      title: title || '',
      ...initialVals,
    } as any,
    enableReinitialize: true,
    validationSchema: yup.object(updatedValidationSchema),
    onSubmit: (values) => {
      const asArray = Object.entries(values);
      let filtered = asArray.filter(([key, value]) => {
        if (key === 'title') return false;
        return value !== false;
      });

      if (filtered.length === 0) {
        toast.error('Must contain at least one row');
        return;
      }
      currentRow ? editApplicantProgress(values) : createApplicantProgress(values);
      closeMe();
    },
  });

  useEffect(() => {
    setCurrent(currentRow);
  }, []);

  useEffect(() => {
    let updated: any = {};
    for (const key in formik.values) {
      if (key === 'title') continue;
      if (currentRow && key === 'row1') continue;
      updated[key] = yup.string().required('Row name required');
    }
    setUpdatedValidationSchema({ ...updatedValidationSchema, ...updated });
  }, []);

  return (
    <>
      <Box sx={{ paddingTop: '20px' }}>
        <h2 className="fs-30 pt">{currentRow ? 'Edit' : 'Add'} Stage </h2>
        <form onSubmit={formik.handleSubmit}>
          <Stack>
            <Box
              sx={{
                paddingTop: '20px',
                display: 'grid',
                gridTemplateColumns: '50% 20% 10% ',
                gap: '15px',
              }}
            >
              <FormControl sx={{ width: '100%' }}>
                <TextField
                  type="text"
                  id="my-input"
                  aria-describedby="my-helper-text"
                  name="title"
                  multiline
                  maxRows={1}
                  label="Title"
                  value={formik.values.title ? formik.values.title : ''}
                  onChange={formik.handleChange}
                  error={formik.touched.title && Boolean(formik.errors.title)}
                  helperText={formik.touched.title && formik.errors.title}
                />
              </FormControl>
              <Tooltip title="Add Row" placement="right">
                <Fab
                  color="primary"
                  aria-label="add"
                  onClick={() => {
                    setRows([...rows, {}]);
                    formik.setFieldValue(`row${rows.length + 2}`, '');
                  }}
                >
                  <AddIcon />
                </Fab>
              </Tooltip>
              {current &&
                current.map((key: any, idx: number) => {
                  return (
                    <>
                      <FormControl sx={{ width: '100%', gridColumn: '1/3' }}>
                        <TextField
                          type="text"
                          id="my-input"
                          aria-describedby="my-helper-text"
                          name={current[idx].label}
                          multiline
                          maxRows={1}
                          value={formik.values[current[idx].label]}
                          onChange={formik.handleChange}
                          error={formik.touched[current[idx].label] && Boolean(formik.errors[current[idx].label])}
                          helperText={formik.touched[current[idx].label] && formik.errors[current[idx].label]}
                        />
                      </FormControl>
               <div className="remove-row-button hover-red">
                        <Tooltip title="Remove Row" placement="right">
                          <ClearIcon
                            onClick={(e) => {
                              e.preventDefault();
                              const copy = [...current];
                              formik.setFieldValue(copy[idx].label, false);
                              copy.splice(idx, 1)
                              setCurrent(copy)

                            }}
                          />
                        </Tooltip>
                      </div>
                    </>
                  );
                })}
              {!currentRow && (
                <FormControl sx={{ width: '100%', gridColumn: '1/3' }}>
                  <TextField
                    type="text"
                    id="my-input"
                    aria-describedby="my-helper-text"
                    name="row1"
                    multiline
                    maxRows={4}
                    label="Row "
                    value={formik.values.row1 ? formik.values.row1 : ''}
                    onChange={formik.handleChange}
                    error={formik.touched.row1 && Boolean(formik.errors.row1)}
                    helperText={formik.touched.row1 && formik.errors.row1}
                  />
                </FormControl>
              )}
              {rows.map((key: any, i) => {
                return (
                  <>
                    <FormControl sx={{ width: '100%', gridColumn: '1/3' }}>
                      <TextField
                        type="text"
                        id="my-input"
                        aria-describedby="my-helper-text"
                        name={`row${i + 2}`}
                        multiline
                        maxRows={4}
                        label={`Row`}
                        value={formik.values[`row${i + 2}`]}
                        onChange={formik.handleChange}
                        error={formik.touched[`row${i + 2}`] && Boolean(formik.errors[`row${i + 2}`])}
                        helperText={formik.touched[`row${i + 2}`] && formik.errors[`row${i + 2}`]}
                      />
                    </FormControl>
                    <div className="hover-red remove-row-button">
                      <Tooltip title="Remove Row" placement="right">
                        {
                          <ClearIcon
                            onClick={(e) => {
                              e.preventDefault();
                              rows.splice(i, 1);
                              formik.setFieldValue(`row${i + 2}`, false);
                            }}
                          />
                        }
                      </Tooltip>
                    </div>
                  </>
                );
              })}
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
            <Button variant="contained" sx={{ bgcolor: 'var(--primary-color)' }} type="submit">
              Submit
            </Button>
            <div>
         {currentRow  && <Tooltip title="Delete Progress Card " placement="right">
              <Button onClick={removeApplicant} variant="contained" sx={{ marginRight: '15px' , bgcolor: 'var(--danger-color)', '&:hover': { backgroundColor: '#c62828' } }} type="button">
                Remove
              </Button>
            </Tooltip>}
            <Button onClick={closeMe} variant="contained" sx={{ bgcolor: '#a3a3ab',  }} type="button">
              Cancel
            </Button>
            </div>
          </Box>
        </form>
      </Box>
    </>
  );
};
export default ApplicantProgressModalContent;
