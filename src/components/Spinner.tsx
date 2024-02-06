import React from 'react';
import { CircularProgress, Box } from '@mui/material';

export function Spinner({color}:any) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '20px',
      }}
    >
      <CircularProgress style = {{color:color|| ''}} />
    </Box>
  );
}
