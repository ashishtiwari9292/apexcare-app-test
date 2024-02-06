import React, { useState, useEffect } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ResizeTable from './ResizeTable';

function CollapsibleList({ tableProps, data, renderCompanyUrl = false }) {
    const [open, setOpen] = useState({});

    const handleToggle = (index) => {
        setOpen(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };


    return (
        <List>

            {data?.length >= 1 && data[0].label !== undefined ? data.map((item, index) => (
                <div key={index}>
                    <ListItem button onClick={() => handleToggle(index)} style={{ backgroundColor: '#e0e0e0', borderRadius: '4px' }} >
                        {open[index] ? <ExpandLess style={{ marginRight: '5px' }} /> : <ExpandMore style={{ marginRight: '5px' }} />}
                        <ListItemText primary={item.label} style={{ height: '24px', display: 'flex', alignItems: 'center', backgroundColor: '#e0e0e0', fontSize: '0.875rem' }} />
                    </ListItem>
                    <Collapse in={open[index]} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            <ListItem>
                                <ResizeTable
                                    rows={data[index]?.rows || []}
                                    {...tableProps}
                                    renderCompanyUrl = {renderCompanyUrl}
                                />
                            </ListItem>
                        </List>
                    </Collapse>
                </div>
            )) :
                <List component="div" disablePadding>
                    <ListItem>
                        <ResizeTable
                            rows={data[0]?.rows || []}
                            renderCompanyUrl = {renderCompanyUrl}
                            {...tableProps}
                        />
                    </ListItem>
                </List>}

        </List>
    );
}

export default CollapsibleList;
