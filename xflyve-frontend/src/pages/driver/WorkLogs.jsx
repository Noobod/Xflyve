import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import NotesIcon from "@mui/icons-material/Notes";
import SpeedIcon from "@mui/icons-material/Speed";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import {
  getWorkLogsByCurrentDriver,
  createWorkLog,
  updateWorkLog,
  deleteWorkLog,
} from "../../api";
import { useAuth } from "../../contexts/AuthContext";

const palette = {
  ink: "#0b1220",
  muted: "#697586",
  line: "rgba(15, 23, 42, 0.075)",
  panel: "rgba(255, 255, 255, 0.88)",
  heroStart: "#050b18",
  heroMid: "#0b2f3a",
  heroEnd: "#0c5f5b",
  teal: "#0e7c76",
  blue: "#2563eb",
  emerald: "#07866f",
  amber: "#b76e00",
  rose: "#b42318",
};

const initialLog = {
  date: new Date().toISOString().split("T")[0],
  hours: "",
  kilometers: "",
  deliveriesDone: "",
  notes: "",
  localStartTime: "",
  localEndTime: "",
  interstateStartKm: "",
  interstateEndKm: "",
  deliveryLocations: "",
};

const formatDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return date.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
};

const getStatusMeta = (status = "pending") => {
  if (status === "approved") return { label: "Approved", color: palette.emerald };
  if (status === "rejected") return { label: "Rejected", color: palette.rose };
  return { label: "Pending approval", color: palette.amber };
};

const StatPill = ({ icon, label, value }) => (
  <Paper elevation={0} sx={{ p: 1.5, borderRadius: 3, border: "1px solid", borderColor: palette.line, bgcolor: alpha("#fff", 0.72) }}>
    <Stack direction="row" spacing={1.25} alignItems="center">
      <Box sx={{ width: 36, height: 36, borderRadius: 2.5, display: "grid", placeItems: "center", color: palette.teal, bgcolor: alpha(palette.teal, 0.08), flexShrink: 0 }}>
        {icon}
      </Box>
      <Box minWidth={0}>
        <Typography variant="caption" sx={{ color: palette.muted, fontWeight: 750 }}>{label}</Typography>
        <Typography variant="body2" fontWeight={900} sx={{ color: palette.ink }}>{value ?? "—"}</Typography>
      </Box>
    </Stack>
  </Paper>
);

