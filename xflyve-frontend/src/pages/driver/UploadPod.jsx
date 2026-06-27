import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Delete, Edit, Save, Cancel } from "@mui/icons-material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { uploadPod, listPodsByDriver, deletePod, updatePodNotes } from "../../api";

const palette = {
  ink: "#0b1220",
  muted: "#697586",
  line: "rgba(15, 23, 42, 0.075)",
  panel: "rgba(255, 255, 255, 0.88)",
  heroStart: "#050b18",
  heroMid: "#0b2f3a",
  heroEnd: "#0c5f5b",
  teal: "#0e7c76",
};

const formatDateTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return date.toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
};

const DriverPOD = () => {
  const { user } = useAuth();
  const { id: routeJobId } = useParams();
  const driverId = user?._id || user?.id;

  const [pods, setPods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState("");
  const [editId, setEditId] = useState(null);
  const [editNotes, setEditNotes] = useState("");

  const fetchPods = useCallback(async () => {
    if (!driverId) return;
    setLoading(true);
    setError("");
    try {
      const data = await listPodsByDriver(driverId);
      setPods(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load PODs");
    } finally {
      setLoading(false);
    }
  }, [driverId]);

  useEffect(() => {
    fetchPods();
  }, [fetchPods]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return setError("Please select a PDF file to upload.");
    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("podFile", file);
    formData.append("driverId", driverId);
    formData.append("notes", notes);
    if (routeJobId) formData.append("jobId", routeJobId);

    try {
      const uploaded = await uploadPod(formData);
      setPods((prev) => [uploaded, ...prev]);
      setFile(null);
      setNotes("");
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this POD upload?")) return;
    try {
      await deletePod(id);
      setPods((prev) => prev.filter((pod) => pod._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete POD");
    }
  };

  const saveEdit = async (id) => {
    try {
      const updated = await updatePodNotes(id, { notes: editNotes });
      setPods((prev) => prev.map((pod) => (pod._id === id ? { ...pod, notes: updated.notes } : pod)));
      setEditId(null);
      setEditNotes("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update notes");
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", pt: { xs: 3, sm: 4 }, pb: { xs: 4, sm: 6 }, overflowX: "hidden", background: `radial-gradient(circle at 0% 0%, ${alpha(palette.teal, 0.13)}, transparent 32%), linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%)` }}>
      <Box sx={{ width: "100%", maxWidth: 960, mx: "auto", px: { xs: 2, sm: 3, md: 4 } }}>
        <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 3.5 }, mb: 3, borderRadius: 5, color: "white", background: `linear-gradient(135deg, ${palette.heroStart} 0%, ${palette.heroMid} 58%, ${palette.heroEnd} 100%)` }}>
          <Chip label="Proof of delivery" size="small" sx={{ mb: 1.5, color: "white", bgcolor: alpha("#fff", 0.12), fontWeight: 850 }} />
          <Typography variant="h4" fontWeight={950} sx={{ letterSpacing: "-0.065em", lineHeight: 1.05 }}>Upload POD</Typography>
          <Typography sx={{ mt: 1, color: alpha("#fff", 0.74), lineHeight: 1.6 }}>
            Upload delivery proof for owner records and invoice preparation.
          </Typography>
        </Paper>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>{error}</Alert>}
        {routeJobId && (
          <Alert severity="info" sx={{ mb: 2, borderRadius: 3 }}>
            This POD will be linked to the selected job.
          </Alert>
        )}

        <Paper elevation={0} sx={{ p: { xs: 2, sm: 2.5 }, mb: 3, borderRadius: 5, border: "1px solid", borderColor: palette.line, bgcolor: palette.panel }}>
          <form onSubmit={handleUpload}>
            <Stack spacing={2}>
              <Box sx={{ p: 2, borderRadius: 4, border: "1px dashed", borderColor: alpha(palette.teal, 0.32), bgcolor: alpha(palette.teal, 0.055) }}>
                <Stack spacing={1}>
                  <Box sx={{ width: 48, height: 48, borderRadius: 3, display: "grid", placeItems: "center", color: palette.teal, bgcolor: alpha(palette.teal, 0.1) }}>
                    <UploadFileIcon />
                  </Box>
                  <Typography fontWeight={950} sx={{ color: palette.ink }}>Select POD PDF</Typography>
                  <Typography variant="body2" sx={{ color: palette.muted }}>Choose the proof of delivery document from your phone.</Typography>
                  <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files[0] || null)} />
                  {file && <Chip icon={<PictureAsPdfIcon />} label={file.name} sx={{ alignSelf: "flex-start" }} />}
                </Stack>
              </Box>
              <TextField label="Notes (optional)" fullWidth multiline rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add delivery notes if needed" />
              <Button variant="contained" size="large" type="submit" disabled={uploading} startIcon={<UploadFileIcon />} sx={{ minHeight: 56, borderRadius: 3, bgcolor: palette.ink, fontWeight: 950 }}>
                {uploading ? "Uploading..." : "Upload POD"}
              </Button>
            </Stack>
          </form>
        </Paper>

        <Typography variant="h5" fontWeight={950} sx={{ mb: 1.75, color: palette.ink, letterSpacing: "-0.045em" }}>Recent POD uploads</Typography>
        {loading ? (
          <Paper elevation={0} sx={{ p: 5, textAlign: "center", borderRadius: 5, border: "1px solid", borderColor: palette.line }}><CircularProgress /></Paper>
        ) : pods.length === 0 ? (
          <Paper elevation={0} sx={{ p: 3, borderRadius: 5, border: "1px solid", borderColor: alpha(palette.teal, 0.16), bgcolor: alpha(palette.teal, 0.055) }}>
            <Typography fontWeight={900}>No POD uploads yet</Typography>
            <Typography sx={{ mt: 0.5, color: palette.muted }}>Uploaded proof of delivery documents will appear here.</Typography>
          </Paper>
        ) : (
          <Stack spacing={2}>
            {pods.map((pod) => (
              <Paper key={pod._id} elevation={0} sx={{ p: 2, borderRadius: 5, border: "1px solid", borderColor: palette.line, bgcolor: palette.panel }}>
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <Box sx={{ width: 46, height: 46, borderRadius: 3, display: "grid", placeItems: "center", color: palette.teal, bgcolor: alpha(palette.teal, 0.09), flexShrink: 0 }}>
                    <Inventory2OutlinedIcon />
                  </Box>
                  <Box flex={1} minWidth={0}>
                    <Typography fontWeight={950} sx={{ color: palette.ink }}>{formatDateTime(pod.uploadDate || pod.createdAt)}</Typography>
                    {editId === pod._id ? (
                      <TextField multiline rows={2} fullWidth value={editNotes} onChange={(e) => setEditNotes(e.target.value)} sx={{ mt: 1 }} />
                    ) : (
                      <Typography variant="body2" sx={{ mt: 0.5, color: palette.muted }}>{pod.notes || "No notes added."}</Typography>
                    )}
                  </Box>
                  <Stack direction="row" spacing={0.5}>
                    {editId === pod._id ? (
                      <>
                        <IconButton onClick={() => saveEdit(pod._id)}><Save /></IconButton>
                        <IconButton color="error" onClick={() => setEditId(null)}><Cancel /></IconButton>
                      </>
                    ) : (
                      <>
                        <IconButton onClick={() => { setEditId(pod._id); setEditNotes(pod.notes || ""); }}><Edit /></IconButton>
                        <IconButton color="error" onClick={() => handleDelete(pod._id)}><Delete /></IconButton>
                      </>
                    )}
                  </Stack>
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
};

export default DriverPOD;
