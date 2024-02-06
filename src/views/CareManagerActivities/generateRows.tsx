import { formatCMDate, formatDateTime, formatName, renderColor, colorCode, formatDate } from "lib";
import { GrFlagFill } from "react-icons/gr";
import { Link } from "react-router-dom";
import parse from 'html-react-parser'

export const generateDetailRows = (data: any, type?: any) => {
  if (type === 'Client') {
    return data.map((rowObj: any) => ({
      id: rowObj._id,
      flag: {
        value: rowObj.flag === true ? <GrFlagFill color="red" /> : <></>,
        style: { width: '5%' },
        selected: rowObj.flag === true,
      },
      date: { value: formatCMDate(rowObj?.date), style: { width: '10%', color: colorCode(rowObj.date) } },
      client: {
        value: (<Link className='applicant-name-link' to={`/client/${rowObj?.client?._id}`}>{formatName(rowObj?.client?.firstName, rowObj?.client?.lastName)}</Link>),
        style: { width: '12%', color: colorCode(rowObj.date) },
        state: rowObj.client
      },
      time: {
        value: formatDateTime(rowObj.date),
        style: { width: '10%', color: colorCode(rowObj.date) },
        raw: rowObj.date,
      },
      careManager: {
        value: formatName(rowObj?.careManager?.firstName, rowObj?.careManager?.lastName),
        style: { width: '12%', color: colorCode(rowObj.date) },
      },
      activity: { value: rowObj.activity?.activity, style: { width: '11%', color: colorCode(rowObj.date) } },
      description: {
        value: parse(rowObj.description || rowObj.additionalComments || ''),
        style: { width: '30%', color: colorCode(rowObj.date), whiteSpace: "pre-wrap" },
      },
      status: {
        value: rowObj.active === true ? 'Open' : 'Closed',
        style: { width: '50%', color: colorCode(rowObj.date) },
      },

      state: {
        value: {
          recurrence: rowObj.recurrence || {},
          date: rowObj.date,
          completedBy: rowObj.completedBy || '',
          completedAt: rowObj.completedAt,
          closingComments: rowObj.closingComments,
          additionalComments: rowObj.additionalComments,
          description: rowObj.description || '',
          render: !rowObj.active,
          clientObj: rowObj.client,
          carePartnerObj: rowObj.carePartner,
          careManager: rowObj.careManager,
          location: rowObj?.location,
        },
        style: {},
      },
    }))
  } else if (type === 'Care Partner') {
    return data.map((rowObj: any) => ({
      id: rowObj._id,
      flag: {
        value: rowObj.flag === true ? <GrFlagFill color="red" /> : <></>,
        style: { width: '5%' },
        selected: rowObj.flag === true,
      },
      date: { value: formatCMDate(rowObj?.date), style: { width: '10%', color: colorCode(rowObj.date) } },
      carePartner: {
        value: (<Link className='applicant-name-link' to={`/care-partner/${rowObj?.carePartner?._id}`}>{formatName(rowObj?.carePartner?.firstName, rowObj?.carePartner?.lastName)}</Link>),
        style: { width: '12%', color: colorCode(rowObj.date) },
        state: rowObj.carePartner
      },
      time: {
        value: formatDateTime(rowObj.date),
        style: { width: '10%', color: colorCode(rowObj.date) },
        raw: rowObj.date,
      },
      careManager: {
        value: formatName(rowObj?.careManager?.firstName, rowObj?.careManager?.lastName),
        style: { width: '12%', color: colorCode(rowObj.date) },
      },
      activity: { value: rowObj.activity?.activity, style: { width: '11%', color: colorCode(rowObj.date) } },
      description: {
        value: parse(rowObj.description || rowObj.additionalComments || ''),
        style: { width: '30%', color: colorCode(rowObj.date), whiteSpace: "pre-wrap" },
      },
      status: {
        value: rowObj.active === true ? 'Open' : 'Closed',
        style: { width: '40%', color: colorCode(rowObj.date) },
      },

      state: {
        value: {
          recurrence: rowObj.recurrence || {},
          date: rowObj.date,
          completedBy: rowObj.completedBy || '',
          completedAt: rowObj.completedAt,
          additionalComments: rowObj.additionalComments,
          closingComments: rowObj.closingComments,
          description: rowObj.description || '',
          render: !rowObj.active,
          clientObj: rowObj.client,
          carePartnerObj: rowObj.carePartner,
          careManager: rowObj.careManager,
          location: rowObj?.location,
        },
        style: {},
      },
    }))
  } else {
    return data.map((rowObj: any) => ({
      id: rowObj._id,
      flag: {
        value: rowObj.flag === true ? <GrFlagFill color="red" /> : <></>,
        style: { width: '5%' },
        selected: rowObj.flag === true,
      },
      date: { value: formatCMDate(rowObj?.date), style: { width: '10%', color: colorCode(rowObj.date) } },
      client: {
        value: (<Link className='applicant-name-link' to={`/client/${rowObj?.client?._id}`}>{formatName(rowObj?.client?.firstName, rowObj?.client?.lastName)}</Link>),
        style: { width: '12%', color: colorCode(rowObj.date) },
        state: rowObj.client
      },
      carePartner: {
        value: (<Link className='applicant-name-link' to={`/care-partner/${rowObj?.carePartner?._id}`}>{formatName(rowObj?.carePartner?.firstName, rowObj?.carePartner?.lastName)}</Link>),
        style: { width: '12%', color: colorCode(rowObj.date) },
        state: rowObj.carePartner
      },
      time: {
        value: formatDateTime(rowObj.date),
        style: { width: '10%', color: colorCode(rowObj.date) },
        raw: rowObj.date,
      },
      careManager: {
        value: formatName(rowObj?.careManager?.firstName, rowObj?.careManager?.lastName),
        style: { width: '12%', color: colorCode(rowObj.date) },
      },
      activity: { value: rowObj.activity?.activity, style: { width: '11%', color: colorCode(rowObj.date) } },
      description: {
        value: parse(rowObj.description || rowObj.additionalComments || ''),
        style: { width: '30%', color: colorCode(rowObj.date), whiteSpace: "pre-wrap" },
      },
      status: {
        value: rowObj.active === true ? 'Open' : 'Closed',
        style: { width: '40%', color: colorCode(rowObj.date) },
      },

      state: {
        value: {
          recurrence: rowObj.recurrence || {},
          date: rowObj.date,
          completedBy: rowObj.completedBy || '',
          completedAt: rowObj.completedAt,
          additionalComments: rowObj.additionalComments,
          closingComments: rowObj.closingComments,
          description: rowObj.description || '',
          render: !rowObj.active,
          clientObj: rowObj.client,
          carePartnerObj: rowObj.carePartner,
          careManager: rowObj.careManager,
          location: rowObj?.location,
        },
        style: {},
      },
    }))
  }
}

