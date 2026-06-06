import { InboxOutlined, Refresh } from '@mui/icons-material';
import { Box, Button, CircularProgress, TableCell, TableRow, Typography } from '@mui/material';

export function TableState({ loading, error, empty, colSpan, emptyTitle, onRetry }) {
  if (!loading && !error && !empty) return null;

  return (
    <TableRow>
      <TableCell colSpan={colSpan}>
        <StateContent
          loading={loading}
          error={error}
          title={emptyTitle}
          onRetry={onRetry}
          compact
        />
      </TableCell>
    </TableRow>
  );
}

export function StateContent({
  loading,
  error,
  title = 'Nothing here yet',
  description = 'New records will appear here when they become available.',
  onRetry,
  compact = false
}) {
  if (loading) {
    return (
      <Box className={`state-content ${compact ? 'compact' : ''}`}>
        <CircularProgress size={24} thickness={4} />
        <Typography>Loading the latest information...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className={`state-content ${compact ? 'compact' : ''}`}>
        <Refresh className="state-icon error" />
        <Typography className="state-title">We could not load this information</Typography>
        <Typography className="state-description">{error}</Typography>
        {onRetry && <Button size="small" variant="outlined" onClick={onRetry}>Try again</Button>}
      </Box>
    );
  }

  return (
    <Box className={`state-content ${compact ? 'compact' : ''}`}>
      <InboxOutlined className="state-icon" />
      <Typography className="state-title">{title}</Typography>
      <Typography className="state-description">{description}</Typography>
    </Box>
  );
}
