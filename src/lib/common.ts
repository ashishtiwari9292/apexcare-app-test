import moment, { Moment } from 'moment';
import { QuickHitsFilter } from 'typings';
import API from 'services/AxiosConfig';
import { toast } from 'react-toastify';
import { mutipleManagerRowFormat } from 'views/CareManagerActivities/generateRows';
import BatchAddActivitesModalContent from 'views/CareManagerActivities/BatchAddActivitiesModalContent';


export function colorCode(date: string) {
  if (!date) return 'blue'
  const differenceInDays = moment.utc(date).startOf('day').diff(moment.utc().startOf('day'), 'days');
  if (moment(date.replace(/-/g, '\/').replace(/T.+/, '')) > moment() && differenceInDays > 7) {
    return 'blue';
  } else if (differenceInDays > 0) {
    return 'green';
  } else {
    return 'red';
  }
}

export function colorCodeApplicant(days: any) {
  if (days === 'N/A') return "black"
  if (days > 20) {
    return "red"
  }
  if (days > 10) {
    return 'blue'
  } else {
    return 'green'
  }
}

export function formatDate(date: string,) {
  return moment(date).local().format('MM/DD/YYYY');
}


export function formatCMDate(date: string) {
  if (!date) return '';

  // Create a Moment.js date object in UTC
  const newDate = moment.utc(date);

  // Format the date in MM/DD/YYYY format
  return newDate.format('MM/DD/YYYY');
}


export function formatDateTime(date: string) {
  const parsedDate = moment(date);
  if (parsedDate.isValid()) {
    return parsedDate.format('hh:mma');
  } else {
    return 'None';
  }
}

export function formatName(firstName: string, lastName: string) {
  if (!firstName || !lastName) return ''
  return `${firstName} ${lastName}`;
}

const getISOString = (date: string | Moment) => {
  if (!moment.isMoment(date)) {
    return moment(date).endOf('day').toISOString();
  }
  return date.endOf('day').toISOString();
};

type Range = {
  startDate: string;
  endDate: string;
};

