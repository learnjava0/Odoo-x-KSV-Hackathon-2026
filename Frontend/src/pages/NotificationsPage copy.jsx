import { MarkEmailRead } from '@mui/icons-material';
import { Button, List, ListItem, ListItemText } from '@mui/material';
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
      <PageHeader title="Notifications" subtitle="RFQ, quotation, approval, PO, and invoice alerts." />
      <div className="data-card">
        <List>
          {notifications.map((item) => (
            <ListItem
              key={item.id}
              secondaryAction={<Button startIcon={<MarkEmailRead />} disabled={item.read} onClick={() => markRead(item.id)}>Read</Button>}
            >
              <ListItemText primary={item.title} secondary={`${item.message} · ${item.read ? 'Read' : 'Unread'}`} />
            </ListItem>
          ))}
        </List>
      </div>
    </>
  );
}
