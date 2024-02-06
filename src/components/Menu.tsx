import React from 'react';
import { NavLink } from 'react-router-dom';
import { Typography, Box, Menu as MuiMenu, MenuItem } from '@mui/material';
import { ItemType } from 'typings';

interface MenuProps {
  anchorEl: null | HTMLElement;
  open: boolean;
  closeHandler: () => void;
  items: ItemType[];
}

export function Menu({ anchorEl, open, closeHandler, items }: MenuProps): JSX.Element {
  return (
    <MuiMenu
      sx={{ mt: '45px', zIndex: 'tooltip' }}
      id="menu-appbar"
      disableScrollLock={true}
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      open={open}
      onClose={closeHandler}
    >
      <Box sx={{ width: { xs: '100vw', sm: '320px' } }}>
        {items.map((item) => (
          <NavLink to={`${item.key}`}>
            <MenuItem key={`${item.label}`}>
              <Typography
                sx={{
                  color: ({ isActive }: any) => (isActive ? 'var(--primary-color)' : 'var(--secondary-color)'),
                }}
                textAlign="center"
              >
                {item.label}
              </Typography>
            </MenuItem>
          </NavLink>
        ))}
      </Box>
    </MuiMenu>
  );
}
