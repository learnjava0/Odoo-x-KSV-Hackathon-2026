import { MarkEmailRead } from '@mui/icons-material';
import { Box, Button, List, ListItem, ListItemText } from '@mui/material';
import { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import { api } from '../services/api.js';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const load = () => api.get('/api/notifications').then(({ data }) => setNotifications(data));

  useEffect(() => { load(); }, []);

  const markRead = async (id) => {
    await api.post(`/api/notifications/${id}/read`);
    load();
  };

  return (
    <>
      <PageHeader title="Activity & Logs" subtitle="A chronological record of RFQ, quotation, approval, PO, and invoice events." />
      <div className="data-card">
        <List>
          {notifications.map((item, index) => (
            <ListItem
              key={item.id}
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
        </List>
      </div>
    </>
  );
}
