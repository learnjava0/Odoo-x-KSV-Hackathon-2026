import { Box, Typography } from '@mui/material';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useEffect, useState } from 'react';
import AnimatedNumber from '../components/AnimatedNumber.jsx';
import ChartTooltip from '../components/ChartTooltip.jsx';
import { StateContent } from '../components/DataStates.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { api } from '../services/api.js';
import { formatCurrency } from '../utils/formatters.js';

export default function ReportsPage() {
  const [vendors, setVendors] = useState([]);
  const [cost, setCost] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await api.get('/analytics/dashboard');
      setVendors((data.recentInvoices || []).map((invoice) => ({
        vendor: invoice.invoiceNumber,
        score: invoice.purchaseOrder?.totalAmount ?? 0,
        onTime: invoice.taxAmount ?? 0
      })));
      setCost({
        quarter: 'Current',
        actual: data.totalSpent,
        savings: 0
      });
    } catch {
      setError('Reporting data is temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <>
      <PageHeader title="Reports" subtitle="Procurement spend and recent invoice totals from backend analytics." />
      <div className="page-grid">
        <div className="metric-card stagger-enter">
          <Typography color="text.secondary">Quarter</Typography>
          <Typography variant="h5">{cost.quarter ?? 'Q2 2026'}</Typography>
          <Typography className="metric-context">Current reporting period</Typography>
        </div>
        <div className="metric-card stagger-enter" style={{ '--enter-delay': '70ms' }}>
          <Typography color="text.secondary">Actual spend</Typography>
          <Typography variant="h5"><AnimatedNumber value={cost.actual} formatter={formatCurrency} /></Typography>
          <Typography className="metric-context">Committed procurement cost</Typography>
        </div>
        <div className="metric-card stagger-enter" style={{ '--enter-delay': '140ms' }}>
          <Typography color="text.secondary">Savings</Typography>
          <Typography variant="h5"><AnimatedNumber value={cost.savings} formatter={formatCurrency} /></Typography>
          <Typography className="metric-context">Not calculated by the current backend</Typography>
        </div>
      </div>
      <Box className="data-card chart-card">
        <Box className="section-heading">
          <Box>
            <Typography className="chart-card-title">Recent invoice composition</Typography>
            <Typography className="section-subtitle">Compare purchase-order base amount with calculated tax.</Typography>
          </Box>
          <Box className="chart-legend">
            <span className="score" /> Base amount
            <span className="delivery" /> Tax
          </Box>
        </Box>
        {loading || error || !vendors.length ? (
          <StateContent
            loading={loading}
            error={error}
            onRetry={load}
            title="No invoice analytics yet"
            description="Invoice totals will appear after a manager approves a quotation."
          />
        ) : (
          <ResponsiveContainer width="100%" height="76%">
            <BarChart data={vendors} margin={{ top: 12, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid stroke="#e4ebe7" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="vendor" axisLine={false} tickLine={false} tick={{ fill: '#78857e', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#78857e', fontSize: 12 }} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f2f7f4' }} />
              <Bar dataKey="score" name="Base amount" fill="#1b7a53" radius={[4, 4, 0, 0]} animationDuration={800} />
              <Bar dataKey="onTime" name="Tax" fill="#d6a251" radius={[4, 4, 0, 0]} animationDuration={1000} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Box>
    </>
  );
}
