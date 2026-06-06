import { Download, Email, ReceiptLong } from '@mui/icons-material';
import { Box, Button, Chip, Snackbar, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { TableState } from '../components/DataStates.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { api, downloadFile } from '../services/api.js';
import { formatCurrency } from '../utils/formatters.js';

export default function DocumentsPage() {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const [poResponse, invoiceResponse] = await Promise.all([
        api.get('/api/purchase-orders'),
        api.get('/api/invoices')
      ]);
      setPurchaseOrders(poResponse.data);
      setInvoices(invoiceResponse.data);
    } catch {
      setError('Purchase order and invoice data could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const generatePo = async () => {
    try {
      await api.post('/api/purchase-orders/from-quotation/1');
      setMessage('Purchase order generated from approved quotation #1.');
      load();
    } catch {
      setMessage('Purchase order could not be generated.');
    }
  };

  const generateInvoice = async (poId) => {
    try {
      await api.post(`/api/invoices/from-purchase-order/${poId}`);
      setMessage('Invoice generated from the purchase order.');
      load();
    } catch {
      setMessage('Invoice could not be generated.');
    }
  };

  const emailInvoice = async (id) => {
    try {
      await api.post(`/api/invoices/${id}/email`);
      setMessage('Invoice email sent.');
    } catch {
      setMessage('Invoice email could not be sent.');
    }
  };

  return (
    <>
      <PageHeader
        title="Purchase Orders & Invoices"
        subtitle="Generate documents from approved quotations and email invoice PDFs."
        action={<Button startIcon={<ReceiptLong />} variant="contained" onClick={generatePo}>Generate purchase order</Button>}
      />
      <Box className="data-card" sx={{ mb: 2 }}>
        <Box className="table-toolbar">
          <Box>
            <Typography className="table-toolbar-title">Purchase orders</Typography>
            <Typography className="table-toolbar-description">Download approved orders or continue them into invoicing.</Typography>
          </Box>
          <Chip label={`${purchaseOrders.length} orders`} />
        </Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>PO Number</TableCell>
              <TableCell>Vendor</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableState loading={loading} error={error} empty={!purchaseOrders.length} colSpan={5} emptyTitle="No purchase orders generated" onRetry={load} />
            {purchaseOrders.map((po) => (
              <TableRow key={po.id}>
                <TableCell>{po.poNumber}</TableCell>
                <TableCell>{po.vendor.vendorName}</TableCell>
                <TableCell><strong>{formatCurrency(po.grandTotal)}</strong></TableCell>
                <TableCell><Chip size="small" label={po.status} /></TableCell>
                <TableCell align="right">
                  <Button startIcon={<Download />} onClick={() => downloadFile(`/api/purchase-orders/${po.id}/pdf`, `${po.poNumber}.pdf`)}>PDF</Button>
                  <Button onClick={() => generateInvoice(po.id)}>Generate invoice</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
      <Box className="data-card">
        <Box className="table-toolbar">
          <Box>
            <Typography className="table-toolbar-title">Invoices</Typography>
            <Typography className="table-toolbar-description">Review totals, download PDFs, and send documents to vendors.</Typography>
          </Box>
          <Chip label={`${invoices.length} invoices`} />
        </Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Invoice</TableCell>
              <TableCell>Subtotal</TableCell>
              <TableCell>Tax</TableCell>
              <TableCell>Total</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableState loading={loading} error={error} empty={!invoices.length} colSpan={5} emptyTitle="No invoices generated" onRetry={load} />
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>{invoice.invoiceNumber}</TableCell>
                <TableCell>{formatCurrency(invoice.subtotal)}</TableCell>
                <TableCell>{formatCurrency(invoice.tax)}</TableCell>
                <TableCell><strong>{formatCurrency(invoice.grandTotal)}</strong></TableCell>
                <TableCell align="right">
                  <Button startIcon={<Download />} onClick={() => downloadFile(`/api/invoices/${invoice.id}/pdf`, `${invoice.invoiceNumber}.pdf`)}>PDF</Button>
                  <Button startIcon={<Email />} onClick={() => emailInvoice(invoice.id)}>Email</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
      <Snackbar open={Boolean(message)} autoHideDuration={3500} onClose={() => setMessage('')} message={message} />
    </>
  );
}
