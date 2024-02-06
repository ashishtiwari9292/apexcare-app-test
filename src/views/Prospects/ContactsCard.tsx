import React, { useState } from 'react'
import { Collapse } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { Card } from 'components';
import ContactsModal from './ContactsModal';



function ContactsCard({ name, data, fetchContacts }: any) {
    const [expanded, setExpanded] = useState(false)

    return (
        <div  >
            <Card style={{ width: '90%', paddingBottom: '10px', }} onClick={() => setExpanded(!expanded)}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', }}>
                    <div style={{ display: 'flex', justifyContent: 'space-evenly', alignItems: 'center', width: '75%', marginLeft: '18.5%', padding: '0px' }} >
                        <h3>{name}</h3>
                        {expanded ? <ExpandLessIcon onClick={() => setExpanded(!expanded)} /> : <ExpandMoreIcon onClick={() => setExpanded(!expanded)} />}
                    </div>
                    <Collapse in={expanded} style={{ width: '90%' }} ><ContactsModal detail={true} currentRow={data} fetchContacts={fetchContacts} /></Collapse>
                </div>
            </Card>
        </div>
    )
}

export default ContactsCard
