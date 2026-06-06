import { CheckCircle, Cancel, Search, Add, Visibility } from '@mui/icons-material';
import {
  Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  Divider, IconButton, InputAdornment, Snackbar, Table, TableBody,
  TableCell, TableHead, TableRow, TextField, Tooltip, Typography
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { TableState } from '../components/DataStates.jsx';
import { ROLES } from '../config/access.js';
import { api } from '../services/api.js';

const STATUS_LABEL = { APPROVED: 'Active', PENDING: 'Pending', REJECTED: 'Blocked' };
const STATUS_COLOR = { APPROVED: '#2e7d32', PENDING: '#e65100', REJECTED: '#c62828' };
const STATUS_BG    = { APPROVED: '#e8f5e9', PENDING: '#fff3e0', REJECTED: '#ffebee' };

const TABS = [
  { label: 'All',     key: 'ALL' },
  { label: 'Active',  key: 'APPROVED' },
  { label: 'Pending', key: 'PENDING' },
  { label: 'Blocked', key: 'REJECTED' },
];

const EMPTY_VENDOR = { name: '', category: '', gstNumber: '', contactDetails: '', state: '', address: '' };

function VendorDetailDialog({ vendor, open, onClose }) {
  if (!vendor) return null;
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Vendor profile</DialogTitle>
      <DialogContent sx={{ display: 'grid', gap: 1.5, pt: '12px !important' }}>
        {[
          { label: 'Company name', val: vendor.name },
          { label: 'Category',     val: vendor.category },
          { label: 'GST number',   val: vendor.gstNumber || 'Not provided' },
          { label: 'Contact',      val: vendor.contactDetails || 'Not provided' },
          { label: 'State',        val: vendor.state || 'Not provided' },
          { label: 'Address',      val: vendor.address || 'Not provided' },
          { label: 'Rating',       val: vendor.rating ?? 'N/A' },
        ].map(({ label, val }) => (
          <Box key={label}>
            <Typography fontSize="0.72rem" color="text.secondary">{label}</Typography>
            <Typography fontSize="0.88rem" fontWeight={500}>{val}</Typography>
          </Box>
        ))}
        <Box>
          <Typography fontSize="0.72rem" color="text.secondary">Status</Typography>
          <Box sx={{ display: 'inline-block', mt: 0.5, px: 1.5, py: 0.3, borderRadius: 4,
            bgcolor: STATUS_BG[vendor.status] || '#f4f7f5', color: STATUS_COLOR[vendor.status] || '#555', fontWeight: 700, fontSize: '0.8rem' }}>
            {STATUS_LABEL[vendor.status] || vendor.status}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState([]);
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [working, setWorking] = useState(null);
  const [viewVendor, setViewVendor] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_VENDOR);
  const [addLoading, setAddLoading] = useState(false);
  const role = useSelector((state) => state.auth.user?.role);
  const isAdmin = role === ROLES.ADMIN;

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await api.get('/vendors', { params: { q: query || undefined } });
      setVendors(data);
    } catch {
      setError('The vendor directory could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    try {
      setWorking(id);
      await api.patch(`/vendors/${id}/status`, null, { params: { status } });
      setMessage(`Vendor ${STATUS_LABEL[status]?.toLowerCase() || status.toLowerCase()} successfully.`);
      load();
    } catch {
      setMessage('Status could not be updated.');
    } finally {
      setWorking(null);
    }
  };

  const addVendor = async () => {
    try {
      setAddLoading(true);
      // Register via auth signup as VENDOR role
      await api.post('/auth/signup', { ...addForm, role: 'VENDOR', password: 'vendor123' });
      setMessage('Vendor registered. They can log in with vendor123 as their initial password.');
      setAddOpen(false);
      setAddForm(EMPTY_VENDOR);
      load();
    } catch {
      setMessage('Vendor could not be registered. Check if email is already in use.');
    } finally {
      setAddLoading(false);
    }
  };

  const tabCounts = TABS.reduce((acc, t) => {
    acc[t.key] = t.key === 'ALL' ? vendors.length : vendors.filter((v) => v.status === t.key).length;
    return acc;
  }, {});

  const filtered = tab === 'ALL' ? vendors : vendors.filter((v) => v.status === tab);

  return (
    <>
      {/* Page header with title + Add Vendor button */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Vendors</Typography>
          <Typography color="text.secondary" fontSize="0.88rem">Manage supplier profiles and registrations</Typography>
        </Box>
        {isAdmin && (
          <Button variant="contained" startIcon={<Add />} onClick={() => setAddOpen(true)}>
            + Add Vendor
          </Button>
        )}
      </Box>

      <div className="data-card">
        {/* Full-width search bar */}
        <Box
          component="form"
          onSubmit={(e) => { e.preventDefault(); load(); }}
          sx={{ mb: 2 }}
        >
          <TextField
            fullWidth
            placeholder="Search bar … search by name, gst number, category…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                )
              }
            }}
          />
        </Box>

        {/* Filter tabs with counts */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          {TABS.map((t) => (
            <Chip
              key={t.key}
              label={`${t.label} ${tabCounts[t.key]}`}
              clickable
              variant={tab === t.key ? 'filled' : 'outlined'}
              color={tab === t.key ? 'primary' : 'default'}
              onClick={() => setTab(t.key)}
              size="small"
            />
          ))}
        </Box>

        <Divider sx={{ mb: 0 }} />

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Vendor Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>GST No.</TableCell>
              <TableCell>Contact no.</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableState
              loading={loading}
              error={error}
              empty={!filtered.length}
              colSpan={6}
              emptyTitle={query ? 'No vendors match this search' : 'No vendors available'}
              onRetry={load}
            />
            {filtered.map((vendor) => (
              <TableRow key={vendor.id} hover>
                <TableCell>
                  <Typography fontWeight={600} fontSize="0.88rem">{vendor.name}</Typography>
                  {vendor.user?.email && (
                    <Typography fontSize="0.72rem" color="text.secondary">{vendor.user.email}</Typography>
                  )}
                </TableCell>
                <TableCell>{vendor.category || '—'}</TableCell>
                <TableCell>{vendor.gstNumber || '—'}</TableCell>
                <TableCell>{vendor.contactDetails || '—'}</TableCell>
                <TableCell>
                  <Box sx={{
                    display: 'inline-block', px: 1.2, py: 0.2, borderRadius: 4,
                    bgcolor: STATUS_BG[vendor.status] || '#f4f7f5',
                    color: STATUS_COLOR[vendor.status] || '#555',
                    fontWeight: 700, fontSize: '0.76rem'
                  }}>
                    {STATUS_LABEL[vendor.status] || vendor.status}
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end', alignItems: 'center' }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Visibility fontSize="small" />}
                      onClick={() => setViewVendor(vendor)}
                    >
                      View
                    </Button>
                    {isAdmin && vendor.status !== 'APPROVED' && (
                      <Tooltip title="Approve vendor">
                        <IconButton size="small" color="success" disabled={working === vendor.id}
                          onClick={() => updateStatus(vendor.id, 'APPROVED')} aria-label={`Approve ${vendor.name}`}>
                          <CheckCircle fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    {isAdmin && vendor.status !== 'REJECTED' && (
                      <Tooltip title="Block vendor">
                        <IconButton size="small" color="error" disabled={working === vendor.id}
                          onClick={() => updateStatus(vendor.id, 'REJECTED')} aria-label={`Block ${vendor.name}`}>
                          <Cancel fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Vendor detail view dialog */}
      <VendorDetailDialog vendor={viewVendor} open={Boolean(viewVendor)} onClose={() => setViewVendor(null)} />

      {/* Add Vendor dialog (Admin only) */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add vendor</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 2, pt: '12px !important' }}>
          <TextField label="Company / vendor name" required value={addForm.name}
            onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} />
          <TextField label="Email (used for login)" required type="email" value={addForm.email || ''}
            onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} />
          <TextField label="Category" value={addForm.category}
            onChange={(e) => setAddForm({ ...addForm, category: e.target.value })} />
          <TextField label="GST number" value={addForm.gstNumber}
            onChange={(e) => setAddForm({ ...addForm, gstNumber: e.target.value })} />
          <TextField label="Contact number / details" value={addForm.contactDetails}
            onChange={(e) => setAddForm({ ...addForm, contactDetails: e.target.value })} />
          <TextField label="State" value={addForm.state}
            onChange={(e) => setAddForm({ ...addForm, state: e.target.value })} />
          <TextField label="Address" value={addForm.address} multiline minRows={2}
            onChange={(e) => setAddForm({ ...addForm, address: e.target.value })} />
          <Typography fontSize="0.76rem" color="text.secondary">
            Initial password will be set to <strong>vendor123</strong>. Vendor should change it on first login.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>Cancel</Button>
          <Button variant="contained" disabled={!addForm.name || !addForm.email || addLoading} onClick={addVendor}>
            {addLoading ? 'Registering…' : 'Register vendor'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={Boolean(message)} autoHideDuration={4000} onClose={() => setMessage('')} message={message} />
    </>
  );
}
