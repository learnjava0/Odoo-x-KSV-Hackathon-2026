import { HowToReg } from '@mui/icons-material';
import { Button, Chip, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import { api } from '../services/api.js';

export default function QuotationsPage() {
  const [quotes, setQuotes] = useState([]);
  const load = () => api.get('/api/rfqs/1/quotations/comparison').then(({ data }) => setQuotes(data));

  useEffect(() => { load(); }, []);

  const requestApproval = async (quotationId) => {
    await api.post('/api/approvals', { quotationId, remarks: 'Best commercial and delivery fit.' });
    load();
  };

  return (
    <>
      <PageHeader title="Quotation Management" subtitle="Compare vendor responses and send the preferred quote for approval." />
      <div className="data-card">
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
            {quotes.map((quote, index) => (
              <TableRow key={quote.id}>
                <TableCell>{quote.vendor.vendorName} {index === 0 && <Chip size="small" label="Lowest" sx={{ ml: 1 }} />}</TableCell>
                <TableCell>{quote.deliveryDate}</TableCell>
                <TableCell>{quote.subtotal}</TableCell>
                <TableCell>{quote.tax}</TableCell>
                <TableCell>{quote.grandTotal}</TableCell>
                <TableCell><Chip size="small" label={quote.status} /></TableCell>
                <TableCell align="right">
                  <Button startIcon={<HowToReg />} size="small" onClick={() => requestApproval(quote.id)}>Request approval</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
