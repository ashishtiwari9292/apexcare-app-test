import React, { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import {
  AppBar,
  Container,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Avatar,
  MenuItem,
  Paper,
  MenuList,
  ListItemIcon,
  Popper,
} from '@mui/material';
import AddToQueueIcon from '@mui/icons-material/AddToQueue';
import LogoutIcon from '@mui/icons-material/Logout';
import AddchartIcon from '@mui/icons-material/Addchart';
import AppsIcon from '@mui/icons-material/Apps';
import AppShortcutIcon from '@mui/icons-material/AppShortcut';
import ApexLogo from 'assets/img/apexcare-logo.png';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import { Menu } from '../Menu';
import { ItemType } from 'typings';
import { useAuth } from 'hooks';
import Tab from './Tab';
import { isAdmin } from 'lib';

const recruitingSelections: ItemType[] = [
  { key: '/recruiting/applicants', label: 'Applicants' },
  { key: '/recruiting/snapshot', label: 'Snapshot' },
  { key: '/recruiting/status', label: 'Status' },

];

const carePlanningSelections: ItemType[] = [
  { key: '/clients', label: 'Clients' },
  { key: '/care-partners', label: 'Care Partners' },
  { key: '/care-management', label: 'Care Management' },
  { key: '/award-management', label: 'Award Management' }
];

const adminSelections: ItemType[] = [
  { key: '/user-management', label: 'User Management' },
  { key: '/stage-management', label: 'Stage Management' },
  { key: '/vendor-management', label: 'Vendor Management' },
  { key: '/award-type-management', label: 'Award Type Management' },
  { key: '/activity-management', label: 'Activity Management' },
  { key: '/location-management', label: "Location Management" },
  { key: '/prospect-activity', label: 'Prospect Activity' },
  { key: '/referral-partners', label: 'Referral Partners Type' },
  { key: '/referral-activity', label: 'Referral Partners Activity' },
  { key: '/lead-source', label: 'Lead Source' },
  { key: '/stage-options', label: 'Stage Options' },
  { key: '/lost-client', label: 'Lost Client Options' },
  { key: '/contact-types', label: 'Contact Types' },
  { key: '/contact-relationships', label: 'Contact Relationships' },
  { key: '/client-deactivation', 'label': 'Client Deactivation Reasons' },
  { key:'/care-partner-deactivation', 'label': 'Care Partner Deactivation Reasons' }

]

const marketingSelections: ItemType[] = [
  { key: '/marketing/referral-partners', label: 'Referral Partners' },
  { key: '/marketing/prospects', label: 'Prospects' },
  { key: '/marketing/management', label: 'Marketing Management' },
  { key: '/marketing/activities', label: 'Marketing Daily Log' },
]

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [carePlanning, setCarePlanning] = useState<null | HTMLElement>(null);
  const [recruiting, setRecruiting] = useState<null | HTMLElement>(null);
  const [adminTab, setAdminTab] = useState<null | HTMLElement>(null);
  const [marketing, setMarketing] = useState<null | HTMLElement>(null)
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(anchorElUser ? null : event.currentTarget);
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };
  return (
    <AppBar
      position="static"
      sx={{
        bgcolor: 'var(--headerBg)',
        position: 'fixed',
        zIndex: '1200',
        top: '0',
        left: '0',
      }}
    >
      <Container maxWidth="xl">
        <Box>
          <Toolbar disableGutters sx={{ justifyContent: 'space-between', zIndex: 'tooltip', alignItems: 'center' }}>
            <img src={ApexLogo} width="150px" alt="apexcare-logo" />
            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
              <Avatar alt={`${user.firstName} ${user.lastName}`} src="/static/images/avatar/2.jpg" />
              <Box sx={{ px: 1, color: 'white' }} className="fs-18">
                {`${user.firstName} ${user.lastName}`}
              </Box>
            </IconButton>
            <Popper anchorEl={anchorElUser} keepMounted open={Boolean(anchorElUser)} disablePortal>
              <Box sx={{ width: { xs: '100vw', sm: '320px' } }}>
                <Paper>
                  <MenuList>
                    <MenuItem key={'Logout'} onClick={handleLogout}>
                      <ListItemIcon>
                        <LogoutIcon fontSize="small" />
                      </ListItemIcon>
                      <Typography textAlign="center">Logout</Typography>
                    </MenuItem>
                  </MenuList>
                </Paper>
              </Box>
            </Popper>
          </Toolbar>
        </Box>
        <Box
          sx={{
            flexGrow: 1,
            bgcolor: 'white',
            color: 'var(--secondary-color)',
            width: '85%',
            left: '0',
            right: '0',
            margin: '0px auto',
            borderRadius: 2,
            marginTop: 2,
            marginBottom: -4,
            boxShadow: 3,
            px: 2,
          }}
        >
          <NavLink to="/quick-hits">
            <Tab icon={<AddToQueueIcon />} label="Quick Hits" />
          </NavLink>
          <Tab
            icon={<AppsIcon />}
            label="Care Planning"
            clickHandler={(e) => {
              setCarePlanning(e.currentTarget);
            }}
            items={carePlanningSelections}
          />
          <Tab
            icon={<AddchartIcon />}
            label="Recruiting"
            clickHandler={(e) => {
              setRecruiting(e.currentTarget);
            }}
            items={recruitingSelections}
          />
          <Tab
            icon={<AppShortcutIcon />}
            label="Marketing"
            clickHandler={(e) => {
              setMarketing(e.currentTarget);
            }}
            items={marketingSelections}
          />
          {isAdmin(user.roles) &&
            <Tab
              icon={<ManageAccountsIcon />}
              label="Admin"
              clickHandler={(e) => {
                setAdminTab(e.currentTarget);
              }}
              items={adminSelections}
            />
          }
          <Menu
            anchorEl={carePlanning}
            open={!!carePlanning}
            closeHandler={() => {
              setCarePlanning(null);
            }}
            items={carePlanningSelections}
          />
          <Menu
            anchorEl={recruiting}
            open={!!recruiting}
            closeHandler={() => {
              setRecruiting(null);
            }}
            items={recruitingSelections}
          />

          <Menu
            anchorEl={adminTab}
            open={!!adminTab}
            closeHandler={() => {
              setAdminTab(null);
            }}
            items={adminSelections}
          />
          <Menu
            anchorEl={marketing}
            open={!!marketing}
            closeHandler={() => {
              setMarketing(null);
            }}
            items={marketingSelections}
          />

          {/* 
          {isAdmin(user.roles) &&
            <NavLink to="/user-management">
              <Tab icon={<ManageAccountsIcon />} label="User Management" />
            </NavLink>}
            {isAdmin(user.roles) &&
            <NavLink to="/stage-management">
              <Tab icon={<ArticleOutlinedIcon />} label="Stage Management" />
            </NavLink>} */}
        </Box>
      </Container>
    </AppBar>
  );
};

export default Header;