export function generateUrl(type: string, filter: any, userId?: string, query: string = '', locations?: any[], limit?: any, page?: any) {

  let range: Range = { startDate: '', endDate: '' };
  const { startDate, endDate, dateRange, activity } = filter;

  if (dateRange?.value === 'Custom' && startDate?.value && endDate?.value) {
    range = { startDate: getISOString(startDate.value), endDate: getISOString(endDate.value) };
  } else if (dateRange?.value && Number(dateRange?.id)) {
    if (dateRange?.id < 0) {
      const end = moment().subtract(Number(dateRange.id), 'd');
      range = { startDate: getISOString(moment()), endDate: getISOString(end) };
    } else if (filter?.awardType) {
      const start = moment().subtract(Number(dateRange.id), 'month');
      range = { startDate: getISOString(start), endDate: getISOString(moment()) };
    } else {
      const start = moment().subtract(Number(dateRange.id), 'd');
      range = { startDate: getISOString(start), endDate: getISOString(moment()) };
    }
  }
  let loc: any = []
  if (locations) {
    loc = locations.map((locationObj) => {
      return locationObj._id
    })
  }
  loc = loc.join(',')

  if (type === 'client') {
    return `/${type}?locationId=${filter.location.id !== '0' ? filter.location.id : loc}&careManagerId=${filter.careManager.value !== 'All' ? filter.careManager.id : ''
      }&status=${filter.status.id === 'Active'}&clientStr=${filter.client.value}`;
  }

  if (type === 'care-partner') {
    return `/${type}?locationId=${filter.location.id !== '0' ? filter.location.id : loc}&status=${filter.status.id === 'Active'
      }&carePartnerStr=${filter.carePartner.value}`;
  }

  if (type === 'current-notes') {
    return `/${type}?careManagerId=${filter.careManager.value !== 'All' ? filter.careManager.id : ''}&locationId=${filter.location.id !== '0' ? filter.location.id : loc
      }&active=${filter.status.id === 'Open'}&startDate=${range.startDate}&endDate=${range.endDate}${query}`;
  }

  if (type === 'applicants') {
    return `/${type}?location=${filter.location.value}&name=${filter.name?.value}&status=${filter.status?.id}&stage=${filter.stage?.id}&startDate=${range.startDate}&endDate=${range.endDate}&locationId=${loc}&radioSelected=${query}&flag=${filter.flag === true}`;
  }
  if (type === 'award-management') {
    return `/${type}?award=${filter?.awardType?.value}&careManager=${filter?.careManager?.value}&carePartner=${filter?.carePartner?.value}&startDate=${range.startDate}&endDate=${range.endDate}${query}&location=${filter.location.id !== '0' ? filter.location.id : loc}&locationId=${loc}&groupBy=${filter.groupBy.value}`
  }
  if(type === 'care-manager-activity-event'){
    return `/${type}?locationId=${filter.location.id !== '0' ? filter.location.id : `${loc}`}&careManagerId=${filter.careManager.value !== 'All' ? filter.careManager.id : ''
    }&active=${filter.status.id === 'All' ? '' : filter.status.id === 'Open'}&activity=${activity?.id === undefined || activity?.id === 'All' ? '' : activity?.id}&startDate=${range.startDate}&endDate=${range.endDate}&flag=${filter.flag === true
    }${query}&limit=${limit || ''}&page=${page || ''}&client=${filter?.client?.value|| ''}&carePartner=${filter?.carePartner?.id|| ''}`;
  }

  return `/${type}?locationId=${filter.location.id !== '0' ? filter.location.id : `${loc}`}&careManagerId=${filter.careManager.value !== 'All' ? filter.careManager.id : ''
    }&active=${filter.status.id === 'All' ? '' : filter.status.id === 'Open'}&activity=${activity?.id === undefined || activity?.id === 'All' ? '' : activity?.id}&startDate=${range.startDate}&endDate=${range.endDate}&flag=${filter.flag === true
    }${query}&limit=${limit || ''}&page=${page || ''}&client=${filter?.client?.value|| ''}&carePartner=${filter?.carePartner?.id|| ''}`;
}

export const status = ['Open', 'Closed'];

export function renderColor(date: string) {
 
  if (moment(date).startOf('day') <= moment().startOf('day')) {
    return 'red';
  }
  const next7Days = moment().startOf('day').add(7, 'd');
  if (moment(date).startOf('day') < next7Days) {
    return 'green';
  }
  return 'blue';
}

export const quickHitsTypes = ['Client', 'Care Partner'];

export const quickHitsFilter: QuickHitsFilter = {
  flag: false,
  location: { id: '0', value: 'All' },
  careManager: { id: '0', value: 'All' },
  status: { id: 'Open', value: 'Open' },
  dateRange: { id: 'All', value: 'All' },
  startDate: { id: '', value: '' },
  endDate: { id: '', value: '' },
};

export const handleUnarchive = (type: any, id: string, closingComments: string) => {
  API.put(`${type}/unarchive/${id}`, { closingComments })
    .then((rsp) => {
      if (rsp.data.success) {
        toast.success('Successfully Reactivated.');
      }
    })
    .catch((error) => {
      console.error(error);
      toast.error('Failed to archive.');
    });
};


