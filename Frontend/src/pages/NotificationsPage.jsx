import {
  DescriptionOutlined, GavelOutlined, ReceiptLongOutlined,
  Inventory2Outlined, CheckCircleOutlined, HourglassEmptyOutlined,
  CancelOutlined, AssignmentTurnedInOutlined
} from '@mui/icons-material';
import { Box, Chip, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { StateContent } from '../components/DataStates.jsx';
import { api } from '../services/api.js';

const FILTER_TABS = ['All', 'RFQ', 'Approvals', 'Invoices', 'Vendors'];

const EVENT_META = {
  RFQ_CREATED:              { color: '#1b7a53', bg: '#e8f5e9', icon: <DescriptionOutlined />,          tab: 'RFQ',       desc: (e) => `RFQ created · ${e.remarks || ''}` },
  RFQ_PUBLISHED:            { color: '#1b7a53', bg: '#e8f5e9', icon: <DescriptionOutlined />,          tab: 'RFQ',       desc: (e) => `RFQ published · sent to vendors` },
  QUOTATION_SUBMITTED:      { color: '#1565c0', bg: '#e3f2fd', icon: <AssignmentTurnedInOutlined />,   tab: 'Approvals', desc: (e) => `Vendor submitted quotation · ${e.remarks || ''}` },
  APPROVAL_REVIEW_STARTED:  { color: '#e65100', bg: '#fff3e0', icon: <HourglassEmptyOutlined />,       tab: 'Approvals', desc: (e) => `Approval pending · ${e.remarks || 'awaiting L2 approval'}` },
  APPROVAL_GRANTED:         { color: '#2e7d32', bg: '#e8f5e9', icon: <CheckCircleOutlined />,          tab: 'Approvals', desc: (e) => `Quotation selected · ${e.remarks || 'Approved — PO and invoice will be generated'}` },
  APPROVAL_REJECTED:        { color: '#c62828', bg: '#ffebee', icon: <CancelOutlined />,               tab: 'Approvals', desc: (e) => `Quotation rejected · ${e.remarks || ''}` },
  INVOICE_GENERATED:        { color: '#6a1b9a', bg: '#f3e5f5', icon: <ReceiptLongOutlined />,          tab: 'Invoices',  desc: (e) => `Invoice PDF Generated and Emailed` },
  INVOICE_SENT:             { color: '#6a1b9a', bg: '#f3e5f5', icon: <ReceiptLongOutlined />,          tab: 'Invoices',  desc: (e) => `Invoice PDF Generated and Emailed` },
  PO_GENERATED:             { color: '#1b5e20', bg: '#e8f5e9', icon: <AssignmentTurnedInOutlined />,   tab: 'Invoices',  desc: (e) => `PO Generated` },
  VENDOR_REGISTERED:        { color: '#00695c', bg: '#e0f2f1', icon: <Inventory2Outlined />,           tab: 'Vendors',   desc: (e) => `Vendor added · ${e.remarks || 'registered and pending verification'}` },
};

const getMeta = (type) => EVENT_META[type] || {
  color: '#546558', bg: '#f4f7f5', icon: <CheckCircleOutlined />,
  tab: 'All', desc: (e) => e.remarks || 'State changed'
};

const getTab = (type) => getMeta(type).tab;

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  const load = async () => {
    try {
      setLoading(true); setError('');
      const { data } = await api.get('/activities');
      setNotifications(data);
    } catch {
      setError('Activity history could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = activeTab === 'All'
    ? notifications
    : notifications.filter((n) => getTab(n.eventType) === activeTab);

  return (
    <>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={800}>Activity &amp; Logs</Typography>
        <Typography color="text.secondary" fontSize="0.88rem">Procurement audit trail</Typography>
      </Box>

      <div className="data-card" style={{ padding: '20px' }}>
        {/* Filter tabs */}
        <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
          {FILTER_TABS.map((tab) => (
            <Box
              key={tab}
              onClick={() => setActiveTab(tab)}
              sx={{
                px: 2, py: 0.6, borderRadius: 99, cursor: 'pointer', fontSize: '0.8rem',
                fontWeight: 600, border: '1px solid',
                borderColor: activeTab === tab ? 'primary.main' : '#dce5df',
                bgcolor: activeTab === tab ? 'primary.main' : '#fff',
                color: activeTab === tab ? '#fff' : 'text.secondary',
                transition: 'all 0.15s',
                '&:hover': { borderColor: 'primary.main', color: activeTab === tab ? '#fff' : 'primary.main' }
              }}
            >
              {tab}
            </Box>
          ))}
        </Box>

        {loading || error || !filtered.length ? (
          <StateContent loading={loading} error={error} onRetry={load}
            title="No activity recorded yet"
            description="RFQ, approval, PO, and invoice events will appear here." />
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {filtered.map((item, index) => {
              const meta = getMeta(item.eventType);
              const ts = item.timestamp
                ? new Date(item.timestamp).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                : '';

              return (
                <Box key={item.id} sx={{
                  display: 'flex', gap: 2, alignItems: 'flex-start',
                  py: 2, px: 1,
                  borderBottom: index < filtered.length - 1 ? '1px solid #f0f4f2' : 'none',
                  '&:hover': { bgcolor: '#fafcfb' }, borderRadius: 1,
                  transition: 'background 0.15s'
                }}>
                  {/* Circle icon */}
                  <Box sx={{
                    width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                    bgcolor: meta.bg, color: meta.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    '& svg': { fontSize: '1.15rem' }
                  }}>
                    {meta.icon}
                  </Box>

                  {/* Content */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.3 }}>
                      <Typography fontSize="0.86rem" fontWeight={700} sx={{ color: meta.color }}>
                        {item.eventType?.replaceAll('_', ' ')}
                      </Typography>
                      <Box sx={{
                        px: 1, py: 0.1, borderRadius: 1, fontSize: '0.68rem', fontWeight: 700,
                        bgcolor: meta.bg, color: meta.color, border: `1px solid ${meta.bg}`
                      }}>
                        {item.entityType} #{item.entityId}
                      </Box>
                    </Box>
                    <Typography fontSize="0.8rem" color="text.primary" sx={{ mb: 0.2 }}>
                      {meta.desc(item)}
                    </Typography>
                    <Typography fontSize="0.72rem" color="text.secondary">
                      {item.actorName} · {ts}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </div>
    </>
  );
}
