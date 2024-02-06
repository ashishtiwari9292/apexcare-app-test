import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

export default function ApplicantActivityTabPanel({ tabs, TableToRender, activityType, setType, resetFilter }: any) {
    const [value, setValue] = React.useState(tabs.indexOf(activityType));
    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
        setType(tabs[newValue])
    };
    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs variant="scrollable"
                    scrollButtons="auto"
                     value={value}
                      onChange={handleChange} 
                      aria-label="scrollable auto tabs example"
                      >
                    {tabs.map((tabObj: any, idx: number) => {
                        return <Tab label={tabObj} {...a11yProps(idx)} />
                    })}
                </Tabs>
            </Box>
            {tabs.map((tabObj: any, idx: number) => {
                return (<TabPanel value={value} index={idx}>{TableToRender(tabObj)}</TabPanel>)
            })}

        </Box>
    );
}