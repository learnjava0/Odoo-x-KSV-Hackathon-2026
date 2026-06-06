import {
  Add, ArrowBack, Close, CloudUploadOutlined, RequestQuoteOutlined
} from '@mui/icons-material';
import {
  Box, Button, Chip, Divider, MenuItem, Snackbar,
  Table, TableBody, TableCell, TableHead, TableRow,
  TextField, Typography
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { ROLES } from '../config/access.js';
import { TableState } from '../components/DataStates.jsx';
import { api } from '../services/api.js';
import { formatCurrency, formatDate } from '../utils/formatters.js';

const GST_RATE = 0.18;

/* ────────────────────────────────────────────────────────
   Stepper (shared)
──────────────────────────────────────────────────────── */
function Stepper({ step }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
      {[1, 2, 3].map((n, i) => (
        <Box key={n} sx={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 'none' }}>
          <Box sx={{
            width: 36, height: 36, borderRadius: '50%', display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontWeight: 700,
            fontSize: '0.9rem', flexShrink: 0,
            bgcolor: step >= n ? 'primary.main' : '#e8f0ec',
            color: step >= n ? '#fff' : 'text.secondary',
            border: step === n ? '3px solid #a8d5bc' : 'none',
          }}>
            {n}
          </Box>
          {i < 2 && (
            <Box sx={{ flex: 1, height: 2, bgcolor: step > n ? 'primary.main' : '#dde8e2', mx: 1 }} />
          )}
        </Box>
      ))}
    </Box>
  );
}

