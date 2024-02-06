import React, { ReactElement, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@mui/material';
import { ItemType } from 'typings';

interface TabProps {
  icon: ReactElement;
  label: string;
  items?: ItemType[];
  clickHandler?: (e?: any) => void;
}

const Tab = ({ icon, label, items, clickHandler }: TabProps): JSX.Element => {
  const { pathname } = useLocation();

  return (
    <Button
      sx={{
        my: 1,
        color: items
          ? items.find((i) => i.key === pathname)
            ? 'var(--primary-color)'
            : 'var(--secondary-color)'
          : ({ isActive }: any) => (isActive ? 'var(--primary-color)' : 'var(--secondary-color)'),
        px: 3,
      }}
      startIcon={icon}
      onClick={clickHandler ? clickHandler : () => {}}
    >
      {label}
    </Button>
  );
};

export default Tab;