export const sort = (data: any[], sortVal: string, type: string, ascending: boolean, origin: string) => {
  if (sortVal === 'Due Date') type = 'date'
  if (sortVal === 'Created') sortVal = 'createdAt';
  if (sortVal === 'Due Date' || sortVal === 'Date Due') sortVal = 'dueDate';
  if (sortVal === 'Care Partner') sortVal = 'carePartnerObj';
  if (sortVal === 'Date') sortVal = 'date';
  if (sortVal === 'Care Manager') sortVal = 'careManager';
  if (sortVal === 'Client') sortVal = 'clientObj';
  if (sortVal === 'Name') {
    sortVal = origin === 'applicants' ? 'fullName' : 'name'
  }
  if (sortVal === 'Created By') sortVal = 'createdBy'
  if (sortVal === 'Date Created') sortVal = 'createdAt'
  if (sortVal === 'Last Activity') {
    sortVal = origin === 'applicants' ? 'lastActivityAt' : 'lastActivity'
  }
  if (sortVal === 'Follow-Up Date') sortVal = 'followupDate';
  if (sortVal === 'Full Name') sortVal = 'fullName';
  if (sortVal === 'Email') sortVal = 'email';
  if (sortVal === 'Source') sortVal = 'source';
  if (sortVal === 'Active Date') {
    sortVal ='activeDate'
  }

  if (sortVal === 'Activity') sortVal = 'activity'
  if (sortVal === 'Completed By') sortVal = 'completedBy'
  if (sortVal === 'Date Completed') sortVal = 'completedAt'
  if (sortVal === 'Date Created') sortVal = 'dateCreated'
  if (sortVal === 'Inquiry Date') sortVal = 'initialContactDate'
  if (sortVal === 'Stage') sortVal = 'stage'
  if (sortVal === 'Status') sortVal = 'status'
  if (sortVal === 'InactiveDate') sortVal = 'inactiveDate'

  if (origin === 'prospects' ) {
    if(sortVal === 'name'){
      sortVal = 'fullName'
    }else if (sortVal === 'lastActivity'){
      sortVal = 'lastActivityAt'
    }
  }
  if(origin === 'careManagerActivities'){
    if(sortVal === 'dueDate'){
      sortVal = 'date'
    }
  }
  if(origin === 'careManagerActivities'){
    if(sortVal === 'dueDate'){
      sortVal = 'date'
    }
  }
  if(origin === 'marketing-activities'){
    if(sortVal === 'Completed Date'){
      sortVal = 'date'
      type = 'date'
    }
    if(sortVal === 'Activity Type'){
      sortVal = 'activity'
    }
  }

  if (type === 'date' && ascending) {
    if (sortVal === 'lastActivityAt' || sortVal === 'initialContactDate' || (sortVal === 'activeDate' &&  origin === 'prospects')) return (data.slice().sort((a: any, b: any) => {
      return +new Date(a[sortVal]) - +new Date(b[sortVal])
    }))
    return data.slice().sort((a: any, b: any) => +new Date(a[sortVal]?.value) - +new Date(b[sortVal]?.value));
  }
  if (type === 'date' && !ascending) {
    if (sortVal === 'lastActivityAt' || sortVal ==='initialContactDate' || sortVal === 'activeDate') return data.slice().sort((a: any, b: any) => +new Date(b[sortVal]) - +new Date(a[sortVal]))
    return data.slice().sort((a: any, b: any) => +new Date(b[sortVal]?.value ) - +new Date(a[sortVal]?.value));
  }
  if (type === 'alphabetical') {
    return data.slice().sort((a: any, b: any) => {
      let nameA;
      let nameB
      if (sortVal === 'fullName' || sortVal === 'name' || sortVal === 'activity' || sortVal === 'createdBy' || sortVal === 'completedBy' || sortVal === 'email' || sortVal == 'stage' || sortVal === 'status') {
        nameA = a[sortVal]?.value?.toUpperCase() || a[sortVal];
        nameB = b[sortVal]?.value?.toUpperCase() || b[sortVal];
      } else {
        nameA = a?.state.value[sortVal]?.firstName || ''
        nameB = b?.state.value[sortVal]?.firstName || ''
      }
      if (nameA === 'Invalid date' || nameB === 'invalidDate') {
        return ascending ? -1 : 1;
      }
      if (nameA < nameB) {
        let val = ascending ? -1 : 1;
        return val;
      }
      if (nameA > nameB) {
        let val = ascending ? 1 : -1;
        return val;
      }
      return 0;
    });
  }
};

export const applicantSort = (data: any, sortVal: string, type: string, ascending: boolean, origin: string) => {
  return data.map((obj: any) => {
    return { location: obj.location, data: sort(obj.data, sortVal, type, ascending, origin), count: obj.count };
  });
};

