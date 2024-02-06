import { useState, useEffect, createContext } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from 'services/AxiosConfig';
import { formatName } from 'lib';
import { Modal, Spinner, Layout, NoData, Card } from 'components';
import { useCompany } from 'hooks';
import ReferralPartnersModalContent from 'views/ReferralPartners/ReferralPartnersModalContent';
import { ReferralPartnersTasksTable } from 'views/ReferralPartners/ReferralPartnersTasksTable';
import { ReferralPartnersActivityTabs } from 'views/ReferralPartners/ReferralPartnerActivityTabs';
import { ProspectTable } from 'views/Prospects/ProspectsTable';
export const PartnerContext = createContext({});

export const ReferralPartnerDetail = (): JSX.Element => {
  const { referralPartnerId } = useParams();
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [activityTabs, setActivityTabs] = useState([])
  const [referralPartner, setReferralPartner] = useState<any>(null);
  const [filter, setFilter] = useState({
    flag: false,
    location: { id: '0', value: 'All' },
    status: { id: 'Open', value: 'Open' },
    dateRange: { id: 'All', value: 'All' },
    startDate: { id: '', value: '' },
    endDate: { id: '', value: '' },
  })
  const { locations } = useCompany()
  const [shouldRefetch, setShouldRefetch] = useState([false,false]);

    const handleRefetch = (idx: number): void => {
      setShouldRefetch(prevState => {
        const newState = [...prevState];
        newState[idx] = true;
        return newState;
      });
    };
  
    const handleRefetchComplete = (idx: number): void => {
      setShouldRefetch(prevState => {
        const newState = [...prevState];
        newState[idx] = false;
        return newState;
      });
    };

  const fetchClient = () => {

    API.get(`/referral-partners/${referralPartnerId}`)
      .then((rsp: any) => {
        setReferralPartner(rsp.data.data)
      })
      .catch((error: any) => {
        toast.error('Failed to load client.');
        console.error(error);
      });
  };


  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const getUniquePrefixes = (arr:any) => {
    const prefixes = new Set();
    arr.forEach((str:string)=>{
      if(str){
      const prefix = str.split(':')[0].trim()
      prefixes.add(prefix)
      }
    })
    return Array.from(prefixes);
  }

  const fetchActivityTabs = async () => {
    API.get(`/marketing/type/activity/search/Active?referral=true`)
      .then((rsp: any) => {
        const formattedTabs:any = getUniquePrefixes(rsp.data.data.map((item: any) => item.type))
        setActivityTabs(formattedTabs)
      })
      .catch((error: any) => {
        toast.error('Failed to load activity types.');
        console.log('this is the error',error);
      });
  }

  useEffect(() => {
    fetchClient();
    fetchActivityTabs()
  }, []);
  return (
    <Layout>
      {!referralPartner && <Spinner />}
      {!referralPartner || locations.length === 0 && <NoData />}
      {referralPartner && locations.length > 0 && (
        <>
          <Card style = {{ paddingTop: 20 }}>
            <ReferralPartnersModalContent detail closeMe={handleCloseModal} currentRow={referralPartner} type='' fetch={fetchClient} title = 'Referral Partner'/>
          </Card>
          <PartnerContext.Provider value={{ shouldRefetch, handleRefetch, handleRefetchComplete }}>
          <ReferralPartnersActivityTabs title="Tasks & Notes" tabs={[ 'Tasks', 'Internal Note']} defaultType='Tasks' />
          <ReferralPartnersActivityTabs defaultType='All Activities' tabs={['All Activities', ...activityTabs]} />
          </PartnerContext.Provider>
          <ProspectTable filter={filter} setFilter={setFilter} title='Prospects' referralId={referralPartnerId} />
        </>
      )}
    </Layout>
  );
};
