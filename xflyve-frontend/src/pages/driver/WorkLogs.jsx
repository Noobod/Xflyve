import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
  Alert,
  IconButton,
  Stack,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";

import {
  getWorkLogsByDriverAdmin,
  getWorkLogsByDriver,
  createWorkLog,
  updateWorkLog,
  deleteWorkLog,
} from "../../api"; // Adjust path if needed
import { useAuth } from "../../contexts/AuthContext";

const DriverWorkLogs = () => {
  const { user } = useAuth();
  const driverId = user?.id;

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [processing, setProcessing] = useState(false); // disable buttons during api calls

  // New Log form state
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

  // Editing state: logId of log being edited, and edited fields
  const [editingId, setEditingId] = useState(null);
  const [editFields, setEditFields] = useState({});

  useEffect(() => {
    if (!driverId) return;
    fetchLogs();
  }, [driverId]);

  const fetchLogs = async () => {
  setLoading(true);
  setError("");
  try {
    let res;
    if (user.role === "admin") {
      res = await getWorkLogsByDriverAdmin(driverId);
    } else {
      res = await getWorkLogsByCurrentDriver();
    }
    if (res.data.success) {
      setLogs(res.data.data);
    } else {
      setError(res.data.message || "Failed to load logs");
    }
  } catch (err) {
    setError(err.response?.data?.message || "Server error loading logs");
  } finally {
    setLoading(false);
  }
};

  const handleNewLogChange = (e) => {
    const { name, value } = e.target;
    setNewLog((prev) => ({ ...prev, [name]: value }));
  };

  const validateLog = (log) => {
    if (!log.date) return "Date is required";
    if (log.hours !== "" && (isNaN(log.hours) || Number(log.hours) < 0))
      return "Hours must be a non-negative number";
    if (log.kilometers !== "" && (isNaN(log.kilometers) || Number(log.kilometers) < 0))
      return "Kilometers must be a non-negative number";
    if (log.interstateStartKm !== "" && (isNaN(log.interstateStartKm) || Number(log.interstateStartKm) < 0))
      return "Interstate Start KM must be a non-negative number";
    if (log.interstateEndKm !== "" && (isNaN(log.interstateEndKm) || Number(log.interstateEndKm) < 0))
      return "Interstate End KM must be a non-negative number";
    if (log.deliveriesDone !== "" && (isNaN(log.deliveriesDone) || Number(log.deliveriesDone) < 0))
      return "Deliveries Done must be a non-negative number";
    return null;
  };

  const handleCreateLog = async () => {
    const errMsg = validateLog(newLog);
    if (errMsg) {
      setError(errMsg);
      return;
    }
    setError("");
    setSuccess("");
    setProcessing(true);
    try {
      const payload = {
        driverId,
        date: newLog.date,
        hours: newLog.hours ? Number(newLog.hours) : 0,
        kilometers: newLog.kilometers ? Number(newLog.kilometers) : 0,
        notes: newLog.notes,
        localStartTime: newLog.localStartTime || "",
        localEndTime: newLog.localEndTime || "",
        interstateStartKm: newLog.interstateStartKm ? Number(newLog.interstateStartKm) : 0,
        interstateEndKm: newLog.interstateEndKm ? Number(newLog.interstateEndKm) : 0,
        deliveriesDone: newLog.deliveriesDone ? Number(newLog.deliveriesDone) : 0,
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
      } else {
        setError(res.data.message || "Failed to create work log");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Server error creating work log");
    } finally {
      setProcessing(false);
    }
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
    setError("");
    setSuccess("");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditFields({});
    setError("");
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFields((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async () => {
    const errMsg = validateLog(editFields);
    if (errMsg) {
      setError(errMsg);
      return;
    }
    setError("");
    setSuccess("");
    setProcessing(true);
    try {
      const payload = {
        date: editFields.date,
        hours: editFields.hours ? Number(editFields.hours) : 0,
        kilometers: editFields.kilometers ? Number(editFields.kilometers) : 0,
        notes: editFields.notes,
        localStartTime: editFields.localStartTime || "",
        localEndTime: editFields.localEndTime || "",
        interstateStartKm: editFields.interstateStartKm ? Number(editFields.interstateStartKm) : 0,
        interstateEndKm: editFields.interstateEndKm ? Number(editFields.interstateEndKm) : 0,
        deliveriesDone: editFields.deliveriesDone ? Number(editFields.deliveriesDone) : 0,
        deliveryLocations: editFields.deliveryLocations
          ? editFields.deliveryLocations.split(",").map((loc) => loc.trim())
          : [],
      };
      const res = await updateWorkLog(editingId, payload);
      if (res.data.success) {
        setSuccess("Work log updated");
        setEditingId(null);
        setEditFields({});
        fetchLogs();
      } else {
        setError(res.data.message || "Failed to update work log");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Server error updating work log");
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (logId) => {
    if (!window.confirm("Are you sure you want to delete this log?")) return;
    setError("");
    setSuccess("");
    setProcessing(true);
    try {
      const res = await deleteWorkLog(logId);
      if (res.data.success) {
        setSuccess("Work log deleted");
        fetchLogs();
      } else {
        setError(res.data.message || "Failed to delete work log");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Server error deleting work log");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h4" gutterBottom>
        My Work Logs
      </Typography>

      <Box
        sx={{
          mb: 4,
          p: 3,
          border: "1px solid #ccc",
          borderRadius: 1,
          bgcolor: "#fafafa",
        }}
      >
        <Typography variant="h6" gutterBottom>
          Create New Log
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>
            {success}
          </Alert>
        )}

        <Stack spacing={2}>
          <TextField
            label="Date"
            type="date"
            name="date"
            value={newLog.date}
            onChange={handleNewLogChange}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <TextField
            label="Hours"
            name="hours"
            type="number"
            inputProps={{ min: 0, step: "0.1" }}
            value={newLog.hours}
            onChange={handleNewLogChange}
            fullWidth
          />
          <TextField
            label="Kilometers"
            name="kilometers"
            type="number"
            inputProps={{ min: 0, step: "0.1" }}
            value={newLog.kilometers}
            onChange={handleNewLogChange}
            fullWidth
          />
          <TextField
            label="Local Start Time"
            name="localStartTime"
            type="time"
            value={newLog.localStartTime}
            onChange={handleNewLogChange}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <TextField
            label="Local End Time"
            name="localEndTime"
            type="time"
            value={newLog.localEndTime}
            onChange={handleNewLogChange}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <TextField
            label="Interstate Start KM"
            name="interstateStartKm"
            type="number"
            inputProps={{ min: 0 }}
            value={newLog.interstateStartKm}
            onChange={handleNewLogChange}
            fullWidth
          />
          <TextField
            label="Interstate End KM"
            name="interstateEndKm"
            type="number"
            inputProps={{ min: 0 }}
            value={newLog.interstateEndKm}
            onChange={handleNewLogChange}
            fullWidth
          />
          <TextField
            label="Deliveries Done"
            name="deliveriesDone"
            type="number"
            inputProps={{ min: 0 }}
            value={newLog.deliveriesDone}
            onChange={handleNewLogChange}
            fullWidth
          />
          <TextField
            label="Delivery Locations (comma separated)"
            name="deliveryLocations"
            multiline
            rows={2}
            value={newLog.deliveryLocations}
            onChange={handleNewLogChange}
            fullWidth
          />
          <TextField
            label="Notes"
            name="notes"
            multiline
            rows={3}
            value={newLog.notes}
            onChange={handleNewLogChange}
            fullWidth
          />
          <Button
            variant="contained"
            onClick={handleCreateLog}
            disabled={processing}
            sx={{ alignSelf: "flex-start" }}
          >
            {processing ? "Creating..." : "Create Log"}
          </Button>
        </Stack>
      </Box>

      <Typography variant="h5" gutterBottom>
        Existing Logs
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" p={5}>
          <CircularProgress size={50} />
        </Box>
      ) : logs.length === 0 ? (
        <Typography align="center" sx={{ mt: 3 }}>
          No logs found.
        </Typography>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Hours</TableCell>
              <TableCell>Kilometers</TableCell>
              <TableCell>Local Start Time</TableCell>
              <TableCell>Local End Time</TableCell>
              <TableCell>Interstate Start KM</TableCell>
              <TableCell>Interstate End KM</TableCell>
              <TableCell>Deliveries Done</TableCell>
              <TableCell>Delivery Locations</TableCell>
              <TableCell>Notes</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log._id}>
                {editingId === log._id ? (
                  <>
                    <TableCell>
                      <TextField
                        type="date"
                        name="date"
                        value={editFields.date}
                        onChange={handleEditChange}
                        InputLabelProps={{ shrink: true }}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        name="hours"
                        value={editFields.hours}
                        onChange={handleEditChange}
                        size="small"
                        inputProps={{ min: 0, step: "0.1" }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        name="kilometers"
                        value={editFields.kilometers}
                        onChange={handleEditChange}
                        size="small"
                        inputProps={{ min: 0, step: "0.1" }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="time"
                        name="localStartTime"
                        value={editFields.localStartTime}
                        onChange={handleEditChange}
                        size="small"
                        InputLabelProps={{ shrink: true }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="time"
                        name="localEndTime"
                        value={editFields.localEndTime}
                        onChange={handleEditChange}
                        size="small"
                        InputLabelProps={{ shrink: true }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        name="interstateStartKm"
                        value={editFields.interstateStartKm}
                        onChange={handleEditChange}
                        size="small"
                        inputProps={{ min: 0 }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        name="interstateEndKm"
                        value={editFields.interstateEndKm}
                        onChange={handleEditChange}
                        size="small"
                        inputProps={{ min: 0 }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        name="deliveriesDone"
                        value={editFields.deliveriesDone}
                        onChange={handleEditChange}
                        size="small"
                        inputProps={{ min: 0 }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        name="deliveryLocations"
                        value={editFields.deliveryLocations}
                        onChange={handleEditChange}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        name="notes"
                        value={editFields.notes}
                        onChange={handleEditChange}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          onClick={handleSaveEdit}
                          color="primary"
                          disabled={processing}
                          aria-label="save"
                        >
                          <SaveIcon />
                        </IconButton>
                        <IconButton
                          onClick={cancelEditing}
                          color="error"
                          disabled={processing}
                          aria-label="cancel"
                        >
                          <CancelIcon />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell>{log.date ? new Date(log.date).toLocaleDateString() : "-"}</TableCell>
                    <TableCell>{log.hours ?? "-"}</TableCell>
                    <TableCell>{log.kilometers ?? "-"}</TableCell>
                    <TableCell>{log.localStartTime || "-"}</TableCell>
                    <TableCell>{log.localEndTime || "-"}</TableCell>
                    <TableCell>{log.interstateStartKm ?? "-"}</TableCell>
                    <TableCell>{log.interstateEndKm ?? "-"}</TableCell>
                    <TableCell>{log.deliveriesDone ?? "-"}</TableCell>
                    <TableCell>
                      {Array.isArray(log.deliveryLocations)
                        ? log.deliveryLocations.join(", ")
                        : ""}
                    </TableCell>
                    <TableCell>{log.notes || "-"}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          onClick={() => startEditing(log)}
                          aria-label="edit"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDelete(log._id)}
                          aria-label="delete"
                          disabled={processing}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Container>
  );
};

export default DriverWorkLogs;
