
import { useEffect, useState } from 'react'
import FullCalendar, { EventClickArg, EventContentArg } from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import { Card, CardHeader, Modal, NoData, Spinner } from 'components'
import { colorCode, formatName } from 'lib'
import CareManagerActivitiesModalContent from 'views/CareManagerActivities/CareManagerActivitiesModalContent'
import rrulePlugin from '@fullcalendar/rrule'
import { generateMarketingRows } from 'views/CareManagerActivities/generateRows'
import { useCompany } from 'hooks'
import { RRule } from 'rrule'
import DoneIcon from '@mui/icons-material/Done';
import moment, { tz } from 'moment-timezone'
import { IconButton } from '@mui/material'
import { DateTime } from "luxon";
import MarketingActivitiesModalContent from './MarketingActivitiesModalContent'
import MarketingTasksModalContent from './MarketingTasksModalContent'
import MarketingCalendarTasksModal from './MarketingCalendarTasksModal'

interface careManagerCalendarProps {
  activities?: any
  fetchData: any
}

export function MarketingCalendar({ activities, fetchData }: careManagerCalendarProps) {
  const { locations } = useCompany()
  const [events, setEvents] = useState<any>()
  const [openModal, setOpenModal] = useState(false)
  const [selectedRow, setSelectedRow] = useState({})

  const handleCloseModal = () => {
    fetchData()
    setOpenModal(false)
  }

  const formatArrays = (arr: any, type: any) => {
    if (!arr) return ''
    let resultStr = ''
    arr.map((item: any) => {
      const name = type === 'company' ? item.companyName : formatName(item.firstName, item.lastName)

      resultStr += name + '\n'
    })
    return resultStr
  }


  const generateEventTitle = (activityObj: any) => {
    const activityType = activityObj?.activity?.type
    // let eventGuest = activityObj.activity.activity[1] === 'P' ? `${activityObj?.carePartner?.firstName || ''} ${activityObj?.carePartner?.lastName || ''}` : `${activityObj?.client?.firstName || ''} ${activityObj?.client?.lastName || ''}`
    let eventGuest = formatArrays(activityObj?.referralPartner, 'partner')
    if (eventGuest === "") {
      eventGuest = activityObj?.prospect?.fullName
    }
    let eventHost = formatName(activityObj?.marketingManager?.firstName, activityObj?.marketingManager?.lastName)
    return `${eventGuest} / ${eventHost} : ${activityType}`

  }

  const generateEvents = (data: any) => {
    data && setEvents(data.map((activityObj: any, i: number) => {
      let currentDate = activityObj.completed ? activityObj?.completedDate : activityObj?.date
      const formattedDate = currentDate ? moment(currentDate.replace(/-/g, '\/').replace(/T.+/, '')) : moment()


      let allDayEvent = false;

      const condition = activityObj.completed ? (activityObj.completedTime && activityObj.completedTime !== "") : (activityObj.time && activityObj.time !== '')

      if (condition) {
        const time = moment(activityObj.completed ? activityObj?.completedTime : activityObj.time);
        formattedDate.set({
          hour: time.get('hour'),
          minute: time.get('minute'),
        });
      } else {
        allDayEvent = true;
      }

      const newestDate = new Date(formattedDate.utc().toISOString())

      let event: any = {
        title: generateEventTitle(activityObj),
        id: i,
        date: newestDate,
        allDay: allDayEvent,
        textColor: colorCode(activityObj.date),
        extendedProps: { completed: activityObj.completed, activityObj, time: activityObj.time }
      }


      let today = moment()
      // activityObj?.recurrence?.type && activityObj?.recurrence?.type !== "No Recurrence" && (event.rrule = {
      //   freq: activityObj?.recurrence?.type === 'Monthly' ? RRule.MONTHLY : activityObj?.recurrence?.type|| '',
      //   interval: Number(activityObj.recurrence.options),
      //   dtstart: newestDate,
      //   tzid:'Etc/GMT+0',
      //   until: moment(activityObj.recurrence.endDate).add(1, 'day') || today.add(1, 'y'),

      // })
      // if (activityObj?.recurrence?.type === 'Weekly') {
      //   activityObj?.recurrence?.days.length > 0 && (event.rrule.byweekday = activityObj?.recurrence?.days)
      // }

      return event
    }))
  }


  const eventTimeFormat = (event: any) => {
    const date = moment.utc(event.start.marker).utcOffset(event.start.timeZoneOffset / 60);
    const formattedTime = date.tz('Etc/GMT+0').format('h:mm A');
    return formattedTime;
  };
  const renderEventContent = (eventContent: EventContentArg) => {

    return (
      <div className="hover event-content" >
        {eventContent?.event?._def?.extendedProps?.completed && <IconButton
          sx={{
            background: 'green',
            color: 'white',
            cursor: "default",
            height: '1em',
            width: '1em'
          }}
          disableRipple
          disableFocusRipple
          className="hired"
          aria-label="Hired"
        >
          <DoneIcon />
        </IconButton>} <strong className='event-time'>{eventContent.timeText}</strong>
        <p style={{ fontSize: 'larger', color: eventContent?.event?._def?.extendedProps?.completed ? 'Black' : eventContent.textColor, margin: '5px', }}>{eventContent.event.title}</p>
      </div>
    )
  }

  const handleEventClick = (clickInfo: EventClickArg) => {
    setSelectedRow(generateMarketingRows([activities[clickInfo.event._def.publicId]])[0])
    console.log('this is now the row',generateMarketingRows([activities[clickInfo.event._def.publicId]])[0])
    setOpenModal(true)
  }

  useEffect(() => {
    generateEvents(activities)
    return () => { }
  }, [activities])

  return (
    <Card >
      <CardHeader title="Calendar Report" setOpenModal={() => { }} expanded={true} setExpanded={() => { }} addIcon={false} expandable={false} />
      <Modal open={openModal} closeHandler={handleCloseModal} title="Edit Marketing Task" radioGroup={true} radioGroupLabel1="Completed" radioGroupLabel2='Incomplete' currentRow={selectedRow}>
        {/* <MarketingActivitiesModalContent closeHandler={handleCloseModal} selected={selectedRow} data={selectedRow} renderButtons management={true} source='marketingCalendar' /> */}
        {/* <MarketingTasksModalContent closeHandler={handleCloseModal} selected={selectedRow} data={selectedRow} renderButtons management={true} source='marketingCalendar' /> */}
        <MarketingCalendarTasksModal closeHandler={handleCloseModal} selected={selectedRow} data={selectedRow} renderButtons management={true} source='marketingCalendar' />
      </Modal>
      {!events && <Spinner />}
      {events?.length === 0 && <NoData />}
      {events?.length > 0 && locations.length > 0 &&
        <FullCalendar
          plugins={[dayGridPlugin, rrulePlugin]}
          headerToolbar={{
            left: 'prev,next',
            center: 'title',
            right: 'today,dayGridWeek,dayGridMonth'
          }}
          contentHeight='auto'
          selectable={false}
          initialView='dayGridMonth'
          editable={false}
          weekends={true}
          events={events}
          eventContent={renderEventContent} // custom render function
          eventClick={handleEventClick}
          eventTimeFormat={eventTimeFormat}
        />
      }
    </Card>
  )
}

