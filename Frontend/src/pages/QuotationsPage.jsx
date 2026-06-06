import { Box, Chip, MenuItem, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { TableState } from '../components/DataStates.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { api } from '../services/api.js';
import { formatCurrency } from '../utils/formatters.js';

export default function QuotationsPage() {
  const [quotes, setQuotes] = useState([]);
  const [rfqs, setRfqs] = useState([]);
  const [rfqId, setRfqId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const loadQuotes = async (selectedRfqId) => {
    try {
      setLoading(true);
      setError('');
      const { data } = await api.get(`/rfqs/${selectedRfqId}/compare`, { params: { sortBy: 'score' } });
      setQuotes(data);
    } catch {
      setError('Quotation comparison could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRfqs(); }, []);
  useEffect(() => { if (rfqId) loadQuotes(rfqId); }, [rfqId]);

  return (
    <>
      <PageHeader title="Quotation Management" subtitle="Compare vendor responses and send the preferred quote for approval." />
      <div className="data-card">
        <Box className="table-toolbar">
          <Box>
            <Typography className="table-toolbar-title">Side-by-side comparison</Typography>
            <Typography className="table-toolbar-description">Quotes are ranked using vendor rating and price-performance score.</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextField select label="RFQ" value={rfqId} onChange={(event) => setRfqId(event.target.value)} sx={{ minWidth: 220 }}>
              {rfqs.map((rfq) => <MenuItem key={rfq.id} value={String(rfq.id)}>{rfq.title}</MenuItem>)}
            </TextField>
            <Chip label={`${quotes.length} responses`} />
          </Box>
        </Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Vendor</TableCell>
              <TableCell>Unit price</TableCell>
              <TableCell>Delivery</TableCell>
              <TableCell>Rating</TableCell>
              <TableCell>Total with tax</TableCell>
              <TableCell>Notes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableState loading={loading} error={error} empty={!quotes.length} colSpan={6} emptyTitle="No quotations received yet" onRetry={() => rfqId && loadQuotes(rfqId)} />
            {quotes.map((quote) => (
              <TableRow key={quote.quotationId} className={quote.recommended ? 'recommended-row' : ''}>
                <TableCell>{quote.vendorName} {quote.recommended && <Chip size="small" label="Recommended" sx={{ ml: 1 }} />}</TableCell>
                <TableCell>{formatCurrency(quote.unitPrice)}</TableCell>
                <TableCell>{quote.deliveryTimeline} days</TableCell>
                <TableCell>{quote.vendorRating}</TableCell>
                <TableCell><strong>{formatCurrency(quote.totalQuotationValueWithTaxes)}</strong></TableCell>
                <TableCell>{quote.notes || 'No notes'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
