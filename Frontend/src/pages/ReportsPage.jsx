import { Box, Typography } from '@mui/material';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import { api } from '../services/api.js';

export default function ReportsPage() {
  const [vendors, setVendors] = useState([]);
  const [cost, setCost] = useState({});

  useEffect(() => {
    api.get('/api/reports/vendor-performance').then(({ data }) => setVendors(data));
    api.get('/api/reports/procurement-cost').then(({ data }) => setCost(data));
  }, []);

  return (
    <>
      <PageHeader title="Reports" subtitle="Vendor performance, procurement cost, spending trend, and approval metrics." />
      <div className="page-grid">
        <div className="metric-card">
          <Typography color="text.secondary">Quarter</Typography>
          <Typography variant="h5">{cost.quarter ?? 'Q2 2026'}</Typography>
        </div>
        <div className="metric-card">
          <Typography color="text.secondary">Actual spend</Typography>
          <Typography variant="h5">{cost.actual ?? 0}</Typography>
        </div>
        <div className="metric-card">
          <Typography color="text.secondary">Savings</Typography>
          <Typography variant="h5">{cost.savings ?? 0}</Typography>
        </div>
      </div>
      <Box className="data-card chart-card">
        <Typography className="chart-card-title">Vendor performance</Typography>
        <ResponsiveContainer width="100%" height="82%">
          <BarChart data={vendors} margin={{ top: 5, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid stroke="#e4ebe7" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="vendor" axisLine={false} tickLine={false} tick={{ fill: '#78857e', fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#78857e', fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="score" fill="#1b7a53" radius={[4, 4, 0, 0]} />
            <Bar dataKey="onTime" fill="#d6a251" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </>
  );
}
