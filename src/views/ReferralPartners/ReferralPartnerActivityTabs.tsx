import { createContext, useEffect, useState } from 'react';
import { Card, CardHeader, Modal, Spinner } from 'components';
import ApplicantActivityTabPanel from 'views/Recruiting/ApplicantActivtyTabPanel';
import { ReferralPartnersTable } from './ReferralPartnersTable';
import { CompaniesTable } from './CompaniesTable';
import ReferralPartnersModal from './ReferralPartnersModal';
import ReferralPartnerActivityModal from './ReferralPartnerActivityModal';
import API from 'services/AxiosConfig';
import MarketingActivititesTable from 'views/MarketingActivitites/MarketingActivititesTable';
import { MarketingTasksTable } from 'views/MarketingActivitites/MarketingTasksTable';
import { useAuth } from 'hooks';
import MarketingActivitiesModalContent from 'views/MarketingActivitites/MarketingActivitiesModalContent';
import MarketingNotesTable from 'views/MarketingActivitites/MarketingNotesTable';
import MarketingDailyLogModalContent from 'views/MarketingActivitites/MarketingDailyLogModalContent';
import MarketingReferralActivitesModalContent from 'views/MarketingActivitites/MarketingReferralActivitesModalContent';


export const ReferralPartnersActivityTabs = ({ resetFilter = () => { }, tabs, title ,defaultType}: any) => {
    const { user } = useAuth()
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState(true);
    const [openModal, setOpenModal] = useState(false)
    const [type, setType] = useState(defaultType)
    const [currentRow, setCurrentRows] = useState({})
    const [editModal, setEditModal] = useState(false)
    const [shouldRefetch, setShouldRefetch] = useState(false);

    const handleRefetch = (): void => {
        setShouldRefetch(true);
      }
    
      const handleRefetchComplete = (): void => {
        setShouldRefetch(false);
      }
    
    const handleCloseModal: any = () => {
        setOpenModal(false)
    }

    const handleCloseEditModal: any = () => {
        setEditModal(false)
        
    }

    const [filter, setFilter] = useState<any>({
        marketingManager: { id: 'All', value: 'All' },
        referralPartner: { id: 'All', value: 'All' },
        company:{ id: 'All', value: 'All' },
        dateRange: { id: 'All', value: 'All' },
        location: { id: '0', value:  'All' },
        activity: { id: 'All', value: 'All' },
        status: { id: 'Open', value: 'Open' },
        groupBy:{ id: 'None', value: 'None' },
        startDate: { id: '', value: '' },
        endDate: { id: '', value: '' },
      })

      const tableToRender = (currentActivity: any) => {
        if(title === 'Tasks & Notes'){
            if(currentActivity === 'Internal Note'){
                return < MarketingNotesTable  openModal = {openModal} setOpenModal = {setOpenModal}/>
            }
            return <MarketingTasksTable source = 'referral-partner-detail' title = "Tasks & Notes" filter= {filter} detail = {true} inline = {true} currentActivity={currentActivity} openModal = {openModal} setOpenModal = {setOpenModal} />
        }else{

            return <MarketingActivititesTable  filter = {filter} inline = {true} currentActivity={currentActivity} openModal = {openModal} setOpenModal = {setOpenModal} source = 'referral-partner-detail'/>
        }
    }
    return (
        <>
            <Card>
                <CardHeader
                    title={title || "Activities"}
                    expanded={expanded}
                    setExpanded={setExpanded}
                    expandable={false}
                    type={''}
                    setType={() => { }}
                    setOpenModal={setOpenModal}
                />
                <Modal open={editModal} closeHandler={handleCloseEditModal}>
                <MarketingReferralActivitesModalContent  source = 'referral-partner-detail' selected = {currentRow} closeHandler = {handleCloseModal} renderButtons={true}/>
                </Modal>
                {loading ? (
                    <Spinner />
                ) : (
                  
                    <ApplicantActivityTabPanel activityType={type} setType={setType} resetFilter={resetFilter} tabs={tabs || ['All Activities', 'Email', 'Calls/Texts', "Drop By's", 'Meetings', 'Events']} TableToRender={(currentActivity: any) => tableToRender(currentActivity)}
                    />
                 
                )}
            </Card>
        </>
    );
};
