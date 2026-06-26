import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import DownloadIcon from "@mui/icons-material/Download";
import { getAllDrivers, listWorkDiariesByDriver, deleteWorkDiary, getWorkDiary, listPendingWorkDiaries, approveWorkDiary, rejectWorkDiary } from "../../api";

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

const WorkDiary = () => {
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState("");
  const [diaries, setDiaries] = useState([]);
  const [pendingDiaries, setPendingDiaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pendingLoading, setPendingLoading] = useState(true);
  const [actionId, setActionId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchPendingDiaries = async () => {
    setPendingLoading(true);
    try {
      setPendingDiaries(await listPendingWorkDiaries());
    } catch (err) {
      setError(err.response?.data?.message || "Server error loading pending compliance approvals");
    } finally {
      setPendingLoading(false);
    }
  };

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const res = await getAllDrivers();
        if (res.data.status === "success") setDrivers(res.data.data || []);
        else setError("Failed to load drivers");
      } catch (err) {
        setError(err.response?.data?.message || "Server error loading drivers");
      }
    };
    fetchDrivers();
    fetchPendingDiaries();
  }, []);

  useEffect(() => {
    setError("");
    setSuccess("");
    if (!selectedDriver) {
      setDiaries([]);
      return;
    }
    const fetchDiaries = async () => {
      setLoading(true);
      try {
        setDiaries(await listWorkDiariesByDriver(selectedDriver));
      } catch (err) {
        setError(err.response?.data?.message || "Server error fetching diaries");
      } finally {
        setLoading(false);
      }
    };
    fetchDiaries();
  }, [selectedDriver]);

  const driverName = (driver) => {
    if (driver?.name) return driver.name;
    return drivers.find((d) => d._id === driver)?.name || "Driver";
  };

  const statusChip = (status = "pending") => {
    const color = status === "approved" ? "#07866f" : status === "rejected" ? "#b42318" : "#b76e00";
    return <Chip label={status} sx={{ color, bgcolor: alpha(color, 0.1), fontWeight: 900, textTransform: "capitalize" }} />;
  };

  const refreshDiaries = async () => {
    await fetchPendingDiaries();
    if (selectedDriver) setDiaries(await listWorkDiariesByDriver(selectedDriver));
  };

  const handleApprove = async (diaryId) => {
    setActionId(diaryId);
    setError("");
    setSuccess("");
    try {
      await approveWorkDiary(diaryId);
      setSuccess("Compliance document approved.");
      await refreshDiaries();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to approve compliance document");
    } finally {
      setActionId("");
    }
  };

  const handleReject = async (diaryId) => {
    const rejectionReason = window.prompt("Why is this compliance document being rejected?");
    if (!rejectionReason) return;
    setActionId(diaryId);
    setError("");
    setSuccess("");
    try {
      await rejectWorkDiary(diaryId, { rejectionReason });
      setSuccess("Compliance document rejected.");
      await refreshDiaries();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reject compliance document");
    } finally {
      setActionId("");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this compliance document?")) return;
    try {
      await deleteWorkDiary(id);
      setSuccess("Compliance document deleted.");
      setDiaries((prev) => prev.filter((d) => d._id !== id));
    } catch {
      setError("Failed to delete work diary");
    }
  };

  const handleDownload = async (workDiary) => {
    try {
      const blob = await getWorkDiary(workDiary._id);
      const dateStr = new Date(workDiary.uploadDate || Date.now()).toISOString().slice(0, 10);
      const filename = `WorkDiary-${driverName(workDiary.driverId).replace(/\s+/g, "_")}-${dateStr}.pdf`;
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(link.href);
    } catch {
      setError("Failed to download work diary");
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", pt: { xs: 3, sm: 4 }, pb: 6, overflowX: "hidden", background: `radial-gradient(circle at 0% 0%, ${alpha(palette.teal, 0.13)}, transparent 32%), linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%)` }}>
      <Box sx={{ width: "100%", maxWidth: 1040, mx: "auto", px: { xs: 2, sm: 3, md: 4 } }}>
        <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 3.5 }, mb: 3, borderRadius: 5, color: "white", background: `linear-gradient(135deg, ${palette.heroStart} 0%, ${palette.heroMid} 58%, ${palette.heroEnd} 100%)` }}>
          <Chip label="Compliance" size="small" sx={{ mb: 1.5, color: "white", bgcolor: alpha("#fff", 0.12), fontWeight: 850 }} />
          <Typography variant="h4" fontWeight={950} sx={{ letterSpacing: "-0.065em", lineHeight: 1.05 }}>Compliance Records</Typography>
          <Typography sx={{ mt: 1, color: alpha("#fff", 0.74), lineHeight: 1.6 }}>Review driver work diary and compliance PDF uploads separately from daily structured records.</Typography>
        </Paper>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 3 }}>{success}</Alert>}

        <Paper elevation={0} sx={{ p: { xs: 2, sm: 2.5 }, mb: 2.5, borderRadius: 5, border: "1px solid", borderColor: alpha(palette.teal, 0.16), bgcolor: alpha(palette.teal, 0.055) }}>
          <Stack spacing={2}>
            <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1}>
              <Box>
                <Typography variant="h5" fontWeight={950} sx={{ color: palette.ink, letterSpacing: "-0.045em" }}>Pending compliance approvals</Typography>
                <Typography variant="body2" sx={{ color: palette.muted }}>Review work diary documents before closing weekly records.</Typography>
              </Box>
              <Chip label={`${pendingDiaries.length} pending`} sx={{ alignSelf: { xs: "flex-start", sm: "center" }, color: palette.teal, bgcolor: alpha(palette.teal, 0.1), fontWeight: 900 }} />
            </Stack>
            {pendingLoading ? (
              <Box sx={{ py: 2, textAlign: "center" }}><CircularProgress size={28} /></Box>
            ) : pendingDiaries.length === 0 ? (
              <Typography sx={{ color: palette.muted }}>No compliance documents waiting for approval.</Typography>
            ) : (
              <Stack spacing={1.5}>
                {pendingDiaries.map((diary) => (
                  <Paper key={diary._id} elevation={0} sx={{ p: 2, borderRadius: 4, border: "1px solid", borderColor: palette.line, bgcolor: palette.panel }}>
                    <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1.5}>
                      <Box>
                        <Typography fontWeight={950} sx={{ color: palette.ink }}>{driverName(diary.driverId)} · {new Date(diary.uploadDate || Date.now()).toLocaleDateString()}</Typography>
                        <Typography variant="body2" sx={{ color: palette.muted }}>{diary.jobId?.title ? `Job: ${diary.jobId.title}` : "No job linked yet"} · {diary.notes || "No notes"}</Typography>
                      </Box>
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                        <Button disabled={actionId === diary._id} variant="contained" startIcon={<CheckCircleOutlineIcon />} onClick={() => handleApprove(diary._id)} sx={{ borderRadius: 3, bgcolor: palette.ink, fontWeight: 900 }}>Approve</Button>
                        <Button disabled={actionId === diary._id} variant="outlined" color="error" startIcon={<CancelOutlinedIcon />} onClick={() => handleReject(diary._id)} sx={{ borderRadius: 3, fontWeight: 900 }}>Reject</Button>
                      </Stack>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            )}
          </Stack>
        </Paper>

        <Paper elevation={0} sx={{ p: 2, mb: 2.5, borderRadius: 5, border: "1px solid", borderColor: palette.line, bgcolor: palette.panel }}>
          <FormControl fullWidth>
            <InputLabel id="driver-select-label">Select Driver</InputLabel>
            <Select labelId="driver-select-label" value={selectedDriver} label="Select Driver" onChange={(e) => setSelectedDriver(e.target.value)}>
              <MenuItem value=""><em>Choose a driver</em></MenuItem>
              {drivers.map((driver) => <MenuItem key={driver._id} value={driver._id}>{driver.name} ({driver.email})</MenuItem>)}
            </Select>
          </FormControl>
        </Paper>

        {loading ? (
          <Paper elevation={0} sx={{ p: 5, textAlign: "center", borderRadius: 5, border: "1px solid", borderColor: palette.line }}><CircularProgress /></Paper>
        ) : !selectedDriver ? (
          <Paper elevation={0} sx={{ p: 3, borderRadius: 5, border: "1px solid", borderColor: alpha(palette.teal, 0.16), bgcolor: alpha(palette.teal, 0.055) }}>
            <Typography fontWeight={950}>Select a driver</Typography>
            <Typography sx={{ color: palette.muted }}>Compliance documents are currently stored by driver.</Typography>
          </Paper>
        ) : diaries.length === 0 ? (
          <Paper elevation={0} sx={{ p: 3, borderRadius: 5, border: "1px solid", borderColor: alpha(palette.teal, 0.16), bgcolor: alpha(palette.teal, 0.055) }}>
            <Typography fontWeight={950}>No compliance records found</Typography>
            <Typography sx={{ color: palette.muted }}>This driver has not uploaded work diary documents yet.</Typography>
          </Paper>
        ) : (
          <Stack spacing={2}>
            {diaries.map((workDiary) => (
              <Paper key={workDiary._id} elevation={0} sx={{ p: 2, borderRadius: 5, border: "1px solid", borderColor: palette.line, bgcolor: palette.panel }}>
                <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={2}>
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <Box sx={{ width: 46, height: 46, borderRadius: 3, display: "grid", placeItems: "center", color: palette.teal, bgcolor: alpha(palette.teal, 0.09), flexShrink: 0 }}><DescriptionOutlinedIcon /></Box>
                    <Box>
                      <Typography fontWeight={950} sx={{ color: palette.ink }}>{new Date(workDiary.uploadDate || Date.now()).toLocaleDateString()}</Typography>
                      <Typography variant="body2" sx={{ color: palette.muted }}>Driver: {driverName(workDiary.driverId)}</Typography>
                      <Box sx={{ mt: 1 }}>{statusChip(workDiary.status)}</Box>
                      <Typography variant="body2" sx={{ color: palette.muted, mt: 0.5 }}>{workDiary.notes || "No notes added."}</Typography>
                    </Box>
                  </Stack>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ minWidth: { sm: 220 } }}>
                    {workDiary.status === "pending" && <Button fullWidth variant="contained" startIcon={<CheckCircleOutlineIcon />} onClick={() => handleApprove(workDiary._id)} disabled={actionId === workDiary._id} sx={{ borderRadius: 3, bgcolor: palette.teal, fontWeight: 900 }}>Approve</Button>}
                    {workDiary.status === "pending" && <Button fullWidth variant="outlined" color="warning" startIcon={<CancelOutlinedIcon />} onClick={() => handleReject(workDiary._id)} disabled={actionId === workDiary._id} sx={{ borderRadius: 3, fontWeight: 900 }}>Reject</Button>}
                    <Button fullWidth variant="contained" startIcon={<DownloadIcon />} onClick={() => handleDownload(workDiary)} sx={{ borderRadius: 3, bgcolor: palette.ink, fontWeight: 900 }}>Download</Button>
                    <Button fullWidth variant="outlined" color="error" startIcon={<DeleteOutlineIcon />} onClick={() => handleDelete(workDiary._id)} sx={{ borderRadius: 3, fontWeight: 900 }}>Delete</Button>
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
