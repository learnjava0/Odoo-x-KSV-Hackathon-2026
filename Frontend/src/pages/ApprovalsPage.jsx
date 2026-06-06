import {
  AccountCircleOutlined, Cancel, CheckCircle,
  DescriptionOutlined, GavelOutlined, ReceiptLongOutlined, RequestQuoteOutlined
} from '@mui/icons-material';
import {
  Box, Button, Chip, Divider, Snackbar, TextField, Typography
} from '@mui/material';
import { useEffect, useState } from 'react';
import { StateContent } from '../components/DataStates.jsx';
import { api } from '../services/api.js';
import { formatCurrency, formatDate } from '../utils/formatters.js';
import { useSelector } from 'react-redux';

/* ── 4-step stepper ──────────────────────────────────── */
const STEPS = [
  { label: 'Submitted',    sub: 'L 1' },
  { label: 'Review',       sub: 'L 2' },
  { label: 'Approval',     sub: 'L 3' },
  { label: 'Generate PO',  sub: '' },
];

function ApprovalStepper({ activeStep = 2 }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3, overflowX: 'auto' }}>
      {STEPS.map((step, i) => {
        const done = i < activeStep;
        const active = i === activeStep;
        return (
          <Box key={step.label} sx={{ display: 'flex', alignItems: 'flex-start', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 64 }}>
              <Box sx={{
                width: 36, height: 36, borderRadius: '50%', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontWeight: 700,
                fontSize: '0.82rem', flexShrink: 0,
                bgcolor: active ? 'warning.main' : done ? 'primary.main' : '#e8f0ec',
                color: done || active ? '#fff' : 'text.secondary',
                border: active ? '3px solid #ffe082' : 'none',
              }}>
                {done ? <CheckCircle sx={{ fontSize: 18 }} /> : i + 1}
              </Box>
              <Typography fontSize="0.68rem" fontWeight={active ? 700 : 400} textAlign="center" sx={{ mt: 0.5 }}
                color={active ? 'warning.dark' : done ? 'primary.main' : 'text.secondary'}>
                {step.label}
              </Typography>
              {step.sub && (
                <Typography fontSize="0.62rem" color="text.secondary">{step.sub}</Typography>
              )}
            </Box>
            {i < STEPS.length - 1 && (
              <Box sx={{ flex: 1, height: 2, mt: '17px', bgcolor: done ? 'primary.main' : '#dde8e2', mx: 0.5 }} />
            )}
          </Box>
        );
      })}
    </Box>
  );
}

