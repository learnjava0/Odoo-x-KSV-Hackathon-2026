import { Box, Typography } from '@mui/material';

export default function PageHeader({ title, subtitle, action, eyebrow = 'VendorBridge' }) {
  return (
    <Box className="page-header page-enter">
      <Box>
        <Typography className="page-eyebrow">{eyebrow}</Typography>
        <Typography component="h1" variant="h4">{title}</Typography>
        {subtitle && <Typography className="page-subtitle">{subtitle}</Typography>}
      </Box>
      {action && <Box className="page-actions">{action}</Box>}
    </Box>
  );
}
