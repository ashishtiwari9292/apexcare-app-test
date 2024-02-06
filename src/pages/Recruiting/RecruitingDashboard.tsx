import React from 'react';
import { Box } from '@mui/material';
import { Layout } from 'components';
import { ApplicantStatusTable } from 'views/Recruiting/ApplicantStatusTable';

export const RecruitingDashboard = () => {
  return (
    <Layout>
      <Box sx={{ marginTop: 20 }}><ApplicantStatusTable/></Box>
    </Layout>
  );
};
