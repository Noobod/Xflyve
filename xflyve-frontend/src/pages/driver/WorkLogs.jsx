import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  Stack,
  Paper,
  useMediaQuery,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  getWorkLogsByDriverAdmin,
  getWorkLogsByCurrentDriver,
  createWorkLog,
  updateWorkLog,
  deleteWorkLog,
} from "../../api";
import { useAuth } from "../../contexts/AuthContext";

const DriverWorkLogs = () => {
  const { user } = useAuth();
  const driverId = user?.id;
  const isMobile = useMediaQuery("(max-width:768px)");

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [processing, setProcessing] = useState(false);

  const [newLog, setNewLog] = useState({
    date: new Date().toISOString().split("T")[0],
    hours: "",
    kilometers: "",
    notes: "",
    localStartTime: "",
    localEndTime: "",
    interstateStartKm: "",
    interstateEndKm: "",
    deliveriesDone: "",
    deliveryLocations: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [editFields, setEditFields] = useState({});

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    setError("");
    try {
      let res;
      if (user.role === "admin" && driverId) {
        res = await getWorkLogsByDriverAdmin(driverId);
      } else {
        res = await getWorkLogsByCurrentDriver();
      }
      if (res.data.success) setLogs(res.data.data);
      else setError(res.data.message || "Failed to load logs");
    } catch (err) {
      setError(err.response?.data?.message || "Server error loading logs");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (setter) => (e) => {
    const { name, value } = e.target;
    setter((prev) => ({ ...prev, [name]: value }));
  };

  const validateLog = (log) => {
    if (!log.date) return "Date is required";
    const numericFields = [
      "hours",
      "kilometers",
      "interstateStartKm",
      "interstateEndKm",
      "deliveriesDone",
    ];
    for (let field of numericFields) {
      if (log[field] !== "" && (isNaN(log[field]) || Number(log[field]) < 0))
        return `${field} must be a non-negative number`;
    }
    return null;
  };

  const handleCreateLog = async () => {
    const errMsg = validateLog(newLog);
    if (errMsg) return setError(errMsg);
    setError(""); setSuccess(""); setProcessing(true);
    try {
      const payload = {
        ...newLog,
        hours: Number(newLog.hours) || 0,
        kilometers: Number(newLog.kilometers) || 0,
        interstateStartKm: Number(newLog.interstateStartKm) || 0,
        interstateEndKm: Number(newLog.interstateEndKm) || 0,
        deliveriesDone: Number(newLog.deliveriesDone) || 0,
        deliveryLocations: newLog.deliveryLocations
          ? newLog.deliveryLocations.split(",").map((loc) => loc.trim())
          : [],
      };
      const res = await createWorkLog(payload);
      if (res.data.success) {
        setSuccess("Work log created successfully");
        setNewLog({
          date: new Date().toISOString().split("T")[0],
          hours: "",
          kilometers: "",
          notes: "",
          localStartTime: "",
          localEndTime: "",
          interstateStartKm: "",
          interstateEndKm: "",
          deliveriesDone: "",
          deliveryLocations: "",
        });
        fetchLogs();
      } else setError(res.data.message || "Failed to create work log");
    } catch (err) {
      setError(err.response?.data?.message || "Server error creating work log");
    } finally { setProcessing(false); }
  };

  const startEditing = (log) => {
    setEditingId(log._id);
    setEditFields({
      date: log.date ? new Date(log.date).toISOString().split("T")[0] : "",
      hours: log.hours?.toString() ?? "",
      kilometers: log.kilometers?.toString() ?? "",
      notes: log.notes ?? "",
      localStartTime: log.localStartTime || "",
      localEndTime: log.localEndTime || "",
      interstateStartKm: log.interstateStartKm?.toString() || "",
      interstateEndKm: log.interstateEndKm?.toString() || "",
      deliveriesDone: log.deliveriesDone?.toString() || "",
      deliveryLocations: Array.isArray(log.deliveryLocations)
        ? log.deliveryLocations.join(", ")
        : "",
    });
    setError(""); setSuccess("");
  };

  const cancelEditing = () => { setEditingId(null); setEditFields({}); setError(""); };

  const handleSaveEdit = async () => {
    const errMsg = validateLog(editFields);
    if (errMsg) return setError(errMsg);
    setError(""); setSuccess(""); setProcessing(true);
    try {
      const payload = {
        ...editFields,
        hours: Number(editFields.hours) || 0,
        kilometers: Number(editFields.kilometers) || 0,
        interstateStartKm: Number(editFields.interstateStartKm) || 0,
        interstateEndKm: Number(editFields.interstateEndKm) || 0,
        deliveriesDone: Number(editFields.deliveriesDone) || 0,
        deliveryLocations: editFields.deliveryLocations
          ? editFields.deliveryLocations.split(",").map((loc) => loc.trim())
          : [],
      };
      const res = await updateWorkLog(editingId, payload);
      if (res.data.success) {
        setSuccess("Work log updated"); setEditingId(null); setEditFields({});
        fetchLogs();
      } else setError(res.data.message || "Failed to update work log");
    } catch (err) {
      setError(err.response?.data?.message || "Server error updating work log");
    } finally { setProcessing(false); }
  };

  const handleDelete = async (logId) => {
    if (!window.confirm("Are you sure you want to delete this log?")) return;
    setError(""); setSuccess(""); setProcessing(true);
    try {
      const res = await deleteWorkLog(logId);
      if (res.data.success) { setSuccess("Work log deleted"); fetchLogs(); }
      else setError(res.data.message || "Failed to delete work log");
    } catch (err) {
      setError(err.response?.data?.message || "Server error deleting work log");
    } finally { setProcessing(false); }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h4" gutterBottom>My Work Logs</Typography>

      {/* Create New Log */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Create New Log</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}

        <Stack spacing={2}>
          {["date","hours","kilometers","localStartTime","localEndTime","interstateStartKm","interstateEndKm","deliveriesDone","deliveryLocations","notes"].map((field) => (
            <TextField
              key={field}
              label={field === "deliveryLocations" ? "Delivery Locations (comma separated)" : field.charAt(0).toUpperCase() + field.slice(1)}
              type={field.includes("Time") ? "time" : field==="date"?"date":field==="hours"||field==="kilometers"||field.includes("Km")||field==="deliveriesDone"?"number":"text"}
              inputProps={field==="hours"||field==="kilometers"||field.includes("Km")||field==="deliveriesDone"?{ min: 0, step: "0.1" }:{}}
              name={field}
              value={newLog[field]}
              onChange={handleChange(setNewLog)}
              fullWidth
              InputLabelProps={field==="date"||field.includes("Time")?{ shrink: true }:{}}
              multiline={field==="notes" || field==="deliveryLocations"}
              rows={field==="notes"?3:field==="deliveryLocations"?2:1}
            />
          ))}
          <Button variant="contained" onClick={handleCreateLog} disabled={processing}>
            {processing ? "Creating..." : "Create Log"}
          </Button>
        </Stack>
      </Paper>

      {/* Existing Logs */}
      <Typography variant="h5" gutterBottom>Existing Logs</Typography>
      {loading ? (
        <Box display="flex" justifyContent="center" p={5}><CircularProgress size={50} /></Box>
      ) : logs.length === 0 ? (
        <Typography align="center" sx={{ mt: 3 }}>No logs found.</Typography>
      ) : (
        <Stack spacing={2}>
          {logs.map((log) => (
            <Paper key={log._id} sx={{ p: 2 }}>
              {editingId === log._id ? (
                <Stack spacing={1}>
                  {Object.keys(editFields).map((field) => (
                    <TextField
                      key={field}
                      label={field==="deliveryLocations"?"Delivery Locations":field.charAt(0).toUpperCase()+field.slice(1)}
                      type={field.includes("Time")?"time":field==="date"?"date":field==="hours"||field==="kilometers"||field.includes("Km")||field==="deliveriesDone"?"number":"text"}
                      inputProps={field==="hours"||field==="kilometers"||field.includes("Km")||field==="deliveriesDone"?{ min: 0, step: "0.1" }:{}}
                      name={field}
                      value={editFields[field]}
                      onChange={handleChange(setEditFields)}
                      fullWidth
                      InputLabelProps={field==="date"||field.includes("Time")?{ shrink: true }:{}}
                      multiline={field==="notes" || field==="deliveryLocations"}
                      rows={field==="notes"?3:field==="deliveryLocations"?2:1}
                    />
                  ))}
                  <Stack direction="row" spacing={1}>
                    <Button variant="contained" onClick={handleSaveEdit} disabled={processing}><SaveIcon /></Button>
                    <Button variant="outlined" color="error" onClick={cancelEditing} disabled={processing}><CancelIcon /></Button>
                  </Stack>
                </Stack>
              ) : (
                <Stack spacing={1}>
                  {Object.entries(log).map(([key, value]) =>
                    key !== "_id" && key !== "__v" ? (
                      <Typography key={key}><strong>{key.charAt(0).toUpperCase()+key.slice(1)}:</strong> {Array.isArray(value)?value.join(", "):(value || "-")}</Typography>
                    ) : null
                  )}
                  <Stack direction="row" spacing={1}>
                    <IconButton onClick={() => startEditing(log)} aria-label="edit"><EditIcon /></IconButton>
                    <IconButton onClick={() => handleDelete(log._id)} aria-label="delete" color="error" disabled={processing}><DeleteIcon /></IconButton>
                  </Stack>
                </Stack>
              )}
            </Paper>
          ))}
        </Stack>
      )}
    </Container>
  );
};

export default DriverWorkLogs;
