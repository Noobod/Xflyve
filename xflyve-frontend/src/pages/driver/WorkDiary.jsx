import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  uploadWorkDiary,
  listWorkDiariesByDriver,
  deleteWorkDiary,
  updateWorkDiaryNotes,
} from "../../api";

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

const WorkDiary = () => {
  const { user } = useAuth();
  const { id: routeJobId } = useParams();
  const driverId = user?._id || user?.id;

  const [workDiaries, setWorkDiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState("");
  const [editId, setEditId] = useState(null);
  const [editNotes, setEditNotes] = useState("");

  const fetchWorkDiaries = useCallback(async () => {
    if (!driverId) return;
    setLoading(true);
    setError("");
    try {
      const data = await listWorkDiariesByDriver(driverId);
      setWorkDiaries(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load work diaries");
    } finally {
      setLoading(false);
    }
  }, [driverId]);

  useEffect(() => {
    fetchWorkDiaries();
  }, [fetchWorkDiaries]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return setError("Please select a PDF file to upload.");
    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("workDiaryFile", file);
    formData.append("driverId", driverId);
    formData.append("notes", notes);
    if (routeJobId) formData.append("jobId", routeJobId);

    try {
      const uploaded = await uploadWorkDiary(formData);
      setWorkDiaries((prev) => [uploaded, ...prev]);
      setFile(null);
      setNotes("");
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this work diary upload?")) return;
    try {
      await deleteWorkDiary(id);
      setWorkDiaries((prev) => prev.filter((diary) => diary._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete work diary");
    }
  };

  const saveEdit = async (id) => {
    try {
      const updated = await updateWorkDiaryNotes(id, { notes: editNotes });
      setWorkDiaries((prev) =>
        prev.map((diary) => (diary._id === id ? { ...diary, notes: updated.notes } : diary))
      );
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
          <Chip label="Compliance document" size="small" sx={{ mb: 1.5, color: "white", bgcolor: alpha("#fff", 0.12), fontWeight: 850 }} />
          <Typography variant="h4" fontWeight={950} sx={{ letterSpacing: "-0.065em", lineHeight: 1.05 }}>Upload Work Diary</Typography>
          <Typography sx={{ mt: 1, color: alpha("#fff", 0.74), lineHeight: 1.6 }}>
            Upload your diary or compliance PDF. This is separate from your structured work log.
          </Typography>
        </Paper>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>{error}</Alert>}
        {routeJobId && (
          <Alert severity="info" sx={{ mb: 2, borderRadius: 3 }}>
            This work diary will be linked to the selected interstate job.
          </Alert>
        )}

        <Paper elevation={0} sx={{ p: { xs: 2, sm: 2.5 }, mb: 3, borderRadius: 5, border: "1px solid", borderColor: palette.line, bgcolor: palette.panel }}>
          <form onSubmit={handleUpload}>
            <Stack spacing={2}>
              <Box sx={{ p: 2, borderRadius: 4, border: "1px dashed", borderColor: alpha(palette.teal, 0.32), bgcolor: alpha(palette.teal, 0.055) }}>
                <Stack spacing={1}>
                  <Box sx={{ width: 48, height: 48, borderRadius: 3, display: "grid", placeItems: "center", color: palette.teal, bgcolor: alpha(palette.teal, 0.1) }}>
                    <DescriptionOutlinedIcon />
                  </Box>
                  <Typography fontWeight={950} sx={{ color: palette.ink }}>Select diary/compliance PDF</Typography>
                  <Typography variant="body2" sx={{ color: palette.muted }}>Choose the work diary or compliance document from your phone.</Typography>
                  <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files[0] || null)} />
                  {file && <Chip icon={<PictureAsPdfIcon />} label={file.name} sx={{ alignSelf: "flex-start" }} />}
                </Stack>
              </Box>
              <TextField label="Notes (optional)" fullWidth multiline rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add diary notes if needed" />
              <Button variant="contained" size="large" type="submit" disabled={uploading} startIcon={<UploadFileIcon />} sx={{ minHeight: 56, borderRadius: 3, bgcolor: palette.ink, fontWeight: 950 }}>
                {uploading ? "Uploading..." : "Upload Work Diary"}
              </Button>
            </Stack>
          </form>
        </Paper>

        <Typography variant="h5" fontWeight={950} sx={{ mb: 1.75, color: palette.ink, letterSpacing: "-0.045em" }}>Recent diary uploads</Typography>
        {loading ? (
          <Paper elevation={0} sx={{ p: 5, textAlign: "center", borderRadius: 5, border: "1px solid", borderColor: palette.line }}><CircularProgress /></Paper>
        ) : workDiaries.length === 0 ? (
          <Paper elevation={0} sx={{ p: 3, borderRadius: 5, border: "1px solid", borderColor: alpha(palette.teal, 0.16), bgcolor: alpha(palette.teal, 0.055) }}>
            <Typography fontWeight={900}>No diary uploads yet</Typography>
            <Typography sx={{ mt: 0.5, color: palette.muted }}>Uploaded work diary documents will appear here.</Typography>
          </Paper>
        ) : (
          <Stack spacing={2}>
            {workDiaries.map((diary) => (
              <Paper key={diary._id} elevation={0} sx={{ p: 2, borderRadius: 5, border: "1px solid", borderColor: palette.line, bgcolor: palette.panel }}>
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <Box sx={{ width: 46, height: 46, borderRadius: 3, display: "grid", placeItems: "center", color: palette.teal, bgcolor: alpha(palette.teal, 0.09), flexShrink: 0 }}>
                    <DescriptionOutlinedIcon />
                  </Box>
                  <Box flex={1} minWidth={0}>
                    <Typography fontWeight={950} sx={{ color: palette.ink }}>{formatDateTime(diary.uploadDate || diary.createdAt)}</Typography>
                    {editId === diary._id ? (
                      <TextField multiline rows={2} fullWidth value={editNotes} onChange={(e) => setEditNotes(e.target.value)} sx={{ mt: 1 }} />
                    ) : (
                      <Typography variant="body2" sx={{ mt: 0.5, color: palette.muted }}>{diary.notes || "No notes added."}</Typography>
                    )}
                  </Box>
                  <Stack direction="row" spacing={0.5}>
                    {editId === diary._id ? (
                      <>
                        <IconButton onClick={() => saveEdit(diary._id)}><SaveIcon /></IconButton>
                        <IconButton color="error" onClick={() => setEditId(null)}><CancelIcon /></IconButton>
                      </>
                    ) : (
                      <>
                        <IconButton onClick={() => { setEditId(diary._id); setEditNotes(diary.notes || ""); }}><EditIcon /></IconButton>
                        <IconButton color="error" onClick={() => handleDelete(diary._id)}><DeleteIcon /></IconButton>
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

export default WorkDiary;
