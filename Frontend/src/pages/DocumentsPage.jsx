import { Download, Email, Print, ReceiptOutlined } from '@mui/icons-material';
import {
  Box, Button, Chip, Divider, Snackbar, Table, TableBody, TableCell,
  TableHead, TableRow, Typography
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { TableState } from '../components/DataStates.jsx';
import { ROLES } from '../config/access.js';
import PageHeader from '../components/PageHeader.jsx';
import { api, downloadFile } from '../services/api.js';
import { formatCurrency, formatDate } from '../utils/formatters.js';
import PdfPreview from '../components/PdfPreview.jsx';

function InvoiceDetail({ invoice }) {
  const base = invoice.totalAmount - invoice.taxAmount;
  const qty = invoice.purchaseOrder?.rfq?.quantity || 1;
  return (
    <Box sx={{ p: 2.5, border: '1px solid #e4ebe7', borderRadius: 2, bgcolor: '#fafcfb' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 2 }}>
        <Box>
          <Typography fontWeight={800} fontSize="1rem">Purchase Order & Invoice</Typography>
          <Typography color="text.secondary" fontSize="0.8rem">
            {invoice.purchaseOrder?.poNumber || '—'} · Auto-generated after approval
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3, mb: 2 }}>
        <Box>
          <Typography fontSize="0.7rem" color="text.secondary" fontWeight={700} sx={{ mb: 0.5 }}>BILL FROM</Typography>
          <Typography fontSize="0.82rem" fontWeight={600}>Your Organisation</Typography>
          <Typography fontSize="0.76rem" color="text.secondary">Procurement Department</Typography>
        </Box>
        <Box>
          <Typography fontSize="0.7rem" color="text.secondary" fontWeight={700} sx={{ mb: 0.5 }}>VENDOR</Typography>
          <Typography fontSize="0.82rem" fontWeight={600}>
            {invoice.purchaseOrder?.rfq?.assignedVendors?.[0]?.name || 'Vendor'}
          </Typography>
          <Typography fontSize="0.76rem" color="text.secondary">
            GSTIN: {invoice.purchaseOrder?.rfq?.assignedVendors?.[0]?.gstNumber || '—'}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 2, mb: 2 }}>
        {[
          { label: 'Invoice number', val: invoice.invoiceNumber },
          { label: 'PO date', val: formatDate(invoice.createdAt) },
          { label: 'RFQ', val: invoice.purchaseOrder?.rfq?.title || `#${invoice.purchaseOrder?.rfq?.id}` }
        ].map(({ label, val }) => (
          <Box key={label}>
            <Typography fontSize="0.7rem" color="text.secondary">{label}</Typography>
            <Typography fontSize="0.82rem" fontWeight={600}>{val}</Typography>
          </Box>
        ))}
      </Box>

      <Table size="small" sx={{ mb: 1.5 }}>
        <TableHead>
          <TableRow sx={{ bgcolor: '#f4f7f5' }}>
            <TableCell>Item</TableCell>
            <TableCell align="right">Qty</TableCell>
            <TableCell align="right">Unit price</TableCell>
            <TableCell align="right">Total</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>{invoice.purchaseOrder?.rfq?.productDetails || invoice.purchaseOrder?.rfq?.title || 'Procurement item'}</TableCell>
            <TableCell align="right">{qty}</TableCell>
            <TableCell align="right">{formatCurrency(base / qty)}</TableCell>
            <TableCell align="right">{formatCurrency(base)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: 240 }}>
          <Typography fontSize="0.78rem" color="text.secondary">Subtotal</Typography>
          <Typography fontSize="0.78rem">{formatCurrency(base)}</Typography>
        </Box>
        {invoice.taxType === 'IGST' ? (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: 240 }}>
            <Typography fontSize="0.78rem" color="text.secondary">IGST (18%)</Typography>
            <Typography fontSize="0.78rem">{formatCurrency(invoice.igstAmount ?? invoice.taxAmount)}</Typography>
          </Box>
        ) : (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: 240 }}>
              <Typography fontSize="0.78rem" color="text.secondary">CGST (9%)</Typography>
              <Typography fontSize="0.78rem">{formatCurrency(invoice.cgstAmount ?? invoice.taxAmount / 2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: 240 }}>
              <Typography fontSize="0.78rem" color="text.secondary">SGST (9%)</Typography>
              <Typography fontSize="0.78rem">{formatCurrency(invoice.sgstAmount ?? invoice.taxAmount / 2)}</Typography>
            </Box>
          </>
        )}
        <Divider sx={{ width: 240, my: 0.5 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: 240 }}>
          <Typography fontSize="0.9rem" fontWeight={700}>Total</Typography>
          <Typography fontSize="0.9rem" fontWeight={700}>{formatCurrency(invoice.totalAmount)}</Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default function DocumentsPage() {
  const role = useSelector((state) => state.auth.user?.role);
  const canManage = role === ROLES.ADMIN || role === ROLES.PROCUREMENT;
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewFilename, setPreviewFilename] = useState('');
  const [expandedInvoice, setExpandedInvoice] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const [poRes, invRes] = await Promise.all([
        api.get('/procurement/invoice/purchase-orders'),
        api.get('/procurement/invoice'),
      ]);
      setPurchaseOrders(poRes.data);
      setInvoices(invRes.data);
    } catch {
      setError('Purchase order and invoice data could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const emailInvoice = async (id) => {
    try {
      await api.post(`/procurement/invoice/${id}/send-email`);
      setMessage('Invoice email sent to vendor.');
    } catch {
      setMessage('Invoice email could not be sent.');
    }
  };

  return (
    <>
      <PageHeader
        title="Purchase Orders & Invoices"
        subtitle="Auto-generated after manager approval. Download, preview, or email to vendor."
      />

      <Box className="data-card" sx={{ mb: 2 }}>
        <Box className="table-toolbar">
          <Box>
            <Typography className="table-toolbar-title">Purchase orders</Typography>
            <Typography className="table-toolbar-description">Orders generated from approved quotations.</Typography>
          </Box>
          <Chip label={`${purchaseOrders.length} orders`} />
        </Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>PO Number</TableCell>
              <TableCell>RFQ</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableState loading={loading} error={error} empty={!purchaseOrders.length}
              colSpan={5} emptyTitle="No purchase orders generated" onRetry={load} />
            {purchaseOrders.map((po) => (
              <TableRow key={po.id}>
                <TableCell><strong>{po.poNumber}</strong></TableCell>
                <TableCell>{po.rfq?.title || `RFQ #${po.rfq?.id}`}</TableCell>
                <TableCell><strong>{formatCurrency(po.totalAmount)}</strong></TableCell>
                <TableCell>{formatDate(po.createdAt)}</TableCell>
                <TableCell><Chip size="small" label={po.status} color="success" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      <Box className="data-card">
        <Box className="table-toolbar">
          <Box>
            <Typography className="table-toolbar-title">Invoices</Typography>
            <Typography className="table-toolbar-description">Click a row to expand full invoice detail with tax breakdown.</Typography>
          </Box>
          <Chip label={`${invoices.length} invoices`} />
        </Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Invoice #</TableCell>
              <TableCell>Tax type</TableCell>
              <TableCell>Tax</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Status</TableCell>
              {canManage && <TableCell align="right">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableState loading={loading} error={error} empty={!invoices.length}
              colSpan={canManage ? 6 : 5} emptyTitle="No invoices generated" onRetry={load} />
            {invoices.map((invoice) => (
              <>
                <TableRow key={invoice.id} hover sx={{ cursor: 'pointer' }}
                  onClick={() => setExpandedInvoice(expandedInvoice === invoice.id ? null : invoice.id)}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ReceiptOutlined fontSize="small" color="action" />
                      <strong>{invoice.invoiceNumber}</strong>
                    </Box>
                  </TableCell>
                  <TableCell><Chip size="small" label={invoice.taxType || 'IGST'} variant="outlined" /></TableCell>
                  <TableCell>{formatCurrency(invoice.taxAmount)}</TableCell>
                  <TableCell><strong>{formatCurrency(invoice.totalAmount)}</strong></TableCell>
                  <TableCell>
                    <Chip size="small" label={invoice.status}
                      color={invoice.status === 'PAID' ? 'success' : 'warning'} />
                  </TableCell>
                  {canManage && (
                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      <Button size="small" startIcon={<Download />}
                        onClick={() => downloadFile(`/procurement/invoice/${invoice.id}/download`, `${invoice.invoiceNumber}.pdf`)}>
                        Download
                      </Button>
                      <Button size="small" startIcon={<Print />}
                        onClick={() => { setPreviewUrl(`/procurement/invoice/${invoice.id}/download`); setPreviewFilename(`${invoice.invoiceNumber}.pdf`); setPreviewOpen(true); }}>
                        Print
                      </Button>
                      <Button size="small" startIcon={<Email />} onClick={() => emailInvoice(invoice.id)}>
                        Email
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
                {expandedInvoice === invoice.id && (
                  <TableRow key={`detail-${invoice.id}`}>
                    <TableCell colSpan={canManage ? 6 : 5} sx={{ p: 2, bgcolor: '#f9fbfa' }}>
                      <InvoiceDetail invoice={invoice} />
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))}
          </TableBody>
        </Table>
        <PdfPreview open={previewOpen} onClose={() => setPreviewOpen(false)} fetchUrl={previewUrl} filename={previewFilename} />
      </Box>

      <Snackbar open={Boolean(message)} autoHideDuration={3500} onClose={() => setMessage('')} message={message} />
    </>
  );
}