export const generateRows = (data: any) =>
  data.map((rowObj: any) => ({
    id: rowObj._id,
    flag: {
      value: rowObj.flag === true ? <GrFlagFill color="red" /> : <></>,
      style: { width: '5%' },
      selected: rowObj.flag === true,
    },
    status: {
      value: rowObj.active === true ? 'Open' : 'Closed',
      style: { width: '5%', color: colorCode(rowObj.date) },
    },
    date: { value: formatCMDate(rowObj.date), style: { width: '5%', color: colorCode(rowObj.date) } },
    time: {
      value: formatDateTime(rowObj.date),
      style: { width: '5%', color: colorCode(rowObj.date) },
      raw: rowObj.date,
    },

    location: { value: rowObj?.location?.location, style: { width: '5%', color: colorCode(rowObj.date) } },
    client: {
      value: rowObj.client ? <Link className='applicant-name-link' to={`/client/${rowObj.client._id}`}>{formatName(rowObj.client.firstName, rowObj.client.lastName)}</Link> : '',
      style: { width: '10%', color: colorCode(rowObj.date) },
    },
    careManager: {
      value: formatName(rowObj?.careManager?.firstName, rowObj?.careManager?.lastName),
      style: { width: '12%', color: colorCode(rowObj.date) },
    },

    carePartner: {
      value: rowObj.carePartner ? formatName(rowObj?.carePartner?.firstName, rowObj?.carePartner?.lastName) : '',
      style: { width: '12%', color: colorCode(rowObj.date) },
    },

    activity: { value: rowObj.activity?.activity, style: { width: '11%', color: colorCode(rowObj.date) } },
    additionalComments: {
      value: parse(rowObj.description || rowObj.additionalComments || ''),
      style: { width: '29%', color: colorCode(rowObj.date), whiteSpace: "pre-wrap" },
    },
    state: {
      value: {
        recurrence: rowObj.recurrence || {},
        date: rowObj.date,
        completedBy: rowObj.completedBy || '',
        completedAt: rowObj.completedAt,
        closingComments: rowObj.closingComments,
        additionalComments: rowObj.description || rowObj.additionalComments || '',
        render: !rowObj.active,
        clientObj: rowObj.client,
        carePartnerObj: rowObj.carePartner,
        careManager: rowObj.careManager,
        location: rowObj?.location,
      },
      style: {},
    },
  }));

