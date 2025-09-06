import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Alert,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Paper,
  Stack,
} from "@mui/material";

import {
  getAllDrivers,
  listWorkDiariesByDriver,
  deleteWorkDiary,
  getWorkDiary,
} from "../../api";

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
        if (res.data.status === "success") {
          setDrivers(res.data.data);
        } else {
          setError("Failed to load drivers");
        }
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
      setError("");
      try {
        const items = await listWorkDiariesByDriver(selectedDriver);
        setDiaries(items);
      } catch (err) {
        setError(err.response?.data?.message || "Server error fetching diaries");
      } finally {
        setLoading(false);
      }
    };

    fetchDiaries();
  }, [selectedDriver]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this work diary?")) return;
    try {
      await deleteWorkDiary(id);
      setSuccess("Work diary deleted");
      setDiaries((prev) => prev.filter((d) => d._id !== id));
    } catch (err) {
      console.error(err);
      setError("Failed to delete work diary");
    }
  };

  const handleDownload = async (workDiary) => {
    try {
      const blob = await getWorkDiary(workDiary._id);

      const driverName =
        drivers.find((d) => d._id === workDiary.driverId)?.name || "Driver";
      const dateStr = new Date(workDiary.uploadDate).toISOString().slice(0, 10);
      const filename = `WorkDiary-${driverName.replace(/\s+/g, "_")}-${dateStr}.pdf`;

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError("Failed to download work diary");
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, maxWidth: "1200px", mx: "auto" }}>
      <Typography variant="h4" gutterBottom textAlign="center">
        Work Diary Management (Admin)
      </Typography>

      {error && (
        <Alert severity="error" onClose={() => setError("")} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" onClose={() => setSuccess("")} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel id="driver-select-label">Select Driver</InputLabel>
        <Select
          labelId="driver-select-label"
          value={selectedDriver}
          label="Select Driver"
          onChange={(e) => setSelectedDriver(e.target.value)}
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          {drivers.map((driver) => (
            <MenuItem key={driver._id} value={driver._id}>
              {driver.name} ({driver.email})
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {loading ? (
        <Box display="flex" justifyContent="center" py={5}>
          <CircularProgress />
        </Box>
      ) : diaries.length === 0 ? (
        <Typography textAlign="center">No work diaries found for selected driver.</Typography>
      ) : (
        <>
          {/* Table for desktop */}
          <Box sx={{ display: { xs: "none", sm: "block" }, overflowX: "auto" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Upload Date</TableCell>
                  <TableCell>Driver</TableCell>
                  <TableCell>Notes</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {diaries.map((workDiary) => (
                  <TableRow key={workDiary._id}>
                    <TableCell>
                      {new Date(workDiary.uploadDate || Date.now()).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {drivers.find((d) => d._id === workDiary.driverId)?.name || "-"}
                    </TableCell>
                    <TableCell>{workDiary.notes || "-"}</TableCell>
                    <TableCell align="center">
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{ mr: 1 }}
                        onClick={() => handleDownload(workDiary)}
                      >
                        Download
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleDelete(workDiary._id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>

          {/* Mobile cards */}
          <Stack spacing={2} sx={{ display: { xs: "block", sm: "none" } }}>
            {diaries.map((workDiary) => (
              <Paper key={workDiary._id} sx={{ p: 2 }}>
                <Typography><b>Upload Date:</b> {new Date(workDiary.uploadDate || Date.now()).toLocaleDateString()}</Typography>
                <Typography><b>Driver:</b> {drivers.find((d) => d._id === workDiary.driverId)?.name || "-"}</Typography>
                <Typography><b>Notes:</b> {workDiary.notes || "-"}</Typography>
                <Box sx={{ mt: 1, display: "flex", gap: 1, flexWrap: "wrap" }}>
                  <Button variant="contained" size="small" onClick={() => handleDownload(workDiary)}>Download</Button>
                  <Button variant="contained" color="error" size="small" onClick={() => handleDelete(workDiary._id)}>Delete</Button>
                </Box>
              </Paper>
            ))}
          </Stack>
        </>
      )}
    </Box>
  );
};

export default WorkDiary;
