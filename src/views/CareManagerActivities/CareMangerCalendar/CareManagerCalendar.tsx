
import { useEffect, useState } from 'react'
import FullCalendar, { EventClickArg, EventContentArg } from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import { Card, CardHeader, Modal, NoData, Spinner } from 'components'
import { colorCode } from 'lib'
import CareManagerActivitiesModalContent from '../CareManagerActivitiesModalContent'
import rrulePlugin from '@fullcalendar/rrule'
import { generateRows } from '../generateRows'
import { useCompany } from 'hooks'
import { RRule } from 'rrule'
import DoneIcon from '@mui/icons-material/Done';
import moment from 'moment'
import { IconButton } from '@mui/material'
import { DateTime } from "luxon";

interface careManagerCalendarProps {
  activities?: any
  fetchData: any
}

export function CareManagerCalendar({ activities, fetchData }: careManagerCalendarProps) {
  const { locations } = useCompany()
  const [events, setEvents] = useState<any>()
  const [openModal, setOpenModal] = useState(false)
  const [selectedRow, setSelectedRow] = useState({})

  const handleCloseModal = () => {
    fetchData()
    setOpenModal(false)
  }

  const generateEventTitle = (activityObj: any) => {

    let eventGuest = activityObj?.activity?.activity[1] === 'P' ? `${activityObj?.carePartner?.firstName || activityObj?.client?.firstName || ''} ${activityObj?.carePartner?.lastName || activityObj?.client?.lastName || ''}` : `${activityObj?.client?.firstName ||activityObj?.carePartner?.firstName|| ''} ${activityObj?.client?.lastName || activityObj?.carePartner?.lastName||''}`

    if (eventGuest.length > 1) {
      return `${activityObj?.careManager?.firstName || ''} ${activityObj?.careManager?.lastName || ''} / ${eventGuest} : ${activityObj?.activity?.activity}`
    } else {
      return `${activityObj?.careManager?.firstName || ''} ${activityObj?.careManager?.lastName || ''} : ${activityObj?.activity?.activity}`
    }
  }

  const generateEvents = (data: any) => {
    data && setEvents(data.map((activityObj: any, i: number) => {
      const formattedDate =  moment(activityObj?.date.replace(/-/g, '\/').replace(/T.+/, ''))
      const time = moment(activityObj.date)
      formattedDate.set({
        hour:time.get('hour'),
        minute:time.get('minute')
      })
      const newestDate = new Date(formattedDate.toISOString())
   
      let event: any = {
        title: generateEventTitle(activityObj),
        id: i,
        date: newestDate,
        // start: new Date(activityObj?.date.replace(/-/g, '\/').replace(/T.+/, '')),
        allDay: false
        ,
        textColor: colorCode(activityObj.date),
        extendedProps: { status: activityObj.active }
      }
      let today = moment()
      // activityObj?.recurrence?.type && activityObj?.recurrence?.type !== "No Recurrence" && (event.rrule = {
      //   freq: activityObj.recurrence.type === 'Monthly' ? RRule.MONTHLY : activityObj.recurrence.type,
      //   interval: Number(activityObj.recurrence.options),
      //   dtstart: activityObj.date,
      //   until: moment(activityObj.recurrence.endDate).add(1, 'day') || today.add(1, 'y')
      // })
      // if (activityObj?.recurrence?.type === 'Weekly') {
      //   activityObj?.recurrence?.days.length > 0 && (event.rrule.byweekday = activityObj?.recurrence?.days)
      // }
      return event
    }))
  }
  const renderEventContent = (eventContent: EventContentArg) => {
    return (
      <div className="hover event-content" >
        {!eventContent?.event?._def?.extendedProps?.status && <IconButton
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
        </IconButton>} <strong className='event-time'>{eventContent.timeText + 'm'}</strong>
        <p style={{ fontSize: 'larger', color: eventContent.textColor, margin: '5px', }}>{eventContent.event.title}</p>
      </div>
    )
  }

  const handleEventClick = (clickInfo: EventClickArg) => {
    setSelectedRow(generateRows([activities[clickInfo.event._def.publicId]])[0])
    setOpenModal(true)
  }

  useEffect(() => {
    generateEvents(activities)
    return () => { }
  }, [activities])

  return (
    <Card >
      <CardHeader title="Calendar Report" setOpenModal={() => { }} expanded={true} setExpanded={() => { }} addIcon={false} expandable={false} />
      <Modal open={openModal} closeHandler={handleCloseModal} title="Edit Care Manager Activity"
       radioGroup={true}
       radioGroupLabel1='Completed'
       radioGroupLabel2='Incomplete'
       currentRow={selectedRow}
      >
        <CareManagerActivitiesModalContent 
        closeHandler={handleCloseModal} 
        selected={selectedRow} 
        data={selectedRow} 
        renderButtons 
        />
      </Modal>
      {!events && <Spinner />}
      {events?.length === 0 || locations.length === 0 && <NoData />}
      {events?.length > 0 && locations.length > 0 &&
        <FullCalendar
          plugins={[dayGridPlugin, rrulePlugin]}
          headerToolbar={{
            left: 'prev,next',
            center: 'title',
            right: 'today'
          }}
          contentHeight='auto'
          selectable={false}
          initialView='dayGridMonth'
          editable={false}
          weekends={true}
          events={events}
          eventContent={renderEventContent} // custom render function
          eventClick={handleEventClick}
        />
      }
    </Card>
  )
}
