import { Box, Typography } from '@mui/material';
import { formatCurrency } from '../utils/formatters.js';

export default function ChartTooltip({ active, payload, label, currency = false }) {
  if (!active || !payload?.length) return null;

  return (
    <Box className="chart-tooltip">
      <Typography className="chart-tooltip-label">{label}</Typography>
      {payload.map((entry) => (
        <Box className="chart-tooltip-row" key={entry.dataKey}>
          <span style={{ background: entry.color }} />
          <Typography>{entry.name || entry.dataKey}</Typography>
          <Typography>{currency ? formatCurrency(entry.value) : Number(entry.value).toLocaleString()}</Typography>
        </Box>
      ))}
    </Box>
  );
}
