import { Modal as MuiModal, Box, FormControl, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import { ComponentDivProps } from 'typings';
import React, {useEffect, useState} from 'react'
const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '50%',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};



export function Modal({ open, closeHandler, children, title, styles, radioGroup = false, radioGroupLabel1, radioGroupLabel2 , currentRow }: any) {
  const [completed, setCompleted] = useState('Referral Partner');

  useEffect(() => {
    // Set the initial value of the "completed" state based on the "currentRow" prop
    if(radioGroupLabel1 === 'Referral Partner'){
      const val = currentRow?.state?.currentRow?.prospect ? 'Prospect': 'Referral Partner'
      setCompleted(val)
    }else{
      currentRow && setCompleted(currentRow && currentRow?.state?.currentRow?.completed ||currentRow?.state?.value?.completed === true || (currentRow?.status?.value === 'Closed' && title !=='Edit Marketing Task')  ? 'Completed' : 'Incomplete');
    }
  }, [currentRow]);

  return (
    <MuiModal
      disableScrollLock={true}
      open={open}
      onClose={closeHandler}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
   <Box sx={ styles ? {...styles, overflowY:'scroll'} : {...style, overflowY:'scroll'} }>
        {title && <div style = {{display:'flex', justifyContent:'space-between', alignItems:'center'}}><h2 className="fs-30 text-primary">{title}</h2>  {radioGroup && (
            <FormControl>
              <RadioGroup
                aria-labelledby="demo-controlled-radio-buttons-group"
                name="controlled-radio-buttons-group"
                row
                value={completed}
                onChange={(e:any) => setCompleted(e.target.value)}
              >
                <FormControlLabel value={radioGroupLabel1} control={<Radio />} label={radioGroupLabel1} />
                <FormControlLabel value={radioGroupLabel2} control={<Radio />} label={radioGroupLabel2} />
              </RadioGroup>
            </FormControl>
          )}</div>}
       {radioGroup ? React.cloneElement(children, { completed }) : children}

      </Box>
    </MuiModal>
  );
}
