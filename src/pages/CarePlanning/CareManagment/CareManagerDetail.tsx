import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import API from 'services/AxiosConfig';
import { generateUrl } from 'lib';
import { Layout } from 'components';
import { CareManagerActivities, CareManagerCalendar, FilterHeader, NoScheduleReport } from 'views';
import { CareManagerFilter } from 'typings';
import { useAuth, useCompany } from 'hooks';
import { CareManagerActivitiesTemplate } from 'views/CareManagerActivities/CareManagerActivititesTemplate';


export const CareMangerDetail = (): JSX.Element => {
  const { user } = useAuth()
  const { locations } = useCompany();

  const [filter, setFilter] = useState<CareManagerFilter>({
    careManager: { id: '0', value: 'All' },
    dateRange: { id: 'All', value: 'All' },
    location: { id: user ? user?.location._id :'0', value: user ? user?.location?.location : 'All' },
    activity: { id: 'All', value: 'All' },
    status: { id: 'Open', value: 'Open' },
    carePartner: { id: 'All', value: 'All' },
    client: { id: 'All', value: 'All' },
    groupBy: { id: 'None', value: 'None' },

  });

  const [noScheduleFilter, setNoScheduleFilter] = useState({ numberOfDays: { id: '1', value: '30 Days' }, numberOfMonths: { id: '', value: '' } })
  const [activities, setActivities] = useState();
  const [calendarActivities , setCalendarActivities] = useState()

  const fetchData = useCallback(() => {
    const url = generateUrl('care-manager-activity-event', filter, '', '', locations);
    API.get(url)
      .then((rsp: any) => {
        const data = rsp.data.data;
        setActivities(data)
      })
      .catch((error: any) => {
        toast.error('Failed to load Care Manager Activities.');
        console.error(error);
      });
  }, [filter]);

  const fetchCalendarData = useCallback(() => {
    const url = generateUrl('care-manager-activity-event', {...filter, status:{ id: 'All', value: 'All' }}, '', '', locations);
    API.get(url)
      .then((rsp: any) => {
        const data = rsp.data.data;
        setCalendarActivities(data)
      })
      .catch((error: any) => {
        toast.error('Failed to load Care Manager Activities.');
        console.error(error);
      });
  }, [filter]);

  useEffect(()=>{
    fetchCalendarData()
  },[filter])
  return (
    <Layout>
      <FilterHeader type="careManagement" setFilter={setFilter} filter={filter} />
      <CareManagerActivities filter={filter} setActivities={setActivities} detail />
      <CareManagerCalendar activities={calendarActivities} fetchData={fetchCalendarData} />
      <FilterHeader type='noScheduleReport' setFilter={setNoScheduleFilter} filter={noScheduleFilter} />
      <NoScheduleReport filter={noScheduleFilter} data={[]} type='noScheduleReport' mainPageFilter={filter}  />
      <CareManagerActivitiesTemplate filter={filter} setActivities={setActivities}/>
    </Layout>
  );
};
