import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { Route, Routes } from 'react-router-dom';
import AppLayout from './layouts/AppLayout.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import VendorsPage from './pages/VendorsPage.jsx';
import RfqsPage from './pages/RfqsPage.jsx';
import QuotationsPage from './pages/QuotationsPage.jsx';
import ApprovalsPage from './pages/ApprovalsPage.jsx';
import DocumentsPage from './pages/DocumentsPage.jsx';
import NotificationsPage from './pages/NotificationsPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1b7a53', dark: '#155c43', contrastText: '#ffffff' },
    secondary: { main: '#b77720' },
    background: { default: '#f4f7f5', paper: '#ffffff' },
    text: { primary: '#17211d', secondary: '#6d7a73' }
  },
  shape: { borderRadius: 9 },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    h4: { fontWeight: 800 },
    h6: { fontWeight: 800 },
    button: { fontWeight: 700, textTransform: 'none' }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { boxShadow: 'none', borderRadius: 8 },
        contained: { '&:hover': { boxShadow: 'none' } }
      }
    },
    MuiTextField: {
      defaultProps: { size: 'small' }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { background: '#fff' }
      }
    },
    MuiTooltip: {
      defaultProps: { arrow: true }
    }
  }
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/vendors" element={<VendorsPage />} />
            <Route path="/rfqs" element={<RfqsPage />} />
            <Route path="/quotations" element={<QuotationsPage />} />
            <Route path="/approvals" element={<ApprovalsPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
          </Route>
        </Route>
      </Routes>
    </ThemeProvider>
  );
}
