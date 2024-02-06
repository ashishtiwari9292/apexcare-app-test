import { useState, useEffect, useCallback } from 'react';
import { Modal } from 'components';
import { Card, Box } from '@mui/material';
import API from '../../services/AxiosConfig';
import EditIcon from '@mui/icons-material/Edit';
import { Tooltip } from '@mui/material';
import { DatePickerInput } from './DatePickerInput';
import ApplicantProgressModalContent from './ApplicantProgressModalContent';
import { ListItem, TextField } from '@material-ui/core';

export const ApplicantsCards = ({ cardName, items, id, fetchData, idx, admin, stageId }: any) => {
  const [values, setValues] = useState({});
  const [openModal, setOpenModal] = useState(false);
  const [initialVals, setInitialVals] = useState({});

  const handleChange = (name: any, value: any, i: number) => {
    let obj = { [name]: value !== null ? value.toString() : '', labelIdx: i };
    setValues(obj);
  };

  const handleCloseModal = () => {
    fetchData();
    fetchData();
    setOpenModal(false);
  };

  const handleEdit = useCallback((id: any, vals: any, title: string) => {
    API.put(`/applicants/progress/${id}`, { vals: { ...vals, stageId: cardName._id }, title, idx })
      .then((rsp: any) => {
        const data = rsp.data.data;
      })
      .catch((error: any) => {
        console.error(error);
      });
  }, []);

  useEffect(() => {
    JSON.stringify({}) !== JSON.stringify(values) && handleEdit(id, values, cardName.stage);
  }, [values, handleEdit]);

  useEffect(() => {
    let obj: any = {};
    for (const key in items) {
      obj[items[key].label] = items[key].label;
    }
    setInitialVals(obj);
  }, [items]);
  return (
    <Card sx={{ p: 2, boxShadow: 4, height: 'max-content', width: '250px', backgroundColor: '#e0e0e0' }}>
      <div className="applicant-card">
        <h3 className='applicant-card-title'>{cardName?.stage}</h3>
        {admin && <Tooltip title="Edit labels" placement="right">
          <EditIcon
            onClick={() => {
              setOpenModal(true);
            }}
            className="hover"
          />
        </Tooltip>}
      </div>
      <Modal open={openModal} closeHandler={handleCloseModal}>
        <ApplicantProgressModalContent
          closeMe={handleCloseModal}
          id={id}
          currentRow={items}
          title={cardName?.stage || ''}
          initialVals={initialVals}
          fetchData={fetchData}
          idx={idx}
        />
      </Modal>
      <Box sx={{}}>
        <Card sx={{ p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {items &&
            items?.map((cardObj: any, i: number) => {
              if (admin) {
                return (
                  <TextField 
                  InputProps={{
                    style: {
                      fontSize:14
                  }}}
                    value={cardObj.label}
                    disabled={true} />
                )
              }
              return (
                <DatePickerInput
                  handleChange={handleChange}
                  label={cardObj.label}
                  name={cardObj.label}
                  initialValue={cardObj.value || ''}
                  i={i}
                />
              )
            })}
        </Card>
      </Box>
    </Card>
  );
};


