import { MarkEmailRead } from '@mui/icons-material';
import { Box, Button, Chip, List, ListItem, ListItemText, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { StateContent } from '../components/DataStates.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { api } from '../services/api.js';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await api.get('/api/notifications');
      setNotifications(data);
    } catch {
      setError('Activity history could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id) => {
    try {
      await api.post(`/api/notifications/${id}/read`);
      setNotifications((items) => items.map((item) => item.id === id ? { ...item, read: true } : item));
    } catch {
      setError('The activity could not be marked as read.');
    }
  };

  return (
    <>
      <PageHeader title="Activity & Logs" subtitle="A chronological record of RFQ, quotation, approval, PO, and invoice events." />
      <div className="data-card">
        <Box className="table-toolbar">
          <Box>
            <Typography className="table-toolbar-title">Procurement activity</Typography>
            <Typography className="table-toolbar-description">Unread events are highlighted so important changes stay visible.</Typography>
          </Box>
          <Chip label={`${notifications.filter((item) => !item.read).length} unread`} />
        </Box>
        {loading || error || !notifications.length ? (
          <StateContent
            loading={loading}
            error={error}
            onRetry={load}
            title="No activity recorded yet"
            description="RFQ, approval, PO, and invoice events will appear here."
          />
        ) : <List>
          {notifications.map((item, index) => (
            <ListItem
              key={item.id}
              className="activity-item"
              divider={index < notifications.length - 1}
              sx={{ py: 1.8, px: 2 }}
              secondaryAction={<Button startIcon={<MarkEmailRead />} disabled={item.read} onClick={() => markRead(item.id)}>Read</Button>}
            >
              <Box sx={{ width: 10, height: 10, mr: 2, borderRadius: '50%', flexShrink: 0, bgcolor: item.read ? '#c8d2cc' : 'primary.main', boxShadow: item.read ? 'none' : '0 0 0 4px #e2f3e9' }} />
              <ListItemText
                primary={item.title}
                secondary={`${item.message} · ${item.read ? 'Read' : 'Unread'}`}
                primaryTypographyProps={{ fontWeight: 700, fontSize: '.84rem' }}
                secondaryTypographyProps={{ fontSize: '.74rem', mt: 0.4 }}
              />
            </ListItem>
          ))}
        </List>}
      </div>
    </>
  );
}
