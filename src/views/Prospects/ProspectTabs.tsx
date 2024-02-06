import { useCallback, useEffect, useState } from 'react';
import { Card, CardHeader, Modal, Spinner } from 'components';
import ApplicantActivityTabPanel from 'views/Recruiting/ApplicantActivtyTabPanel';
import API from 'services/AxiosConfig';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';
import { MarketingTasksTable } from 'views/MarketingActivitites/MarketingTasksTable';
import MarketingActivititesTable from 'views/MarketingActivitites/MarketingActivititesTable';
import MarketingNotesTable from 'views/MarketingActivitites/MarketingNotesTable';



export const ProspectTabs = ({ resetFilter = () => { }, tabs, title, defaultType = 'All Tasks & Notes'}: any) => {
    const { prospectId } = useParams();
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState(true);
    const [type, setType] = useState(defaultType)
    const [options, setOptions] = useState([])
    const [currentRow, setCurrentRow] = useState([])
    const [activityTypes, setActivityTypes] = useState([])
    const [openModal, setOpenModal] = useState(false)

    const [filter, setFilter] = useState<any>({
        marketingManager: { id: 'All', value: 'All' },
        referralPartner: { id: 'All', value: 'All' },
        company: { id: 'All', value: 'All' },
        dateRange: { id: 'All', value: 'All' },
        location: { id: '0', value: 'All' },
        activity: { id: 'All', value: 'All' },
        status: { id: 'Open', value: 'Open' },
        groupBy: { id: 'None', value: 'None' },
        startDate: { id: '', value: '' },
        endDate: { id: '', value: '' },
    })


    const tableToRender = (currentActivity: any) => {
        if (title === 'Prospect Task and Notes') {
            if (currentActivity === 'Internal Note') {
                return < MarketingNotesTable openModal={openModal} setOpenModal={setOpenModal} />
            }
            return <MarketingTasksTable source='prospects-detail' renderPartners={false} renderType='prospectTask' prospectId={prospectId} filter={filter} detail={true} inline={true} currentActivity={currentActivity} openModal={openModal} setOpenModal={setOpenModal} title={title} />
        } else {

            return <MarketingActivititesTable source='prospects-detail' renderPartners={false} prospectId={prospectId} filter={filter} inline={true} currentActivity={currentActivity} openModal={openModal} setOpenModal={setOpenModal} title={title} defaultType ='All'/>
        }
    }

    const fetchData = useCallback(() => {
        API.get('prospects/types')
            .then((rsp: any) => {
                const data = rsp.data.data;
                setActivityTypes(data);
            })
            .catch((error: any) => {
                toast.error('Failed to load Activity types.');
                console.error(error);

            });
    }, []);

    useEffect(() => {
        fetchData()
    }, [])
    

    return (
        <>
            <Card>
                <CardHeader
                    title={ title === 'Prospect Task and Notes'?"Tasks":"Activities"}
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
                    <ApplicantActivityTabPanel activityType={type} setType={setType} resetFilter={resetFilter} tabs={tabs || ['All Activities', 'Tasks', 'Internal Note', 'Email', 'Calls/Texts', "Drop By's", 'Meetings', 'Events']} TableToRender={(currentActivity: any) => tableToRender(currentActivity)}
                    />
                )}
            </Card>
        </>
    );
};
