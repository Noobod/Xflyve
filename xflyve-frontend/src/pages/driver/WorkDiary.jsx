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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import { useAuth } from "../../contexts/AuthContext";

const WorkDiary = () => {
  const { user, token } = useAuth();
  const [workDiaries, setWorkDiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState("");
  const [editId, setEditId] = useState(null);
  const [editNotes, setEditNotes] = useState("");

  useEffect(() => {
    if (!user) return;

    const fetchWorkDiaries = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/workDiaries/driver/${user._id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (data.success) {
          setWorkDiaries(data.data);
        } else {
          setError(data.message || "Failed to load work diaries");
        }
      } catch {
        setError("Failed to load work diaries");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkDiaries();
  }, [user, token]);

  // Upload handler unchanged
  const handleFileChange = (e) => {
    if (e.target.files.length > 0) setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a PDF file to upload");
      return;
    }
    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("workDiaryFile", file);
    formData.append("driverId", user._id);
    formData.append("notes", notes);

    try {
      const res = await fetch("/api/workDiaries/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setWorkDiaries((prev) => [...prev, data.data]);
        setFile(null);
        setNotes("");
      } else {
        setError(data.message || "Upload failed");
      }
    } catch {
      setError("Server error during upload");
    } finally {
      setUploading(false);
    }
  };

  // Delete handler
  const handleDelete = async (id) => {
    setError("");
    if (!window.confirm("Are you sure you want to delete this work diary?")) return;
    try {
      const res = await fetch(`/api/workDiaries/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setWorkDiaries((prev) => prev.filter((wd) => wd._id !== id));
      } else {
        setError(data.message || "Failed to delete");
      }
    } catch {
      setError("Server error during delete");
    }
  };

  // Start editing notes
  const startEdit = (id, currentNotes) => {
    setEditId(id);
    setEditNotes(currentNotes || "");
  };

  // Cancel editing notes
  const cancelEdit = () => {
    setEditId(null);
    setEditNotes("");
  };

  // Save edited notes
  const saveEdit = async (id) => {
    setError("");
    try {
      const res = await fetch(`/api/workDiaries/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notes: editNotes }),
      });
      const data = await res.json();
      if (data.success) {
        setWorkDiaries((prev) =>
          prev.map((wd) => (wd._id === id ? { ...wd, notes: editNotes } : wd))
        );
        cancelEdit();
      } else {
        setError(data.message || "Failed to update notes");
      }
    } catch {
      setError("Server error during update");
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Work Diary Uploads
      </Typography>

      {error && (
        <Alert severity="error" onClose={() => setError("")} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 4 }}>
        <form onSubmit={handleUpload}>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            style={{ marginBottom: 16 }}
          />
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
      ) : (
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="center" sx={{ fontWeight: "bold" }}>
                  Uploaded At
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold" }}>
                  Notes
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold" }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {workDiaries.map((wd) => (
                <TableRow key={wd._id} hover>
                  <TableCell align="center">
                    {new Date(wd.uploadDate || wd.uploadedAt || wd.createdAt).toLocaleString()}
                  </TableCell>

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
                        <IconButton
                          aria-label="save"
                          color="primary"
                          onClick={() => saveEdit(wd._id)}
                          size="small"
                        >
                          <SaveIcon />
                        </IconButton>
                        <IconButton
                          aria-label="cancel"
                          color="error"
                          onClick={cancelEdit}
                          size="small"
                        >
                          <CancelIcon />
                        </IconButton>
                      </>
                    ) : (
                      <>
                        <IconButton
                          aria-label="edit"
                          onClick={() => startEdit(wd._id, wd.notes)}
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          aria-label="delete"
                          onClick={() => handleDelete(wd._id)}
                          color="error"
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
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
