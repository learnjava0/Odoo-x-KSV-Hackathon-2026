import { Search } from '@mui/icons-material';
import { Box, Button, InputAdornment, LinearProgress, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { TableState } from '../components/DataStates.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { api } from '../services/api.js';

export default function VendorsPage() {
  const [vendors, setVendors] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await api.get('/api/vendors', { params: { q: query } });
      setVendors(data);
    } catch {
      setError('The vendor directory could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <>
      <PageHeader
        title="Vendor Management"
        subtitle="Search the approved vendor network and compare performance before RFQ assignment."
      />
      <div className="data-card">
        <Box className="table-toolbar">
          <Box>
            <Typography className="table-toolbar-title">Vendor directory</Typography>
            <Typography color="text.secondary" sx={{ fontSize: '.7rem' }}>{vendors.length} vendors available</Typography>
          </Box>
          <Box component="form" onSubmit={(event) => { event.preventDefault(); load(); }} sx={{ display: 'flex', gap: 1 }}>
            <TextField
              aria-label="Search vendors"
              placeholder="Name, company, or category"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              sx={{ width: { xs: 190, sm: 300 } }}
              InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
            />
            <Button type="submit" variant="outlined">Search</Button>
          </Box>
        </Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Company</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Score</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableState
              loading={loading}
              error={error}
              empty={!vendors.length}
              colSpan={6}
              emptyTitle={query ? 'No vendors match this search' : 'No vendors available'}
              onRetry={load}
            />
            {vendors.map((vendor) => (
              <TableRow key={vendor.id}>
                <TableCell>{vendor.vendorName}</TableCell>
                <TableCell>{vendor.companyName}</TableCell>
                <TableCell>{vendor.email}</TableCell>
                <TableCell>{vendor.category}</TableCell>
                <TableCell><Box component="span" sx={{ color: 'primary.main', fontWeight: 700 }}>{vendor.status}</Box></TableCell>
                <TableCell>
                  <Box className="score-cell">
                    <Box component="span">{vendor.performanceScore ?? 0}</Box>
                    <LinearProgress variant="determinate" value={Math.min(Number(vendor.performanceScore) || 0, 100)} />
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
