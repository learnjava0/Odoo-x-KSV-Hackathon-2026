import { Box, Button, Typography } from '@mui/material';
import { FileDownloadOutlined } from '@mui/icons-material';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useEffect, useState } from 'react';
import AnimatedNumber from '../components/AnimatedNumber.jsx';
import ChartTooltip from '../components/ChartTooltip.jsx';
import { StateContent } from '../components/DataStates.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { api } from '../services/api.js';
import { formatCurrency } from '../utils/formatters.js';

const COLORED_CARDS = [
  { key: 'actual',       label: 'Total spend',          color: '#e8f5e9', textColor: '#1b5e20', formatter: formatCurrency },
  { key: 'vendorCount',  label: 'Active vendors',        color: '#e3f2fd', textColor: '#0d47a1', formatter: (v) => v },
  { key: 'poCount',      label: 'Active spend',          color: '#fff8e1', textColor: '#e65100', formatter: (v) => v },
  { key: 'invoiceCount', label: 'Confirmed invoices',    color: '#fce4ec', textColor: '#880e4f', formatter: (v) => v },
];

export default function ReportsPage() {
  const [chartData, setChartData] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const currentMonth = new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' });

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await api.get('/analytics/dashboard');
      setChartData((data.recentInvoices || []).map((invoice) => ({
        vendor: invoice.invoiceNumber,
        base: invoice.totalAmount - invoice.taxAmount,
        tax: invoice.taxAmount ?? 0
      })));
      setStats({
        actual: data.totalSpent,
        vendorCount: data.totalVendors,
        poCount: data.recentPurchaseOrders?.length ?? 0,
        invoiceCount: data.recentInvoices?.length ?? 0
      });
    } catch {
      setError('Reporting data is temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const exportCsv = () => {
    const rows = [
      ['Invoice', 'Base amount', 'Tax'],
      ...chartData.map((d) => [d.vendor, d.base, d.tax])
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'procurement-report.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <PageHeader
        title="Reports & Analytics"
        subtitle={`Procurement insights · ${currentMonth}`}
        action={
          <Button variant="outlined" startIcon={<FileDownloadOutlined />} onClick={exportCsv}>
            Export
          </Button>
        }
      />

      {/* 4 colored metric cards matching wireframe */}
      <div className="page-grid">
        {COLORED_CARDS.map((card, i) => (
          <div
            className="metric-card stagger-enter"
            key={card.key}
            style={{ '--enter-delay': `${i * 70}ms`, background: card.color, border: 'none' }}
          >
            <Typography color="text.secondary" fontSize="0.78rem">{card.label}</Typography>
            <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5, color: card.textColor }}>
              <AnimatedNumber value={stats[card.key] ?? 0} formatter={card.formatter} />
            </Typography>
          </div>
        ))}
      </div>

      {/* Invoice composition bar chart */}
      <Box className="data-card chart-card">
        <Box className="section-heading">
          <Box>
            <Typography className="chart-card-title">Invoice composition</Typography>
            <Typography className="section-subtitle">Base amount vs tax per invoice</Typography>
          </Box>
          <Box className="chart-legend">
            <span className="score" /> Base
            <span className="delivery" /> Tax
          </Box>
        </Box>
        {loading || error || !chartData.length ? (
          <StateContent
            loading={loading}
            error={error}
            onRetry={load}
            title="No invoice analytics yet"
            description="Invoice totals will appear after a manager approves a quotation."
          />
        ) : (
          <ResponsiveContainer width="100%" height="76%">
            <BarChart data={chartData} margin={{ top: 12, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid stroke="#e4ebe7" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="vendor" axisLine={false} tickLine={false} tick={{ fill: '#78857e', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#78857e', fontSize: 11 }} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f2f7f4' }} />
              <Bar dataKey="base" name="Base amount" fill="#1b7a53" radius={[4, 4, 0, 0]} animationDuration={800} />
              <Bar dataKey="tax" name="Tax" fill="#d6a251" radius={[4, 4, 0, 0]} animationDuration={1000} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Box>
    </>
  );
}