/* ────────────────────────────────────────────────────────
   Create RFQ — full-page form (Screen 5)
──────────────────────────────────────────────────────── */
function CreateRfqView({ vendors, onCancel, onCreated, onMessage }) {
  const [form, setForm] = useState({ title: '', category: '', deadline: '', description: '' });
  const [lineItems, setLineItems] = useState([{ item: '', qty: '', unit: 'NOS' }]);
  const [assignedVendors, setAssignedVendors] = useState([]);
  const [vendorInput, setVendorInput] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const addLineItem = () => setLineItems((l) => [...l, { item: '', qty: '', unit: 'NOS' }]);
  const removeLineItem = (i) => setLineItems((l) => l.filter((_, idx) => idx !== i));
  const setLineField = (i, k, v) => setLineItems((l) => l.map((row, idx) => idx === i ? { ...row, [k]: v } : row));

  const addVendor = (v) => {
    if (!assignedVendors.find((a) => a.id === v.id)) setAssignedVendors((a) => [...a, v]);
    setVendorInput('');
  };
  const removeVendor = (id) => setAssignedVendors((a) => a.filter((v) => v.id !== id));

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) setAttachment(file);
  };

  const submit = async (publish) => {
    try {
      setSaving(true);
      let attachmentName = null;
      if (attachment) {
        const fd = new FormData();
        fd.append('file', attachment);
        const { data } = await api.post('/rfqs/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        attachmentName = data;
      }
      const productDetails = lineItems.filter((l) => l.item)
        .map((l) => `${l.item} × ${l.qty || 1} ${l.unit}`).join('; ') || form.description;
      const totalQty = lineItems.reduce((s, l) => s + (Number(l.qty) || 0), 0) || 1;

      await api.post('/rfqs', {
        title: form.title, productDetails: productDetails || form.description,
        quantity: totalQty, deadline: form.deadline,
        attachmentName, assignedVendorIds: assignedVendors.map((v) => v.id),
      });
      onMessage(publish ? 'RFQ saved and sent to vendors.' : 'RFQ saved as draft.');
      onCreated();
    } catch {
      onMessage('RFQ could not be saved. Check the form and try again.');
    } finally {
      setSaving(false);
    }
  };

  const filteredVendors = vendors.filter(
    (v) => !assignedVendors.find((a) => a.id === v.id) &&
      (vendorInput === '' || v.name.toLowerCase().includes(vendorInput.toLowerCase()))
  );
  const isValid = form.title && form.deadline;

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
        <Button startIcon={<ArrowBack />} onClick={onCancel} sx={{ mr: 1 }}>Back</Button>
        <Box>
          <Typography variant="h5" fontWeight={800}>Create RFQ's</Typography>
          <Typography color="text.secondary" fontSize="0.88rem">new request for quotation</Typography>
        </Box>
      </Box>
      <Stepper step={1} />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        {/* Left */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box>
            <Typography fontSize="0.78rem" fontWeight={600} sx={{ mb: 0.5 }}>RFQ's title <Box component="span" color="error.main">*</Box></Typography>
            <TextField fullWidth size="small" placeholder="Office Furniture procurement Q 2" value={form.title} onChange={(e) => setField('title', e.target.value)} />
          </Box>
          <Box>
            <Typography fontSize="0.78rem" fontWeight={600} sx={{ mb: 0.5 }}>Category</Typography>
            <TextField fullWidth size="small" placeholder="Furniture" value={form.category} onChange={(e) => setField('category', e.target.value)} />
          </Box>
          <Box>
            <Typography fontSize="0.78rem" fontWeight={600} sx={{ mb: 0.5 }}>Deadline <Box component="span" color="error.main">*</Box></Typography>
            <TextField fullWidth size="small" type="date" value={form.deadline} onChange={(e) => setField('deadline', e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
          </Box>
          <Box>
            <Typography fontSize="0.78rem" fontWeight={600} sx={{ mb: 0.5 }}>Description</Typography>
            <TextField fullWidth size="small" multiline minRows={4} placeholder="Ergonomic chairs and standing desks for 3rd floor" value={form.description} onChange={(e) => setField('description', e.target.value)} />
          </Box>
        </Box>

        {/* Right */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Line items */}
          <Box>
            <Typography fontSize="0.78rem" fontWeight={600} sx={{ mb: 1 }}>Line items</Typography>
            <Box sx={{ border: '1px solid #dde8e2', borderRadius: 1.5, overflow: 'hidden' }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 60px 70px 32px', px: 1.5, py: 0.8, bgcolor: '#f4f7f5' }}>
                {['Item', 'Qty', 'Unit', ''].map((h) => (
                  <Typography key={h} fontSize="0.72rem" fontWeight={700} color="text.secondary">{h}</Typography>
                ))}
              </Box>
              <Divider />
              {lineItems.map((row, i) => (
                <Box key={i} sx={{ display: 'grid', gridTemplateColumns: '1fr 60px 70px 32px', gap: 1, px: 1.5, py: 0.8, alignItems: 'center' }}>
                  <TextField size="small" variant="standard" placeholder="Ergonomic chair" value={row.item} onChange={(e) => setLineField(i, 'item', e.target.value)} sx={{ '& .MuiInput-underline:before': { borderColor: 'transparent' } }} />
                  <TextField size="small" variant="standard" type="number" placeholder="25" value={row.qty} onChange={(e) => setLineField(i, 'qty', e.target.value)} sx={{ '& .MuiInput-underline:before': { borderColor: 'transparent' } }} />
                  <TextField size="small" variant="standard" select value={row.unit} onChange={(e) => setLineField(i, 'unit', e.target.value)}>
                    {['NOS', 'KG', 'MTR', 'LTR', 'BOX', 'SET'].map((u) => <MenuItem key={u} value={u}>{u}</MenuItem>)}
                  </TextField>
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    {lineItems.length > 1 && (
                      <Box component="button" onClick={() => removeLineItem(i)} sx={{ border: 'none', background: 'none', cursor: 'pointer', color: 'text.secondary', p: 0, display: 'flex' }}>
                        <Close fontSize="small" />
                      </Box>
                    )}
                  </Box>
                </Box>
              ))}
              <Divider />
              <Box sx={{ px: 1.5, py: 0.8 }}>
                <Button size="small" startIcon={<Add />} onClick={addLineItem} sx={{ fontSize: '0.76rem' }}>+ add line item</Button>
              </Box>
            </Box>
          </Box>

          {/* Assign vendors */}
          <Box>
            <Typography fontSize="0.78rem" fontWeight={700} sx={{ mb: 1, letterSpacing: '0.05em' }}>ASSIGN VENDORS</Typography>
            <Box sx={{ border: '1px solid #dde8e2', borderRadius: 1.5, p: 1.5 }}>
              {assignedVendors.map((v) => (
                <Box key={v.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 0.4 }}>
                  <Typography fontSize="0.84rem">{v.name}</Typography>
                  <Box component="button" onClick={() => removeVendor(v.id)} sx={{ border: 'none', background: 'none', cursor: 'pointer', color: 'text.secondary', display: 'flex', p: 0 }}><Close fontSize="small" /></Box>
                </Box>
              ))}
              <TextField fullWidth size="small" variant="standard" placeholder="+ add vendor" value={vendorInput} onChange={(e) => setVendorInput(e.target.value)} sx={{ mt: assignedVendors.length ? 0.5 : 0, '& .MuiInput-underline:before': { borderColor: '#dde8e2' } }} />
              {vendorInput && filteredVendors.length > 0 && (
                <Box sx={{ border: '1px solid #dde8e2', borderRadius: 1, mt: 0.5, maxHeight: 140, overflow: 'auto', bgcolor: '#fff' }}>
                  {filteredVendors.map((v) => (
                    <Box key={v.id} onClick={() => addVendor(v)} sx={{ px: 1.5, py: 0.8, cursor: 'pointer', fontSize: '0.84rem', '&:hover': { bgcolor: '#f4f7f5' } }}>
                      {v.name} <Typography component="span" fontSize="0.72rem" color="text.secondary">— {v.category}</Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, alignItems: 'start' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Button variant="outlined" onClick={() => submit(true)} disabled={!isValid || saving} sx={{ justifyContent: 'flex-start', px: 3, py: 1.2, borderRadius: 1.5 }}>Save &amp; Send to Vendors</Button>
          <Button variant="outlined" color="inherit" onClick={() => submit(false)} disabled={!isValid || saving} sx={{ justifyContent: 'flex-start', px: 3, py: 1.2, borderRadius: 1.5 }}>Save as Draft</Button>
        </Box>
        <Box>
          <Typography fontSize="0.78rem" fontWeight={600} sx={{ mb: 0.5 }}>Attachments</Typography>
          <input ref={fileRef} type="file" style={{ display: 'none' }} accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg" onChange={(e) => setAttachment(e.target.files[0] || null)} />
          <Box onClick={() => fileRef.current.click()} onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop}
            sx={{ border: `2px dashed ${dragOver ? '#1b7a53' : '#b0c9bc'}`, borderRadius: 2, p: 3, textAlign: 'center', cursor: 'pointer', bgcolor: dragOver ? '#e8f5e9' : '#fafcfb', transition: 'all 0.2s', '&:hover': { borderColor: '#1b7a53', bgcolor: '#f0f8f4' } }}>
            <CloudUploadOutlined sx={{ fontSize: 32, color: '#78857e', mb: 1 }} />
            {attachment
              ? <Box><Typography fontSize="0.84rem" fontWeight={600}>{attachment.name}</Typography><Typography fontSize="0.72rem" color="text.secondary">{(attachment.size / 1024).toFixed(1)} KB</Typography></Box>
              : <Typography fontSize="0.84rem" color="text.secondary">Drag &amp; drop files or click to upload</Typography>}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

/* ────────────────────────────────────────────────────────
   Submit Quotation — full-page form (Screen 6)
──────────────────────────────────────────────────────── */
function SubmitQuotationView({ rfq, onCancel, onSubmitted, onMessage }) {
  const [lineItems, setLineItems] = useState([
    { item: '', qty: '', unitPrice: '', deliveryDays: '' }
  ]);
  const [notes, setNotes] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('Net 30 days net');
  const [saving, setSaving] = useState(false);

  const setLineField = (i, k, v) =>
    setLineItems((rows) => rows.map((r, idx) => idx === i ? { ...r, [k]: v } : r));
  const addRow = () => setLineItems((r) => [...r, { item: '', qty: '', unitPrice: '', deliveryDays: '' }]);
  const removeRow = (i) => setLineItems((r) => r.filter((_, idx) => idx !== i));

  // Calculations
  const subtotal = lineItems.reduce((s, r) => s + (Number(r.qty) || 0) * (Number(r.unitPrice) || 0), 0);
  const gst = subtotal * GST_RATE;
  const grandTotal = subtotal + gst;

  // For API: use lowest delivery days entered, or first row
  const deliveryTimeline = lineItems.reduce((min, r) => {
    const d = Number(r.deliveryDays);
    return d > 0 && d < min ? d : min;
  }, 999) || 1;
  const avgUnitPrice = lineItems.length ? subtotal / lineItems.reduce((s, r) => s + (Number(r.qty) || 1), 0) : 0;
  const combinedNotes = [notes, paymentTerms ? `Payment terms: ${paymentTerms}` : ''].filter(Boolean).join(' | ');

  const submit = async (draft = false) => {
    if (draft) { onMessage('Quotation saved as draft.'); onCancel(); return; }
    try {
      setSaving(true);
      await api.post(`/quotations/submit/${rfq.id}`, {
        price: Number(avgUnitPrice.toFixed(2)) || subtotal,
        deliveryTimeline,
        notes: combinedNotes,
      });
      onMessage('Quotation submitted for procurement review.');
      onSubmitted();
    } catch {
      onMessage('Quotation could not be submitted. Confirm your vendor profile is approved.');
    } finally {
      setSaving(false);
    }
  };

  // Parse RFQ productDetails into a summary string
  const rfqSummary = rfq.productDetails || rfq.title;

  return (
    <Box sx={{ maxWidth: 860, mx: 'auto' }}>
      {/* Back + heading */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
        <Button startIcon={<ArrowBack />} onClick={onCancel} sx={{ mr: 1 }}>Back</Button>
        <Box>
          <Typography variant="h5" fontWeight={800}>Submit Quotations</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 0.3, alignItems: 'center' }}>
            <Typography color="text.secondary" fontSize="0.85rem">
              RFQ: <strong>{rfq.title}</strong>
            </Typography>
            <Typography color="text.secondary" fontSize="0.85rem">
              - deadline <strong>{formatDate(rfq.deadline)}</strong>
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ mt: 2 }}>
        {/* RFQ Summary banner */}
        <Box sx={{ border: '1px solid #dde8e2', borderRadius: 1.5, px: 2, py: 1.2, mb: 2.5, bgcolor: '#fafcfb' }}>
          <Typography fontSize="0.72rem" fontWeight={700} color="text.secondary" sx={{ mb: 0.3 }}>RFQ Summary</Typography>
          <Typography fontSize="0.84rem">{rfqSummary}</Typography>
        </Box>

        {/* Your Quotation label */}
        <Typography fontSize="0.82rem" fontWeight={700} sx={{ mb: 1 }}>Your Quotation</Typography>

        {/* Line items table */}
        <Box sx={{ border: '1px solid #dde8e2', borderRadius: 1.5, overflow: 'hidden', mb: 2 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 80px 100px 100px 90px 32px', px: 1.5, py: 0.8, bgcolor: '#f4f7f5' }}>
            {['Item', 'Qty', 'Unit price', 'Total', 'Delivery (days)', ''].map((h) => (
              <Typography key={h} fontSize="0.72rem" fontWeight={700} color="text.secondary">{h}</Typography>
            ))}
          </Box>
          <Divider />
          {lineItems.map((row, i) => {
            const rowTotal = (Number(row.qty) || 0) * (Number(row.unitPrice) || 0);
            return (
              <Box key={i} sx={{ display: 'grid', gridTemplateColumns: '1fr 80px 100px 100px 90px 32px', gap: 1, px: 1.5, py: 0.8, alignItems: 'center', borderBottom: i < lineItems.length - 1 ? '1px solid #f0f4f2' : 'none' }}>
                <TextField size="small" variant="standard" placeholder="Ergonomic chair" value={row.item} onChange={(e) => setLineField(i, 'item', e.target.value)} sx={{ '& .MuiInput-underline:before': { borderColor: 'transparent' } }} />
                <TextField size="small" variant="standard" type="number" placeholder="2" value={row.qty} onChange={(e) => setLineField(i, 'qty', e.target.value)} sx={{ '& .MuiInput-underline:before': { borderColor: 'transparent' } }} />
                <TextField size="small" variant="standard" type="number" placeholder="8,500" value={row.unitPrice} onChange={(e) => setLineField(i, 'unitPrice', e.target.value)} sx={{ '& .MuiInput-underline:before': { borderColor: 'transparent' } }} />
                <Typography fontSize="0.84rem" fontWeight={500}>{rowTotal > 0 ? formatCurrency(rowTotal) : '—'}</Typography>
                <TextField size="small" variant="standard" type="number" placeholder="7" value={row.deliveryDays} onChange={(e) => setLineField(i, 'deliveryDays', e.target.value)} sx={{ '& .MuiInput-underline:before': { borderColor: 'transparent' } }} />
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  {lineItems.length > 1 && (
                    <Box component="button" onClick={() => removeRow(i)} sx={{ border: 'none', background: 'none', cursor: 'pointer', color: 'text.secondary', p: 0, display: 'flex' }}>
                      <Close fontSize="small" />
                    </Box>
                  )}
                </Box>
              </Box>
            );
          })}
          <Divider />
          <Box sx={{ px: 1.5, py: 0.8 }}>
            <Button size="small" startIcon={<Add />} onClick={addRow} sx={{ fontSize: '0.76rem' }}>+ add row</Button>
          </Box>
        </Box>

        {/* Bottom two columns */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          {/* Left — notes + payment terms */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography fontSize="0.78rem" fontWeight={600} sx={{ mb: 0.5 }}>The GST is</Typography>
              <TextField fullWidth size="small" value="18%" disabled />
            </Box>
            <Box>
              <Typography fontSize="0.78rem" fontWeight={600} sx={{ mb: 0.5 }}>Notes / terms</Typography>
              <TextField fullWidth size="small" multiline minRows={2} placeholder="Any conditions or notes..." value={notes} onChange={(e) => setNotes(e.target.value)} />
            </Box>
            <Box>
              <Typography fontSize="0.78rem" fontWeight={600} sx={{ mb: 0.5 }}>Payment terms</Typography>
              <TextField fullWidth size="small" placeholder="Net 30 days net" value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} />
            </Box>
          </Box>

          {/* Right — cost breakdown */}
          <Box>
            <Typography fontSize="0.78rem" fontWeight={600} sx={{ mb: 1 }}>Cost breakdown</Typography>
            <Box sx={{ border: '1px solid #dde8e2', borderRadius: 1.5, overflow: 'hidden' }}>
              {[
                { label: 'Subtotal', val: formatCurrency(subtotal) },
                { label: `GST (${(GST_RATE * 100).toFixed(0)}%)`, val: formatCurrency(gst) },
              ].map(({ label, val }, i) => (
                <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', px: 1.5, py: 0.9, bgcolor: i % 2 === 0 ? '#fff' : '#fafcfb', borderBottom: '1px solid #f0f4f2' }}>
                  <Typography fontSize="0.82rem" color="text.secondary">{label}</Typography>
                  <Typography fontSize="0.82rem">{val}</Typography>
                </Box>
              ))}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 1.5, py: 0.9, bgcolor: '#f4f7f5' }}>
                <Typography fontSize="0.88rem" fontWeight={700}>Grand total</Typography>
                <Typography fontSize="0.88rem" fontWeight={700} color="primary.dark">{formatCurrency(grandTotal)}</Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Action buttons */}
        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
          <Button variant="outlined" onClick={() => submit(false)} disabled={saving || !lineItems.some((r) => r.item && r.qty && r.unitPrice)}>
            {saving ? 'Submitting…' : 'Submit Quotation'}
          </Button>
          <Button variant="outlined" color="inherit" onClick={() => submit(true)}>
            Save Draft
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

/* ────────────────────────────────────────────────────────
   Main RFQs page
──────────────────────────────────────────────────────── */
export default function RfqsPage() {
  const [rfqs, setRfqs] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [creating, setCreating] = useState(false);
  const [quotingRfq, setQuotingRfq] = useState(null);
  const role = useSelector((state) => state.auth.user?.role);
  const isProcurement = role === ROLES.PROCUREMENT;
  const isVendor = role === ROLES.VENDOR;

  const load = async () => {
    try {
      setLoading(true); setError('');
      const { data } = await api.get('/rfqs');
      setRfqs(data);
    } catch { setError('RFQs could not be loaded.'); }
    finally { setLoading(false); }
  };

  const loadVendors = async () => {
    try {
      const { data } = await api.get('/vendors');
      setVendors(data.filter((v) => v.status === 'APPROVED'));
    } catch { /* non-critical */ }
  };

  useEffect(() => {
    load();
    if (isProcurement || role === ROLES.ADMIN) loadVendors();
  }, [role]);

  /* Show Create RFQ full page */
  if (creating) {
    return (
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <CreateRfqView vendors={vendors} onCancel={() => setCreating(false)}
          onCreated={() => { setCreating(false); load(); }} onMessage={setMessage} />
        <Snackbar open={Boolean(message)} autoHideDuration={3500} onClose={() => setMessage('')} message={message} />
      </Box>
    );
  }

  /* Show Submit Quotation full page */
  if (quotingRfq) {
    return (
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <SubmitQuotationView rfq={quotingRfq} onCancel={() => setQuotingRfq(null)}
          onSubmitted={() => { setQuotingRfq(null); load(); }} onMessage={setMessage} />
        <Snackbar open={Boolean(message)} autoHideDuration={3500} onClose={() => setMessage('')} message={message} />
      </Box>
    );
  }

  /* List view */
  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>RFQ Management</Typography>
          <Typography color="text.secondary" fontSize="0.88rem">
            Published requests are immediately open for vendor quotation submission.
          </Typography>
        </Box>
        {isProcurement && (
          <Button variant="contained" startIcon={<Add />} onClick={() => setCreating(true)}>
            Create RFQ
          </Button>
        )}
      </Box>

      <div className="data-card">
        <div className="table-toolbar">
          <div>
            <div className="table-toolbar-title">Sourcing requests</div>
            <div className="table-toolbar-description">Open requests with quantities, deadlines, and lifecycle state.</div>
          </div>
        </div>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Category / Details</TableCell>
              <TableCell>Qty</TableCell>
              <TableCell>Deadline</TableCell>
              <TableCell>Assigned vendors</TableCell>
              <TableCell>Status</TableCell>
              {isVendor && <TableCell align="right">Action</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableState loading={loading} error={error} empty={!rfqs.length}
              colSpan={isVendor ? 7 : 6} emptyTitle="No RFQs have been created" onRetry={load} />
            {rfqs.map((rfq) => (
              <TableRow key={rfq.id} hover>
                <TableCell>
                  <Typography fontWeight={600} fontSize="0.88rem">{rfq.title}</Typography>
                </TableCell>
                <TableCell sx={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {rfq.productDetails}
                </TableCell>
                <TableCell>{rfq.quantity}</TableCell>
                <TableCell>{formatDate(rfq.deadline)}</TableCell>
                <TableCell>
                  {rfq.assignedVendors?.length
                    ? rfq.assignedVendors.map((v) => (
                        <Chip key={v.id} size="small" label={v.name} sx={{ mr: 0.5, mb: 0.3 }} />
                      ))
                    : <Typography variant="caption" color="text.secondary">All vendors</Typography>}
                </TableCell>
                <TableCell>
                  <Chip size="small" label={rfq.status}
                    color={rfq.status === 'PUBLISHED' ? 'success' : rfq.status === 'APPROVED' ? 'primary' : 'default'} />
                </TableCell>
                {isVendor && (
                  <TableCell align="right">
                    <Button size="small" startIcon={<RequestQuoteOutlined />}
                      disabled={!['PUBLISHED', 'UNDER_REVIEW'].includes(rfq.status)}
                      onClick={() => setQuotingRfq(rfq)}>
                      Submit quote
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Snackbar open={Boolean(message)} autoHideDuration={3500} onClose={() => setMessage('')} message={message} />
    </>
  );
}