export const generateMarketingRows = (data: any) =>
  data.map((rowObj: any) => ({
    id: rowObj._id,
    flag: {
      value: rowObj.flag === true ? <GrFlagFill color="red" /> : <></>,
      style: { width: '5%' },
      selected: rowObj.flag === true,
    },
    status: {
      value: rowObj.active === true ? 'Open' : 'Closed',
      style: { width: '5%', color: renderColor(rowObj.date) },
    },
    date: { value: formatCMDate(rowObj.date), style: { width: '5%', color: renderColor(rowObj.date) } },
    time: {
      value: formatDateTime(rowObj.time),
      style: { width: '5%', color: renderColor(rowObj.date) },
      raw: rowObj.date,
    },

    location: { value: rowObj?.location?.location, style: { width: '5%', color: renderColor(rowObj.date) } },
    client: {
      value: rowObj.client ? <Link className='applicant-name-link' to={`/client/${rowObj.client._id}`}>{formatName(rowObj.client.firstName, rowObj.client.lastName)}</Link> : '',
      style: { width: '10%', color: renderColor(rowObj.date) },
    },
    careManager: {
      value: formatName(rowObj?.careManager?.firstName, rowObj?.careManager?.lastName),
      style: { width: '12%', color: renderColor(rowObj.date) },
    },

    carePartner: {
      value: rowObj.carePartner ? formatName(rowObj?.carePartner?.firstName, rowObj?.carePartner?.lastName) : '',
      style: { width: '12%', color: renderColor(rowObj.date) },
    },

    activity: { value: rowObj.activity?.activity, style: { width: '11%', color: renderColor(rowObj.date) } },
    additionalComments: {
      value: rowObj.description,
      style: { width: '29%', color: renderColor(rowObj.date), whiteSpace: "pre-wrap" },
    },
    state: {
      value: {
        recurrence: rowObj.recurrence || {},
        date: rowObj.date,
        completedDate:rowObj.completedDate,
        completedTime:rowObj.completedTime,
        completedBy: rowObj.completedBy || '',
        completedAt: rowObj.completedAt,
        completed: rowObj?.completed,
        description: rowObj.description || '',
        closingComments: rowObj.closingComments,
        finalComments: rowObj?.finalComments,
        render: !rowObj.active,
        clientObj: rowObj.referralPartner[0],
        carePartnerObj: rowObj.company[0],
        activity: rowObj.activity,
        careManager: rowObj.careManager,
        location: rowObj?.location,
        prospect: rowObj?.prospect,
        company: rowObj?.company,
        referralPartners: rowObj?.referralPartner,
        recurrenceId: rowObj.recurrenceId,
        createdBy:rowObj?.marketingManager
      },
      style: {},
    },
  }));
function formatDisplayedDate(dateString: any) {
  const dateParts = dateString.split('/');
  const year = dateParts[2];
  const monthIndex = parseInt(dateParts[0]) - 1;
  const day = parseInt(dateParts[1]);

  const monthNames = [
    "January", "February", "March",
    "April", "May", "June", "July",
    "August", "September", "October",
    "November", "December"
  ];

  const monthName = monthNames[monthIndex];
  return `${monthName} ${day}, ${year}`;
}
function getWeekKey(weekStart: Date, weekEnd: Date): string {
  const startMonth = monthNames[weekStart.getMonth()];
  const endMonth = monthNames[weekEnd.getMonth()];
  const startDate = weekStart.getDate();
  const endDate = weekEnd.getDate();
  const year = weekStart.getFullYear();
  return `${startMonth} ${startDate} - ${endMonth} ${endDate}, ${year}`;
}

const monthNames = [
  "January", "February", "March",
  "April", "May", "June", "July",
  "August", "September", "October",
  "November", "December"
];


function getWeekStartDate(date: Date): Date {
  const dayOffset = (date.getUTCDay() + 6) % 7;
  const weekStart = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - dayOffset);
  return weekStart;
}

