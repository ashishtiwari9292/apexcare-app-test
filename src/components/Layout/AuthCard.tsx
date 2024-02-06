import React from 'react';
import { Box } from '@mui/material';
import { ComponentDivProps } from 'typings';

export interface AuthCardProps extends ComponentDivProps {
  title: string;
  description: string;
}
export function AuthCard({ children, title, description }: AuthCardProps): JSX.Element {
  return (
    <>
      <Box>
        <h1 className="pt fs-35 m-0">{title}</h1>
        <p className="st fs-20 m-0">{description}</p>
      </Box>
      <Box sx={{ paddingTop: '20px' }}>{children}</Box>
    </>
  );
}
