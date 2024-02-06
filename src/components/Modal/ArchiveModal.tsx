import { useFormik } from 'formik';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { Button, FormControl, FormHelperText, Grid, InputLabel, MenuItem, Select, Stack } from '@mui/material';
import moment from 'moment';
import API from 'services/AxiosConfig';
import { Modal } from './Modal';
import { ActionButtons, FormAutocomplete, FormDatePicker, FormInput } from '../Form';
import { formatDate, formatName } from 'lib';
import { useAuth, useCompany } from 'hooks';
import { handleUnarchive } from 'lib';
import { useEffect, useState } from 'react';


interface ArchiveModalProps {
  open: boolean;
  closeHandler: () => void;
  collectionName: string;
  selected: any;
  label: string;
  deactivate?: boolean;
  fetchData?: () => void;
  stageOptions?: any;
  lostClientReasons?: any;
}

interface ArchiveInputProps {
  completedBy: string;

  closingComments: string;
  completedAt: string;
}

export const ArchiveModal = ({
  open,
  closeHandler,
  selected,
  collectionName,
  label,
  deactivate,
  stageOptions,
  lostClientReasons,
  fetchData = () => { }
}: ArchiveModalProps): JSX.Element => {
  
  const { locations, users, setClients, clients } = useCompany()
  const { user } = useAuth();
  const [clientTypes, setClientTypes] = useState<any>([])
  const [partnerTypes, setPartnerTypes] = useState<any>([])

  const archiveHandler = async (values: ArchiveInputProps) => {
    API.put(`${collectionName}/archive/${selected?.id || selected.state.currentRow._id}`, { ...values, userId: user?._id })
      .then((rsp) => {
        if (rsp.data.success) {
          toast.success('Successfully archived.');
          closeHandler();
        }
      })
      .catch((error) => {
        console.error(error);
        toast.error('Failed to archive.');
      });
  };


  const convertToClient = async () => {
    try {

      if (Object.keys(formik.errors).length === 0) {
        const converted = await API.put(`/prospects/convert-to-client/${selected?.id || selected.state.currentRow._id}`, { user: user })
        let client = converted.data.data
        let updatedClients = [...clients, client]
        setClients(updatedClients)
        if (converted) {
          toast.success('Successfully converted Prospect to Client.')
        }
      } else {
        toast.error('Please complete required fields before adding to Clients.')
      }
    } catch (err: any) {
      console.error(err)
      toast.error('Failed to convert Prospect to Client.')
    }
  }


  const archivePermission = async (values: any) => {
    API.post(`permissions/${selected?.state?.value?.userId}/${selected?.state?.value?.locationId}`, values)
      .then((rsp: any) => {
        fetchData()
        formik.setFieldValue('closingComments', '')
        toast.success('Successfully archived permission.');
      }).catch(err => {
        fetchData()
        toast.error('Failed to archived permission.');
      })
  }

  const getClientTypes = async () => {
    API.get('/client/activity/search/Active')
      .then((rsp) => {
        if (rsp.data.success) {

          setClientTypes(rsp.data.data)
        }
      })
      .catch((error) => {
        console.error(error);
        toast.error('Failed to get client deactivation types.');
      });
  };


  const getPartnerTypes = async () => {
    API.get('/care-partner/activity/search/Active')
      .then((rsp) => {
        if (rsp.data.success) {
          setPartnerTypes(rsp.data.data)
        }
      })
      .catch((error) => {
        console.error(error);
        toast.error('Failed to get client deactivation types.');
      });
  };
  const validationSchema = yup.object({
    closingComments: yup.string(),
    completedAt: yup.string().required('Closed date is required'),
    completedBy: yup.string().typeError('Select closed by').required('Closed by is required'),
    clientDeactivationReason: label === 'Client' && !(selected?.status?.value === 'Closed' || selected?.status?.value === 'Inactive' || selected?.state?.value?.render || selected?.status === false) ? yup.string().required('Client Deactivation reason is required') : yup.mixed(),
    carePartnerDeactivationReason: label === 'Care Partner' && !(selected?.status?.value === 'Closed' || selected?.status?.value === 'Inactive' || selected?.state?.value?.render || selected?.status === false) ? yup.string().required('Care Partner Deactivation reason is required') : yup.mixed()

  });

  const formik = useFormik({
    initialValues: {
      completedBy: user ? formatName(user.firstName, user.lastName) : '',
      completedAt: moment().format('MM/DD/YYYY'),
      stage: '',
      lostClientReason: '',
      closingComments: collectionName === 'user-management' ? '' : (selected?.status?.value === 'Closed' || selected?.status?.value === 'Inactive' || selected?.state?.value?.render
        ? selected?.state?.value?.closingComments || selected?.state?.value?.comments
        : ''),
      clientDeactivationReason: selected ? selected?.state?.value?.deactivateReason?._id : null,
      carePartnerDeactivationReason: selected ? selected?.state?.value?.deactivateReason : null

    },
    enableReinitialize: true,
    validationSchema: validationSchema,
    onSubmit: (values) => {
      selected?.status?.value === 'Closed' || selected?.status?.value === 'Inactive' || selected?.state?.value?.render
        ? handleUnarchive(collectionName, selected?.id, values.closingComments)
        : collectionName === "user-management" ? archivePermission(values) : archiveHandler(values);
      closeHandler();
    },
  });

  useEffect(() => {
    if (label === 'Client') {
      getClientTypes()
    } else if (label == 'Care Partner') {
      getPartnerTypes()
    }
  }, [label])


  return (
    <Modal
      open={open}
      closeHandler={closeHandler}
      title={
        selected?.status?.value === 'Closed' || selected?.status?.value === 'Inactive' || selected?.state?.value?.render || selected?.status === false
          ? 'Unarchive ' + label
          : 'Archive ' + label
      }

    >
      <form onSubmit={formik.handleSubmit}>
        <Stack spacing={2}>

          <div style={{ 'display': 'flex', gap: '20px' }}>
            {collectionName !== "user-management" &&

              <FormAutocomplete
                name="completedBy"
                label="Care Manager"
                value={formik.values.completedBy}
                onChange={formik.handleChange}
                error={formik.touched.completedBy && Boolean(formik.errors.completedBy)}
                helperText={formik.touched.completedBy && formik.errors.completedBy}
                autocompleteOnChange={(event: any, newValue: String | null) => {
                  formik.setFieldValue('completedBy', newValue);
                }}
                autocompleteValue={formik.values.completedBy}
                options={users && users.map((c: any) => formatName(c.firstName, c.lastName))}
                required
              />

            }
            <div style={{ marginTop: '10px', width: '100%' }}>
              <FormDatePicker
                name="completedAt"
                label={(deactivate ? 'Archive' : 'Completed') + ' Date'}
                value={formik.values.completedAt}
                onChange={formik.handleChange}
                error={formik.touched.completedAt && Boolean(formik.errors.completedAt)}
                helperText={formik.touched.completedAt && formik.errors.completedAt}
                pickerOnChange={(newValue: String | null) => {
                  if (newValue) {
                    formik.setFieldValue('completedAt', formatDate(newValue.toString()));
                  }
                }}
                required
              />
            </div>
          </div>

          {label === 'Prospect' &&
            <div style={{ 'display': 'flex', gap: '20px' }}>
              <FormControl fullWidth >
                <InputLabel style={{ color: formik.touched.stage && formik.errors.stage ? 'red' : '' }} id="demo-simple-select-label">Stage*</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={formik.values.stage}
                  label="Stage"
                  name="stage"
                  error={formik.touched.stage && Boolean(formik.errors.stage)}

                  onChange={(e) => { formik.setFieldValue('stage', e.target.value) }}
                >
                  {stageOptions.map((stage: any) => (
                    <MenuItem value={stage.type}>{stage.type}</MenuItem>
                  ))}
                </Select>
                <FormHelperText style={{ color: 'red' }}>
                  {formik.touched.stage && formik.errors.stage}
                </FormHelperText>
              </FormControl>
              <FormControl fullWidth >
                <InputLabel style={{ color: formik.touched.lostClientReason && formik.errors.lostClientReason ? 'red' : '' }} id="demo-simple-select-label">Lost Client Reason{formik.values.stage === "Closed Lost" ? "*" : ""}</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  disabled={formik.values.stage !== 'Closed Lost'}
                  id="demo-simple-select"
                  value={formik.values.lostClientReason}
                  label="Lost Client Reason"
                  name="lostClientReason"
                  error={formik.touched.lostClientReason && Boolean(formik.errors.lostClientReason)}
                  onChange={(e) => {
                    formik.setFieldValue('lostClientReason', e.target.value)
                  }}
                >
                  {lostClientReasons.map((reason: any) => (
                    <MenuItem value={reason.type}>{reason.type}</MenuItem>
                  ))}
                </Select>
                <FormHelperText style={{ color: 'red' }}>
                  {formik.touched.lostClientReason && formik.errors.lostClientReason}
                </FormHelperText>
              </FormControl>
            </div>}

          {label === 'Client' && (
            <FormControl style={{ width: '49%', marginTop: '5px' }}>
              <InputLabel style={{ color: formik.touched.clientDeactivationReason && formik.errors.clientDeactivationReason ? 'red' : '' }} id="demo-simple-select-label">Client Deactivation Reason*</InputLabel>
              <Select
                id="demo-simple-select"
                value={formik.values.clientDeactivationReason}
                label="Client Deactivation Reason"
                name="clientDeactivationReason"
                onChange={formik.handleChange}
                error={formik.touched.clientDeactivationReason && Boolean(formik.errors.clientDeactivationReason)}
              >
                {clientTypes?.map(({ _id, type }: any) => (
                  <MenuItem value={_id}>{type}</MenuItem>
                ))}
              </Select>
              {formik.touched.clientDeactivationReason && formik.errors.clientDeactivationReason && <FormHelperText error >Client Deactivation Reason is required</FormHelperText>}
            </FormControl>
          )}
          {label === 'Care Partner' && (
            <FormControl style={{ width: '49%', marginTop: '5px' }}>
              <InputLabel style={{ color: formik.touched.carePartnerDeactivationReason && formik.errors.carePartnerDeactivationReason ? 'red' : '' }} id="demo-simple-select-label">CP Deactivation Reason*</InputLabel>
              <Select
                id="demo-simple-select"
                value={formik.values.carePartnerDeactivationReason}
                label="Client Deactivation Reason"
                name="carePartnerDeactivationReason"
                onChange={formik.handleChange}
                error={formik.touched.carePartnerDeactivationReason && Boolean(formik.errors.carePartnerDeactivationReason)}
              >
                {partnerTypes?.map(({ _id, type }: any) => (
                  <MenuItem value={_id}>{type}</MenuItem>
                ))}
              </Select>
              {formik.touched.carePartnerDeactivationReason && formik.errors.carePartnerDeactivationReason && <FormHelperText error >Care Partner Deactivation Reason is required</FormHelperText>}
            </FormControl>
          )}
          <FormInput
            name="closingComments"
            label="Closing Comments"
            value={formik.values.closingComments}
            onChange={formik.handleChange}
            error={formik.touched.closingComments && Boolean(formik.errors.closingComments)}
            helperText={formik.touched.closingComments && formik.errors.closingComments}
            textarea={true}
          />
          {label === 'Prospect' && formik.values.stage === 'Closed Won' && (
            <Button  variant="contained" sx={{ bgcolor: 'var(--primary-color)', width: '350px', height: '40px', float:'right' }} onClick={() => convertToClient()}>
            {"ADD TO CLIENTS"}
        </Button>
          )}
        </Stack>
        <ActionButtons
          closeHandler={closeHandler}
          actionText={selected?.status?.value === 'Closed' || selected?.status?.value === 'Inactive' || selected?.state?.value?.render || selected?.status === false ? 'Unarchive ' : 'Archive'}
          renderEmail={false}
        />
      </form>
    </Modal>
  );
};