function getWeekEndDate(date: Date): Date {
  const dayOffset = (date.getUTCDay() + 6) % 7;
  const weekEnd = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - dayOffset + 6);
  return weekEnd;
}

const mutipleManager = (data: any) => {
  let obj: any = {}
  let resultArr: any = []

  if (data[0]?.data) return data
  data.map((item: any) => {
    if (!obj[item.careManager.value]) {
      obj[item.careManager.value] = []
    }
    obj[item.careManager.value].push(item)
  })
  for (const key in obj) {
    resultArr.push({ location: key, data: obj[key], count: obj[key].length })
  }
  return resultArr
}
export const mutipleManagerRowFormat = (data: any, groupBy: any) => {
  let obj: any = {}
  let resultArr: any = []
  if(!groupBy){
  return data
}

  const groupByMap: any = {
    'Care manager': 'careManager',
    'Activity': 'activity',
    'Client': 'client',
    'Care Partner': 'carePartner',
    'Day': 'day',
    'Week': 'week',
  }
  let k = groupByMap[groupBy?.value || groupBy]

  if (groupBy?.value === 'None' || k === undefined) {
    k = 'careManager'
  }

  if (data[0]?.data) return data
  data.map((item: any) => {

    let currentKey = item[k]?.value
    if (k === 'client') {
      if (item?.state?.value?.clientObj?.firstName) {
        currentKey = `${item?.state?.value?.clientObj?.firstName} ${item?.state?.value?.clientObj?.lastName}`
      }
    }
    if (k === 'carePartner') {
      if (item?.state?.value?.carePartnerObj?.firstName) {
        currentKey = `${item?.state?.value?.carePartnerObj?.firstName} ${item?.state?.value?.carePartnerObj?.lastName}`
      } else {
        currentKey = 'Not Found'
      }
    }
    if (k === 'week') {
      const date = new Date(item['date']?.value);
      const weekStart = getWeekStartDate(date);
      const weekEnd = getWeekEndDate(date);
      currentKey = getWeekKey(weekStart, weekEnd);
    } else if (k === 'day') {
      currentKey = formatDisplayedDate(item['date']?.value)
    }

    if (!obj[currentKey]) {
      obj[currentKey] = []
    }

    obj[currentKey].push(item)
  })
  for (const key in obj) {
    resultArr.push({ location: key, data: obj[key], count: obj[key].length })
  }
  return resultArr
}


