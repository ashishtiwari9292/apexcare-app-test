//@ts-nocheck

import { useState,useEffect } from 'react';
import { Card, CardHeader, Modal, Spinner } from 'components';
import ApplicantActivityTabPanel from 'views/Recruiting/ApplicantActivtyTabPanel';
import { ReferralPartnersTable } from './ReferralPartnersTable';
import { CompaniesTable } from './CompaniesTable';
import ReferralPartnersModal from './ReferralPartnersModal';
import ResizableTable from 'views/ResizableTable';
import CompaniesResizableTable from 'views/CompaniesResizableTable';
import { useNavigate, useLocation } from 'react-router-dom'; 
import {useFilter} from '../../pages/Marketing/ReferralPartners/ReferralFilterContext'


export const ReferralPartnersTabs = ({  type, setType}: any) => {
  const { referralFilter, updateFilter, resetFilter } = useFilter();
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [openModal, setOpenModal] = useState(false)
  const queryParameters = new URLSearchParams(window.location.search);
  const [params,setParams] = useState('')
  const tab = queryParameters.get("type")


  const tableToRender = (currentActivity: any) => {
    return currentActivity === 'Referral Partners' ? <ResizableTable filter={referralFilter}  addOpenModal = {openModal} setAddOpenModal={setOpenModal}/> : <CompaniesResizableTable filter = {referralFilter} addOpenModal = {openModal} setAddOpenModal={setOpenModal}/>
  }

  const handleCloseModal = () => {
    setOpenModal(false)
  }
  return (
    <>
      <Card maxWidth = {false} style = {{pt: 3, width:'95%'}}>
        <CardHeader
          title="Referral Partners & Companies"
          expanded={expanded}
          setExpanded={setExpanded}
          expandable={false}
          type={''}
          setType={() => { }}
          setOpenModal={setOpenModal}
        />
        {loading ? (
          <Spinner />
        ) : (
          <ApplicantActivityTabPanel activityType={tab || type} setType={setType} resetFilter={resetFilter} tabs={['Referral Partners', 'Companies']} TableToRender={(currentActivity: any) => tableToRender(currentActivity)}
          />
        )}
      </Card>
    </>
  );
};
function useQuery() {
  throw new Error('Function not implemented.');
}

