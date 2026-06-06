import { useEffect, useState } from 'react';
import {
  AssignmentTurnedInOutlined,
  DescriptionOutlined,
  GavelOutlined,
  Inventory2Outlined,
  ReceiptLongOutlined,
  AddOutlined,
  PersonAddOutlined
} from '@mui/icons-material';
import { Box, Button, Chip, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import AnimatedNumber from '../components/AnimatedNumber.jsx';
import ChartTooltip from '../components/ChartTooltip.jsx';
import { StateContent } from '../components/DataStates.jsx';
import WorkflowTracker from '../components/WorkflowTracker.jsx';
import { api } from '../services/api.js';
import { useSelector } from 'react-redux';
import { formatCurrency } from '../utils/formatters.js';

export default function DashboardPage() {
  const [summary, setSummary] = useState({ monthlySpend: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = useSelector((state) => state.auth.user);

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await api.get('/analytics/dashboard');
      const monthlySpend = (data.recentPurchaseOrders || []).map((po) => ({
        month: po.poNumber?.split('-').slice(-1)[0] || po.id,
        amount: po.totalAmount
      }));
      setSummary({
        monthlySpend,
        pendingApprovals: data.pendingApprovals,
        activeRfqs: data.activeRfqs,
        vendorCount: data.totalVendors,
        totalSpent: data.totalSpent,
        purchaseOrders: data.recentPurchaseOrders?.length ?? 0,
        invoiceCount: data.recentInvoices?.length ?? 0,
        recentActivities: data.recentActivities || []
      });
    } catch {
      setError('Check that the API is running, then try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const metrics = [
    { label: 'Active RFQs', value: summary.activeRfqs ?? 0, icon: <DescriptionOutlined />, note: 'Open sourcing events', color: '#e8f5e9' },
    { label: 'Pending approvals', value: summary.pendingApprovals ?? 0, icon: <GavelOutlined />, note: 'Awaiting a decision', color: '#fff8e1' },
    { label: 'Active vendors', value: summary.vendorCount ?? 0, icon: <Inventory2Outlined />, note: 'In the vendor network', color: '#e3f2fd' },
    { label: 'Purchase orders', value: summary.purchaseOrders ?? 0, icon: <AssignmentTurnedInOutlined />, note: 'Orders generated', color: '#fce4ec' },
    { label: 'Invoices', value: summary.invoiceCount ?? 0, icon: <ReceiptLongOutlined />, note: 'Documents processed', color: '#f3e5f5' }
  ];

  const quickActions = [
    { label: 'New RFQ', icon: <AddOutlined />, to: '/rfqs' },
    { label: 'Add Vendor', icon: <PersonAddOutlined />, to: '/vendors' },
    { label: 'Approvals', icon: <GavelOutlined />, to: '/approvals' },
  ];

  return (
    <>
      {/* Greeting header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={800}>
          Welcome back, {user?.name || 'User'} 👋
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5, fontSize: '0.9rem' }}>
          Today's overview · {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </Typography>
      </Box>

      {/* Quick actions */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
        {quickActions.map((action) => (
          <Button
            key={action.label}
            variant="outlined"
            startIcon={action.icon}
            component={Link}
            to={action.to}
            sx={{ borderRadius: 2, fontWeight: 600 }}
          >
            {action.label}
          </Button>
        ))}
      </Box>

      {/* Metric cards */}
      <div className="page-grid">
        {metrics.map((metric, index) => (
          <div className="metric-card stagger-enter" key={metric.label} style={{ '--enter-delay': `${index * 70}ms` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
              <Typography color="text.secondary" variant="body2">{metric.label}</Typography>
              <Box className="metric-icon" sx={{ background: metric.color }}>{metric.icon}</Box>
            </Box>
            <Typography variant="h4" sx={{ mt: 1 }}><AnimatedNumber value={metric.value} /></Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5, fontSize: '0.72rem' }}>{metric.note}</Typography>
          </div>
        ))}
      </div>

      {/* Workflow tracker */}
      <WorkflowTracker summary={summary} />

      {/* Spending chart + recent activity side by side */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 360px' }, gap: 2 }}>
        <Box className="data-card chart-card">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Box>
              <Typography className="chart-card-title">Spending trend</Typography>
              <Typography color="text.secondary" sx={{ fontSize: '0.75rem', mt: 0.3, mb: 1 }}>
                Total committed: <strong>{formatCurrency(summary.totalSpent)}</strong>
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
              description="Spend will appear after purchase orders are generated."
            />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={summary.monthlySpend} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2f966a" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2f966a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#e4ebe7" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#78857e', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#78857e', fontSize: 11 }} />
                <Tooltip content={<ChartTooltip currency />} cursor={{ stroke: '#a9cdb9', strokeDasharray: '4 4' }} />
                <Area type="monotone" dataKey="amount" name="Spend" stroke="#1b7a53" strokeWidth={2.5}
                  fill="url(#spendFill)" animationDuration={900}
                  activeDot={{ r: 5, strokeWidth: 3, stroke: '#dff3e7', fill: '#1b7a53' }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Box>

        {/* Recent activity */}
        <Box className="data-card" sx={{ display: 'flex', flexDirection: 'column', p: 2.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography fontWeight={800} fontSize="0.95rem">Recent activity</Typography>
            <Button component={Link} to="/notifications" size="small" sx={{ color: 'primary.main', fontWeight: 700 }}>View all</Button>
          </Box>
          {!summary.recentActivities?.length ? (
            <Typography color="text.secondary" fontSize="0.8rem" sx={{ mt: 2 }}>No activity yet.</Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {summary.recentActivities.slice(0, 6).map((item, i) => (
                <Box key={item.id} sx={{
                  display: 'flex', gap: 1.5, alignItems: 'flex-start',
                  py: 1.4,
                  borderBottom: i < Math.min(summary.recentActivities.length, 6) - 1 ? '1px solid #f0f4f2' : 'none'
                }}>
                  <Box sx={{
                    width: 10, height: 10, mt: '4px', borderRadius: '50%', flexShrink: 0,
                    bgcolor: '#1b7a53', boxShadow: '0 0 0 3px #d8f0e5'
                  }} />
                  <Box>
                    <Typography fontSize="0.8rem" fontWeight={700} lineHeight={1.3} sx={{ color: '#1b4a34' }}>
                      {item.eventType?.replaceAll('_', ' ')}
                    </Typography>
                    <Typography fontSize="0.71rem" color="text.secondary" sx={{ mt: 0.2 }}>
                      {item.actorName} · {new Date(item.timestamp).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
}
