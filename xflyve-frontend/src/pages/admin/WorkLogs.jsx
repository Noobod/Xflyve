import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { alpha } from "@mui/material/styles";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import NotesIcon from "@mui/icons-material/Notes";
import SpeedIcon from "@mui/icons-material/Speed";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import { getAllWorkLogsAdmin, getWorkLogsByDriverAdmin, getAllDrivers } from "../../api";

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

const formatDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return date.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
};

const StatPill = ({ icon, label, value }) => (
  <Paper elevation={0} sx={{ p: 1.4, borderRadius: 3, border: "1px solid", borderColor: palette.line, bgcolor: alpha("#fff", 0.74), minWidth: 0 }}>
    <Stack direction="row" spacing={1.1} alignItems="center">
      <Box sx={{ width: 34, height: 34, borderRadius: 2.5, display: "grid", placeItems: "center", color: palette.teal, bgcolor: alpha(palette.teal, 0.08), flexShrink: 0 }}>
        {icon}
      </Box>
      <Box minWidth={0}>
        <Typography variant="caption" sx={{ color: palette.muted, fontWeight: 800 }}>{label}</Typography>
        <Typography variant="body2" fontWeight={900} noWrap sx={{ color: palette.ink }}>{value ?? "—"}</Typography>
      </Box>
    </Stack>
  </Paper>
);

const WorkLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const res = await getAllDrivers();
        if (res.data.status === "success") setDrivers(res.data.data || []);
        else setError("Failed to fetch drivers");
      } catch {
        setError("Server error fetching drivers");
      }
    };
    fetchDrivers();
  }, []);

  const fetchRecords = async (driverId) => {
    setLoading(true);
    setError("");
    try {
      const res = driverId ? await getWorkLogsByDriverAdmin(driverId) : await getAllWorkLogsAdmin();
      if (res.data.success) setLogs(res.data.data || []);
      else {
        setError(res.data.message || "Failed to fetch daily records");
        setLogs([]);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Server error fetching daily records");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const weeklySummary = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay() + 1);
    start.setHours(0, 0, 0, 0);
    const weekLogs = logs.filter((log) => new Date(log.date) >= start);
    return {
      count: weekLogs.length,
      hours: weekLogs.reduce((sum, log) => sum + (Number(log.hours) || 0), 0),
      km: weekLogs.reduce((sum, log) => sum + (Number(log.kilometers) || 0), 0),
      deliveries: weekLogs.reduce((sum, log) => sum + (Number(log.deliveriesDone) || 0), 0),
    };
  }, [logs]);

  const handleDriverChange = (event, newValue) => {
    setSelectedDriver(newValue);
    fetchRecords(newValue ? newValue._id : null);
  };

  return (
    <Box sx={{ minHeight: "100vh", pt: { xs: 3, sm: 4 }, pb: 6, overflowX: "hidden", background: `radial-gradient(circle at 0% 0%, ${alpha(palette.teal, 0.13)}, transparent 32%), linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%)` }}>
      <Box sx={{ width: "100%", maxWidth: 1180, mx: "auto", px: { xs: 2, sm: 3, md: 4 } }}>
        <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 3.5 }, mb: 3, borderRadius: 5, color: "white", background: `linear-gradient(135deg, ${palette.heroStart} 0%, ${palette.heroMid} 58%, ${palette.heroEnd} 100%)` }}>
          <Chip label="Daily Records" size="small" sx={{ mb: 1.5, color: "white", bgcolor: alpha("#fff", 0.12), fontWeight: 850 }} />
          <Typography variant="h4" fontWeight={950} sx={{ letterSpacing: "-0.065em", lineHeight: 1.05 }}>Driver Records</Typography>
          <Typography sx={{ mt: 1, color: alpha("#fff", 0.74), lineHeight: 1.6 }}>Review driver hours, kilometres and delivery counts for future payroll and invoicing preparation.</Typography>
        </Paper>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }, gap: 1.5, mb: 2.5 }}>
          <StatPill icon={<FactCheckIcon />} label="Logs this week" value={weeklySummary.count} />
          <StatPill icon={<TimerOutlinedIcon />} label="Weekly hours" value={weeklySummary.hours.toFixed(1)} />
          <StatPill icon={<SpeedIcon />} label="Weekly km" value={weeklySummary.km.toFixed(0)} />
          <StatPill icon={<FactCheckIcon />} label="Deliveries" value={weeklySummary.deliveries} />
        </Box>

        <Paper elevation={0} sx={{ p: 2, mb: 2.5, borderRadius: 5, border: "1px solid", borderColor: palette.line, bgcolor: palette.panel }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <Autocomplete
              sx={{ flex: 1 }}
              options={drivers}
              getOptionLabel={(option) => option.name || ""}
              value={selectedDriver}
              onChange={handleDriverChange}
              isOptionEqualToValue={(option, value) => option._id === value._id}
              renderInput={(params) => <TextField {...params} label="Filter by Driver" />}
              noOptionsText="No drivers found"
            />
            <Button variant="outlined" onClick={() => { setSelectedDriver(null); fetchRecords(); }} disabled={!selectedDriver} sx={{ minHeight: 54, borderRadius: 3, fontWeight: 900 }}>
              Clear Filter
            </Button>
          </Stack>
        </Paper>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>{error}</Alert>}

        {loading ? (
          <Paper elevation={0} sx={{ p: 5, textAlign: "center", borderRadius: 5, border: "1px solid", borderColor: palette.line }}><CircularProgress /></Paper>
        ) : logs.length === 0 ? (
          <Paper elevation={0} sx={{ p: 3, borderRadius: 5, border: "1px solid", borderColor: alpha(palette.teal, 0.16), bgcolor: alpha(palette.teal, 0.055) }}>
            <Typography fontWeight={950}>No daily records found</Typography>
            <Typography sx={{ color: palette.muted }}>Driver-submitted records will appear here.</Typography>
          </Paper>
        ) : (
          <Stack spacing={2}>
            {logs.map((log) => (
              <Paper key={log._id} elevation={0} sx={{ p: 2, borderRadius: 5, border: "1px solid", borderColor: palette.line, bgcolor: palette.panel }}>
                <Stack spacing={1.5}>
                  <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1}>
                    <Box>
                      <Typography fontWeight={950} sx={{ color: palette.ink }}>{log.driverId?.name || "Unknown driver"}</Typography>
                      <Typography variant="body2" sx={{ color: palette.muted }}>{formatDate(log.date)}</Typography>
                    </Box>
                    <Chip label="Submitted" sx={{ alignSelf: { xs: "flex-start", sm: "center" }, color: palette.teal, bgcolor: alpha(palette.teal, 0.1), fontWeight: 900 }} />
                  </Stack>
                  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 1 }}>
                    <StatPill icon={<TimerOutlinedIcon />} label="Hours" value={log.hours ?? 0} />
                    <StatPill icon={<SpeedIcon />} label="Kilometres" value={log.kilometers ?? 0} />
                    <StatPill icon={<FactCheckIcon />} label="Deliveries" value={log.deliveriesDone ?? 0} />
                  </Box>
                  {(log.localStartTime || log.localEndTime || log.interstateStartKm || log.interstateEndKm) && (
                    <Typography variant="body2" sx={{ color: palette.muted }}>
                      Optional details: {log.localStartTime || "—"} → {log.localEndTime || "—"} · KM {log.interstateStartKm ?? "—"} → {log.interstateEndKm ?? "—"}
                    </Typography>
                  )}
                  {log.notes && <Chip icon={<NotesIcon />} label={log.notes} sx={{ alignSelf: "flex-start", maxWidth: "100%" }} />}
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
};

export default WorkLogs;
