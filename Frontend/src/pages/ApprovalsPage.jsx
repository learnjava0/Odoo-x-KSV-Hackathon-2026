import { CheckCircle, Cancel } from '@mui/icons-material';
import { Box, Button, Chip, Snackbar, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { TableState } from '../components/DataStates.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { api } from '../services/api.js';
import { formatCurrency } from '../utils/formatters.js';

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [workingId, setWorkingId] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await api.get('/api/approvals/pending');
      setApprovals(data);
    } catch {
      setError('The approval queue could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const decide = async (id, action) => {
    try {
      setWorkingId(id);
      await api.post(`/api/approvals/${id}/${action}`, { remarks: action === 'approve' ? 'Approved for PO generation.' : 'Rejected for revision.' });
      setMessage(action === 'approve' ? 'Quotation approved for PO generation.' : 'Quotation returned for revision.');
      load();
    } catch {
      setMessage('The decision could not be saved. Please try again.');
    } finally {
      setWorkingId(null);
    }
  };

  return (
    <>
      <PageHeader title="Approval Workflow" subtitle="Manager approval queue with remarks and audit state." />
      <div className="data-card">
        <Box className="table-toolbar">
          <Box>
            <Typography className="table-toolbar-title">Decision queue</Typography>
            <Typography className="table-toolbar-description">Review commercial fit and record a clear decision.</Typography>
          </Box>
          <Chip label={`${approvals.length} pending`} />
        </Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Quotation</TableCell>
              <TableCell>Vendor</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Remarks</TableCell>
              <TableCell align="right">Decision</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableState loading={loading} error={error} empty={!approvals.length} colSpan={5} emptyTitle="All approvals are up to date" onRetry={load} />
            {approvals.map((approval) => (
              <TableRow key={approval.id}>
                <TableCell>#{approval.quotation.id}</TableCell>
                <TableCell>{approval.quotation.vendor.vendorName}</TableCell>
                <TableCell><strong>{formatCurrency(approval.quotation.grandTotal)}</strong></TableCell>
                <TableCell>{approval.remarks}</TableCell>
                <TableCell align="right">
                  <Button startIcon={<CheckCircle />} disabled={workingId === approval.id} onClick={() => decide(approval.id, 'approve')}>Approve</Button>
                  <Button startIcon={<Cancel />} color="error" disabled={workingId === approval.id} onClick={() => decide(approval.id, 'reject')}>Reject</Button>
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
