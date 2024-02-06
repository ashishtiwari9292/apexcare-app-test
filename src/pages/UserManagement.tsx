import React, { useState } from 'react'
import { Container } from '@mui/system';
import { Layout } from 'components';
import { FilterHeader } from 'views';
import { UserManagementTable } from 'views/UserManagement/UserManagementTable';
import { useAuth } from 'hooks';

export const UserManagement = (): JSX.Element => {

  const { user } = useAuth()
  const [filter, setFilter] = useState({
    status: { id: 'Active', value: 'Active' },
    location: { id: user.location._id, value: user.location.location } 
  })

  return (
    <Layout>
      <Container maxWidth="xl" sx={{ pt: 3, width: '100%' }}>
        <FilterHeader type="userManagement" label="Quick Hits" setFilter={setFilter} filter={filter} />
        <UserManagementTable type="userManagement" filter = {filter} />
      </Container>
    </Layout>
  );
};


