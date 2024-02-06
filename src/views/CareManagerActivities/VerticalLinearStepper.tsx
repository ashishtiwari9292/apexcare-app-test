import { useEffect, useState } from 'react';
import API from 'services/AxiosConfig';
import CareManagerActivitiesModalContent from './CareManagerActivitiesModalContent';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepContent from '@mui/material/StepContent';
import Typography from '@mui/material/Typography';
import { toast } from 'react-toastify';
import MarketingActivitiesModalContent from 'views/MarketingActivitites/MarketingActivitiesModalContent';
import { Button } from '@mui/material';

function VerticalLinearStepper({ templateName, client, closeHandler, closeSelectionModal, management = false }: any) {
  const [activeStep, setActiveStep] = useState(0);
  const [steps, setSteps] = useState<any>([])
  const [vals, setVals] = useState<any>([])
  const [company, setCompany] = useState<any>([])


  const handleSumbitTemplate = (vals: any) => {
    const url = management ? 'marketing/template' : 'care-manager-activity-event/template'
    API.post(url, vals)
      .then((data: any) => {
        closeHandler()
        closeSelectionModal()
        toast.success('Successfully applied template!')
      })
      .catch((err: any) => {
        console.log(err)
        toast.error('Failed to apply template')
        closeHandler()
        closeSelectionModal()
      })
  }

  const addVal = (value: any) => {
    vals[activeStep] = value
    if (activeStep === steps.length - 1) {
      const addMissingData = steps.map((stepObj: any, index: any) => {
        vals[index].client = client
        vals[index].activity = stepObj.activity
        if (company && management) {
          vals[index].carePartner = company
        }
        return vals[index]
      })
      handleSumbitTemplate(addMissingData)
    } else {
      setVals(vals)
    }
  }
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  useEffect(() => {
    API.get(management ? `management-activity-template/${templateName.name}` : `activity-template/${templateName.name}`)
      .then(rsp => {
        setSteps(rsp.data.data.activities.map((actObj: any) => {
          return { label: actObj?.type, description: 'component goes here', dateCalculator: actObj.dateCalculator, activity: actObj?.type }
        }))
      })
  }, [templateName])

  const getCompany = async (id: any) => {
    const comp = await API.get(`/referral-partners/${id}`)
    if (comp) {
      setCompany(comp.data.data.companyName)
    }
  }
  useEffect(() => {
    if (client._id) {
      getCompany(client._id)
    }
  }, [client])

  return (
    <Box >
      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((step: any, index: any) => (
          <Step key={step?.label}>
            <StepLabel
              optional={
                index === 2 ? (
                  <Typography variant="caption">Last step</Typography>
                ) : null
              }
            >
              {step?.label}
            </StepLabel>
            <StepContent>
              {management ?
                <MarketingActivitiesModalContent stepper={true} source='template' closeHandler={() => { }} setVals={addVal} vals={vals} activeStep={activeStep} steps={steps} handleNext={handleNext} handleBack={handleBack} prefill={{ dateCalculator: step.dateCalculator }} management={true} /> :
                <CareManagerActivitiesModalContent closeHandler={() => { }} setVals={addVal} vals={vals} activeStep={activeStep} steps={steps} handleNext={handleNext} handleBack={handleBack} prefill={{ dateCalculator: step.dateCalculator }} />}
            </StepContent>
          </Step>
        ))}
        
      </Stepper>
    
    </Box>
  );
}

export default VerticalLinearStepper


