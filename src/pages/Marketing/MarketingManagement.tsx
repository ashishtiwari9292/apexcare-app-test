import { useState, useCallback, useEffect, createContext } from 'react';
import { toast } from 'react-toastify';
import API from 'services/AxiosConfig';
import { generateUrl } from 'lib';
import { Layout } from 'components';
import { CareManagerActivities, CareManagerCalendar, FilterHeader, NoScheduleReport } from 'views';
import { CareManagerFilter } from 'typings';
import { useAuth, useCompany } from 'hooks';
import { CareManagerActivitiesTemplate } from 'views/CareManagerActivities/CareManagerActivititesTemplate';
import { MarketingTasksTable } from 'views/MarketingActivitites/MarketingTasksTable';
import { MarketingCalendar } from 'views/MarketingActivitites/MarketingCalendar';
import { MarketingManagementTemplate } from './MarketingManagementTemplate';
import moment, { Moment } from 'moment';
export const MarketingManagementContext = createContext({});


export const MarketingManagement = (): JSX.Element => {
  const { user } = useAuth()
  const { locations } = useCompany();

  const [filter, setFilter] = useState<any>({
    marketingManager: { id: 'All', value: 'All' },
    referralPartner: { id: 'All', value: 'All' },
    prospect: { id: 'All', value: 'All' },
    company:{ id: 'All', value: 'All' },
    dateRange: { id: 'All', value: 'All' },
    location: { id: user ? user?.location._id : '0', value: user ? user?.location?.location : 'All' },
    activity: { id: 'All', value: 'All' },
    status: { id: 'Open', value: 'Open' },
    groupBy:{ id: 'None', value: 'None' },
    startDate: { id: '', value: '' },
    endDate: { id: '', value: '' },
  })
  const [noScheduleFilter, setNoScheduleFilter] = useState({ numberOfDays: { id: '1', value: '30 Days' }, numberOfMonths: { id: '', value: '' } })
  const [activities, setActivities] = useState();
  const [calendarActivities, setCalendarActivities] = useState()
  const [shouldRefetchMarketing, setShouldRefetch] = useState([false]);
  const [type, setType] = useState("All")

  const handleRefetchMarketing = (idx: number): void => {
    setShouldRefetch(prevState => {
      const newState = [...prevState];
      newState[idx] = true;
      return newState;
    });
  };

  const handleRefetchMarketingComplete = (idx: number): void => {
    setShouldRefetch(prevState => {
      const newState = [...prevState];
      newState[idx] = false;
      return newState;
    });
  };


  const getISOString = (date: string | Moment) => {
    if (!moment.isMoment(date)) {
      return moment(date).endOf('day').toISOString();
    }
    return date.endOf('day').toISOString();
  };
  
 

  const fetchCalendarData = useCallback(() => {
    let range:any = { startDate: '', endDate: '' };
    const { startDate, endDate, dateRange,} = filter;
    if (dateRange?.value === 'Custom' && startDate?.value && endDate?.value) {
        range = { startDate: getISOString(startDate.value), endDate: getISOString(endDate.value) };
    } else if (dateRange?.value && Number(dateRange?.id)) {
        if (dateRange?.id < 0) {
            const end = moment().subtract(Number(dateRange.id), 'd');
            range = { startDate: getISOString(moment()), endDate: getISOString(end) };
        } else  {
            const start = moment().subtract(Number(dateRange.id), 'd');
            range = { startDate: getISOString(start), endDate: getISOString(moment()) };
        }
    }
    const url = `marketing/activities?&marketingManager=${filter.marketingManager.id}&referralPartner=${filter.referralPartner.id}&company=${filter.company.id}&location=${filter.location.id}&startDate=${range.startDate}&endDate=${range.endDate}&source=${'calendar'}&prospectId=${filter.prospect.id}`
    API.get(url)
      .then((rsp: any) => {
        const data = rsp.data.data;
        setCalendarActivities(data)
      })
      .catch((error: any) => {
        toast.error('Failed to load Care Manager Activities.');
        console.error(error);
      });
  }, [filter,type]);

  useEffect(() => {
    fetchCalendarData()
  }, [filter,type])

  return (
    <Layout>
      <div style = {{marginTop:'75px'}}>
      <FilterHeader type="marketingManagement" setFilter={setFilter} filter={filter} label = "Marketing Management"/>
      </div>
      <MarketingManagementContext.Provider value={{ shouldRefetchMarketing, handleRefetchMarketing, handleRefetchMarketingComplete }}>
      <MarketingTasksTable filter={filter} setActivities={setActivities} detail fetchCalendarData = {fetchCalendarData} source = 'marketing-management'/>
      <MarketingCalendar activities={calendarActivities} fetchData={fetchCalendarData} />
      <MarketingManagementTemplate filter={filter} setActivities={setActivities} />
      </MarketingManagementContext.Provider>
    </Layout>
  );
};
