import { Download, Email, ReceiptLong } from '@mui/icons-material';
import { Box, Button, Chip, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import { api, downloadFile } from '../services/api.js';

export default function DocumentsPage() {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);

  const load = async () => {
    const [poResponse, invoiceResponse] = await Promise.all([
      api.get('/api/purchase-orders'),
      api.get('/api/invoices')
    ]);
    setPurchaseOrders(poResponse.data);
    setInvoices(invoiceResponse.data);
  };

  useEffect(() => { load(); }, []);

  const generatePo = async () => {
    await api.post('/api/purchase-orders/from-quotation/1');
    load();
  };

  const generateInvoice = async (poId) => {
    await api.post(`/api/invoices/from-purchase-order/${poId}`);
    load();
  };

  return (
    <>
      <PageHeader
        title="Purchase Orders & Invoices"
        subtitle="Generate documents from approved quotations and email invoice PDFs."
        action={<Button startIcon={<ReceiptLong />} variant="contained" onClick={generatePo}>Generate PO from Quote #1</Button>}
      />
      <Box className="data-card" sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ p: 2 }}>Purchase Orders</Typography>
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
            {purchaseOrders.map((po) => (
              <TableRow key={po.id}>
                <TableCell>{po.poNumber}</TableCell>
                <TableCell>{po.vendor.vendorName}</TableCell>
                <TableCell>{po.grandTotal}</TableCell>
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
        <Typography variant="h6" sx={{ p: 2 }}>Invoices</Typography>
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
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>{invoice.invoiceNumber}</TableCell>
                <TableCell>{invoice.subtotal}</TableCell>
                <TableCell>{invoice.tax}</TableCell>
                <TableCell>{invoice.grandTotal}</TableCell>
                <TableCell align="right">
                  <Button startIcon={<Download />} onClick={() => downloadFile(`/api/invoices/${invoice.id}/pdf`, `${invoice.invoiceNumber}.pdf`)}>PDF</Button>
                  <Button startIcon={<Email />} onClick={() => api.post(`/api/invoices/${invoice.id}/email`)}>Email</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </>
  );
}
