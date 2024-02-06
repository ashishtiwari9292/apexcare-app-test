import { useEffect, useState } from 'react';
import API from 'services/AxiosConfig';
import * as yup from 'yup';
import { ActionButtons, FormAutocomplete, Modal } from 'components';
import { useFormik } from 'formik';
import { useCompany } from 'hooks'
import VerticalLinearStepper from './VerticalLinearStepper';
import { ClientsModalContent } from 'views/CarePlanning/Clients/ClientsModalContent';
import Autocomplete from 'components/Form/Autocomplete';
import { Button } from '@mui/material';
import ReferralPartnersModal from 'views/ReferralPartners/ReferralPartnersModal';


const ActivityTemplateModalContent = ({ closeHandler, closeSelectionModal, management = false }: any): JSX.Element => {
  const { clients } = useCompany()
  const [templates, setTemplates] = useState<any[]>([])
  const [templateName, setTemplateName] = useState<any>([])
  const [renderStepper, toggleRenderStepper] = useState(false)
  const [client, setClient] = useState<any>({ firstName: '', lastName: '' })
  const [clientModal, setClientModal] = useState(false)
  const [partnerModal, setPartnerModal] = useState(false)
  const [referralPartners, setReferralPartners] = useState([])
  const [company, setCompany] = useState(null)
  const options = management ? referralPartners : clients


  const initialValues: any = {
    client: { _id: '', firstName: '', lastName: '' },
    template: undefined
  };
  const validationSchema = yup.object({
    client: yup.object().typeError('Invalid type').required('Client is required'),
    template: yup.object().typeError('Invalid type').required('Template is required')
  });

  const formik = useFormik({
    initialValues,
    validationSchema: validationSchema,
    onSubmit: (values) => {
      setTemplateName(values.template)
      setClient(values.client)
      toggleRenderStepper(true)
    },
  });

  const handleCloseModal = () => {
    setClientModal(false);
    setPartnerModal(false)
  };

  const fetchReferralPartner = async () => {
    const partner = await API.get('referral-partners')
    setReferralPartners(partner.data.data)
  }
  const handleAddClient = (client: any) => {
    if (client) {
      const { firstName, lastName, _id } = client
      formik.setFieldValue('client', { _id: _id, firstName: firstName, lastName: lastName });
    } else {
      formik.setFieldValue('client', { _id: '', firstName: '', lastName: '' });
    }
    setClientModal(false);
  }

  useEffect(() => {
    const url = management ? '/management-activity-template' : 'activity-template'
    API.get(url)
      .then(rsp => {
        setTemplates(rsp.data.data)
      })
      .catch(err => {
        console.log(err)
      })
    management && fetchReferralPartner()


  }, [management])



  return (
    <>
      <Modal open={clientModal} closeHandler={handleCloseModal} title="Add Client">
        <ClientsModalContent closeHandler={handleAddClient} />
      </Modal>
      <Modal open={partnerModal} closeHandler={handleCloseModal} styles={{
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
              setPartnerModal(false)
            }} />
          </Modal>
      <form onSubmit={(e) => {
        e.preventDefault()
        formik.handleSubmit()
      }}>
        {!renderStepper &&
          <div className="select-client-template">
            <Autocomplete
              value={formik.values.client}
              options={
                [
                  { id: '', firstName: '', lastName: '' },
                  management === false ? { id: 'add', firstName: 'ADD', lastName: 'CLIENT' } : { id: 'addpartner', firstName: 'ADD', lastName: 'REFERRAL PARTNER' },

                  ...options
                ]
              }
              onChange={(event: any, newValue: any | null) => {

                if (null || !newValue) {
                  formik.setFieldValue('client', { id: '', firstName: '', lastName: '' });
                } else if (newValue.id === 'add') {
                  setClientModal(true)
                }else if (newValue.id === 'addpartner'){
                  setPartnerModal(true)
                }
                else {
                  formik.setFieldValue('client', { _id: newValue._id, firstName: newValue.firstName, lastName: newValue.lastName });
                }
              }}
              label={management ? 'Referral Partner' : 'Client'}
              width={'200%'}
            />
            <FormAutocomplete
              name="template"
              label="Template"
              value={formik.values.template}
              onChange={formik.handleChange}
              error={formik.touched.template && Boolean(formik.errors.template)}
              helperText={formik.touched.template && formik.errors.template}
              autocompleteValue={formik.values.template}
              getOptions={(option: any) => option.name}
              options={
                templates
              }
              autocompleteOnChange={(event: any, newValue: any | null) => {
                formik.setFieldValue('template', { _id: newValue._id, name: newValue.name });
              }}
              width={'200%'}
            />
          </div>}
        {!renderStepper && <ActionButtons
          renderEmail={false}
          closeHandler={() => {
            closeHandler()
          }}
          actionText={'Next'}
        />}
      </form>

      {<VerticalLinearStepper closeSelectionModal={closeSelectionModal} templateName={templateName} client={client} closeHandler={closeHandler} management={management} />}
      {renderStepper &&
        <Button
          onClick={closeHandler}
          variant="contained"
          sx={{ bgcolor: '#a3a3ab' }}
          type="button">
          Cancel
        </Button>}
    </>
  );
};

export default ActivityTemplateModalContent