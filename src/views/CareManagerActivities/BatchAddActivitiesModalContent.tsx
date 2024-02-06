
import { useState, useEffect } from 'react';
import { Fab, Stack, Tooltip, Select, FormControl, InputLabel, MenuItem } from '@mui/material';
import API from 'services/AxiosConfig';
import * as yup from 'yup';
import { ActionButtons, CompanyAutocomplete, FormAutocomplete, Modal, Table } from 'components';
import { ModalProps } from 'typings';
import AddIcon from '@mui/icons-material/Add';

import CareManagerActivitiesModalContent from './CareManagerActivitiesModalContent';
import { toast } from 'react-toastify';
import { formatName, formatDate, fetchActivities } from 'lib';
import { useFormik } from 'formik';
import { useAuth, useCompany } from 'hooks'
import { ClientsModalContent } from 'views/CarePlanning/Clients/ClientsModalContent';
import Autocomplete from 'components/Form/Autocomplete';
import MarketingActivitiesModalContent from 'views/MarketingActivitites/MarketingActivitiesModalContent';
import ReferralPartnersModal from 'views/ReferralPartners/ReferralPartnersModal';
import CompaniesModalContent from 'views/ReferralPartners/CompaniesModalContent';
import ProspectsModal from 'views/Prospects/ProspectsModal';


