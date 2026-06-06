import {
  AssignmentTurnedInOutlined,
  DescriptionOutlined,
  GavelOutlined,
  ReceiptLongOutlined,
  RequestQuoteOutlined
} from '@mui/icons-material';
import { Box, Typography } from '@mui/material';
import AnimatedNumber from './AnimatedNumber.jsx';

export default function WorkflowTracker({ summary }) {
  const steps = [
    { label: 'RFQs', detail: 'Requests opened', value: summary.activeRfqs, icon: <DescriptionOutlined /> },
    { label: 'Quotations', detail: 'Vendor responses', value: summary.quotationCount, icon: <RequestQuoteOutlined /> },
    { label: 'Approvals', detail: 'Waiting for review', value: summary.pendingApprovals, icon: <GavelOutlined /> },
    { label: 'Orders', detail: 'POs generated', value: summary.purchaseOrders, icon: <AssignmentTurnedInOutlined /> },
    { label: 'Invoices', detail: 'Ready for payment', value: summary.invoiceCount, icon: <ReceiptLongOutlined /> }
  ];

  return (
    <Box className="workflow-card">
      <Box className="section-heading">
        <Box>
          <Typography className="section-title">Request-to-payment tracker</Typography>
          <Typography className="section-subtitle">Follow work as it moves through each procurement stage.</Typography>
        </Box>
        <Box className="live-indicator"><span /> Live pipeline</Box>
      </Box>
      <Box className="workflow-steps">
        {steps.map((step, index) => (
          <Box className="workflow-step" key={step.label} style={{ '--step-delay': `${index * 80}ms` }}>
            <Box className="workflow-icon">{step.icon}</Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography className="workflow-value"><AnimatedNumber value={step.value ?? 0} /></Typography>
              <Typography className="workflow-label">{step.label}</Typography>
              <Typography className="workflow-detail">{step.detail}</Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
