


import { Container } from '@mui/system'
import { Layout } from 'components'
import { useAuth } from 'hooks'
import React, { useEffect, useState } from 'react'
import { FilterHeader } from "views"
import { ReferralPartnersTabs } from 'views/ReferralPartners/ReferralPartnersTabs'


function ReferralPartners() {
    const [type, setType] = useState("Referral Partners")
    const queryParameters = new URLSearchParams(window.location.search);
    const tab = queryParameters.get("type")
    const {user} = useAuth()

    const [filter, setFilter] = useState(
        {
            flag: false,
            referralPartner: { id: '', value: '' },
            companyName: { id: '', value: '' },
            status: { id: 'Active', value: 'Active' },
            companyType:{id:'All', value:'All'},
            location: { id: user?.location?._id, value: user?.location?.location },
            groupBy:{ id: 'None', value: 'None' },
        }
    )

    const resetFilter = () => {
        const defaultFilter = {
            flag: false,
            referralPartner: { id: '', value: '' },
            companyName: { id: '', value: '' },
            status: { id: 'Active', value: 'Active' },
            companyType:{id:'All', value:'All'},
            location: { id: user?.location?._id, value: user?.location?.location },
            groupBy:{ id: 'None', value: 'None' },
        }
        setFilter(defaultFilter)
    }
  
    useEffect(()=>{setFilter(filter => ({...filter,location:{ id: user?.location?._id, value: user?.location?.location }}))},[user])
    return (
        <Layout>
            <Container maxWidth= {false} sx={{ paddingTop:15, paddingLeft:'0'}}>
                <FilterHeader type={type} label=''  setFilter={setFilter} maxWidth = {false} />
                <ReferralPartnersTabs  setType={setType} type={type} resetFilter={resetFilter} />
            </Container>
        </Layout>
    )
}

export default ReferralPartners
