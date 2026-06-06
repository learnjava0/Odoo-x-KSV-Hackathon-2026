import { Send } from '@mui/icons-material';
import { Button, Chip, Snackbar, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { useEffect, useState } from 'react';
import { TableState } from '../components/DataStates.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { api } from '../services/api.js';
import { formatDate } from '../utils/formatters.js';

export default function RfqsPage() {
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await api.get('/api/rfqs');
      setRfqs(data);
    } catch {
      setError('RFQs could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async (id) => {
    try {
      await api.post(`/api/rfqs/${id}/submit`);
      setMessage('RFQ submitted to assigned vendors.');
      load();
    } catch {
      setMessage('RFQ submission failed. Please try again.');
    }
  };

  return (
    <>
      <PageHeader title="RFQ Management" subtitle="Create RFQs, assign vendors, and open quotation windows." />
      <div className="data-card">
        <div className="table-toolbar">
          <div>
            <div className="table-toolbar-title">Sourcing requests</div>
            <div className="table-toolbar-description">Submit draft requests when vendor assignments and deadlines are ready.</div>
          </div>
        </div>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>RFQ</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Deadline</TableCell>
              <TableCell>Vendors</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableState loading={loading} error={error} empty={!rfqs.length} colSpan={6} emptyTitle="No RFQs have been created" onRetry={load} />
            {rfqs.map((rfq) => (
              <TableRow key={rfq.id}>
                <TableCell>{rfq.rfqNumber}</TableCell>
                <TableCell>{rfq.title}</TableCell>
                <TableCell>{formatDate(rfq.deadline)}</TableCell>
                <TableCell>{rfq.vendors?.length ?? 0}</TableCell>
                <TableCell><Chip size="small" label={rfq.status} /></TableCell>
                <TableCell align="right">
                  <Button
                    startIcon={<Send />}
                    size="small"
                    disabled={String(rfq.status).toLowerCase() !== 'draft'}
                    onClick={() => submit(rfq.id)}
                  >
                    {String(rfq.status).toLowerCase() === 'draft' ? 'Send to vendors' : 'Submitted'}
                  </Button>
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
