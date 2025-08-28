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
} from "@mui/material";

import {
  getAllDrivers,
  listWorkDiariesByDriver,
  deleteWorkDiary,
  getWorkDiary, // Make sure this is imported from your api.js
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
        const res = await listWorkDiariesByDriver(selectedDriver);
        if (res.data.success) {
          setDiaries(res.data.data);
        } else {
          setError(res.data.message || "Failed to fetch work diaries");
        }
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

  // Updated download function to download with driver name and date in filename
  const handleDownload = async (workDiary) => {
    try {
      const blobResponse = await getWorkDiary(workDiary._id);
      const blob = new Blob([blobResponse.data], { type: "application/pdf" });

      // Create a filename like WorkDiary-DriverName-YYYY-MM-DD.pdf
      const driverName = drivers.find((d) => d._id === workDiary.driverId)?.name || "Driver";
      const dateStr = new Date(workDiary.uploadDate).toISOString().slice(0, 10);
      const filename = `WorkDiary-${driverName.replace(/\s+/g, "_")}-${dateStr}.pdf`;

      // Create a temporary link and click it to download
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
    <Box sx={{ p: 4, maxWidth: "1200px", mx: "auto" }}>
      <Typography variant="h4" gutterBottom>
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
        <Typography>No work diaries found for selected driver.</Typography>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Upload Date</TableCell>
              <TableCell>Notes</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {diaries.map((workDiary) => (
              <TableRow key={workDiary._id}>
                <TableCell>{new Date(workDiary.uploadDate || Date.now()).toLocaleDateString()}</TableCell>
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
      )}
    </Box>
  );
};

export default WorkDiary;
