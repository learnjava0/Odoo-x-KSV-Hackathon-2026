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
import AnimatedNumber from '../components/AnimatedNumber.jsx';
import ChartTooltip from '../components/ChartTooltip.jsx';
import { StateContent } from '../components/DataStates.jsx';
import PageHeader from '../components/PageHeader.jsx';
import WorkflowTracker from '../components/WorkflowTracker.jsx';
import { api } from '../services/api.js';

export default function DashboardPage() {
  const [summary, setSummary] = useState({ monthlySpend: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await api.get('/analytics/dashboard');
      const monthlySpend = (data.recentInvoices || []).map((invoice) => ({
        month: invoice.invoiceNumber,
        amount: invoice.totalAmount
      }));
      setSummary({
        monthlySpend,
        pendingApprovals: data.pendingApprovals,
        activeRfqs: data.activeRfqs,
        vendorCount: data.totalVendors,
        purchaseOrders: data.recentPurchaseOrders?.length ?? 0,
        invoiceCount: data.recentInvoices?.length ?? 0,
        quotationCount: data.pendingApprovals
      });
    } catch {
      setError('Check that the API is running, then try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

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
        {metrics.map((metric, index) => (
          <div className="metric-card stagger-enter" key={metric.label} style={{ '--enter-delay': `${index * 70}ms` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
              <Typography color="text.secondary" variant="body2">{metric.label}</Typography>
              <Box className="metric-icon">{metric.icon}</Box>
            </Box>
            <Typography variant="h4" sx={{ mt: 1 }}><AnimatedNumber value={metric.value} /></Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5, fontSize: '0.72rem' }}>{metric.note}</Typography>
          </div>
        ))}
      </div>
      <WorkflowTracker summary={summary} />
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
        {loading || error || !summary.monthlySpend.length ? (
          <StateContent
            loading={loading}
            error={error}
            onRetry={load}
            title="No spending history yet"
            description="Monthly spend will be charted after purchase orders and invoices are created."
          />
        ) : (
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
              <Tooltip content={<ChartTooltip currency />} cursor={{ stroke: '#a9cdb9', strokeDasharray: '4 4' }} />
              <Area
                type="monotone"
                dataKey="amount"
                name="Spend"
                stroke="#1b7a53"
                strokeWidth={2.5}
                fill="url(#spendFill)"
                animationDuration={900}
                activeDot={{ r: 5, strokeWidth: 3, stroke: '#dff3e7', fill: '#1b7a53' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Box>
    </>
  );
}
