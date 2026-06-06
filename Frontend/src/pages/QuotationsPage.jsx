import { HowToReg } from '@mui/icons-material';
import { Box, Button, Chip, Snackbar, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { TableState } from '../components/DataStates.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { api } from '../services/api.js';
import { formatCurrency, formatDate } from '../utils/formatters.js';

export default function QuotationsPage() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await api.get('/api/rfqs/1/quotations/comparison');
      setQuotes(data);
    } catch {
      setError('Quotation comparison could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const requestApproval = async (quotationId) => {
    try {
      await api.post('/api/approvals', { quotationId, remarks: 'Best commercial and delivery fit.' });
      setMessage('Quotation sent to the approval queue.');
      load();
    } catch {
      setMessage('Could not request approval. Please try again.');
    }
  };

  return (
    <>
      <PageHeader title="Quotation Management" subtitle="Compare vendor responses and send the preferred quote for approval." />
      <div className="data-card">
        <Box className="table-toolbar">
          <Box>
            <Typography className="table-toolbar-title">Side-by-side comparison</Typography>
            <Typography className="table-toolbar-description">RFQ #1 · Quotes are ranked by submitted total.</Typography>
          </Box>
          <Chip label={`${quotes.length} responses`} />
        </Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Vendor</TableCell>
              <TableCell>Delivery</TableCell>
              <TableCell>Subtotal</TableCell>
              <TableCell>Tax</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableState loading={loading} error={error} empty={!quotes.length} colSpan={7} emptyTitle="No quotations received yet" onRetry={load} />
            {quotes.map((quote, index) => (
              <TableRow key={quote.id} className={index === 0 ? 'recommended-row' : ''}>
                <TableCell>{quote.vendor.vendorName} {index === 0 && <Chip size="small" label="Best price" sx={{ ml: 1 }} />}</TableCell>
                <TableCell>{formatDate(quote.deliveryDate)}</TableCell>
                <TableCell>{formatCurrency(quote.subtotal)}</TableCell>
                <TableCell>{formatCurrency(quote.tax)}</TableCell>
                <TableCell><strong>{formatCurrency(quote.grandTotal)}</strong></TableCell>
                <TableCell><Chip size="small" label={quote.status} /></TableCell>
                <TableCell align="right">
                  <Button startIcon={<HowToReg />} size="small" onClick={() => requestApproval(quote.id)}>Request approval</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Snackbar open={Boolean(message)} autoHideDuration={3500} onClose={() => setMessage('')} message={message} />
    </>
  );
}
