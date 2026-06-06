import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import PageHeader from '../components/PageHeader.jsx';
import { api } from '../services/api.js';

export default function DashboardPage() {
  const [summary, setSummary] = useState({ monthlySpend: [] });

  useEffect(() => {
    api.get('/api/dashboard/summary').then(({ data }) => setSummary(data));
  }, []);

  const metrics = [
    ['Pending approvals', summary.pendingApprovals ?? 0],
    ['Active RFQs', summary.activeRfqs ?? 0],
    ['Vendors', summary.vendorCount ?? 0],
    ['Purchase orders', summary.purchaseOrders ?? 0],
    ['Invoices', summary.invoiceCount ?? 0]
  ];

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Live view of the RFQ to invoice pipeline." />
      <div className="page-grid">
        {metrics.map(([label, value]) => (
          <div className="metric-card" key={label}>
            <Typography color="text.secondary" variant="body2">{label}</Typography>
            <Typography variant="h4" sx={{ mt: 1 }}>{value}</Typography>
          </div>
        ))}
      </div>
      <Box className="data-card" sx={{ mt: 2, p: 2, height: 340 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Monthly Spending</Typography>
        <ResponsiveContainer width="100%" height="85%">
          <AreaChart data={summary.monthlySpend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="amount" stroke="#25636f" fill="#b8dfe4" />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </>
  );
}
