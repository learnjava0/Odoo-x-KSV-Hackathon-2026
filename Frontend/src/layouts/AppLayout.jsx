import {
  AssessmentOutlined,
  AssignmentTurnedInOutlined,
  DashboardOutlined,
  DescriptionOutlined,
  GavelOutlined,
  Inventory2Outlined,
  LocalShippingOutlined,
  Logout,
  ManageAccountsOutlined,
  Menu,
  NotificationsNoneOutlined,
  ReceiptLongOutlined
} from '@mui/icons-material';
import {
  AppBar,
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
  Typography
} from '@mui/material';
import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/store.js';
import { routeAccess } from '../config/access.js';

const drawerWidth = 228;

const nav = [
  { label: 'Dashboard',      to: '/',             icon: <DashboardOutlined />,          roles: routeAccess.dashboard },
  { label: 'Vendors',        to: '/vendors',       icon: <Inventory2Outlined />,         roles: routeAccess.vendors },
  { label: 'RFQs',           to: '/rfqs',          icon: <DescriptionOutlined />,        roles: routeAccess.rfqs },
  { label: 'Quotations',     to: '/quotations',    icon: <AssignmentTurnedInOutlined />, roles: routeAccess.quotations },
  { label: 'Approvals',      to: '/approvals',     icon: <GavelOutlined />,              roles: routeAccess.approvals },
  { label: 'Purchase orders',to: '/documents',     icon: <ReceiptLongOutlined />,        roles: routeAccess.documents },
  { label: 'Invoices',       to: '/documents',     icon: <ReceiptLongOutlined />,        roles: routeAccess.documents },
  { label: 'Reports',        to: '/reports',       icon: <AssessmentOutlined />,         roles: routeAccess.reports },
  { label: 'Activity',       to: '/notifications', icon: <NotificationsNoneOutlined />,  roles: routeAccess.activities },
  { label: 'Admin',          to: '/admin',         icon: <ManageAccountsOutlined />,     roles: routeAccess.admin }
];

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const signOut = () => {
    dispatch(logout());
    navigate('/login');
  };

  const drawer = (
    <Box className="sidebar">
      <Toolbar className="sidebar-brand">
        <Box className="brand-mark"><LocalShippingOutlined fontSize="small" /></Box>
        <Box>
          <Typography className="brand-name">VendorBridge</Typography>
          <Typography className="brand-caption">Procurement workspace</Typography>
        </Box>
      </Toolbar>
      <Divider />
      <List className="nav-list" sx={{ mt: 1 }}>
        {nav.filter((item) => item.roles.includes(user?.role)).map((item) => (
          <ListItemButton
            key={item.to + item.label}
            component={NavLink}
            to={item.to}
            onClick={() => setMobileOpen(false)}
            className={location.pathname === item.to ? 'active' : ''}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
      <Box className="sidebar-footer">
        <Avatar>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography className="sidebar-user" noWrap>{user?.name || 'User'}</Typography>
          <Typography className="sidebar-role" noWrap>{user?.role?.replace('_', ' ') || 'Procurement'}</Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box className="app-shell">
      <AppBar className="topbar" position="fixed" elevation={0}>
        <Toolbar>
          <IconButton
            aria-label="open navigation"
            onClick={() => setMobileOpen(true)}
            sx={{ display: { md: 'none' }, mr: 1 }}
          >
            <Menu />
          </IconButton>
          <Box sx={{ flexGrow: 1 }}>
            <Typography className="topbar-title">Procurement Operations</Typography>
            <Typography className="topbar-subtitle">Manage sourcing from request to payment</Typography>
          </Box>
          <Box className="topbar-user">
            <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
              <Typography className="topbar-user-name">{user?.name}</Typography>
              <Typography className="topbar-user-role">{user?.role}</Typography>
            </Box>
            <Tooltip title="Sign out">
              <IconButton onClick={signOut} aria-label="sign out"><Logout fontSize="small" /></IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { width: drawerWidth }
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' }
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box component="main" className="main-content" sx={{ width: { md: `calc(100% - ${drawerWidth}px)` } }}>
        <Box key={location.pathname} className="route-enter">
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
