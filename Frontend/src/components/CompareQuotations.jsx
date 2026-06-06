import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { formatCurrency } from "../utils/formatters.js";

export default function CompareQuotations({ open, onClose, quotes = [] }) {
  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span>Compare Quotations ({quotes.length})</span>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {quotes.length === 0 ? (
          <Typography>No quotations selected for comparison.</Typography>
        ) : (
          <Box sx={{ overflowX: "auto" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Field</TableCell>
                  {quotes.map((q) => (
                    <TableCell key={q.quotationId}>{q.vendorName}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Unit price</TableCell>
                  {quotes.map((q) => (
                    <TableCell key={q.quotationId}>
                      {formatCurrency(q.unitPrice)}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell>Quantity</TableCell>
                  {quotes.map((q) => (
                    <TableCell key={q.quotationId}>
                      {q.quantity || "—"}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell>Delivery (days)</TableCell>
                  {quotes.map((q) => (
                    <TableCell key={q.quotationId}>
                      {q.deliveryTimeline} days
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell>Vendor rating</TableCell>
                  {quotes.map((q) => (
                    <TableCell key={q.quotationId}>{q.vendorRating}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell>Total with taxes</TableCell>
                  {quotes.map((q) => (
                    <TableCell key={q.quotationId}>
                      <strong>
                        {formatCurrency(q.totalQuotationValueWithTaxes)}
                      </strong>
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell>Notes</TableCell>
                  {quotes.map((q) => (
                    <TableCell key={q.quotationId}>
                      {q.notes || "No notes"}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell>Recommended</TableCell>
                  {quotes.map((q) => (
                    <TableCell key={q.quotationId}>
                      {q.recommended ? "Yes" : "No"}
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