const DriverWorkLogs = () => {
  const { user } = useAuth();
  const driverId = user?._id || user?.id;

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [processing, setProcessing] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [newLog, setNewLog] = useState(initialLog);
  const [editingId, setEditingId] = useState(null);
  const [editFields, setEditFields] = useState({});

  const fetchLogs = useCallback(async () => {
    if (!driverId) return;
    setLoading(true);
    setError("");
    try {
      const res = await getWorkLogsByCurrentDriver();
      if (res.data.success) setLogs(res.data.data || []);
      else setError(res.data.message || "Failed to load logs");
    } catch (err) {
      setError(err.response?.data?.message || "Server error loading logs");
    } finally {
      setLoading(false);
    }
  }, [driverId]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const todaysLog = useMemo(() => {
    const todayKey = new Date().toLocaleDateString("en-CA");
    return logs.find((log) => new Date(log.date).toLocaleDateString("en-CA") === todayKey);
  }, [logs]);

  const handleChange = (setter) => (e) => {
    const { name, value } = e.target;
    setter((prev) => ({ ...prev, [name]: value }));
  };

  const validateLog = (log) => {
    if (!log.date) return "Date is required";
    for (const field of ["hours", "kilometers", "interstateStartKm", "interstateEndKm", "deliveriesDone"]) {
      if (log[field] !== "" && (Number.isNaN(Number(log[field])) || Number(log[field]) < 0)) {
        return `${field} must be a non-negative number`;
      }
    }
    return null;
  };

  const toPayload = (log) => ({
    ...log,
    hours: Number(log.hours) || 0,
    kilometers: Number(log.kilometers) || 0,
    interstateStartKm: Number(log.interstateStartKm) || 0,
    interstateEndKm: Number(log.interstateEndKm) || 0,
    deliveriesDone: Number(log.deliveriesDone) || 0,
    deliveryLocations: log.deliveryLocations
      ? log.deliveryLocations.split(",").map((loc) => loc.trim()).filter(Boolean)
      : [],
  });

  const handleCreateLog = async () => {
    const errMsg = validateLog(newLog);
    if (errMsg) return setError(errMsg);
    setError("");
    setSuccess("");
    setProcessing(true);
    try {
      const res = await createWorkLog(toPayload(newLog));
      if (res.data.success) {
        setSuccess("Today’s Work submitted successfully");
        setNewLog(initialLog);
        setShowAdvanced(false);
        fetchLogs();
      } else setError(res.data.message || "Failed to create Today’s Work record");
    } catch (err) {
      setError(err.response?.data?.message || "Server error creating Today’s Work record");
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
      deliveriesDone: log.deliveriesDone?.toString() || "",
      notes: log.notes ?? "",
      localStartTime: log.localStartTime || "",
      localEndTime: log.localEndTime || "",
      interstateStartKm: log.interstateStartKm?.toString() || "",
      interstateEndKm: log.interstateEndKm?.toString() || "",
      deliveryLocations: Array.isArray(log.deliveryLocations) ? log.deliveryLocations.join(", ") : "",
    });
    setError("");
    setSuccess("");
  };

  const handleSaveEdit = async () => {
    const errMsg = validateLog(editFields);
    if (errMsg) return setError(errMsg);
    setProcessing(true);
    try {
      const res = await updateWorkLog(editingId, toPayload(editFields));
      if (res.data.success) {
        setSuccess("Today’s Work updated");
        setEditingId(null);
        setEditFields({});
        fetchLogs();
      } else setError(res.data.message || "Failed to update Today’s Work");
    } catch (err) {
      setError(err.response?.data?.message || "Server error updating Today’s Work");
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (logId) => {
    if (!window.confirm("Delete this Today’s Work record?")) return;
    setProcessing(true);
    try {
      const res = await deleteWorkLog(logId);
      if (res.data.success) {
        setSuccess("Today’s Work deleted");
        fetchLogs();
      } else setError(res.data.message || "Failed to delete Today’s Work");
    } catch (err) {
      setError(err.response?.data?.message || "Server error deleting Today’s Work");
    } finally {
      setProcessing(false);
    }
  };

  const renderFormFields = (fields, setter) => (
    <Stack spacing={1.5}>
      <TextField label="Date" type="date" name="date" value={fields.date} onChange={handleChange(setter)} fullWidth InputLabelProps={{ shrink: true }} />
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 1.5 }}>
        <TextField label="Hours" name="hours" type="number" value={fields.hours} onChange={handleChange(setter)} inputProps={{ min: 0, step: "0.1" }} fullWidth />
        <TextField label="Kilometres" name="kilometers" type="number" value={fields.kilometers} onChange={handleChange(setter)} inputProps={{ min: 0, step: "0.1" }} fullWidth />
        <TextField label="Deliveries" name="deliveriesDone" type="number" value={fields.deliveriesDone} onChange={handleChange(setter)} inputProps={{ min: 0 }} fullWidth />
      </Box>
      <TextField label="Notes" name="notes" value={fields.notes} onChange={handleChange(setter)} fullWidth multiline rows={3} placeholder="Anything the owner should know?" />
    </Stack>
  );

  const renderAdvancedFields = (fields, setter) => (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" }, gap: 1.5 }}>
      <TextField label="Local start time" name="localStartTime" type="time" value={fields.localStartTime} onChange={handleChange(setter)} InputLabelProps={{ shrink: true }} fullWidth />
      <TextField label="Local end time" name="localEndTime" type="time" value={fields.localEndTime} onChange={handleChange(setter)} InputLabelProps={{ shrink: true }} fullWidth />
      <TextField label="Interstate start km" name="interstateStartKm" type="number" value={fields.interstateStartKm} onChange={handleChange(setter)} inputProps={{ min: 0 }} fullWidth />
      <TextField label="Interstate end km" name="interstateEndKm" type="number" value={fields.interstateEndKm} onChange={handleChange(setter)} inputProps={{ min: 0 }} fullWidth />
      <TextField label="Delivery locations" name="deliveryLocations" value={fields.deliveryLocations} onChange={handleChange(setter)} fullWidth multiline rows={2} sx={{ gridColumn: { sm: "1 / -1" } }} placeholder="Comma separated" />
    </Box>
  );

  return (
    <Box sx={{ minHeight: "100vh", pt: { xs: 3, sm: 4 }, pb: { xs: 4, sm: 6 }, overflowX: "hidden", background: `radial-gradient(circle at 0% 0%, ${alpha(palette.teal, 0.13)}, transparent 32%), linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%)` }}>
      <Box sx={{ width: "100%", maxWidth: 960, mx: "auto", px: { xs: 2, sm: 3, md: 4 } }}>
        <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 3.5 }, mb: 3, borderRadius: 5, color: "white", background: `linear-gradient(135deg, ${palette.heroStart} 0%, ${palette.heroMid} 58%, ${palette.heroEnd} 100%)` }}>
          <Chip label="Today’s Work" size="small" sx={{ mb: 1.5, color: "white", bgcolor: alpha("#fff", 0.12), fontWeight: 850 }} />
          <Typography variant="h4" fontWeight={950} sx={{ letterSpacing: "-0.065em", lineHeight: 1.05 }}>Submit Today’s Work</Typography>
          <Typography sx={{ mt: 1, color: alpha("#fff", 0.74), lineHeight: 1.6 }}>
            Record local work, extra deliveries, warehouse/admin work, phone-call work, or any work not captured by a job.
          </Typography>
        </Paper>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 3 }}>{success}</Alert>}

        <Paper elevation={0} sx={{ p: { xs: 2, sm: 2.5 }, mb: 3, borderRadius: 5, border: "1px solid", borderColor: palette.line, bgcolor: palette.panel }}>
          <Stack spacing={2}>
            {todaysLog && (
              <Alert severity="info" sx={{ borderRadius: 3 }}>
                You already have a Today’s Work record for this date. You can still submit another if needed.
              </Alert>
            )}
            {renderFormFields(newLog, setNewLog)}
            <Button endIcon={<ExpandMoreIcon />} onClick={() => setShowAdvanced((prev) => !prev)} sx={{ alignSelf: "flex-start", fontWeight: 850 }}>
              {showAdvanced ? "Hide optional details" : "Add optional details"}
            </Button>
            <Collapse in={showAdvanced}>
              {renderAdvancedFields(newLog, setNewLog)}
            </Collapse>
            <Button variant="contained" size="large" onClick={handleCreateLog} disabled={processing} sx={{ minHeight: 56, borderRadius: 3, bgcolor: palette.ink, fontWeight: 950 }}>
              {processing ? "Submitting..." : "Submit Today’s Work"}
            </Button>
          </Stack>
        </Paper>

        <Typography variant="h5" fontWeight={950} sx={{ mb: 1.75, color: palette.ink, letterSpacing: "-0.045em" }}>Today’s Work history</Typography>
        {loading ? (
          <Paper elevation={0} sx={{ p: 5, textAlign: "center", borderRadius: 5, border: "1px solid", borderColor: palette.line }}>
            <CircularProgress />
          </Paper>
        ) : logs.length === 0 ? (
          <Paper elevation={0} sx={{ p: 3, borderRadius: 5, border: "1px solid", borderColor: alpha(palette.teal, 0.16), bgcolor: alpha(palette.teal, 0.055) }}>
            <Typography fontWeight={900}>No Today’s Work records yet</Typography>
            <Typography sx={{ mt: 0.5, color: palette.muted }}>Submit your first daily record above.</Typography>
          </Paper>
        ) : (
          <Stack spacing={2}>
            {logs.map((log) => {
              const statusMeta = getStatusMeta(log.status);
              const isApproved = log.status === "approved";

              return (
              <Paper key={log._id} elevation={0} sx={{ p: 2, borderRadius: 5, border: "1px solid", borderColor: palette.line, bgcolor: palette.panel }}>
                {editingId === log._id ? (
                  <Stack spacing={2}>
                    {renderFormFields(editFields, setEditFields)}
                    {renderAdvancedFields(editFields, setEditFields)}
                    <Stack direction="row" spacing={1}>
                      <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSaveEdit} disabled={processing}>Save</Button>
                      <Button variant="outlined" color="error" startIcon={<CancelIcon />} onClick={() => setEditingId(null)} disabled={processing}>Cancel</Button>
                    </Stack>
                  </Stack>
                ) : (
                  <Stack spacing={1.5}>
                    <Stack direction="row" justifyContent="space-between" spacing={1}>
                      <Box>
                        <Typography fontWeight={950} sx={{ color: palette.ink }}>{formatDate(log.date)}</Typography>
                        <Typography variant="body2" sx={{ color: palette.muted }}>{log.notes || "No notes added."}</Typography>
                      </Box>
                      <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" justifyContent="flex-end">
                        <Chip
                          size="small"
                          label={isApproved ? "Approved by admin — locked" : statusMeta.label}
                          sx={{ color: statusMeta.color, bgcolor: alpha(statusMeta.color, 0.1), fontWeight: 900 }}
                        />
                        {!isApproved && (
                          <>
                            <IconButton aria-label="edit Today’s Work" onClick={() => startEditing(log)}><EditIcon /></IconButton>
                            <IconButton aria-label="delete Today’s Work" onClick={() => handleDelete(log._id)} color="error" disabled={processing}><DeleteIcon /></IconButton>
                          </>
                        )}
                      </Stack>
                    </Stack>
                    {log.status === "rejected" && log.rejectionReason && (
                      <Alert severity="error" sx={{ borderRadius: 3 }}>
                        Rejection reason: {log.rejectionReason}
                      </Alert>
                    )}
                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 1 }}>
                      <StatPill icon={<TimerOutlinedIcon />} label="Hours" value={log.hours ?? 0} />
                      <StatPill icon={<SpeedIcon />} label="Kilometres" value={log.kilometers ?? 0} />
                      <StatPill icon={<FactCheckIcon />} label="Deliveries" value={log.deliveriesDone ?? 0} />
                    </Box>
                    {(log.localStartTime || log.localEndTime || log.interstateStartKm || log.interstateEndKm) && (
                      <Typography variant="caption" sx={{ color: palette.muted }}>
                        Optional: {log.localStartTime || "—"} → {log.localEndTime || "—"} · KM {log.interstateStartKm ?? "—"} → {log.interstateEndKm ?? "—"}
                      </Typography>
                    )}
                    {Array.isArray(log.deliveryLocations) && log.deliveryLocations.length > 0 && (
                      <Chip icon={<NotesIcon />} label={log.deliveryLocations.join(", ")} sx={{ alignSelf: "flex-start", maxWidth: "100%" }} />
                    )}
                  </Stack>
                )}
              </Paper>
              );
            })}
          </Stack>
        )}
      </Box>
    </Box>
  );
};

export default DriverWorkLogs;
