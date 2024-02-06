import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from 'services/AxiosConfig';
import { formatName } from 'lib';
import { Modal, Spinner, Layout, NoData } from 'components';
import { useCompany } from 'hooks';
import {
  ClientsModalContent,
  SensitiveIssues,
  SchedulingGap,
  HealthCheck,
  KeepInView,
  CareManagerActivities,
  CarePlanningDetailTable,
  CarePlanningHeader,
} from 'views';

export const ClientDetail = (): JSX.Element => {
  const { clientId } = useParams();
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [client, setClient] = useState<any>(null);
  const { locations } = useCompany()

  const fetchClient = () => {
    API.get(`/client/${clientId}`)
      .then((rsp: any) => {
        setClient(rsp.data.data);
      })
      .catch((error: any) => {
        toast.error('Failed to load client.');
        console.error(error);
      });
  };
  useEffect(() => {
    fetchClient();
  }, []);

  const handleCloseModal = () => {
    fetchClient();
    setOpenModal(false);
  };

  return (
    <Layout>
      {!client && <Spinner />}
      {!client || locations.length === 0 && <NoData />}
      {client && locations.length > 0 && (
        <>
          <CarePlanningHeader
            handleOpen={() => setOpenModal(true)}
            clientName={formatName(client.firstName, client.lastName)}
            label="Client"
          />
          <Modal open={openModal} closeHandler={handleCloseModal} title="Edit Client">
            <ClientsModalContent closeHandler={handleCloseModal} selected={client} />
          </Modal>
          <CarePlanningDetailTable fetch = {fetchClient} data={{ client }} title="Client" />
          <CareManagerActivities data={client} type="client" filter={{}} detail />
          <SensitiveIssues data={client} type="client" filter={{}} detail />
          <SchedulingGap data={client} type="client" filter={{}} detail/>
          <HealthCheck data={client} showType="client" filter={{}} detail/>
          <KeepInView data={client} showType="client" filter={{}} detail/>
        </>
      )}
    </Layout>
  );
};
