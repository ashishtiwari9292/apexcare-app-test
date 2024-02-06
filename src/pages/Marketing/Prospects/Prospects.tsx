import { Layout } from 'components'
import { useAuth } from 'hooks'
import React, { useState } from 'react'
import { FilterHeader } from 'views'
import { ProspectTable } from 'views/Prospects/ProspectsTable'
import { useFilter } from '../ReferralPartners/ReferralFilterContext'


function Prospects() {
    const { user } = useAuth()
    // const {}

    const { prospectFilter, updateProspectFilter } = useFilter()
    return (
        <Layout>
            <div style={{ paddingTop: '13vh' }}>
                <FilterHeader type="prospects" setFilter={updateProspectFilter} filter={prospectFilter} />
            </div>
            <ProspectTable filter={prospectFilter} setFilter={updateProspectFilter} title="Prospects" />
        </Layout>
    )
}

export default Prospects
