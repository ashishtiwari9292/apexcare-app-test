import { Container } from '@mui/system';
import { Layout } from 'components';
import { ApplicantProgress } from 'views';

export const StageManagement = (): JSX.Element => {

  return (
    <Layout>
        <Container maxWidth="xl" sx={{ pt: 3, mt: 20, width:'100%' }}>
        <ApplicantProgress admin = {true} title = {'Stage Management'} add/>
        </Container>
    </Layout>
  );
};
