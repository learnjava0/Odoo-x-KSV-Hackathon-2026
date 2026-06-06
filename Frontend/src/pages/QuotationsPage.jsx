import {
  Box, Button, Chip, MenuItem, Snackbar, TextField, Typography
} from '@mui/material';
import { useEffect, useState } from 'react';
import { StateContent } from '../components/DataStates.jsx';
import { api } from '../services/api.js';
import { formatCurrency } from '../utils/formatters.js';

const CRITERIA = [
  { label: 'Grand Total',    key: (q) => formatCurrency(q.totalQuotationValueWithTaxes), bold: true },
  { label: 'GST %',          key: () => '18%' },
  { label: 'Delivery (days)',key: (q) => q.deliveryTimeline ? `${q.deliveryTimeline}` : '—' },
  { label: 'Vendor rating',  key: (q) => q.vendorRating ?? '—' },
  { label: 'Payment terms',  key: () => 'Net 30' },
];

export default function QuotationsPage() {
  const [quotes, setQuotes] = useState([]);
  const [rfqs, setRfqs] = useState([]);
  const [rfqId, setRfqId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [approving, setApproving] = useState(null);

  const loadRfqs = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await api.get('/rfqs');
      setRfqs(data);
      if (data.length) setRfqId(String(data[0].id));
      else setLoading(false);
    } catch {
      setError('RFQs could not be loaded.');
      setLoading(false);
    }
  };

  const loadQuotes = async (id) => {
    try {
      setLoading(true);
      setError('');
      const { data } = await api.get(`/rfqs/${id}/compare`, { params: { sortBy: 'score' } });
      setQuotes(data);
    } catch {
      setError('Quotation comparison could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRfqs(); }, []);
  useEffect(() => { if (rfqId) loadQuotes(rfqId); }, [rfqId]);

  const selectAndApprove = async (quotationId) => {
    try {
      setApproving(quotationId);
      await api.post(`/approvals/${quotationId}`, {
        purchaseOrderApproved: true,
        approvalRemark: 'Selected via quotation comparison — best value.'
      });
      setMessage('Quotation approved. PO and invoice generated automatically.');
      loadQuotes(rfqId);
    } catch {
      setMessage('Could not approve. Make sure you have manager permissions.');
    } finally {
      setApproving(null);
    }
  };

  const selectedRfq = rfqs.find((r) => String(r.id) === rfqId);

  // Lowest price index for green highlight
  const lowestIdx = quotes.length
    ? quotes.reduce((minI, q, i) => q.unitPrice < quotes[minI].unitPrice ? i : minI, 0)
    : -1;

  return (
    <>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={800}>Quotation Comparison</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.5, flexWrap: 'wrap' }}>
          <Typography color="text.secondary" fontSize="0.88rem">RFQ:</Typography>
          <TextField
            select size="small"
            value={rfqId}
            onChange={(e) => setRfqId(e.target.value)}
            sx={{ minWidth: 260 }}
          >
            {rfqs.map((r) => (
              <MenuItem key={r.id} value={String(r.id)}>{r.title}</MenuItem>
            ))}
          </TextField>
          <Typography color="text.secondary" fontSize="0.88rem">—</Typography>
          <Chip label={`${quotes.length} quotations received`} size="small" />
        </Box>
      </Box>

      {loading || error || !quotes.length ? (
        <div className="data-card">
          <StateContent loading={loading} error={error} onRetry={() => rfqId && loadQuotes(rfqId)}
            title="No quotations received yet"
            description="Vendors need to submit quotations before comparison is available." />
        </div>
      ) : (
        <Box className="data-card" sx={{ overflowX: 'auto' }}>
          {/* Side-by-side comparison table */}
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: `200px repeat(${quotes.length}, minmax(180px, 1fr))`,
            minWidth: 200 + quotes.length * 180
          }}>
            {/* Header row */}
            <Box sx={{ p: 1.5, bgcolor: '#f4f7f5', borderBottom: '1px solid #e4ebe7' }}>
              <Typography fontSize="0.78rem" fontWeight={700} color="text.secondary">Criteria</Typography>
            </Box>
            {quotes.map((q, i) => (
              <Box key={q.quotationId} sx={{
                p: 1.5, borderBottom: '1px solid #e4ebe7', borderLeft: '1px solid #e4ebe7',
                bgcolor: i === lowestIdx ? '#1b7a53' : '#f4f7f5',
                borderRadius: i === lowestIdx ? '8px 8px 0 0' : 0,
              }}>
                <Typography fontSize="0.88rem" fontWeight={800}
                  color={i === lowestIdx ? '#fff' : 'text.primary'}>
                  {q.vendorName}
                </Typography>
                {i === lowestIdx && (
                  <Typography fontSize="0.68rem" sx={{ color: '#a8d5bc', mt: 0.3 }}>Lowest price</Typography>
                )}
                {q.recommended && i !== lowestIdx && (
                  <Chip size="small" label="Recommended" sx={{ mt: 0.3, height: 16, fontSize: '0.65rem' }} />
                )}
              </Box>
            ))}

            {/* Criteria rows */}
            {CRITERIA.map((crit, ci) => (
              <>
                <Box key={`label-${ci}`} sx={{
                  p: 1.5, borderBottom: '1px solid #f0f4f2',
                  bgcolor: ci % 2 === 0 ? '#fff' : '#fafcfb'
                }}>
                  <Typography fontSize="0.82rem" color="text.secondary">{crit.label}</Typography>
                </Box>
                {quotes.map((q, i) => (
                  <Box key={`val-${ci}-${q.quotationId}`} sx={{
                    p: 1.5, borderBottom: '1px solid #f0f4f2', borderLeft: '1px solid #e4ebe7',
                    bgcolor: i === lowestIdx
                      ? (ci % 2 === 0 ? '#e8f5e9' : '#f0faf4')
                      : (ci % 2 === 0 ? '#fff' : '#fafcfb')
                  }}>
                    <Typography fontSize="0.88rem" fontWeight={crit.bold ? 700 : 400}
                      color={i === lowestIdx && crit.bold ? 'primary.dark' : 'text.primary'}>
                      {crit.key(q)}
                    </Typography>
                  </Box>
                ))}
              </>
            ))}

            {/* Action row */}
            <Box sx={{ p: 1.5, borderTop: '1px solid #e4ebe7' }} />
            {quotes.map((q, i) => (
              <Box key={`action-${q.quotationId}`} sx={{
                p: 1.5, borderTop: '1px solid #e4ebe7', borderLeft: '1px solid #e4ebe7',
                bgcolor: i === lowestIdx ? '#e8f5e9' : '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {i === lowestIdx ? (
                  <Button variant="contained" size="small"
                    disabled={approving === q.quotationId}
                    onClick={() => selectAndApprove(q.quotationId)}
                    sx={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                    {approving === q.quotationId ? 'Approving…' : 'Select & Approve'}
                  </Button>
                ) : (
                  <Button variant="outlined" size="small"
                    disabled={approving === q.quotationId}
                    onClick={() => selectAndApprove(q.quotationId)}
                    sx={{ fontSize: '0.78rem' }}>
                    Select
                  </Button>
                )}
              </Box>
            ))}
          </Box>

          {/* Legend */}
          <Box sx={{ mt: 1.5, px: 1 }}>
            <Typography fontSize="0.72rem" color="text.secondary">
              Green = lowest price. Selecting a vendor initiates the approval workflow.
            </Typography>
          </Box>
        </Box>
      )}

      <Snackbar open={Boolean(message)} autoHideDuration={4000} onClose={() => setMessage('')} message={message} />
    </>
  );
}
