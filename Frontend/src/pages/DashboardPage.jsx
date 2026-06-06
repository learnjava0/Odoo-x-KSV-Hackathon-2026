import { useEffect, useState } from 'react';
import {
  AssignmentTurnedInOutlined,
  DescriptionOutlined,
  GavelOutlined,
  Inventory2Outlined,
  ReceiptLongOutlined
} from '@mui/icons-material';
import { Box, Button, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import PageHeader from '../components/PageHeader.jsx';
import { api } from '../services/api.js';

export default function DashboardPage() {
  const [summary, setSummary] = useState({ monthlySpend: [] });

  useEffect(() => {
    api.get('/api/dashboard/summary').then(({ data }) => setSummary(data));
  }, []);

  const metrics = [
    { label: 'Active RFQs', value: summary.activeRfqs ?? 0, icon: <DescriptionOutlined />, note: 'Open sourcing events' },
    { label: 'Pending approvals', value: summary.pendingApprovals ?? 0, icon: <GavelOutlined />, note: 'Awaiting a decision' },
    { label: 'Active vendors', value: summary.vendorCount ?? 0, icon: <Inventory2Outlined />, note: 'In the vendor network' },
    { label: 'Purchase orders', value: summary.purchaseOrders ?? 0, icon: <AssignmentTurnedInOutlined />, note: 'Orders generated' },
    { label: 'Invoices', value: summary.invoiceCount ?? 0, icon: <ReceiptLongOutlined />, note: 'Documents processed' }
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="A live view of your request-to-payment pipeline."
        action={<Button component={Link} to="/rfqs" variant="contained">Manage RFQs</Button>}
      />
      <div className="page-grid">
        {metrics.map((metric) => (
          <div className="metric-card" key={metric.label}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
              <Typography color="text.secondary" variant="body2">{metric.label}</Typography>
              <Box sx={{ color: 'primary.main', display: 'flex' }}>{metric.icon}</Box>
            </Box>
            <Typography variant="h4" sx={{ mt: 1 }}>{metric.value}</Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5, fontSize: '0.72rem' }}>{metric.note}</Typography>
          </div>
        ))}
      </div>
      <Box className="data-card chart-card">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Box>
            <Typography className="chart-card-title">Monthly spending</Typography>
            <Typography color="text.secondary" sx={{ fontSize: '0.75rem', mt: -1.5, mb: 1.5 }}>
              Procurement spend across the current reporting period
            </Typography>
          </Box>
          <Button component={Link} to="/reports" size="small">View reports</Button>
        </Box>
        <ResponsiveContainer width="100%" height="78%">
          <AreaChart data={summary.monthlySpend} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2f966a" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#2f966a" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#e4ebe7" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#78857e', fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#78857e', fontSize: 12 }} />
            <Tooltip />
            <Area type="monotone" dataKey="amount" stroke="#1b7a53" strokeWidth={2.5} fill="url(#spendFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </>
  );
}
