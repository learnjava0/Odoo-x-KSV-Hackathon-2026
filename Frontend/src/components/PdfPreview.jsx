import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  CircularProgress,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import PrintIcon from "@mui/icons-material/Print";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import { useEffect, useState } from "react";
import { api, downloadFile } from "../services/api.js";

export default function PdfPreview({ open, onClose, fetchUrl, filename }) {
  const [loading, setLoading] = useState(false);
  const [objectUrl, setObjectUrl] = useState("");
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (!open) return undefined;
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const resp = await api.get(fetchUrl, { responseType: "blob" });
        if (!mounted) return;
        const u = URL.createObjectURL(resp.data);
        setObjectUrl(u);
      } catch (e) {
        console.error("Could not load PDF", e);
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
        setObjectUrl("");
      }
    };
  }, [open, fetchUrl]);

  const handleDownload = async () => {
    // reuse existing helper for saving
    await downloadFile(fetchUrl, filename || "document.pdf");
  };

  const handlePrint = () => {
    if (!objectUrl) return;
    const w = window.open(objectUrl);
    if (!w) return;
    w.focus();
    // give the new window a moment to load, then print
    setTimeout(() => {
      w.print();
    }, 500);
  };

  const handleOpenNew = () => {
    if (!objectUrl) return;
    window.open(objectUrl, "_blank");
  };

  const changeZoom = (delta) =>
    setZoom((z) => Math.max(0.25, Math.min(3, +(z + delta).toFixed(2))));

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span>{filename || "Document preview"}</span>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ minHeight: 400 }}>
        <Box
          sx={{
            display: "flex",
            gap: 1,
            mb: 1,
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          <Button
            size="small"
            onClick={() => changeZoom(-0.25)}
            startIcon={<ZoomOutIcon />}
          >
            -
          </Button>
          <Button size="small" onClick={() => setZoom(1)} sx={{ minWidth: 36 }}>
            {Math.round(zoom * 100)}%
          </Button>
          <Button
            size="small"
            onClick={() => changeZoom(0.25)}
            startIcon={<ZoomInIcon />}
          >
            +
          </Button>
          <Button
            size="small"
            startIcon={<OpenInNewIcon />}
            onClick={handleOpenNew}
          >
            Open
          </Button>
        </Box>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
            <CircularProgress />
          </Box>
        ) : objectUrl ? (
          <Box sx={{ width: "100%", height: 600, overflow: "auto" }}>
            <Box
              sx={{
                transform: `scale(${zoom})`,
                transformOrigin: "top left",
                width: "100%",
              }}
            >
              <object
                data={objectUrl}
                type="application/pdf"
                width="100%"
                height="600"
              >
                PDF preview not available
              </object>
            </Box>
          </Box>
        ) : (
          <Box sx={{ p: 2 }}>Unable to load PDF.</Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button startIcon={<DownloadIcon />} onClick={handleDownload}>
          Download
        </Button>
        <Button startIcon={<PrintIcon />} onClick={handlePrint}>
          Print
        </Button>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
