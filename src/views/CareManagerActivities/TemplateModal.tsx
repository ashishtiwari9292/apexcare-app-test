import { useEffect, useState } from 'react';
import { Card, Fab, IconButton, Stack, Tooltip } from '@mui/material';
import API from 'services/AxiosConfig';
import * as yup from 'yup';
import { ActionButtons, Modal, FormInput} from 'components';
import { ModalProps } from 'typings';
import AddIcon from '@mui/icons-material/Add';
import { toast } from 'react-toastify';
import { useFormik } from 'formik';
import TemplateModalContent from './TemplateModalContent';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';


const TemplateModal = ({ closeHandler, closeSelectionModal, data, management=false }: any): JSX.Element => {
  const [openModal, setOpenModal] = useState(false)
  const [templates, setTemplates] = useState<any[]>([])

  const timeToNextActivityFormatter = (val: string) => {
    let timeConditions: any = {
      d: 'Days',
      m: 'Months'
    }
    if (!val) return ''
    return `${val.slice(0, val.length - 1)} ${timeConditions[val[val.length - 1]]}`
  }

  const handleCloseModal = () => {
    setOpenModal(false)
  }
  const addTemplate = (newVal: any) => {
    setTemplates([...templates, newVal])
  }
  const removeActivity = (id: string, idx: number) => {

    if (idx > 0) {
      let copy = templates.slice()
      copy.splice(idx, 1)
      setTemplates(copy);
    } else {
      setTemplates([])
    }
  }

  const createTemplate = (values: any) => {
    let formattedTemplates = templates.map((template: any, idx: number) => {
      return { type: template.activity, dateCalculator: idx !== 0 ? `${template.timeBetween}${template.daysOrMonths}` : null }
    })
    const url = management? '/management-activity-template ':'/activity-template'
    API.post(url, { name: values.name, activities: formattedTemplates })
      .then((rsp) => {
        if (rsp) {
          toast.success('Successfully created template')
        }
      })
      .catch(error => {
        toast.error(error.response.data.error || 'Failed to create template')
      })
  }

  const editTemplate = (values: any) => {
   
    const url = management? 'management-activity-template':'activity-template'
    let formattedTemplates = templates.map((template: any, idx: number) => {
      return { type: template.activity, dateCalculator: idx !== 0 ? `${template.timeBetween}${template.daysOrMonths}` : null }
    })

    API.put(`/${url}/${data?.data[0]?.state._id}`, { name: values.name, activities: formattedTemplates })
      .then((rsp) => {
        if (rsp) {
          toast.success('Successfully edited template')
        }
      })
      .catch(error => {
        toast.error(error.response.data.error || 'Failed to edit template')
      })
  }


  const initialValues: any = {
    name: data?.location || '',
  };
  const validationSchema = yup.object({
    name: yup.string().typeError('name is required').required('name is required'),
  });

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema: validationSchema,
    onSubmit: (values) => {
      if(templates.length === 0){
        toast.error('Template must contain atleast one activity')
        return
      }
      if (data) {
        editTemplate(values)
        closeHandler()
      } else {
        createTemplate(values)
        closeHandler();
      }
    },
  });



  useEffect(() => {
    let arr: any = []
    data && data.data.map((actObj: any) => {
      let daysOrMonths = ''
      let timeBetween = ''
      if (actObj.timeToNextActivity.value) {
        let [time, months] = actObj?.timeToNextActivity?.value.split(' ')
        daysOrMonths = months[0].toLowerCase()
        timeBetween = time
      }
      arr.push({ activity: actObj?.activity.value, daysOrMonths, timeBetween })
    })
    setTemplates(arr)
  }, [data])

  return (
    <form onSubmit={formik.handleSubmit}>
      <Stack>
        <div style = {{ display:'flex', alignItems:'center', gap:'30px', marginBottom:'10px'}}>
        <FormInput
          name='name'
          label='Name'
          value={formik.values.name}
          onChange={formik.handleChange}
          error={formik.touched.name && Boolean(formik.errors.name)}
          helperText={formik.touched.name && formik.errors.name}
          width='60%'
        />
             <Tooltip title="Add Activity" placement="bottom">
            <Fab
              color="primary"
              aria-label="add"
              onClick={() => {
                setOpenModal(true);
              }}
            >
              <AddIcon />
            </Fab>
          </Tooltip>
          </div>
          <div className='batch-add-modal-container'>
          <div className='batch-add-modal-wrapper' >
            {templates.map((actObj: any, idx: number) => (
              <Card sx = {{width:'92%', marginBottom:'10px', height: '50px'}}>
              <Tooltip title="Remove Activity" placement="right">
                <div  className='template-modal-content'>
                  <div className = 'template-activity-label'>{actObj?.activity}</div>
                  {idx !== 0 ? <div className = 'template-date-label'>{`${timeToNextActivityFormatter(`${actObj.timeBetween}${actObj.daysOrMonths}`)} later`} </div> : <div ></div>}
                  <div style = {{justifySelf:'flex-end'}}>
                  <IconButton
                      sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        marginRight:'8px'
                      }}
                      aria-label="Remove Item"
                      onClick={() => {
                         removeActivity(actObj?._id, idx)
                      }}
                    >
                      <DeleteOutlineIcon />
                    </IconButton>
                    </div>
                </div>
              </Tooltip>
              </Card>
            ))}
          </div>
          <Modal styles={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '30%',
            bgcolor: 'background.paper',
            border: '2px solid #000',
            boxShadow: 24,
            p: 4,
          }} open={openModal} closeHandler={handleCloseModal} title="Add Activity">
            <TemplateModalContent management ={management} templates={templates} closeHandler={handleCloseModal} renderButtons={true} showType={"batchAdd"} data={data} addActivity={addTemplate} batchAdd={true} selected={{ state: { value: { clientObj: formik.values.client } } }} />
          </Modal>
        </div>
      </Stack>
      <ActionButtons closeHandler={closeHandler} />
    </form>
  );
};
export default TemplateModal;