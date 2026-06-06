import { Add, Search } from '@mui/icons-material';
import { Box, Button, InputAdornment, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import { api } from '../services/api.js';

export default function VendorsPage() {
  const [vendors, setVendors] = useState([]);
  const [query, setQuery] = useState('');

  const load = () => api.get('/api/vendors', { params: { q: query } }).then(({ data }) => setVendors(data));
  useEffect(() => { load(); }, []);

  return (
    <>
      <PageHeader
        title="Vendor Management"
        subtitle="Create, search, and score vendors for RFQ assignment."
        action={<Button startIcon={<Add />} variant="contained">New Vendor</Button>}
      />
      <div className="data-card">
        <Box className="table-toolbar">
          <Box>
            <Typography className="table-toolbar-title">Vendor directory</Typography>
            <Typography color="text.secondary" sx={{ fontSize: '.7rem' }}>{vendors.length} vendors available</Typography>
          </Box>
          <TextField
            placeholder="Search name, company, or category"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load()}
            sx={{ width: { xs: 210, sm: 320 } }}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
          />
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
            {vendors.map((vendor) => (
              <TableRow key={vendor.id}>
                <TableCell>{vendor.vendorName}</TableCell>
                <TableCell>{vendor.companyName}</TableCell>
                <TableCell>{vendor.email}</TableCell>
                <TableCell>{vendor.category}</TableCell>
                <TableCell><Box component="span" sx={{ color: 'primary.main', fontWeight: 700 }}>{vendor.status}</Box></TableCell>
                <TableCell><Box component="span" sx={{ fontWeight: 800 }}>{vendor.performanceScore}</Box></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