/* ── Single approval card ────────────────────────────── */
function ApprovalCard({ approval, onDecide, working }) {
  const [remark, setRemark] = useState('');
  const user = useSelector((s) => s.auth.user);

  return (
    <Box sx={{ border: '1px solid #e4ebe7', borderRadius: 2, mb: 2, overflow: 'hidden' }}>
      {/* RFQ + vendor title bar */}
      <Box sx={{ px: 2.5, py: 1.5, bgcolor: '#f4f7f5', borderBottom: '1px solid #e4ebe7' }}>
        <Typography fontWeight={800} fontSize="0.95rem">
          {approval.rfq?.title || `RFQ #${approval.rfq?.id}`}
        </Typography>
        <Typography fontSize="0.78rem" color="text.secondary">
          Vendor: {approval.vendor?.name || '—'} &nbsp;·&nbsp;
          {formatCurrency(approval.price)} &nbsp;·&nbsp; {approval.deliveryTimeline ?? '—'} days
        </Typography>
      </Box>

      {/* Stepper */}
      <Box sx={{ px: 2.5, pt: 2 }}>
        <ApprovalStepper activeStep={2} />
      </Box>

      {/* Two-column body */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 0 }}>
        {/* Left — approval chain + remarks */}
        <Box sx={{ px: 2.5, pb: 2.5, borderRight: { md: '1px solid #e4ebe7' } }}>
          <Typography fontSize="0.72rem" fontWeight={700} color="text.secondary" sx={{ mb: 1.5, letterSpacing: '0.06em' }}>
            APPROVAL CHAIN
          </Typography>

          {/* Submitted by */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
            <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <AccountCircleOutlined fontSize="small" color="primary" />
            </Box>
            <Box>
              <Typography fontSize="0.82rem" fontWeight={600}>
                {approval.vendor?.name || 'Vendor'} (Procurement officer)
              </Typography>
              <Typography fontSize="0.72rem" color="text.secondary">
                Approved on {formatDate(new Date())} · L 1
              </Typography>
            </Box>
          </Box>

          {/* Current approver */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 2 }}>
            <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: '#fff8e1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '2px solid #ffd54f' }}>
              <AccountCircleOutlined fontSize="small" sx={{ color: '#f57f17' }} />
            </Box>
            <Box>
              <Typography fontSize="0.82rem" fontWeight={600}>
                {user?.name || 'Finance manager'} (Finance manager)
              </Typography>
              <Typography fontSize="0.72rem" color="text.secondary">
                Awaiting · Assigned: 1
              </Typography>
            </Box>
          </Box>

          {/* Remarks */}
          <Typography fontSize="0.72rem" fontWeight={700} color="text.secondary" sx={{ mb: 0.8, letterSpacing: '0.06em' }}>
            APPROVAL REMARKS
          </Typography>
          <TextField
            fullWidth size="small" multiline minRows={3}
            placeholder="Add your comments or conditions..."
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
          />
        </Box>

        {/* Right — quotation summary */}
        <Box sx={{ px: 2.5, pb: 2.5, pt: { xs: 2, md: 0 }, pt: 0 }}>
          <Typography fontSize="0.72rem" fontWeight={700} color="text.secondary" sx={{ mb: 1.5, letterSpacing: '0.06em', pt: 2.5 }}>
            QUOTATION SUMMARY
          </Typography>
          <Box sx={{ border: '1px solid #e4ebe7', borderRadius: 1.5, overflow: 'hidden' }}>
            {[
              { label: 'Vendor',   val: approval.vendor?.name || '—' },
              { label: 'Total',    val: formatCurrency(approval.price), bold: true },
              { label: 'Delivery', val: approval.deliveryTimeline ? `${approval.deliveryTimeline} days` : '—' },
              { label: 'Rating',   val: approval.vendor?.rating ? `${approval.vendor.rating} / 5` : 'N/A' },
            ].map(({ label, val, bold }, i) => (
              <Box key={label} sx={{
                display: 'flex', justifyContent: 'space-between', px: 1.5, py: 1,
                bgcolor: i % 2 === 0 ? '#fff' : '#fafcfb',
                borderBottom: i < 3 ? '1px solid #f0f4f2' : 'none'
              }}>
                <Typography fontSize="0.8rem" color="text.secondary">{label}</Typography>
                <Typography fontSize="0.8rem" fontWeight={bold ? 700 : 500}>{val}</Typography>
              </Box>
            ))}
          </Box>

          {/* Approve / Reject */}
          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <Button variant="contained" color="success" fullWidth
              startIcon={<CheckCircle />}
              disabled={working === approval.id}
              onClick={() => onDecide(approval.id, 'approve', remark)}>
              Approve
            </Button>
            <Button variant="outlined" color="error" fullWidth
              startIcon={<Cancel />}
              disabled={working === approval.id}
              onClick={() => onDecide(approval.id, 'reject', remark)}>
              Reject
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

/* ── Page ────────────────────────────────────────────── */
export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [working, setWorking] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await api.get('/approvals/pending');
      setApprovals(data);
    } catch {
      setError('The approval queue could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const decide = async (id, action, remark) => {
    try {
      setWorking(id);
      await api.post(`/approvals/${id}`, {
        purchaseOrderApproved: action === 'approve',
        approvalRemark: remark || (action === 'approve' ? 'Approved.' : 'Rejected.')
      });
      setMessage(action === 'approve'
        ? 'Approved. PO and invoice generated automatically.'
        : 'Quotation rejected.');
      load();
    } catch {
      setMessage('Decision could not be saved. Please try again.');
    } finally {
      setWorking(null);
    }
  };

  return (
    <>
      {/* Page header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Approval Workflow</Typography>
          <Typography color="text.secondary" fontSize="0.88rem">
            Review pending quotations and record your decision.
          </Typography>
        </Box>
        <Chip
          label={`${approvals.length} pending`}
          color={approvals.length > 0 ? 'warning' : 'default'}
        />
      </Box>

      {loading || error ? (
        <div className="data-card">
          <StateContent loading={loading} error={error} onRetry={load}
            title="Approval queue empty" description="No quotations are pending approval." />
        </div>
      ) : !approvals.length ? (
        <div className="data-card">
          <StateContent loading={false} error=""
            title="All approvals are up to date"
            description="No quotations pending your decision right now." />
        </div>
      ) : (
        approvals.map((approval) => (
          <ApprovalCard
            key={approval.id}
            approval={approval}
            onDecide={decide}
            working={working}
          />
        ))
      )}

      <Snackbar open={Boolean(message)} autoHideDuration={3500} onClose={() => setMessage('')} message={message} />
    </>
  );
}
