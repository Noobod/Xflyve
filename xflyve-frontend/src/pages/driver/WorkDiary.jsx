import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Button,
  TextField,
  IconButton,
  Box,
  Card,
  CardContent,
  CardActions,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import { useAuth } from "../../contexts/AuthContext";
import {
  uploadWorkDiary,
  listWorkDiariesByDriver,
  deleteWorkDiary,
  updateWorkDiaryNotes,
} from "../../api";

const WorkDiary = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [workDiaries, setWorkDiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState("");
  const [editId, setEditId] = useState(null);
  const [editNotes, setEditNotes] = useState("");

  // Fetch work diaries
  const fetchWorkDiaries = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listWorkDiariesByDriver(user._id);
      setWorkDiaries(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load work diaries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchWorkDiaries();
  }, [user]);

  const handleFileChange = (e) => setFile(e.target.files[0] || null);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return setError("Please select a PDF file to upload");
    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("workDiaryFile", file);
    formData.append("driverId", user._id);
    formData.append("notes", notes);

    try {
      const uploaded = await uploadWorkDiary(formData);
      setWorkDiaries((prev) => [...prev, uploaded]);
      setFile(null);
      setNotes("");
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this work diary?")) return;
    try {
      await deleteWorkDiary(id);
      setWorkDiaries((prev) => prev.filter((wd) => wd._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete");
    }
  };

  const startEdit = (id, currentNotes) => {
    setEditId(id);
    setEditNotes(currentNotes || "");
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditNotes("");
  };

  const saveEdit = async (id) => {
    try {
      const updated = await updateWorkDiaryNotes(id, { notes: editNotes });
      setWorkDiaries((prev) =>
        prev.map((wd) => (wd._id === id ? { ...wd, notes: updated.notes } : wd))
      );
      cancelEdit();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update notes");
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Work Diary Uploads
      </Typography>

      {error && <Alert severity="error" onClose={() => setError("")} sx={{ mb: 2 }}>{error}</Alert>}

      {/* Upload Form */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <form onSubmit={handleUpload}>
          <input type="file" accept="application/pdf" onChange={handleFileChange} style={{ marginBottom: 16 }} />
          <TextField
            label="Notes (optional)"
            fullWidth
            multiline
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button variant="contained" type="submit" disabled={uploading}>
            {uploading ? "Uploading..." : "Upload Work Diary PDF"}
          </Button>
        </form>
      </Paper>

      {loading ? (
        <CircularProgress />
      ) : workDiaries.length === 0 ? (
        <Typography>No work diary uploads found.</Typography>
      ) : isMobile ? (
        // Mobile: card layout
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {workDiaries.map((wd) => (
            <Card key={wd._id} variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary">Uploaded At:</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {new Date(wd.uploadDate || wd.createdAt).toLocaleString()}
                </Typography>

                <Typography variant="subtitle2" color="textSecondary">Notes:</Typography>
                {editId === wd._id ? (
                  <TextField
                    multiline
                    rows={2}
                    fullWidth
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    size="small"
                    sx={{ mb: 1 }}
                  />
                ) : (
                  <Typography variant="body2" sx={{ mb: 1 }}>{wd.notes || "-"}</Typography>
                )}
              </CardContent>
              <CardActions>
                {editId === wd._id ? (
                  <>
                    <IconButton onClick={() => saveEdit(wd._id)} size="small"><SaveIcon /></IconButton>
                    <IconButton onClick={cancelEdit} color="error" size="small"><CancelIcon /></IconButton>
                  </>
                ) : (
                  <>
                    <IconButton onClick={() => startEdit(wd._id, wd.notes)} size="small"><EditIcon /></IconButton>
                    <IconButton onClick={() => handleDelete(wd._id)} color="error" size="small"><DeleteIcon /></IconButton>
                  </>
                )}
              </CardActions>
            </Card>
          ))}
        </Box>
      ) : (
        // Desktop: table layout
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="center">Uploaded At</TableCell>
                <TableCell align="center">Notes</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {workDiaries.map((wd) => (
                <TableRow key={wd._id} hover>
                  <TableCell align="center">{new Date(wd.uploadDate || wd.createdAt).toLocaleString()}</TableCell>
                  <TableCell align="center">
                    {editId === wd._id ? (
                      <TextField
                        multiline
                        rows={2}
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        size="small"
                      />
                    ) : (
                      wd.notes || "-"
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {editId === wd._id ? (
                      <>
                        <IconButton onClick={() => saveEdit(wd._id)} size="small"><SaveIcon /></IconButton>
                        <IconButton onClick={cancelEdit} color="error" size="small"><CancelIcon /></IconButton>
                      </>
                    ) : (
                      <>
                        <IconButton onClick={() => startEdit(wd._id, wd.notes)} size="small"><EditIcon /></IconButton>
                        <IconButton onClick={() => handleDelete(wd._id)} color="error" size="small"><DeleteIcon /></IconButton>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default WorkDiary;
