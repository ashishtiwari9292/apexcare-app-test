import { ReactElement } from 'react';
import { Container, Box } from '@mui/material';
import { ComponentDivProps } from 'typings';
import Apexlogo from 'assets/img/apexcare-logo.png';

export interface AuthProps extends ComponentDivProps {
  withLogo?: boolean;
  title?: string;
  description?: string | ReactElement;
  withLogin?: boolean;
}
export function Auth({ children }: AuthProps): JSX.Element {
  return (
    <Box sx={{ bgcolor: 'rgba(91, 140, 232, .25)', height: '100vh' }}>
      <Container maxWidth="xl" fixed>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
          }}
        >
          <Box sx={{ width: '420px', textAlign: 'center' }}>
            <Box sx={{ textAlign: 'center', p: 4 }}>
              <img src={Apexlogo} className = 'w-full' alt="logo" />
            </Box>
            <Box p={4} sx={{ bgcolor: 'white' }}>
              {children}
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
