import { Add, RequestQuoteOutlined } from '@mui/icons-material';
import { Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Snackbar, Table, TableBody, TableCell, TableHead, TableRow, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { ROLES } from '../config/access.js';
import { TableState } from '../components/DataStates.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { api } from '../services/api.js';
import { formatDate } from '../utils/formatters.js';

export default function RfqsPage() {
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', productDetails: '', quantity: 1, deadline: '' });
  const [quoteRfq, setQuoteRfq] = useState(null);
  const [quoteForm, setQuoteForm] = useState({ price: '', deliveryTimeline: '', notes: '' });
  const role = useSelector((state) => state.auth.user?.role);

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await api.get('/rfqs');
      setRfqs(data);
    } catch {
      setError('RFQs could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const createRfq = async () => {
    try {
      await api.post('/rfqs', { ...form, quantity: Number(form.quantity) });
      setMessage('RFQ published and opened for vendor quotations.');
      setOpen(false);
      setForm({ title: '', productDetails: '', quantity: 1, deadline: '' });
      load();
    } catch {
      setMessage('RFQ could not be published. Check the form and try again.');
    }
  };

  const submitQuotation = async () => {
    try {
      await api.post(`/quotations/submit/${quoteRfq.id}`, {
        price: Number(quoteForm.price),
        deliveryTimeline: Number(quoteForm.deliveryTimeline),
        notes: quoteForm.notes
      });
      setMessage('Quotation submitted for procurement review.');
      setQuoteRfq(null);
      setQuoteForm({ price: '', deliveryTimeline: '', notes: '' });
      load();
    } catch {
      setMessage('Quotation could not be submitted. Confirm that your vendor profile is approved.');
    }
  };

  return (
    <>
      <PageHeader
        title="RFQ Management"
        subtitle="Published requests are immediately available for vendor quotation submission."
        action={role === ROLES.PROCUREMENT ? <Button startIcon={<Add />} variant="contained" onClick={() => setOpen(true)}>Publish RFQ</Button> : null}
      />
      <div className="data-card">
        <div className="table-toolbar">
          <div>
            <div className="table-toolbar-title">Sourcing requests</div>
            <div className="table-toolbar-description">Review open requests, quantities, deadlines, and lifecycle state.</div>
          </div>
        </div>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Product details</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Deadline</TableCell>
              <TableCell>Status</TableCell>
              {role === ROLES.VENDOR && <TableCell align="right">Action</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableState loading={loading} error={error} empty={!rfqs.length} colSpan={role === ROLES.VENDOR ? 6 : 5} emptyTitle="No RFQs have been created" onRetry={load} />
            {rfqs.map((rfq) => (
              <TableRow key={rfq.id}>
                <TableCell>{rfq.title}</TableCell>
                <TableCell>{rfq.productDetails}</TableCell>
                <TableCell>{rfq.quantity}</TableCell>
                <TableCell>{formatDate(rfq.deadline)}</TableCell>
                <TableCell><Chip size="small" label={rfq.status} /></TableCell>
                {role === ROLES.VENDOR && (
                  <TableCell align="right">
                    <Button
                      size="small"
                      startIcon={<RequestQuoteOutlined />}
                      disabled={!['PUBLISHED', 'UNDER_REVIEW'].includes(rfq.status)}
                      onClick={() => setQuoteRfq(rfq)}
                    >
                      Submit quote
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Publish procurement RFQ</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 2, pt: '12px !important' }}>
          <TextField label="Title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
          <TextField label="Product details" value={form.productDetails} onChange={(event) => setForm({ ...form, productDetails: event.target.value })} multiline minRows={3} required />
          <TextField label="Quantity" type="number" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} inputProps={{ min: 1 }} required />
          <TextField label="Deadline" type="date" value={form.deadline} onChange={(event) => setForm({ ...form, deadline: event.target.value })} InputLabelProps={{ shrink: true }} required />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={createRfq} disabled={!form.title || !form.productDetails || !form.deadline}>Publish RFQ</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={Boolean(quoteRfq)} onClose={() => setQuoteRfq(null)} fullWidth maxWidth="sm">
        <DialogTitle>Submit quotation for {quoteRfq?.title}</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 2, pt: '12px !important' }}>
          <TextField label="Unit price" type="number" value={quoteForm.price} onChange={(event) => setQuoteForm({ ...quoteForm, price: event.target.value })} inputProps={{ min: 0, step: 0.01 }} required />
          <TextField label="Delivery timeline (days)" type="number" value={quoteForm.deliveryTimeline} onChange={(event) => setQuoteForm({ ...quoteForm, deliveryTimeline: event.target.value })} inputProps={{ min: 1 }} required />
          <TextField label="Notes" value={quoteForm.notes} onChange={(event) => setQuoteForm({ ...quoteForm, notes: event.target.value })} multiline minRows={3} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQuoteRfq(null)}>Cancel</Button>
          <Button variant="contained" onClick={submitQuotation} disabled={!quoteForm.price || !quoteForm.deliveryTimeline}>Submit quotation</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={Boolean(message)} autoHideDuration={3500} onClose={() => setMessage('')} message={message} />
    </>
  );
}
