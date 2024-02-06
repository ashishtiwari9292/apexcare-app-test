import { useState } from 'react';
import { Box } from '@mui/system';
import { Layout } from 'components';
import { FilterHeader, CarePartners } from 'views';
import { useAuth, useCompany } from 'hooks';

export const CarePartnersListing = (): JSX.Element => {
  const { user } = useAuth();
  const { locations } = useCompany()
  
  const [filter, setFilter]: any = useState({
    carePartner: { id: '', value: '' },
    status: { id: 'Active', value: 'Active' },
    location:{ id: user?.location?._id||'0', value: user?.location?.location || 'All' }
  });
  return (
    <Layout>
      <Box>
        <FilterHeader type="carePartners" setFilter={setFilter} filter={filter} />
        <CarePartners filter={filter} />
      </Box>
    </Layout>
  );
};
