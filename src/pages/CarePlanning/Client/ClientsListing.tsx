import { useEffect, useState } from 'react';
import { Box } from '@mui/system';
import { Layout } from 'components';
import { FilterHeader, Clients } from 'views';
import { useAuth } from 'hooks';

export const ClientsListing = (): JSX.Element => {

  const { user } = useAuth();

  const [filter, setFilter]: any = useState({
    client: { id: '', value: '' },
    location: { id: user?.location?._id || '0', value: user?.location?.location || '' },
    status: { id: 'Active', value: 'Active' },
    careManager: { id: 'All', value: 'All' },
  });



  return (
    <Layout>
      <Box>
        <FilterHeader type="clients" setFilter={setFilter} filter={filter} />
        <Clients filter={filter} />
      </Box>
    </Layout>
  );
};
