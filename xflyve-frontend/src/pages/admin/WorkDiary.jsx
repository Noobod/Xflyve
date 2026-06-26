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
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import DownloadIcon from "@mui/icons-material/Download";
import { getAllDrivers, listWorkDiariesByDriver, deleteWorkDiary, getWorkDiary } from "../../api";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  const driverName = (id) => drivers.find((d) => d._id === id)?.name || "Driver";

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
                      <Typography variant="body2" sx={{ color: palette.muted, mt: 0.5 }}>{workDiary.notes || "No notes added."}</Typography>
                    </Box>
                  </Stack>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ minWidth: { sm: 220 } }}>
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
