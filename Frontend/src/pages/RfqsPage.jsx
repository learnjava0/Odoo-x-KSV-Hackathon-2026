import { Send } from '@mui/icons-material';
import { Button, Chip, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import { api } from '../services/api.js';

export default function RfqsPage() {
  const [rfqs, setRfqs] = useState([]);
  const load = () => api.get('/api/rfqs').then(({ data }) => setRfqs(data));

  useEffect(() => { load(); }, []);

  const submit = async (id) => {
    await api.post(`/api/rfqs/${id}/submit`);
    load();
  };

  return (
    <>
      <PageHeader title="RFQ Management" subtitle="Create RFQs, assign vendors, and open quotation windows." />
      <div className="data-card">
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
            {rfqs.map((rfq) => (
              <TableRow key={rfq.id}>
                <TableCell>{rfq.rfqNumber}</TableCell>
                <TableCell>{rfq.title}</TableCell>
                <TableCell>{rfq.deadline}</TableCell>
                <TableCell>{rfq.vendors?.length ?? 0}</TableCell>
                <TableCell><Chip size="small" label={rfq.status} /></TableCell>
                <TableCell align="right">
                  <Button startIcon={<Send />} size="small" onClick={() => submit(rfq.id)}>Submit</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
