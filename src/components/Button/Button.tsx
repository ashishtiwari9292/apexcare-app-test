import { BiChevronLeft } from 'react-icons/bi';
import { Link } from 'react-router-dom';
import { Button as MuiButton } from '@mui/material';

export interface ButtonProps {
  text: string;
}
export function SubmitButton({ text }: ButtonProps): JSX.Element {
  return (
    <MuiButton variant="contained" sx={{ bgcolor: 'var(--primary-color)', float:'right' }} type="submit">
      {text}
    </MuiButton>
  );
}

export interface ConfirmButtonProps {
  onClick?: React.MouseEventHandler<HTMLButtonElement>
}
export function ConfirmButton({ onClick }: ConfirmButtonProps): JSX.Element {
  return (
    <MuiButton variant="contained" sx={{ bgcolor: 'var(--primary-color)' }} type="button" onClick = {onClick}>
      Confirm
    </MuiButton>
  );
}

interface BackButtonProps {
  link: string;
}
export function BackButton({ link }: BackButtonProps): JSX.Element {
  return (
    <div className = "back-button-container">
      <Link
        to={link}
        className = 'back-button'
        color="primary"
      >
        <BiChevronLeft />
        Back
      </Link>
    </div>
  );
}