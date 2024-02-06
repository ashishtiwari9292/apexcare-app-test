import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from 'services/AxiosConfig';
import { formatName } from 'lib';
import { Modal, Spinner, Layout, NoData, Card, CardHeader } from 'components';
import { useCompany } from 'hooks';
import ReferralPartnersModalContent from 'views/ReferralPartners/ReferralPartnersModalContent';
import { ReferralPartnersTasksTable } from 'views/ReferralPartners/ReferralPartnersTasksTable';
import { ReferralPartnersActivityTabs } from 'views/ReferralPartners/ReferralPartnerActivityTabs';
import CompaniesModalContent from 'views/ReferralPartners/CompaniesModalContent';
import { ReferralPartnersTable } from 'views/ReferralPartners/ReferralPartnersTable';

export const CompanyDetail = (): JSX.Element => {
  const { referralPartnerId } = useParams();
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [expanded, setExpanded] = useState(true)
  const [referralPartner, setReferralPartner] = useState<any>(null);
  const { locations } = useCompany()

  const fetchClient = () => {
    API.get(`/referral-partners/company/${referralPartnerId}`)
      .then((rsp: any) => {
        setReferralPartner(rsp.data.data)
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
      {!referralPartner && <Spinner />}
      {!referralPartner || locations.length === 0 && <NoData />}
      {referralPartner && locations.length > 0 && (
        <>
          <Card style={{ paddingTop: 20 }}>
            <CompaniesModalContent detail closeMe={() => { }} currentRow={referralPartner} type='' fetchClient={fetchClient} />
          </Card>
          <Card>
            <CardHeader
              title="Referral Partners"
              expanded={expanded}
              setExpanded={setExpanded}
              expandable={false}
              type={''}
              setOpenModal={setOpenModal}
            />
            <ReferralPartnersTable filter={{}} id={referralPartnerId} detail={true} addOpenModal ={ openModal} setAddOpenModal = {setOpenModal} />
          </Card>
        </>
      )}
    </Layout>
  );
};
