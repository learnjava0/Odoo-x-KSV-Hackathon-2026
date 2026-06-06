import { CheckCircle, Cancel } from '@mui/icons-material';
import { Button, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import { api } from '../services/api.js';

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState([]);
  const load = () => api.get('/api/approvals/pending').then(({ data }) => setApprovals(data));

  useEffect(() => { load(); }, []);

  const decide = async (id, action) => {
    await api.post(`/api/approvals/${id}/${action}`, { remarks: action === 'approve' ? 'Approved for PO generation.' : 'Rejected for revision.' });
    load();
  };

  return (
    <>
      <PageHeader title="Approval Workflow" subtitle="Manager approval queue with remarks and audit state." />
      <div className="data-card">
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
            {approvals.map((approval) => (
              <TableRow key={approval.id}>
                <TableCell>#{approval.quotation.id}</TableCell>
                <TableCell>{approval.quotation.vendor.vendorName}</TableCell>
                <TableCell>{approval.quotation.grandTotal}</TableCell>
                <TableCell>{approval.remarks}</TableCell>
                <TableCell align="right">
                  <Button startIcon={<CheckCircle />} onClick={() => decide(approval.id, 'approve')}>Approve</Button>
                  <Button startIcon={<Cancel />} color="error" onClick={() => decide(approval.id, 'reject')}>Reject</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
