import React from 'react';
import { Box, Container, Card as MuiCard } from '@mui/material';


export function Card({ children, style, maxWidth = 'xl' }: any): JSX.Element {
  return (
    <Container maxWidth={maxWidth} sx={style ? style : { pt: 3 }}>
      <Box sx={{ boxShadow: 4, p: 1.9 }}>
        <MuiCard sx={{ minWidth: 345, border: 0, boxShadow: 0 ,}}>{children}</MuiCard>
      </Box>
    </Container>
  );
}
