import { Container } from '@mui/system';
import { Layout } from 'components';
import { LocationManagementTable } from 'views/LocationManagement/LocationManagementTable';

export const LocationManagement = (): JSX.Element => {
    

  return (
    <Layout>
        <Container maxWidth="xl" sx={{ pt: 3, mt: 20, width:'100%' }}>
        <LocationManagementTable type = "Location Management"/>
        </Container>
    </Layout>
  );
};