const formatArrays = (arr: any, type: any) => {
  if (!arr) return ''
  let resultArr: any = []
  arr.map((item: any) => {
    const name = type === 'company' ? item.companyName : formatName(item.firstName, item.lastName)
    let url: any = type === 'company' ? '/marketing/company/' : '/marketing/referral-partners/'
    resultArr.push(<Link className='applicant-name-link' to={`${url}${item?._id}`}>{name}</Link>)
    resultArr.push('\n')
  })
  return resultArr
}
export const generateDetailMarketingRows = (data: any, id: any, type?: any) => {
  if (id) {
    return data.map((rowObj: any) => ({
      id: rowObj._id,
      flag: {
        value: rowObj.flag === true ? <GrFlagFill color="red" /> : <></>,
        style: { width: '5%' },
        selected: rowObj.flag === true,
      },
      createdAt: { value: formatCMDate(rowObj?.createdAt), style: { width: '10%', color: renderColor(rowObj?.date) } },
      dueDate: { value: formatCMDate(rowObj?.date), style: { width: '10%', color: renderColor(rowObj?.date) } },
      time: {
        value: formatDateTime(rowObj.time),
        style: { width: '10%', color: renderColor(rowObj.date) },
        raw: rowObj.date,
      },
      careManager: {
        value: formatName(rowObj?.marketingManager?.firstName, rowObj?.marketingManager?.lastName),
        style: { width: '12%', color: renderColor(rowObj.date) },
      },
      activity: { value: rowObj.activity?.type, style: { width: '11%', color: renderColor(rowObj.date) } },
      description: {
        value: rowObj.description,
        style: { width: '30%', color: renderColor(rowObj.date), whiteSpace: "pre-wrap" },
      },


      state: {
        value: {
          recurrence: rowObj.recurrence || {},
          date: rowObj.date,
          time: rowObj.time,
          completedBy: rowObj.completedBy || '',
          completedAt: rowObj.completedAt,
          description: rowObj.description || '',
          closingComments: rowObj.closingComments,
          render: !rowObj.active,
          clientObj: rowObj.referralPartner[0],
          carePartnerObj: rowObj.company[0],
          careManager: rowObj.marketingManager,
          location: rowObj?.location,
          activity: rowObj?.activity,
          finalComments: rowObj?.finalComments,
          referralPartners: rowObj.referralPartner,
          company: rowObj.company,
          prospect: rowObj.prospect,
          recurrenceId: rowObj.recurrenceId
        },
        style: {},
      },
    }))
  }

  if (type === 'Prospect') {
    return data.map((rowObj: any) => ({
      id: rowObj._id,
      flag: {
        value: rowObj.flag === true ? <GrFlagFill color="red" /> : <></>,
        style: { width: '5%' },
        selected: rowObj.flag === true,
      },

      dueDate: { value: formatCMDate(rowObj?.date), style: { width: '5%', color: renderColor(rowObj.date) } },
      prospect: {
        value: (<Link className='applicant-name-link' to={`/marketing/prospects/${rowObj?.prospect?._id}`}>{rowObj?.prospect?.fullName}</Link>),
        style: { width: '12%', color: renderColor(rowObj.date) },
        state: rowObj.prospect
      },
      time: {
        value: formatDateTime(rowObj.time),
        style: { width: '5%', color: renderColor(rowObj.date) },
        raw: rowObj.date,
      },
      careManager: {
        value: formatName(rowObj?.marketingManager?.firstName, rowObj?.marketingManager?.lastName),
        style: { width: '12%', color: renderColor(rowObj.date) },
      },
      activity: { value: rowObj.activity?.type, style: { width: '11%', color: renderColor(rowObj.date) } },
      description: {
        value: rowObj.description,
        style: { width: '30%', color: renderColor(rowObj.date), whiteSpace: "pre-wrap" },
      },

      state: {
        value: {
          recurrence: rowObj.recurrence || {},
          date: rowObj.date,
          time: rowObj.time,
          completedBy: rowObj.completedBy || '',
          completedAt: rowObj.completedAt,
          closingComments: rowObj.closingComments,
          render: !rowObj.active,
          clientObj: rowObj.referralPartner[0],
          carePartnerObj: rowObj.company[0],
          careManager: rowObj.marketingManager,
          location: rowObj?.location,
          activity: rowObj?.activity,
          description: rowObj.description || '',
          finalComments: rowObj?.finalComments,
          referralPartners: rowObj.referralPartner,
          company: rowObj.company,
          prospect: rowObj.prospect
        },
        style: {},
      },
    }))
  }

  if (type === "Referral Partner") {
    return data.map((rowObj: any) => ({
      id: rowObj._id,
      flag: {
        value: rowObj.flag === true ? <GrFlagFill color="red" /> : <></>,
        style: { width: '5%' },
        selected: rowObj.flag === true,
      },

      dueDate: { value: formatCMDate(rowObj?.date), style: { width: '5%', color: renderColor(rowObj.date) } },
      client: {
        value: formatArrays(rowObj?.referralPartner, 'partner'),
        style: { width: '12%', color: renderColor(rowObj.date), whiteSpace: 'pre' },
      },
      company: {
        value: formatArrays(rowObj?.company, 'company'),
        style: { width: '10%', color: renderColor(rowObj.date), whiteSpace: 'pre' },
      },
      time: {
        value: formatDateTime(rowObj.time),
        style: { width: '5%', color: renderColor(rowObj.date) },
        raw: rowObj.date,
      },
      careManager: {
        value: formatName(rowObj?.marketingManager?.firstName, rowObj?.marketingManager?.lastName),
        style: { width: '12%', color: renderColor(rowObj.date) },
      },
      activity: { value: rowObj.activity?.type, style: { width: '11%', color: renderColor(rowObj.date) } },
      description: {
        value: rowObj.description,
        style: { width: '30%', color: renderColor(rowObj.date), whiteSpace: "pre-wrap" },
      },

      state: {
        value: {
          recurrence: rowObj.recurrence || {},
          date: rowObj.date,
          time: rowObj.time,
          completedBy: rowObj.completedBy || '',
          completedAt: rowObj.completedAt,
          closingComments: rowObj.closingComments,
          render: !rowObj.active,
          clientObj: rowObj.referralPartner[0],
          carePartnerObj: rowObj.company[0],
          careManager: rowObj.marketingManager,
          location: rowObj?.location,
          activity: rowObj?.activity,
          description: rowObj.description || '',
          finalComments: rowObj?.finalComments,
          referralPartners: rowObj.referralPartner,
          company: rowObj.company,
          prospect: rowObj.prospect
        },
        style: {},
      },
    }))
  }
  return data.map((rowObj: any) => ({
    id: rowObj._id,
    flag: {
      value: rowObj.flag === true ? <GrFlagFill color="red" /> : <></>,
      style: { width: '5%' },
      selected: rowObj.flag === true,
    },

    dueDate: { value: formatCMDate(rowObj?.date), style: { width: '5%', color: renderColor(rowObj.date) } },
    client: {
      value: formatArrays(rowObj?.referralPartner, 'partner'),
      style: { width: '12%', color: renderColor(rowObj.date), whiteSpace: 'pre' },
    },
    prospect: {
      value: (<Link className='applicant-name-link' to={`/marketing/prospects/${rowObj?.prospect?._id}`}>{rowObj?.prospect?.fullName}</Link>),
      style: { width: '12%', color: renderColor(rowObj.date) },
      state: rowObj.prospect
    },
    company: {
      value: formatArrays(rowObj?.company, 'company'),
      style: { width: '10%', color: renderColor(rowObj.date), whiteSpace: 'pre' },
    },
    time: {
      value: formatDateTime(rowObj.time),
      style: { width: '5%', color: renderColor(rowObj.date) },
      raw: rowObj.date,
    },
    careManager: {
      value: formatName(rowObj?.marketingManager?.firstName, rowObj?.marketingManager?.lastName),
      style: { width: '12%', color: renderColor(rowObj.date) },
    },
    activity: { value: rowObj.activity?.type, style: { width: '11%', color: renderColor(rowObj.date) } },
    description: {
      value: rowObj.description,
      style: { width: '30%', color: renderColor(rowObj.date), whiteSpace: "pre-wrap" },
    },

    state: {
      value: {
        recurrence: rowObj.recurrence || {},
        date: rowObj.date,
        time: rowObj.time,
        completedBy: rowObj.completedBy || '',
        completedAt: rowObj.completedAt,
        closingComments: rowObj.closingComments,
        render: !rowObj.active,
        clientObj: rowObj.referralPartner[0],
        carePartnerObj: rowObj.company[0],
        careManager: rowObj.marketingManager,
        location: rowObj?.location,
        activity: rowObj?.activity,
        description: rowObj.description || '',
        finalComments: rowObj?.finalComments,
        referralPartners: rowObj.referralPartner,
        company: rowObj.company,
        prospect: rowObj.prospect
      },
      style: {},
    },
  }))
}

