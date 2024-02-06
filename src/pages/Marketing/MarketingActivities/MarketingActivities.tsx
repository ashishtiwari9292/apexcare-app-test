import { Container } from '@mui/system'
import { Layout } from 'components'
import { useAuth } from 'hooks'
import React, { useEffect, useState } from 'react'
import API from 'services/AxiosConfig'
import { FilterHeader } from 'views'
import MarketingActivititesTable from 'views/MarketingActivitites/MarketingActivititesTable'

interface Props { }

function MarketingActivities() {
    const activityType = ['All', 'Phone Call: Voice Mail', 'Phone Call: Connected', 'Drop By/Drop Off: No Contact', 'Meeting: Ad Hoc Converation', "Meeting: Unscheduled", "Meeting: Scheduled", "Meeting: In-Service/ Presentation", "Event: Participated", "Event: Hosted/Sponsored", "Client: Assessment", "Client: QA/SOC"]
    const groupBy = ['None', 'Day', "Location", "Activity Type", "Created By"]
    const [openModal, setOpenModal] = useState(false)
    const options = { activityType, groupBy }
    const { user } = useAuth()

    const [filter, setFilter] = useState({
        location: {id:user?.location?._id, value:user?.location?.location},
        dateRange: { id: '7', value: 'Last 7 Days' },
        activity: { id: 'All', value: 'All' },
        marketingManager: { id: 'All', value: 'All' },
        referralPartner: { id: 'All', value: 'All' },
        company: { id: 'All', value: 'All' },
        groupBy: { id: 'Day', value: 'Day' },
        startDate: { id: '', value: '' },
        endDate: { id: '', value: '' },
    })


    useEffect(() => {
        setFilter({
            ...filter,
            location:{id:user?.location?._id, value:user?.location?.location},
        })
        
    }, [])



    return (
        <Layout>
            <Container maxWidth="xl" sx={{ pt: 3}}>
                <FilterHeader filter={filter} setFilter={setFilter} type="marketing-activities" options={{ ...options, referral: [] }} label="Marketing Daily Log" />
                <MarketingActivititesTable source  = 'marketing-activities'renderPartners = {true} filter={filter} openModal={openModal} setOpenModal={setOpenModal} defaultSelection = {'Referral Partners'} />
            </Container>
        </Layout>
    )
}

export default MarketingActivities
