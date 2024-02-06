import { Box, Container } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { BackButton, Card } from 'components';

interface CarePlanningHeaderProps {
  clientName: string;
  label: string;
  handleOpen: () => void;
}

export const CarePlanningHeader = ({ clientName, label, handleOpen }: CarePlanningHeaderProps) => {
  return (
    <Container maxWidth="xl" sx={{ pt: 3, mt: 20 }}>
   
          <h1 spellCheck={false} className="pt">
            {label + ' - '}
            {clientName}
          </h1>
    </Container>
  );
};