export const generateProspectRows = (data: any) =>
  data.map((rowObj: any) => ({
    id: rowObj._id,
    flag: {
      value: rowObj.flag === true ? <GrFlagFill color="red" /> : <></>,
      style: { width: '5%' },
      selected: rowObj.flag === true,
    },
    date: { value: formatCMDate(rowObj?.createdAt), style: { width: '10%', color: renderColor(rowObj.date) } },
    dueDate: { value: formatCMDate(rowObj?.date), style: { width: '10%', color: renderColor(rowObj.date) } },
    time: {
      value: formatDateTime(rowObj.time),
      style: { width: '10%', color: renderColor(rowObj.date) },
      raw: rowObj.date,
    },
    careManager: {
      value: formatName(rowObj?.marketingManager?.firstName, rowObj?.marketingManager?.lastName),
      style: { width: '12%', color: renderColor(rowObj.date) },
    },
    activity: { value: rowObj.activity?.type, style: { width: '20%', color: renderColor(rowObj.date) } },
    description: {
      value: rowObj?.description,
      style: { width: '30%', color: renderColor(rowObj.date), whiteSpace: "pre-wrap" },
    },

    state: {
      value: {
        recurrence: rowObj.recurrence || {},
        date: rowObj.date,
        time: rowObj.time,
        completedBy: rowObj.completedBy || '',
        completedAt: rowObj.completedAt,
        closingComments: rowObj.closingComments,
        render: !rowObj.active,
        clientObj: rowObj.referralPartner[0],
        carePartnerObj: rowObj.company[0],
        careManager: rowObj.marketingManager,
        location: rowObj?.location,
        activity: rowObj?.activity,
        description: rowObj?.description,
        finalComments: rowObj?.finalComments,
        referralPartners: rowObj.referralPartner,
        company: rowObj.company,
        prospect: rowObj.prospect
      },
      style: {},
    },
  }))