export const careManagerSort = (data: any, sortVal: string, type: string, ascending: boolean, origin: string, multipleManagers: boolean,groupBy?:any) => {
  let rows = multipleManagers &&(groupBy && groupBy !=='None'|| groupBy?.value && groupBy.value !== 'None')  ? mutipleManagerRowFormat(data,groupBy) : data
  if (multipleManagers && ( groupBy !=='None'&&  groupBy.value !== 'None')) {
    return rows.map((obj: any) => {
      let sortedData = sort(obj.data, sortVal, type, ascending, origin)
      return { location: obj.location, data: sortedData, count:sortedData?.length };
    });
  } else {
    return sort(data, sortVal, type, ascending, origin)
  }
};

export const fetchApplicantName = async (id: string, setApplicantName: any) => {
  API.get(`/applicants/applicant/${id}`)
    .then(({ data }) => {
      const { fullName } = data.data;
      setApplicantName(fullName);
    })
    .catch((error) => {
      console.log(error);
      toast.error('Failed to get applicant');
    })
};

export const fetchActivities = async (type: any, id: any, callback: any, formatter?: any) => {
  API.get(`/applicants/activities/${id}/?type=${type}`)
    .then((rsp) => {
      if (formatter) {
        callback(formatter(rsp.data.data))
        return
      }
      callback(rsp.data.data);
    })
    .catch((error) => {
      console.error(error);
      toast.error('Failed to get activities');
    });
};

export const fetchProspectActivities = async (type: any, id: any, callback: any, setLoading: any, formatter?: any) => {
  setLoading(true)
  API.get(`/prospects/activities/${id}/?type=${type}`)
    .then((rsp) => {
      if (formatter) {

        callback(formatter(rsp.data.data))
        setLoading(false)
        return
      }
      setLoading(false)
      callback(rsp.data.data);
      setLoading(false)
    })
    .catch((error) => {
      console.error(error);
      toast.error('Failed to get activities');
      setLoading(false)
    });
};

export const fetchReferralPartnerActivities = async (type: any, id: any, callback: any, formatter?: any) => {
  API.get(`/referral-partners/activities/${id}/?type=${type}`)
    .then((rsp) => {
      if (formatter) {
        callback(formatter(rsp.data.data))
        return
      }
      callback(rsp.data.data);
    })
    .catch((error) => {
      console.error(error);
      toast.error('Failed to get activities');
    });
};

export const fetchSources = async (callback: any) => {
  API.get('/applicants/sources')
    .then((rsp) => {
      callback(rsp.data.data);
    })
    .catch((error) => {
      console.error(error);
      toast.error('Failed to get stages');
    });
}

export const fetchStages = async (callback: any) => {
  API.get('/applicants/stages')
    .then((rsp) => {
      callback(rsp.data.data);
    })
    .catch((error) => {
      console.error(error);
      toast.error('Failed to get stages');
    });
}

export const dateCalulator = (condition: any, date: any) => {
  if (!condition) return ''
  let timeOption: any = condition[condition.length - 1]
  if (timeOption.toLowerCase() === 'm') {
    timeOption = 'Months'
  } else {
    timeOption = "Days"
  }
  let timeDifference: any = condition.slice(0, condition.length - 1)
  let today = moment(date)
  return today.add(Number(timeDifference), timeOption)
}

export const isAdmin = (roles: any[]) => {
  let admin = roles?.find((role: any) => role.role === 'Super Administrator')
  return !!admin
}


export const emailHandler = async (values: any, tableSource: string, sendTo = []) => {
  const email = await API.post('/email', { values: values, tableSource: tableSource, sendTo: sendTo })
  return email
}

export const numberToMonth = (str: any) => {
  const months: any = {
    '1': 'January',
    '2': 'February',
    '3': 'March',
    '4': 'April',
    '5': 'May',
    '6': 'June',
    '7': 'July',
    '8': 'August',
    '9': 'September',
    '10': 'October',
    '11': 'November',
    '12': 'December'
  };

  return months[str];
}