const BatchAddActivitesModalContent = ({ closeHandler, closeSelectionModal, data, management = false }: any): JSX.Element => {
  
  const [clients, setClients] = useState([])
  const [carePartners, setCarePartners] = useState([])
  const [openCompanyModal, setOpenCompanyModal] = useState(false)
  const [openModal, setOpenModal] = useState(false)
  const [openReferralPartnerModal, setOpenReferralPartnerModal] = useState(false)
  const [activities, setActivities] = useState<any[]>([])
  const [clientModal, setClientModal] = useState(false)
  const [prospectModal, setProspectModal] = useState(false)
  const [referralPartners, setReferralPartners] = useState([])
  const [company, setCompany] = useState(null)
  const [prospects, setProspects] = useState([])
  const [companies, setCompanies] = useState([])
  const { locations } = useCompany();
  const {user} = useAuth()
  const options = management ? referralPartners : clients
  const options2: any = management ? prospects : carePartners

  const generateRows = (data: any) =>
    data.map((rowObj: any) => ({
      id: rowObj._id,
      date: { value: formatDate(rowObj.date), style: { width: '10%' } },
      time: {
        value: rowObj?.time ? rowObj?.time?.toLocaleTimeString() : '',
        style: { width: '15%' },
      },

      client: {
        value: rowObj.client ? management ? rowObj?.state.referralPartners : formatName(rowObj?.client?.firstName, rowObj?.client?.lastName) : '',
        style: { width: '30%' },
      },
      careManager: {
        value: management ? rowObj?.state.company : formatName(rowObj?.careManager?.firstName, rowObj?.careManager?.lastName),
        style: { width: '30%' },
      },
      activity: { value: rowObj?.activity, style: { width: '20%' } },
      state: {
        value: {
          recurrence: rowObj.recurrence || {},
          completedBy: rowObj.completedBy || '',
          completedAt: rowObj.completedAt,
          closingComments: rowObj.closingComments,
          render: !rowObj.active,
          clientObj: rowObj.client,
          carePartnerObj: rowObj.carePartner,
          careManager: rowObj.careManager,
          location: rowObj?.location,
        },
        style: {},
      },
    }));

  const handleClose = () => {
    setClientModal(false);
  };
  const handleAddClient = (client: any) => {
    if (client) {
      const { firstName, lastName, _id } = client
      formik.setFieldValue('client', { _id: _id, firstName: firstName, lastName: lastName });
    } else {
      formik.setFieldValue('client', { _id: '', firstName: '', lastName: '' });
    }
    setClientModal(false);
  }
  const fetchReferralPartner = async () => {
    const response = await API.get('referral-partners');
    const partners = response?.data?.data;

    const sorted = partners?.filter((partner: any) => {

      if (formik.values.company) {
        return partner?.location?.location === formik?.values?.location?.location && partner?.companyName?.companyName === formik?.values?.company?.companyName
      }
      return partner?.location?.location === formik?.values?.location?.location
    })

    // const sorted = partners?.filter((partner: any) => {
    //   // If neither value exists, return the partner
    //   if (!formik?.values?.location?.location && !formik.values.company.companyName) {

    //     console.log('looking for this1',formik?.values?.location?.location && company)
    //     return partner;
    //   }
    //   // If only location exists, filter by location
    //   else if (formik?.values?.location?.location && !company) {
    //     console.log('looking for this2',formik?.values?.location?.location,company)
    //     return partner?.location?.location === formik?.values?.location?.location;
    //   }
    //   // If only companyName exists, filter by companyName
    //   else if (!formik?.values?.location?.location && company) {
    //     console.log('looking for this3',formik?.values?.location?.location , company,formik.values)
    //     return partner?.companyName?.companyName === company;
    //   }
    //   // If both values exist, filter by both
    //   else if (formik?.values?.location?.location && company) {
    //     console.log('looking for this4',formik?.values?.location?.location , company)
    //     return (partner?.location?.location === formik?.values?.location?.location) && 
    //            (partner?.companyName?.companyName === company);
    //   }
    // });

    setReferralPartners(sorted);
  }
  const fetchProspectData = async () => {
    try {
      const response = await API.get('/prospects/all')
      const prospects = response?.data?.data;
      const sorted = prospects.filter((prospect: any) => {
        if (!formik?.values?.location) {
          return prospect
        }
        return prospect?.location === formik?.values?.location?._id
      })
      setProspects(sorted)
    } catch (err) {
      console.log(err)
    }
  }
  const fetchCompanies = async () => {
    const company = await API.get('referral-partners/companies/listing')
    const sorted = company?.data?.data.filter((company: any) => {
      if (!formik?.values?.location?.location) {
        return company
      }
      return company?.location?.location === formik?.values?.location?.location
    })
    setCompanies(sorted)
  }
  const fetchClientData = async () => {
    try {
      const prospects = await API.get('client?status=true')
     
      setClients(prospects.data.data)
    } catch (err) {
      console.log(err)
    }
  }

  const fetchCPData = async () => {
    try {
      const prospects = await API.get('care-partner?status=true')

      setCarePartners(prospects.data.data)
    } catch (err) {
      console.log(err)
    }
  }
  const handleCloseModal = () => {
    setOpenModal(false)
  }
  const addActivity = (newVal: any) => {

    setActivities([...activities, newVal])
  }

  const initialValues: any = {
    client: { firstName: '', lastName: '' },
    carePartner: { firstName: '', lastName: '' },
    prospect: { firstName: '', lastName: '' },
    location: user?.location ||'',
    company: '',
    type: 'client'
  };

  const validationSchema = yup.object({
    name: yup.object().typeError('client is required').required('client is required'),
  });
  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema: validationSchema,
    onSubmit: (values) => {
      if (activities.length === 0) {
        toast.error("must add atleast one activity")
        return
      }
      closeHandler();
    },
  });

  useEffect(() => {
    fetchReferralPartner()
    fetchProspectData()
    fetchClientData()
    fetchCPData()
    fetchCompanies()
    

  }, [formik.values.location, formik.values.company, openCompanyModal])

  useEffect(() => {
    formik.setFieldValue('company', company)
  }, [company])


  return (
    <form onSubmit={() => {
      closeHandler()
      closeSelectionModal && closeSelectionModal()
    }}>
      {management &&
        <div style={{ width: '37.5%' }}>
          <FormAutocomplete
            name="location"
            label="Location"
            value={formik.values.location}
            onChange={formik.handleChange}
            error={formik.touched.location && Boolean(formik.errors.location)}
            helperText={formik.touched.location && formik.errors.location}
            autocompleteValue={formik.values.location}
            options={locations}
            getOptions={(option: any) => option.location}
            autocompleteOnChange={(event: any, newValue: String | null) => {
              formik.setFieldValue('location', newValue);
            }}
            required
          />
        </div>
      }
      <Modal open={openCompanyModal} closeHandler={() => { setOpenCompanyModal(false)}} >
        <CompaniesModalContent closeMe={(data?: any) => {
         data && formik.setFieldValue('company', { _id: data._id, companyName: data.companyName })
          data && setCompany(data.companyName)
          setOpenCompanyModal(false)
        }} />
      </Modal>
      <Modal open={prospectModal} closeHandler={() => { setProspectModal(false) }} styles={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '50%',
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
        height: '90%',
        overflowY: 'scroll'
      }}>
        <ProspectsModal
          closeMe={(data?: any) => {
            data && formik.setFieldValue('prospect', { _id: data._id, firstName: data.firstName, lastName: data.lastName })
            setProspectModal(false)
          }}
        />
      </Modal>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '75%', marginBottom: '5px', gap: '5px' }}>
        {management ? <Autocomplete
          value={formik.values.client}
          options={
            [
              { id: '', firstName: '', lastName: '' },
              { id: 'add', firstName: 'ADD', lastName: 'REFERRAL PARTNER' },
              ...options
            ]
          }
          onChange={(event: any, newValue: any | null) => {
            if (null || !newValue) {
              formik.setFieldValue('client', { id: '', firstName: '', lastName: '' });
            } else if (newValue.id === 'add') {
              setOpenReferralPartnerModal(true)
            }
            else {
              formik.setFieldValue('client', { _id: newValue._id, firstName: newValue.firstName, lastName: newValue.lastName });
              if (management) setCompany(newValue.companyName)
            }
          }}
          label={'Referral Partner'}
          width={'50%'}
        /> :
          <Autocomplete
            value={formik.values.client}
            options={
              [
                { id: '', firstName: '', lastName: '' },
                ...options
              ]
            }
            onChange={(event: any, newValue: any | null) => {
              if (null || !newValue) {
                formik.setFieldValue('client', { id: '', firstName: '', lastName: '' });
              } else if (newValue.id === 'add') {
                setClientModal(true)
              } else if (newValue.id === 'add') {

              }
              else {
                formik.setFieldValue('client', { _id: newValue._id, firstName: newValue.firstName, lastName: newValue.lastName });
                if (management) setCompany(newValue.companyName)
              }
            }}
            label={management ? 'Referral Partner' : 'Client'}
            width={'50%'}
          />}
        {management &&
          <div style={{ width: '50%', marginTop: '10px' }}>
            <CompanyAutocomplete
              name="company"
              label="Company"
              value={formik.values.company || null}
              onChange={formik.handleChange}
              error={formik.touched.company && Boolean(formik.errors.company)}
              helperText={formik.touched.company && formik.errors.company}
              autocompleteValue={formik.values.company|| null}
              getOptions={(option: any) => {
                if (option.companyName) {
                  return option?.companyName
                }
                if (typeof option === 'string') {
                  return option
                }
                return ''
              }
              }
              options={
                [
                  { companyName: '', id: '' },
                  { companyName: 'ADD COMPANY', id: 'add' },
                  ...companies
                ]
              }
              autocompleteOnChange={(event: any, newValue: any | null) => {
                if (!newValue) {
                  formik.setFieldValue('company', { companyName: '', id: '' } );
                }
                if (newValue?.id === 'add') {
                  setOpenCompanyModal(true)
                }
                else if (!newValue?._id) {
                  formik.setFieldValue('company', formik.values.company);
                } else {
                  formik.setFieldValue('company', { _id: newValue._id, companyName: newValue.companyName });
                }
              }}
            />
          </div>
        }
        {!management ? <Autocomplete
          value={formik.values.carePartner}
          options={
            [
              { id: '', firstName: '', lastName: '' },
              { id: 'add', firstName: 'ADD', lastName: 'CARE PARTNER' },

              ...carePartners
            ]
          }
          onChange={(event: any, newValue: any | null) => {
         
            if (newValue === null || !newValue) {
              formik.setFieldValue('carePartner', { id: '', firstName: '', lastName: '' });
            }
            else if (newValue.id === 'add') {
              setOpenModal(true)
            } else {
              formik.setFieldValue('carePartner', { _id: newValue._id, firstName: newValue.firstName, lastName: newValue.lastName });
            }
          }}
          label={'Care Partner'}
          width={'49%'}
        /> :
          <Autocomplete
            value={formik.values.prospect}
            options={
              [
                { id: '', firstName: '', lastName: '' },
                { firstName: 'ADD PROSPECT', lastName: '', id: 'add' },
                ...prospects.map((prospect: any) => {
                  const [firstName, lastName] = prospect?.fullName.split(' ')
                  return { _id: prospect._id, firstName: firstName, lastName: lastName }
                })
              ]
            }
            onChange={(event: any, newValue: any | null) => {
              if (null || !newValue) {
                formik.setFieldValue('prospect', { id: '', firstName: '', lastName: '' });
              }
              else if (newValue?.id === 'add') {
                setProspectModal(true)
              } else {
                formik.setFieldValue('prospect', { _id: newValue._id, firstName: newValue.firstName, lastName: newValue.lastName });
              }
            }}
            label={'Prospect'}
            width={'49%'}
          />
        }

      </div>
      <Modal open={clientModal} closeHandler={handleClose} title="Add Client">
        <ClientsModalContent closeHandler={handleAddClient} />
      </Modal>
      <Stack>
        <div className='batch-add-modal-container'>
          <div className='batch-add-modal-wrapper' >
            <Table
              columns={[
                { val: 'Date', width: '5%' },
                { val: 'Time', width: '10px' },
                { val: management ? 'Referral Partner' : 'Client', width: '20px' },
                { val: management ? 'Company' : 'Care Manager', width: '50px' },
                { val: 'Activity', width: '5%' },
              ]}
              tableName=""
              rows={generateRows(activities)}
              handleArchive={() => { }}
              handleEdit={() => { }}
              hideArchive={true}
              handleSort={() => { }}
              handleReactivate={() => { }}
              type={'batchAdd'}
            />
          </div>
          <Modal open={openModal} closeHandler={handleCloseModal} title={management ? "Add Task" : "Add Care Manager Activity"} >
            {!management ? <CareManagerActivitiesModalContent closeHandler={handleCloseModal} renderButtons={true} showType={"batchAdd"} data={data} addActivity={addActivity} batchAdd={true} selected={{ state: { value: { clientObj: formik.values.client, carePartnerObj: formik.values.carePartner, } } }} /> :
              <MarketingActivitiesModalContent source='Batch' closeHandler={handleCloseModal} renderButtons={true} showType={"batchAdd"} data={data} addActivity={addActivity} batchAdd={true} selected={{ state: { value: { clientObj: formik.values.client, carePartnerObj: company, prospect: formik.values.prospect } } }} currentLocation={formik.values.location} />}
          </Modal>
          <Modal open={openReferralPartnerModal} closeHandler={()=>  setOpenReferralPartnerModal(false)} styles={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '50%',
            bgcolor: 'background.paper',
            border: '2px solid #000',
            boxShadow: 24,
            p: 4,
            height: '90vh',
            overflow: 'scroll'
          }
          }>
            <ReferralPartnersModal type="Referral Partners" closeMe={(data?: any) => {
             data && formik.setFieldValue('client', { _id: data._id, firstName: data.firstName, lastName: data.lastName })
              // formik.setFieldValue('company',{ _id: data.companyName._id, companyName:data.companyName.companyName })
              // setCompany(data.companyName)
              setOpenReferralPartnerModal(false)
            }} />
          </Modal>
          <Tooltip title="Add Activity" placement="bottom">
            <Fab
              color="primary"
              aria-label="add"
              onClick={() => {
                if (!management) {
                  if (!formik?.values?.carePartner?.firstName && !formik?.values?.client?.firstName) {
                    toast.error('Client or Care Partner is required')
                  } else {
                    setOpenModal(true);
                  }
                 
                } else {
                  if (formik?.values?.client?.firstName === '') {
                    formik.setFieldValue('client', null)
                  }
                  if (formik?.values?.client?.firstName !== '' && formik?.values?.prospect?.firstName !== '') {
                  
                    toast.error('Both Referral Partner and Prospect cannot be selected')
                  } else {
                    setOpenModal(true);
                  }
                }
              }}
            >
              <AddIcon />
            </Fab>
          </Tooltip>
        </div>
      </Stack>
      <ActionButtons closeHandler={closeHandler} renderEmail={false} />
    </form>

  );
};
export default BatchAddActivitesModalContent;
