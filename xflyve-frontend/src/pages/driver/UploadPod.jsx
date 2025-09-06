import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Button,
  TextField,
  IconButton,
  Box,
  useMediaQuery,
  Card,
  CardContent,
  CardActions,
} from "@mui/material";
import { Delete, Edit, Save, Cancel } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { useAuth } from "../../contexts/AuthContext";
import {
  uploadPod,
  listPodsByDriver,
  deletePod,
  updatePodNotes,
} from "../../api";

const DriverPOD = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // detects mobile screen

  const [pods, setPods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState("");
  const [editId, setEditId] = useState(null);
  const [editNotes, setEditNotes] = useState("");

  // Fetch PODs for the driver
  const fetchPods = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listPodsByDriver(user._id);
      setPods(data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load PODs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchPods();
  }, [user]);

  // File selection
  const handleFileChange = (e) => setFile(e.target.files[0] || null);

  // Upload POD
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return setError("Please select a PDF file to upload");

    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("podFile", file); 
    formData.append("driverId", user._id);
    formData.append("notes", notes);

    try {
      const uploaded = await uploadPod(formData);
      setPods((prev) => [...prev, uploaded]);
      setFile(null);
      setNotes("");
    } catch (err) {
      console.error(err.response || err);
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // Delete POD
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this POD?")) return;
    try {
      await deletePod(id);
      setPods((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error(err.response || err);
      setError(err.response?.data?.message || "Failed to delete POD");
    }
  };

  // Edit notes
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
      const updated = await updatePodNotes(id, { notes: editNotes });
      setPods((prev) =>
        prev.map((p) => (p._id === id ? { ...p, notes: updated.notes } : p))
      );
      cancelEdit();
    } catch (err) {
      console.error(err.response || err);
      setError(err.response?.data?.message || "Failed to update notes");
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        My POD Uploads
      </Typography>

      {error && (
        <Alert severity="error" onClose={() => setError("")} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Upload Form */}
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
            {uploading ? "Uploading..." : "Upload POD PDF"}
          </Button>
        </form>
      </Paper>

      {/* POD List */}
      {loading ? (
        <CircularProgress />
      ) : pods.length === 0 ? (
        <Typography>No POD uploads found.</Typography>
      ) : isMobile ? (
        // Mobile card view
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {pods.map((p) => (
            <Card key={p._id} variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary">
                  Uploaded At:
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {new Date(p.uploadDate || p.createdAt).toLocaleString()}
                </Typography>

                <Typography variant="subtitle2" color="textSecondary">
                  Notes:
                </Typography>
                {editId === p._id ? (
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
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {p.notes || "-"}
                  </Typography>
                )}
              </CardContent>
              <CardActions>
                {editId === p._id ? (
                  <>
                    <IconButton onClick={() => saveEdit(p._id)} size="small">
                      <Save />
                    </IconButton>
                    <IconButton onClick={cancelEdit} color="error" size="small">
                      <Cancel />
                    </IconButton>
                  </>
                ) : (
                  <>
                    <IconButton onClick={() => startEdit(p._id, p.notes)} size="small">
                      <Edit />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(p._id)}
                      color="error"
                      size="small"
                    >
                      <Delete />
                    </IconButton>
                  </>
                )}
              </CardActions>
            </Card>
          ))}
        </Box>
      ) : (
        // Desktop table view
        <Box sx={{ overflowX: "auto" }}>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 450 }}>
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
                {pods.map((p) => (
                  <TableRow key={p._id} hover>
                    <TableCell align="center">
                      {new Date(p.uploadDate || p.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell align="center">
                      {editId === p._id ? (
                        <TextField
                          multiline
                          rows={2}
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          size="small"
                        />
                      ) : (
                        p.notes || "-"
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {editId === p._id ? (
                        <>
                          <IconButton onClick={() => saveEdit(p._id)} size="small">
                            <Save />
                          </IconButton>
                          <IconButton onClick={cancelEdit} color="error" size="small">
                            <Cancel />
                          </IconButton>
                        </>
                      ) : (
                        <>
                          <IconButton
                            onClick={() => startEdit(p._id, p.notes)}
                            size="small"
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            onClick={() => handleDelete(p._id)}
                            color="error"
                            size="small"
                          >
                            <Delete />
                          </IconButton>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Container>
  );
};

export default DriverPOD;
