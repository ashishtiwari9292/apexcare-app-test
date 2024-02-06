import React, { useState } from 'react';
import { Tabs, Tab } from '@mui/material';
import ChecklistComponent from './Checklist';
import SavedConfigurationsComponent from './SavedConfigurationsComponent';
// import CreateNewComponent from './CreateNewComponent';

const ModalTabs = ({callback, closeHandler, url, options}) => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };


  return (
    <div>
      <Tabs value={tabValue} onChange={handleTabChange}>
        <Tab label="Configurations" />
        <Tab label="Create New" />
      </Tabs>
      {tabValue === 0 && <SavedConfigurationsComponent  closeHandler={closeHandler} url = {url} options = {options}/>}
      {tabValue === 1 && <ChecklistComponent creation  callback={callback} closeHandler={closeHandler} url = {url} options = {options} />}
    </div>
  );
};

export default ModalTabs;
