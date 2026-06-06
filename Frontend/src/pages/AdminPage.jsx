import { Box, Chip, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { TableState } from '../components/DataStates.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { api } from '../services/api.js';

const ROLE_COLORS = {
  ADMIN: 'error',
  MANAGER: 'primary',
  PROCUREMENT_OFFICER: 'info',
  VENDOR: 'default'
};

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await api.get('/users');
      setUsers(data);
    } catch {
      setError('User list could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const roleCounts = users.reduce((acc, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <PageHeader title="User Management" subtitle="All registered system users and their assigned roles." />
      <Box className="page-grid" sx={{ mb: 3 }}>
        {Object.entries(roleCounts).map(([role, count]) => (
          <div key={role} className="metric-card stagger-enter">
            <Typography color="text.secondary">{role.replace('_', ' ')}</Typography>
            <Typography variant="h5">{count}</Typography>
            <Typography className="metric-context">registered users</Typography>
          </div>
        ))}
      </Box>
      <div className="data-card">
        <Box className="table-toolbar">
          <Box>
            <Typography className="table-toolbar-title">System users</Typography>
            <Typography className="table-toolbar-description">
              All accounts in the procurement system.
            </Typography>
          </Box>
          <Chip label={`${users.length} total`} />
        </Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableState
              loading={loading}
              error={error}
              empty={!users.length}
              colSpan={3}
              emptyTitle="No users found"
              onRetry={load}
            />
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={user.role}
                    color={ROLE_COLORS[user.role] || 'default'}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
