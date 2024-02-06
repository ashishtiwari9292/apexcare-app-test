import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Box } from '@mui/material';
import API from 'services/AxiosConfig';
import { formatName } from 'lib';
import { Spinner, Layout } from 'components';
import {
  SensitiveIssues,
  HealthCheck,
  KeepInView,
  CarePlanningDetailTable,
  CarePlanningHeader,
  CareManagerActivities,
} from 'views';
import { AwardManagement } from '../AwardManagement/AwardManagement';

export const CarePartnerDetail = (): JSX.Element => {
  const { carePartnerId } = useParams();
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [carePartner, setCarePartner] = useState<any>(null);
  const fetchCarePartner = () => {
    API.get(`/care-partner/${carePartnerId}`)
      .then((rsp: any) => {
        setCarePartner(rsp.data.data);
      })
      .catch((error: any) => {
        toast.error('Failed to load care partner.');
        console.error(error);
      });
  };
  useEffect(() => {
    fetchCarePartner();
  }, []);

  return (
    <Layout>
      {!carePartner && (
        <Box sx={{ mt: 30 }}>
          <Spinner />
        </Box>
      )}
      {carePartner && (
        <>
          <CarePlanningHeader
            handleOpen={() => setOpenModal(true)}
            clientName={formatName(carePartner.firstName, carePartner.lastName)}
            label="Care Partner"
          />
          <CarePlanningDetailTable data={{ carePartner }} title="Care Partner" fetch={fetchCarePartner} />
          <AwardManagement filter={{}} type="carePartner" carePartner={carePartner} />
          <CareManagerActivities data={carePartner} type="carePartner" filter={{}} detail />
          <SensitiveIssues data={carePartner} type="carePartner" filter={{}} />
          <HealthCheck data={carePartner} showType="Care Partner" filter={{}} detail />
          <KeepInView data={carePartner} showType="Care Partner" filter={{}} detail carePartner={true} />
        </>
      )}
    </Layout>
  );
};
