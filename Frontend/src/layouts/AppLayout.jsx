import {
  Assessment,
  AssignmentTurnedIn,
  Dashboard,
  Description,
  Gavel,
  Inventory,
  LocalShipping,
  Logout,
  Notifications,
  Receipt
} from '@mui/icons-material';
import {
  AppBar,
  Box,
  Button,
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
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/store.js';

const nav = [
  { label: 'Dashboard', to: '/', icon: <Dashboard /> },
  { label: 'Vendors', to: '/vendors', icon: <Inventory /> },
  { label: 'RFQs', to: '/rfqs', icon: <Description /> },
  { label: 'Quotations', to: '/quotations', icon: <AssignmentTurnedIn /> },
  { label: 'Approvals', to: '/approvals', icon: <Gavel /> },
  { label: 'PO & Invoice', to: '/documents', icon: <Receipt /> },
  { label: 'Notifications', to: '/notifications', icon: <Notifications /> },
  { label: 'Reports', to: '/reports', icon: <Assessment /> }
];

export default function AppLayout() {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const signOut = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <Box className="app-shell" sx={{ display: 'flex' }}>
      <AppBar position="fixed" elevation={0} sx={{ borderBottom: '1px solid #dce4e8', bgcolor: '#ffffff', color: '#1f2937' }}>
        <Toolbar>
          <LocalShipping sx={{ color: '#25636f', mr: 1 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>VendorBridge ERP</Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>{user?.name} · {user?.role}</Typography>
          <Tooltip title="Logout">
            <IconButton onClick={signOut} aria-label="logout">
              <Logout />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: 238,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: 238, boxSizing: 'border-box', top: 64, borderRight: '1px solid #dce4e8' }
        }}
      >
        <List sx={{ px: 1, py: 2 }}>
          {nav.map((item) => (
            <ListItemButton
              key={item.to}
              component={NavLink}
              to={item.to}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                '&.active': { bgcolor: '#e4f1f3', color: '#25636f' }
              }}
            >
              <ListItemIcon sx={{ minWidth: 38 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8, minWidth: 0 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
