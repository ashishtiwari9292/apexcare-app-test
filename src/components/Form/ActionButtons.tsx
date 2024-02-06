import { Button, Box } from '@mui/material';
import { SubmitButton,ConfirmButton } from 'components';

interface ActionButtonsProps {
  closeHandler?: () => void;
  actionText?: string;
  archiveText?: string;
  renderSubmit?: boolean;
  renderConfirm?: boolean;
  confirmHandler?: () => void;
  archiveHandler?:() => void;
  deleteHandler?: ()=> void;
  emailHandler?: ()=>void;
  confirm?: boolean;
  renderDelete? : boolean;
  renderArchive?:boolean;
  renderEmail?:boolean;
  clickHandler?: React.MouseEventHandler<HTMLButtonElement>
}

export function ActionButtons({ closeHandler, actionText = 'Submit', archiveText, renderSubmit = true, renderConfirm = false, renderDelete = false, renderArchive = false , renderEmail = true, confirmHandler, deleteHandler, archiveHandler, emailHandler }: ActionButtonsProps): JSX.Element {
  return (
    <Box pt={4} mb={2}>
      {renderSubmit && <SubmitButton text={actionText}/>}
      { renderEmail && <Button style = {{float:'right'}} onClick ={emailHandler}>Email</Button>}
      {renderConfirm && <Button onClick={confirmHandler} variant="contained" sx={{ bgcolor: 'var(--primary-color)' }} type="button">
        Confirm
      </Button>}
      <Button onClick={closeHandler} variant="contained" sx={{ bgcolor: '#a3a3ab' }} type="button">
        Cancel
      </Button>
      {renderArchive && <Button onClick={archiveHandler} variant="contained" sx={{ bgcolor: 'var(--primary-color)', marginLeft:'5px' }} type="button">
        {archiveText}
      </Button>}
      {renderDelete && <Button onClick={deleteHandler} variant="contained" color = 'error' sx={{  marginLeft:'15px' }} type="button">
       Delete
      </Button>}
    </Box>
  );
}
